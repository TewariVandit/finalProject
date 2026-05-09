import { useState } from "react";
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
    Divider
} from "@mui/material";

import { DataGrid, GridToolbar } from "@mui/x-data-grid";

import MoreVertIcon from "@mui/icons-material/MoreVert";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloseIcon from "@mui/icons-material/Close";

import MainCard from "components/MainCard";

// ================= MOCK DATA =================
const ordersData = [
    {
        id: 1,
        orderNo: "SO-001",
        customer: "Ravi Kumar",
        items: [
            { name: "Rice", qty: 2, price: 500 },
            { name: "Milk", qty: 5, price: 50 }
        ],
        total: 1250,
        tax: 50,
        grandTotal: 1300,
        status: "Confirmed",
        staff: "Amit",
        date: "2026-03-25"
    },
    {
        id: 2,
        orderNo: "SO-002",
        customer: "Neha Sharma",
        items: [
            { name: "Soap", qty: 4, price: 40 },
            { name: "Shampoo", qty: 2, price: 120 }
        ],
        total: 400,
        tax: 20,
        grandTotal: 420,
        status: "Draft",
        staff: "Rohit",
        date: "2026-03-26"
    }
];

export default function SalesOrderPage() {
    const [rows, setRows] = useState(ordersData);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const [selected, setSelected] = useState(null);
    const [viewOpen, setViewOpen] = useState(false);

    const [anchorEl, setAnchorEl] = useState(null);

    // ================= FILTER =================
    const filteredRows = rows.filter((r) => {
        return (
            (r.customer.toLowerCase().includes(search.toLowerCase()) ||
                r.orderNo.toLowerCase().includes(search.toLowerCase())) &&
            (statusFilter === "all" || r.status === statusFilter)
        );
    });

    // ================= SUMMARY =================
    const totalOrders = filteredRows.length;
    const revenue = filteredRows.reduce((s, r) => s + r.grandTotal, 0);
    const draft = filteredRows.filter((r) => r.status === "Draft").length;
    const delivered = filteredRows.filter((r) => r.status === "Delivered").length;

    // ================= STATUS CHIP =================
    const getStatus = (status) => {
        const color =
            status === "Delivered"
                ? "success"
                : status === "Confirmed"
                ? "info"
                : "warning";

        return <Chip label={status} color={color} size="small" variant="outlined" />;
    };

    // ================= MENU =================
    const handleMenuOpen = (e, row) => {
        setAnchorEl(e.currentTarget);
        setSelected(row);
    };

    const handleMenuClose = () => setAnchorEl(null);

    // ================= UPDATE STATUS =================
    const updateStatus = (value) => {
        setRows((prev) =>
            prev.map((r) =>
                r.id === selected.id ? { ...r, status: value } : r
            )
        );
        setSelected({ ...selected, status: value });
    };

    // ================= COLUMNS =================
    const columns = [
        { field: "orderNo", headerName: "Order No", flex: 1 },
        { field: "customer", headerName: "Customer", flex: 1 },
        {
            field: "items",
            headerName: "Items",
            flex: 1,
            renderCell: (p) => `${p.row.items.length} items`
        },
        { field: "grandTotal", headerName: "₹ Total", flex: 1 },
        { field: "staff", headerName: "Staff", flex: 1 },
        {
            field: "status",
            headerName: "Status",
            flex: 1,
            renderCell: (p) => getStatus(p.row.status)
        },
        { field: "date", headerName: "Date", flex: 1 },
        {
            field: "action",
            headerName: "",
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
            {/* HEADER */}
            <Typography variant="h5" mb={2}>
                Sales Orders
            </Typography>

            {/* FILTERS */}
            <Stack direction="row" spacing={2} mb={2}>
                <TextField
                    fullWidth
                    placeholder="Search order or customer..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <TextField
                    select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="Draft">Draft</MenuItem>
                    <MenuItem value="Confirmed">Confirmed</MenuItem>
                    <MenuItem value="Delivered">Delivered</MenuItem>
                </TextField>
            </Stack>

            {/* DASHBOARD */}
            <Grid container spacing={2} mb={2}>
                <Grid item xs={12} md={3}>
                    <Box p={2} bgcolor="primary.light" borderRadius={2}>
                        <Typography>Total Orders</Typography>
                        <Typography variant="h5">{totalOrders}</Typography>
                    </Box>
                </Grid>

                <Grid item xs={12} md={3}>
                    <Box p={2} bgcolor="success.light" borderRadius={2}>
                        <Typography>Revenue</Typography>
                        <Typography variant="h5">₹ {revenue}</Typography>
                    </Box>
                </Grid>

                <Grid item xs={12} md={3}>
                    <Box p={2} bgcolor="warning.light" borderRadius={2}>
                        <Typography>Draft</Typography>
                        <Typography variant="h5">{draft}</Typography>
                    </Box>
                </Grid>

                <Grid item xs={12} md={3}>
                    <Box p={2} bgcolor="info.light" borderRadius={2}>
                        <Typography>Delivered</Typography>
                        <Typography variant="h5">{delivered}</Typography>
                    </Box>
                </Grid>
            </Grid>

            {/* TABLE */}
            <div style={{ height: 500 }}>
                <DataGrid
                    rows={filteredRows}
                    columns={columns}
                    slots={{ toolbar: GridToolbar }}
                    disableRowSelectionOnClick
                />
            </div>

            {/* MENU */}
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                <MuiMenuItem
                    onClick={() => {
                        setViewOpen(true);
                        handleMenuClose();
                    }}
                >
                    <ListItemIcon>
                        <VisibilityIcon fontSize="small" />
                    </ListItemIcon>
                    View
                </MuiMenuItem>
            </Menu>

            {/* DRAWER */}
            <Drawer anchor="right" open={viewOpen} onClose={() => setViewOpen(false)}>
                <Box width={420} display="flex" flexDirection="column" height="100%">

                    {/* HEADER */}
                    <Box p={2} bgcolor="primary.main" color="#fff" display="flex" justifyContent="space-between">
                        <Box>
                            <Typography variant="h6">{selected?.orderNo}</Typography>
                            <Typography variant="caption">{selected?.customer}</Typography>
                        </Box>
                        <IconButton onClick={() => setViewOpen(false)} sx={{ color: "#fff" }}>
                            <CloseIcon />
                        </IconButton>
                    </Box>

                    {/* BODY */}
                    <Box p={2} flex={1} overflow="auto">

                        {/* ITEMS */}
                        <Typography variant="subtitle2" mb={1}>
                            Items
                        </Typography>

                        <Stack spacing={1} mb={2}>
                            {selected?.items?.map((item, i) => (
                                <Box key={i} display="flex" justifyContent="space-between">
                                    <Typography>
                                        {item.name} × {item.qty}
                                    </Typography>
                                    <Typography>₹ {item.qty * item.price}</Typography>
                                </Box>
                            ))}
                        </Stack>

                        <Divider />

                        {/* TOTALS */}
                        <Stack spacing={1} mt={2}>
                            <Box display="flex" justifyContent="space-between">
                                <Typography>Subtotal</Typography>
                                <Typography>₹ {selected?.total}</Typography>
                            </Box>

                            <Box display="flex" justifyContent="space-between">
                                <Typography>Tax</Typography>
                                <Typography>₹ {selected?.tax}</Typography>
                            </Box>

                            <Box display="flex" justifyContent="space-between">
                                <Typography fontWeight={600}>Total</Typography>
                                <Typography fontWeight={600}>
                                    ₹ {selected?.grandTotal}
                                </Typography>
                            </Box>
                        </Stack>

                        {/* STATUS */}
                        <Box mt={3}>
                            <Typography variant="subtitle2">Status</Typography>

                            <Stack direction="row" spacing={2} mt={1}>
                                {getStatus(selected?.status)}

                                <TextField
                                    select
                                    size="small"
                                    value={selected?.status || ""}
                                    onChange={(e) => updateStatus(e.target.value)}
                                >
                                    <MenuItem value="Draft">Draft</MenuItem>
                                    <MenuItem value="Confirmed">Confirmed</MenuItem>
                                    <MenuItem value="Delivered">Delivered</MenuItem>
                                </TextField>
                            </Stack>
                        </Box>
                    </Box>

                    {/* FOOTER */}
                    <Box p={2} borderTop="1px solid #eee">
                        <Button fullWidth variant="contained">
                            Convert to Invoice
                        </Button>
                    </Box>
                </Box>
            </Drawer>
        </MainCard>
    );
}