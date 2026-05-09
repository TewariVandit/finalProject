import { useState, useEffect } from "react";
import {
    Autocomplete, Box, Typography, TextField, MenuItem, Stack, Grid, Chip,
    IconButton, Drawer, Button, Menu, MenuItem as MuiMenuItem,
    ListItemIcon, Divider, Snackbar, Alert
} from "@mui/material";

import { DataGrid, GridToolbar } from "@mui/x-data-grid";

import MoreVertIcon from "@mui/icons-material/MoreVert";
import VisibilityIcon from "@mui/icons-material/Visibility";

import MainCard from "components/MainCard";
import API from "../../api/axios";

// ================= EMPTY FORM =================
const emptyForm = {
    orderNo: "",
    supplier: "",
    items: [{ name: "", qty: 1, price: 0 }],
    total: 0,
    tax: 0,
    grandTotal: 0,
    status: "Pending",
    date: ""
};

export default function PurchaseOrdersPage() {

    const [rows, setRows] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [productOptions, setProductOptions] = useState([]);
    const [productSearch, setProductSearch] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const [selected, setSelected] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [mode, setMode] = useState("view");

    const [form, setForm] = useState(emptyForm);
    const [anchorEl, setAnchorEl] = useState(null);

    const [snackbar, setSnackbar] = useState({ open: false, msg: "", type: "success" });

    // ================= FETCH ORDERS =================
    const fetchOrders = async () => {
        try {
            const res = await API.get("/inventory/purchase-orders");

            setRows(
                res.data.data.map((item) => ({
                    id: item._id,
                    orderNo: item.orderNo,
                    supplier: item.supplier?._id || "",
                    supplierName: item.supplier?.name || "",
                    items: item.items,
                    total: item.total,
                    tax: item.tax,
                    grandTotal: item.grandTotal,
                    status: item.status,
                    date: item.date
                }))
            );

        } catch (err) {
            console.error(err);
            setSnackbar({ open: true, msg: "Fetch failed", type: "error" });
        }
    };

    // ================= FETCH SUPPLIERS =================
    const fetchSuppliers = async () => {
        try {
            const res = await API.get("/suppliers");
            setSuppliers(res.data.data);
        } catch (err) {
            console.error(err);
        }
    };

    // ================= INIT =================
    useEffect(() => {
        fetchOrders();
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

    // ================= FILTER =================
    const filteredRows = rows.filter((r) =>
        (r.supplierName.toLowerCase().includes(search.toLowerCase()) ||
            r.orderNo.toLowerCase().includes(search.toLowerCase())) &&
        (statusFilter === "all" || r.status === statusFilter)
    );

    const totalOrders = filteredRows.length;
    const totalAmount = filteredRows.reduce((s, r) => s + r.grandTotal, 0);

    // ================= CALCULATIONS =================
    const calculateTotals = (items) => {
        const total = items.reduce((sum, i) => sum + i.qty * i.price, 0);
        const tax = total * 0.05;
        const grandTotal = total + tax;

        setForm((prev) => ({
            ...prev,
            items,
            total,
            tax,
            grandTotal
        }));
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
            await API.delete(`/inventory/purchase-orders/${selected.id}`);
            setSnackbar({ open: true, msg: "Order deleted", type: "success" });
            fetchOrders();
        } catch {
            setSnackbar({ open: true, msg: "Delete failed", type: "error" });
        }
        setAnchorEl(null);
    };

    const handleSave = async () => {
        if (!form.orderNo || !form.supplier) {
            setSnackbar({ open: true, msg: "Order No & Supplier required", type: "error" });
            return;
        }

        try {
            if (mode === "add") {
                await API.post("/inventory/purchase-orders", form);
                setSnackbar({ open: true, msg: "Order added", type: "success" });
            } else {
                const orderId = form.id || selected?.id;
                if (!orderId) {
                    setSnackbar({ open: true, msg: "Order id missing for edit", type: "error" });
                    return;
                }
                await API.put(`/inventory/purchase-orders/${orderId}`, form);
                setSnackbar({ open: true, msg: "Order updated", type: "success" });
            }

            fetchOrders();
            setDrawerOpen(false);

        } catch {
            setSnackbar({ open: true, msg: "Save failed", type: "error" });
        }
    };

    // ================= ITEMS =================
    const addItem = () => {
        calculateTotals([...form.items, { name: "", product: "", qty: 1, price: 0 }]);
    };

    const removeItem = (index) => {
        const items = form.items.filter((_, i) => i !== index);
        calculateTotals(items);
    };

    const updateItem = (index, field, value) => {
        const items = [...form.items];
        items[index][field] = ["name", "product"].includes(field) ? value : Number(value);
        calculateTotals(items);
    };

    const selectProduct = (index, product) => {
        const items = [...form.items];
        items[index] = {
            ...items[index],
            product: product?._id || "",
            name: product?.name || "",
            price: Number(product?.price || 0)
        };
        calculateTotals(items);
    };

    // ================= TABLE =================
    const columns = [
        { field: "orderNo", headerName: "Order No", flex: 1 },
        { field: "supplierName", headerName: "Supplier", flex: 1 },
        {
            field: "items",
            headerName: "Items",
            flex: 1,
            renderCell: (p) => `${p.row.items.length} items`
        },
        { field: "grandTotal", headerName: "₹ Total", flex: 1 },
        {
            field: "status",
            headerName: "Status",
            flex: 1,
            renderCell: (p) => <Chip label={p.row.status} size="small" />
        },
        { field: "date", headerName: "Date", flex: 1 },
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
            <Typography variant="h5" mb={2}>Purchase Orders</Typography>

            {/* TOP BAR */}
            <Stack direction="row" spacing={2} mb={2}>
                <TextField fullWidth placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />

                <TextField select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="Ordered">Ordered</MenuItem>
                    <MenuItem value="Pending">Pending</MenuItem>
                </TextField>

                <Button variant="contained" onClick={handleAdd}>
                    Add Order
                </Button>
            </Stack>

            {/* STATS */}
            <Grid container spacing={2} mb={2}>
                <Grid item xs={6}>
                    <Box p={2} bgcolor="primary.light" borderRadius={2}>
                        <Typography>Total Orders</Typography>
                        <Typography variant="h5">{totalOrders}</Typography>
                    </Box>
                </Grid>
                <Grid item xs={6}>
                    <Box p={2} bgcolor="success.light" borderRadius={2}>
                        <Typography>Total Amount</Typography>
                        <Typography variant="h5">₹ {totalAmount}</Typography>
                    </Box>
                </Grid>
            </Grid>

            {/* TABLE */}
            <div style={{ height: 500 }}>
                <DataGrid rows={filteredRows} columns={columns} slots={{ toolbar: GridToolbar }} />
            </div>

            {/* MENU */}
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                <MuiMenuItem onClick={() => { setMode("view"); setDrawerOpen(true); setAnchorEl(null); }}>
                    <ListItemIcon><VisibilityIcon fontSize="small" /></ListItemIcon>
                    View
                </MuiMenuItem>
                <MuiMenuItem onClick={handleEdit}>Edit</MuiMenuItem>
                <MuiMenuItem onClick={handleDelete}>Delete</MuiMenuItem>
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
                        {mode === "add" ? "Add Order" : mode === "edit" ? "Edit Order" : "Order Details"}
                    </Typography>
                </Box>
                <Box width={400} p={3}>

                    {mode === "view" ? (
                        <>
                            <Typography>{selected?.orderNo}</Typography>
                            <Typography>{selected?.supplierName}</Typography>

                            <Divider sx={{ my: 2 }} />

                            {selected?.items.map((i, idx) => (
                                <Box key={idx} display="flex" justifyContent="space-between">
                                    <Typography>{i.name} × {i.qty}</Typography>
                                    <Typography>₹ {i.qty * i.price}</Typography>
                                </Box>
                            ))}

                            <Divider sx={{ my: 2 }} />
                            <Typography>Total: ₹ {selected?.grandTotal}</Typography>
                        </>
                    ) : (
                        <Stack spacing={2}>
                            <TextField label="Order No" value={form.orderNo} onChange={(e) => setForm({ ...form, orderNo: e.target.value })} />

                            <Autocomplete
                                options={suppliers}
                                getOptionLabel={(option) => option.name || ""}
                                value={suppliers.find((s) => s._id === form.supplier) || null}
                                onChange={(event, value) => setForm({ ...form, supplier: value?._id || "" })}
                                renderInput={(params) => <TextField {...params} label="Supplier" />}
                            />

                            <TextField type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />

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

                            <Typography>Total: ₹ {form.total}</Typography>
                            <Typography>Tax: ₹ {form.tax}</Typography>
                            <Typography>Grand Total: ₹ {form.grandTotal}</Typography>

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
