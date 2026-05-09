import { useState, useEffect } from "react";
import {
    Autocomplete, Box, Typography, TextField, Stack, Chip,
    IconButton, Drawer, Button, Divider,
    Menu, MenuItem, Snackbar, Alert
} from "@mui/material";

import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import MoreVertIcon from "@mui/icons-material/MoreVert";

import MainCard from "components/MainCard";
import API from "../../api/axios";

// ================= EMPTY FORM =================
const emptyForm = {
    returnNo: "",
    supplier: "",
    items: [{ name: "", qty: 1, price: 0 }],
    amount: 0,
    status: "Returned",
    date: ""
};

export default function PurchaseReturnsPage() {

    const [rows, setRows] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [productOptions, setProductOptions] = useState([]);
    const [productSearch, setProductSearch] = useState("");

    const [selected, setSelected] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [mode, setMode] = useState("view");

    const [form, setForm] = useState(emptyForm);
    const [anchorEl, setAnchorEl] = useState(null);

    const [snackbar, setSnackbar] = useState({ open: false, msg: "", type: "success" });

    // ================= FETCH =================
    const fetchReturns = async () => {
        try {
            const res = await API.get("/inventory/purchase-returns");

            setRows(
                res.data.data.map((item) => ({
                    id: item._id,
                    returnNo: item.returnNo,
                    supplier: item.supplier?._id || "",
                    supplierName: item.supplier?.name || "",
                    items: item.items,
                    amount: item.amount,
                    status: item.status,
                    date: item.date
                }))
            );

        } catch (err) {
            console.error(err);
            setSnackbar({ open: true, msg: "Fetch failed", type: "error" });
        }
    };

    const fetchSuppliers = async () => {
        try {
            const res = await API.get("/suppliers");
            setSuppliers(res.data.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchReturns();
        fetchSuppliers();
    }, []);

    useEffect(() => {
        const timer = setTimeout(async () => {
            try {
                const res = await API.get("/products", {
                    params: { search: productSearch, limit: 10 }
                });
                setProductOptions(res.data.data || []);
            } catch (err) {
                setProductOptions([]);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [productSearch]);

    // ================= CALC =================
    const calculateAmount = (items) => {
        const amount = items.reduce((sum, i) => sum + i.qty * i.price, 0);
        setForm((prev) => ({ ...prev, items, amount }));
    };

    // ================= CRUD =================
    const handleAdd = () => {
        setMode("add");
        setForm({ ...emptyForm, items: [{ name: "", product: "", qty: 1, price: 0 }] });
        setDrawerOpen(true);
    };

    const handleEdit = () => {
        setMode("edit");
        setForm(selected);
        setDrawerOpen(true);
        setAnchorEl(null);
    };

    const handleDelete = async () => {
        try {
            await API.delete(`/inventory/purchase-returns/${selected.id}`);
            setSnackbar({ open: true, msg: "Return deleted", type: "success" });
            fetchReturns();
        } catch {
            setSnackbar({ open: true, msg: "Delete failed", type: "error" });
        }
        setAnchorEl(null);
    };

    const handleSave = async () => {
        if (!form.returnNo || !form.supplier) {
            setSnackbar({ open: true, msg: "Return No & Supplier required", type: "error" });
            return;
        }

        try {
            if (mode === "add") {
                await API.post("/inventory/purchase-returns", form);
                setSnackbar({ open: true, msg: "Return added", type: "success" });
            } else {
                const returnId = form.id || selected?.id;
                if (!returnId) {
                    setSnackbar({ open: true, msg: "Return id missing for edit", type: "error" });
                    return;
                }
                await API.put(`/inventory/purchase-returns/${returnId}`, form);
                setSnackbar({ open: true, msg: "Return updated", type: "success" });
            }

            fetchReturns();
            setDrawerOpen(false);

        } catch {
            setSnackbar({ open: true, msg: "Save failed", type: "error" });
        }
    };

    // ================= REFUND =================
    const handleRefund = async () => {
        try {
            await API.patch(`/inventory/purchase-returns/${selected.id}/refund`);
            setSnackbar({ open: true, msg: "Refund received", type: "success" });
            fetchReturns();
            setDrawerOpen(false);
        } catch {
            setSnackbar({ open: true, msg: "Refund failed", type: "error" });
        }
    };

    // ================= ITEMS =================
    const addItem = () => {
        calculateAmount([...form.items, { name: "", product: "", qty: 1, price: 0 }]);
    };

    const removeItem = (index) => {
        const items = form.items.filter((_, i) => i !== index);
        calculateAmount(items);
    };

    const updateItem = (index, field, value) => {
        const items = [...form.items];
        items[index][field] = ["name", "product"].includes(field) ? value : Number(value);
        calculateAmount(items);
    };

    const selectProduct = (index, product) => {
        const items = [...form.items];
        items[index] = {
            ...items[index],
            product: product?._id || "",
            name: product?.name || "",
            price: Number(product?.price || 0)
        };
        calculateAmount(items);
    };

    // ================= TABLE =================
    const columns = [
        { field: "returnNo", headerName: "Return No", flex: 1 },
        { field: "supplierName", headerName: "Supplier", flex: 1 },
        { field: "amount", headerName: "₹ Amount", flex: 1 },
        {
            field: "status",
            headerName: "Status",
            flex: 1,
            renderCell: (p) => (
                <Chip
                    label={p.row.status}
                    color={p.row.status === "Refunded" ? "success" : "warning"}
                    size="small"
                />
            )
        },
        {
            field: "action",
            width: 70,
            renderCell: (p) => (
                <IconButton onClick={(e) => {
                    setAnchorEl(e.currentTarget);
                    setSelected(p.row);
                }}>
                    <MoreVertIcon />
                </IconButton>
            )
        }
    ];

    return (
        <MainCard>
            <Typography variant="h5" mb={2}>Purchase Returns</Typography>

            {/* ADD BUTTON */}
            <Stack direction="row" justifyContent="flex-end" mb={2}>
                <Button variant="contained" onClick={handleAdd}>
                    Add Return
                </Button>
            </Stack>

            {/* TABLE */}
            <div style={{ height: 500 }}>
                <DataGrid rows={rows} columns={columns} slots={{ toolbar: GridToolbar }} />
            </div>

            {/* MENU */}
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                <MenuItem onClick={() => { setMode("view"); setDrawerOpen(true); setAnchorEl(null); }}>
                    View
                </MenuItem>
                <MenuItem onClick={handleEdit}>Edit</MenuItem>
                <MenuItem onClick={handleDelete}>Delete</MenuItem>
            </Menu>

            {/* DRAWER */}
            <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
                <Box
                    sx={{
                        p: 2,
                        bgcolor: "primary.main",
                        color: "#fff",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                    }}
                >
                    <Typography variant="h6" mb={2}>
                        {mode === "add" ? "Add Return" : mode === "edit" ? "Edit Return" : "Return Details"}
                    </Typography>
                </Box>
                <Box width={400} p={3}>


                    {mode === "view" ? (
                        <>
                            <Typography>{selected?.returnNo}</Typography>
                            <Typography>{selected?.supplierName}</Typography>

                            <Divider sx={{ my: 2 }} />

                            {selected?.items.map((i, idx) => (
                                <Box key={idx} display="flex" justifyContent="space-between">
                                    <Typography>{i.name} × {i.qty}</Typography>
                                    <Typography>₹ {i.qty * i.price}</Typography>
                                </Box>
                            ))}

                            <Divider sx={{ my: 2 }} />
                            <Typography>Total: ₹ {selected?.amount}</Typography>

                            {selected?.status !== "Refunded" && (
                                <Button fullWidth variant="contained" sx={{ mt: 2 }} onClick={handleRefund}>
                                    Receive Refund
                                </Button>
                            )}
                        </>
                    ) : (
                        <Stack spacing={2}>
                            <TextField
                                label="Return No"
                                value={form.returnNo}
                                onChange={(e) => setForm({ ...form, returnNo: e.target.value })}
                            />

                            <Autocomplete
                                options={suppliers}
                                getOptionLabel={(option) => option.name || ""}
                                value={suppliers.find((s) => s._id === form.supplier) || null}
                                onChange={(event, value) => setForm({ ...form, supplier: value?._id || "" })}
                                renderInput={(params) => <TextField {...params} label="Supplier" />}
                            />

                            <Divider>Items</Divider>

                            {form.items.map((item, index) => (
                                <Stack key={index} direction="row" spacing={1}>
                                    <Autocomplete
                                        freeSolo
                                        options={productOptions}
                                        getOptionLabel={(option) => typeof option === "string" ? option : option.name || ""}
                                        inputValue={item.name}
                                        sx={{ minWidth: 160 }}
                                        onInputChange={(event, value) => {
                                            setProductSearch(value);
                                            updateItem(index, "name", value);
                                        }}
                                        onChange={(event, value) => {
                                            if (value && typeof value !== "string") selectProduct(index, value);
                                        }}
                                        renderInput={(params) => <TextField {...params} label="Item" />}
                                    />
                                    <TextField type="number" label="Qty" value={item.qty} onChange={(e) => updateItem(index, "qty", e.target.value)} />
                                    <TextField type="number" label="Price" value={item.price} onChange={(e) => updateItem(index, "price", e.target.value)} />
                                    <Button onClick={() => removeItem(index)}>X</Button>
                                </Stack>
                            ))}

                            <Button onClick={addItem}>+ Add Item</Button>

                            <Typography>Total: ₹ {form.amount}</Typography>

                            <Button variant="contained" onClick={handleSave}>
                                Save
                            </Button>
                        </Stack>
                    )}
                </Box>
            </Drawer>

            {/* SNACKBAR */}
            <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                <Alert severity={snackbar.type}>{snackbar.msg}</Alert>
            </Snackbar>
        </MainCard>
    );
}
