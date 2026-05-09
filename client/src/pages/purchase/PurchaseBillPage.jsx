import { useState, useEffect } from "react";
import {
    Autocomplete, Box, Typography, TextField, MenuItem, Stack, Chip,
    IconButton, Drawer, Button, Menu, MenuItem as MuiMenuItem,
    ListItemIcon, Snackbar, Alert
} from "@mui/material";

import { DataGrid, GridToolbar } from "@mui/x-data-grid";

import MoreVertIcon from "@mui/icons-material/MoreVert";
import VisibilityIcon from "@mui/icons-material/Visibility";

import MainCard from "components/MainCard";
import API from "../../api/axios";

// ================= EMPTY FORM =================
const emptyForm = {
    id: "",
    billNo: "",
    supplier: "",
    paymentStatus: "Pending",
    paymentMode: "Cash",
    date: ""
};

export default function PurchaseBillsPage() {

    const [rows, setRows] = useState([]);
    const [suppliers, setSuppliers] = useState([]);

    const [search, setSearch] = useState("");

    const [selected, setSelected] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [mode, setMode] = useState("view");

    const [form, setForm] = useState(emptyForm);
    const [anchorEl, setAnchorEl] = useState(null);

    const [snackbar, setSnackbar] = useState({ open: false, msg: "", type: "success" });

    // ================= FETCH =================
    const fetchBills = async () => {
        try {
            const res = await API.get("/inventory/purchase-orders");

            setRows(
                res.data.data.map((item) => ({
                    id: item._id,
                    billNo: item.billNo || item.orderNo,
                    supplier: item.supplier?._id || "",
                    supplierName: item.supplier?.name || "",
                    total: item.grandTotal,
                    paymentStatus: item.paymentStatus || "Pending",
                    paymentMode: item.paymentMode || "Cash",
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
        fetchBills();
        fetchSuppliers();
    }, []);

    // ================= FILTER =================
    const filteredRows = rows.filter((r) =>
        r.supplierName.toLowerCase().includes(search.toLowerCase())
    );

    // ================= CRUD =================
    const handleAdd = () => {
        setMode("add");
        setForm(emptyForm);
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
            setSnackbar({ open: true, msg: "Bill deleted", type: "success" });
            fetchBills();
        } catch {
            setSnackbar({ open: true, msg: "Delete failed", type: "error" });
        }
        setAnchorEl(null);
    };

    const handleSave = async () => {
        if (!form.billNo || !form.supplier) {
            setSnackbar({ open: true, msg: "Bill No & Supplier required", type: "error" });
            return;
        }

        try {
            const billId = form.id || selected?.id;
            if (!billId) {
                setSnackbar({ open: true, msg: "Bill id missing for edit", type: "error" });
                return;
            }

            await API.put(`/inventory/purchase-orders/${billId}`, {
                billNo: form.billNo,
                supplier: form.supplier,
                paymentStatus: form.paymentStatus,
                paymentMode: form.paymentMode,
                date: form.date
            });

            setSnackbar({ open: true, msg: "Bill updated", type: "success" });
            fetchBills();
            setDrawerOpen(false);

        } catch {
            setSnackbar({ open: true, msg: "Save failed", type: "error" });
        }
    };

    // ================= UI =================
    const getStatus = (s) => (
        <Chip label={s} color={s === "Paid" ? "success" : "warning"} size="small" />
    );

    const columns = [
        { field: "billNo", headerName: "Bill No", flex: 1 },
        { field: "supplierName", headerName: "Supplier", flex: 1 },
        { field: "total", headerName: "₹ Total", flex: 1 },
        { field: "paymentMode", headerName: "Mode", flex: 1 },
        {
            field: "paymentStatus",
            headerName: "Status",
            flex: 1,
            renderCell: (p) => getStatus(p.row.paymentStatus)
        },
        {
            field: "action",
            width: 70,
            renderCell: (p) => (
                <IconButton
                    onClick={(e) => {
                        setAnchorEl(e.currentTarget);
                        setSelected(p.row);
                    }}
                >
                    <MoreVertIcon />
                </IconButton>
            )
        }
    ];

    return (
        <MainCard>
            <Typography variant="h5" mb={2}>Purchase Bills</Typography>

            {/* TOP BAR */}
            <Stack direction="row" spacing={2} mb={2}>
                <TextField
                    fullWidth
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <Button variant="contained" onClick={handleAdd}>
                    Add Bill
                </Button>
            </Stack>

            {/* TABLE */}
            <div style={{ height: 500 }}>
                <DataGrid
                    rows={filteredRows}
                    columns={columns}
                    slots={{ toolbar: GridToolbar }}
                />
            </div>

            {/* MENU */}
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                <MuiMenuItem onClick={() => {
                    setMode("view");
                    setDrawerOpen(true);
                    setAnchorEl(null);
                }}>
                    <ListItemIcon>
                        <VisibilityIcon fontSize="small" />
                    </ListItemIcon>
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
                        {mode === "view" ? "Bill Details" : "Edit Bill"}
                    </Typography>
                </Box>
                <Box width={400} p={3}>
                    {mode === "view" ? (
                        <>
                            <Typography>Bill No: {selected?.billNo}</Typography>
                            <Typography>Supplier: {selected?.supplierName}</Typography>
                            <Typography>Total: ₹ {selected?.total}</Typography>
                            <Typography>Mode: {selected?.paymentMode}</Typography>
                            <Typography>Status: {selected?.paymentStatus}</Typography>
                        </>
                    ) : (
                        <Stack spacing={2}>
                            <TextField
                                label="Bill No"
                                value={form.billNo}
                                onChange={(e) =>
                                    setForm({ ...form, billNo: e.target.value })
                                }
                            />

                            <Autocomplete
                                options={suppliers}
                                getOptionLabel={(option) => option.name || ""}
                                value={suppliers.find((s) => s._id === form.supplier) || null}
                                onChange={(event, value) => setForm({ ...form, supplier: value?._id || "" })}
                                renderInput={(params) => <TextField {...params} label="Supplier" />}
                            />

                            <TextField
                                select
                                label="Payment Mode"
                                value={form.paymentMode}
                                onChange={(e) =>
                                    setForm({ ...form, paymentMode: e.target.value })
                                }
                            >
                                <MenuItem value="Cash">Cash</MenuItem>
                                <MenuItem value="Bank">Bank</MenuItem>
                                <MenuItem value="UPI">UPI</MenuItem>
                            </TextField>

                            <TextField
                                select
                                label="Payment Status"
                                value={form.paymentStatus}
                                onChange={(e) =>
                                    setForm({ ...form, paymentStatus: e.target.value })
                                }
                            >
                                <MenuItem value="Paid">Paid</MenuItem>
                                <MenuItem value="Pending">Pending</MenuItem>
                            </TextField>

                            <Button variant="contained" onClick={handleSave}>
                                Save
                            </Button>
                        </Stack>
                    )}
                </Box>
            </Drawer>

            {/* SNACKBAR */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert severity={snackbar.type}>{snackbar.msg}</Alert>
            </Snackbar>
        </MainCard>
    );
}
