import { useEffect, useState } from "react";
import {
    Box,
    Typography,
    TextField,
    MenuItem,
    Stack,
    Grid,
    Chip,
    IconButton,
    Drawer,
    Button,
    Menu,
    MenuItem as MuiMenuItem,
    ListItemIcon,
    Divider,
    Snackbar,
    Alert
} from "@mui/material";

import { DataGrid, GridToolbar } from "@mui/x-data-grid";

import MoreVertIcon from "@mui/icons-material/MoreVert";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloseIcon from "@mui/icons-material/Close";

import MainCard from "components/MainCard";
import API from "../../api/axios";

// ================= EMPTY FORM =================
const emptyForm = {
    returnNo: "",
    orderNo: "",
    customer: "",
    items: [{ name: "", qty: 1, price: 0 }],
    refundAmount: 0,
    refundMode: "Cash",
    status: "Requested",
    date: ""
};

export default function SalesReturnsPage() {
    const [rows, setRows] = useState([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const [selected, setSelected] = useState(null);
    const [viewOpen, setViewOpen] = useState(false);
    const [formOpen, setFormOpen] = useState(false);

    const [form, setForm] = useState(emptyForm);

    const [anchorEl, setAnchorEl] = useState(null);

    const [snackbar, setSnackbar] = useState({ open: false, msg: "", type: "success" });

    // ================= FETCH =================
    const fetchReturns = async () => {
        try {
            const res = await API.get("/sales/returns");

            setRows(
                res.data.data.map((item) => ({
                    id: item._id,
                    ...item
                }))
            );
        } catch (err) {
            setSnackbar({ open: true, msg: "Fetch failed", type: "error" });
        }
    };

    useEffect(() => {
        fetchReturns();
    }, []);

    // ================= FILTER =================
    const filteredRows = rows.filter((r) =>
        (r.customer?.toLowerCase().includes(search.toLowerCase()) ||
            r.returnNo?.toLowerCase().includes(search.toLowerCase())) &&
        (statusFilter === "all" || r.status === statusFilter)
    );

    // ================= SUMMARY =================
    const total = filteredRows.length;
    const refunded = filteredRows.filter((r) => r.status === "Refunded").length;
    const requested = filteredRows.filter((r) => r.status === "Requested").length;
    const totalRefund = filteredRows.reduce((s, r) => s + r.refundAmount, 0);

    // ================= STATUS =================
    const getStatus = (status) => {
        const color =
            status === "Refunded"
                ? "success"
                : status === "Approved"
                    ? "info"
                    : "warning";

        return <Chip label={status} color={color} size="small" />;
    };

    // ================= MENU =================
    const handleMenuOpen = (e, row) => {
        setAnchorEl(e.currentTarget);
        setSelected(row);
    };

    const handleMenuClose = () => setAnchorEl(null);

    // ================= CREATE =================
    const handleAdd = () => {
        setForm(emptyForm);
        setFormOpen(true);
    };

    const handleSave = async () => {
        try {
            await API.post("/sales/returns", form);

            setSnackbar({ open: true, msg: "Return added", type: "success" });
            setFormOpen(false);
            fetchReturns();
        } catch {
            setSnackbar({ open: true, msg: "Save failed", type: "error" });
        }
    };

    // ================= UPDATE STATUS =================
    const updateStatus = async (value) => {
        try {
            await API.put(`/sales/returns/${selected.id}`, {
                ...selected,
                status: value
            });

            setSelected({ ...selected, status: value });
            fetchReturns();
        } catch {
            setSnackbar({ open: true, msg: "Update failed", type: "error" });
        }
    };

    // ================= DELETE =================
    const handleDelete = async () => {
        try {
            await API.delete(`/sales/returns/${selected.id}`);
            setSnackbar({ open: true, msg: "Deleted", type: "error" });
            fetchReturns();
        } catch {
            setSnackbar({ open: true, msg: "Delete failed", type: "error" });
        }
    };

    // ================= ITEMS =================
    const calculateTotal = (items) => {
        const refundAmount = items.reduce((s, i) => s + i.qty * i.price, 0);
        setForm((prev) => ({ ...prev, items, refundAmount }));
    };

    const updateItem = (index, field, value) => {
        const items = [...form.items];
        items[index][field] = field === "name" ? value : Number(value);
        calculateTotal(items);
    };

    const addItem = () => calculateTotal([...form.items, { name: "", qty: 1, price: 0 }]);

    // ================= COLUMNS =================
    const columns = [
        { field: "returnNo", headerName: "Return No", flex: 1 },
        { field: "orderNo", headerName: "Order No", flex: 1 },
        { field: "customer", headerName: "Customer", flex: 1 },
        {
            field: "items",
            headerName: "Items",
            flex: 1,
            renderCell: (p) => `${p.row.items?.length || 0} items`
        },
        { field: "refundAmount", headerName: "₹ Refund", flex: 1 },
        { field: "refundMode", headerName: "Mode", flex: 1 },
        {
            field: "status",
            headerName: "Status",
            flex: 1,
            renderCell: (p) => getStatus(p.row.status)
        },
        {
            field: "action",
            width: 70,
            renderCell: (p) => (
                <IconButton onClick={(e) => handleMenuOpen(e, p.row)}>
                    <MoreVertIcon />
                </IconButton>
            )
        }
    ];

    return (
        <MainCard>
            <Typography variant="h5" mb={2}>Sales Returns</Typography>

            {/* FILTER */}
            <Stack direction="row" spacing={2} mb={2}>
                <TextField
                    fullWidth
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <TextField
                    select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="Requested">Requested</MenuItem>
                    <MenuItem value="Approved">Approved</MenuItem>
                    <MenuItem value="Refunded">Refunded</MenuItem>
                </TextField>

                <Button variant="contained" onClick={handleAdd}>
                    Add Return
                </Button>
            </Stack>

            {/* STATS */}
            <Grid container spacing={2} mb={2}>
                <Grid item xs={3}><Box p={2} bgcolor="primary.light">Total {total}</Box></Grid>
                <Grid item xs={3}><Box p={2} bgcolor="warning.light">Requested {requested}</Box></Grid>
                <Grid item xs={3}><Box p={2} bgcolor="success.light">Refunded {refunded}</Box></Grid>
                <Grid item xs={3}><Box p={2} bgcolor="error.light">₹ {totalRefund}</Box></Grid>
            </Grid>

            {/* TABLE */}
            <div style={{ height: 500 }}>
                <DataGrid rows={filteredRows} columns={columns} slots={{ toolbar: GridToolbar }} />
            </div>

            {/* MENU */}
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                <MuiMenuItem onClick={() => { setViewOpen(true); handleMenuClose(); }}>
                    <ListItemIcon><VisibilityIcon fontSize="small" /></ListItemIcon>
                    View
                </MuiMenuItem>
                <MuiMenuItem onClick={handleDelete}>Delete</MuiMenuItem>
            </Menu>

            {/* VIEW DRAWER */}
            <Drawer anchor="right" open={viewOpen} onClose={() => setViewOpen(false)}>
                <Box width={400} p={3}>
                    <Typography variant="h6">{selected?.returnNo}</Typography>

                    {selected?.items?.map((i, idx) => (
                        <Box key={idx} display="flex" justifyContent="space-between">
                            <Typography>{i.name} × {i.qty}</Typography>
                            <Typography>₹ {i.qty * i.price}</Typography>
                        </Box>
                    ))}

                    <Divider sx={{ my: 2 }} />

                    <Typography>Total: ₹ {selected?.refundAmount}</Typography>

                    <TextField
                        select
                        fullWidth
                        value={selected?.status || ""}
                        onChange={(e) => updateStatus(e.target.value)}
                        sx={{ mt: 2 }}
                    >
                        <MenuItem value="Requested">Requested</MenuItem>
                        <MenuItem value="Approved">Approved</MenuItem>
                        <MenuItem value="Refunded">Refunded</MenuItem>
                    </TextField>

                    <Button
                        fullWidth
                        variant="contained"
                        sx={{ mt: 2 }}
                        onClick={() => updateStatus("Refunded")}
                    >
                        Process Refund
                    </Button>
                </Box>
            </Drawer>

            {/* ADD FORM */}
            <Drawer anchor="right" open={formOpen} onClose={() => setFormOpen(false)}>
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
                    <Typography variant="h6">Add Return</Typography>
                </Box>
                <Box width={400} p={3}>

                    <Stack spacing={2}>
                        <TextField label="Return No" onChange={(e) => setForm({ ...form, returnNo: e.target.value })} />
                        <TextField label="Order No" onChange={(e) => setForm({ ...form, orderNo: e.target.value })} />
                        <TextField label="Customer" onChange={(e) => setForm({ ...form, customer: e.target.value })} />

                        {form.items.map((item, i) => (
                            <Stack direction="row" key={i} spacing={1}>
                                <TextField label="Item" onChange={(e) => updateItem(i, "name", e.target.value)} />
                                <TextField type="number" label="Qty" onChange={(e) => updateItem(i, "qty", e.target.value)} />
                                <TextField type="number" label="Price" onChange={(e) => updateItem(i, "price", e.target.value)} />
                            </Stack>
                        ))}

                        <Button onClick={addItem}>+ Add Item</Button>

                        <Typography>Total: ₹ {form.refundAmount}</Typography>

                        <Button variant="contained" onClick={handleSave}>
                            Save
                        </Button>
                    </Stack>
                </Box>
            </Drawer>

            {/* SNACKBAR */}
            <Snackbar open={snackbar.open} autoHideDuration={3000}>
                <Alert severity={snackbar.type}>{snackbar.msg}</Alert>
            </Snackbar>
        </MainCard>
    );
}