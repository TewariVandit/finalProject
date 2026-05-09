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
    ListItemIcon
} from "@mui/material";

import { DataGrid, GridToolbar } from "@mui/x-data-grid";

import MoreVertIcon from "@mui/icons-material/MoreVert";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloseIcon from "@mui/icons-material/Close";

import MainCard from "components/MainCard";

// ================= MOCK DATA =================
const customerData = [
    {
        id: 1,
        name: "Ravi Kumar",
        phone: "9876543210",
        email: "ravi@gmail.com",
        city: "Jaipur",
        gst: "08ABCDE1234F1Z5",
        totalOrders: 12,
        totalSpent: 25400,
        pendingAmount: 1200,
        status: "Active",
        lastOrder: "2026-03-25"
    },
    {
        id: 2,
        name: "Neha Sharma",
        phone: "9123456780",
        email: "neha@gmail.com",
        city: "Delhi",
        gst: "",
        totalOrders: 5,
        totalSpent: 8200,
        pendingAmount: 0,
        status: "Active",
        lastOrder: "2026-03-20"
    },
    {
        id: 3,
        name: "Amit Singh",
        phone: "9988776655",
        email: "amit@gmail.com",
        city: "Mumbai",
        gst: "27ABCDE1234F1Z5",
        totalOrders: 20,
        totalSpent: 50200,
        pendingAmount: 5400,
        status: "Inactive",
        lastOrder: "2026-02-10"
    }
];

export default function CustomersPage() {
    const [rows, setRows] = useState(customerData);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const [selected, setSelected] = useState(null);
    const [viewOpen, setViewOpen] = useState(false);

    const [anchorEl, setAnchorEl] = useState(null);

    // ================= FILTER =================
    const filteredRows = rows.filter((r) => {
        return (
            (r.name.toLowerCase().includes(search.toLowerCase()) ||
                r.phone.includes(search)) &&
            (statusFilter === "all" || r.status === statusFilter)
        );
    });

    // ================= SUMMARY =================
    const totalCustomers = filteredRows.length;
    const active = filteredRows.filter((r) => r.status === "Active").length;
    const inactive = filteredRows.filter((r) => r.status === "Inactive").length;
    const totalRevenue = filteredRows.reduce((s, r) => s + r.totalSpent, 0);

    // ================= STATUS CHIP =================
    const getStatus = (status) => (
        <Chip
            label={status}
            color={status === "Active" ? "success" : "default"}
            size="small"
            variant="outlined"
        />
    );

    // ================= MENU =================
    const handleMenuOpen = (e, row) => {
        setAnchorEl(e.currentTarget);
        setSelected(row);
    };

    const handleMenuClose = () => setAnchorEl(null);

    // ================= COLUMNS =================
    const columns = [
        { field: "name", headerName: "Customer Name", flex: 1 },
        { field: "phone", headerName: "Phone", flex: 1 },
        { field: "city", headerName: "City", flex: 1 },
        { field: "totalOrders", headerName: "Orders", flex: 1 },
        { field: "totalSpent", headerName: "₹ Spent", flex: 1 },
        { field: "pendingAmount", headerName: "₹ Pending", flex: 1 },
        {
            field: "status",
            headerName: "Status",
            flex: 1,
            renderCell: (p) => getStatus(p.row.status)
        },
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
                Customers
            </Typography>

            {/* FILTERS */}
            <Stack direction="row" spacing={2} mb={2}>
                <TextField
                    fullWidth
                    placeholder="Search by name or phone..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <TextField
                    select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Inactive">Inactive</MenuItem>
                </TextField>
            </Stack>

            {/* DASHBOARD */}
            <Grid container spacing={2} mb={2}>
                <Grid item xs={12} md={3}>
                    <Box p={2} bgcolor="primary.light" borderRadius={2}>
                        <Typography>Total Customers</Typography>
                        <Typography variant="h5">{totalCustomers}</Typography>
                    </Box>
                </Grid>

                <Grid item xs={12} md={3}>
                    <Box p={2} bgcolor="success.light" borderRadius={2}>
                        <Typography>Active</Typography>
                        <Typography variant="h5">{active}</Typography>
                    </Box>
                </Grid>

                <Grid item xs={12} md={3}>
                    <Box p={2} bgcolor="warning.light" borderRadius={2}>
                        <Typography>Inactive</Typography>
                        <Typography variant="h5">{inactive}</Typography>
                    </Box>
                </Grid>

                <Grid item xs={12} md={3}>
                    <Box p={2} bgcolor="info.light" borderRadius={2}>
                        <Typography>Total Revenue</Typography>
                        <Typography variant="h5">₹ {totalRevenue}</Typography>
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
                        <Typography variant="h6">{selected?.name}</Typography>
                        <IconButton onClick={() => setViewOpen(false)} sx={{ color: "#fff" }}>
                            <CloseIcon />
                        </IconButton>
                    </Box>

                    {/* BODY */}
                    <Box p={2} flex={1}>

                        <Typography variant="subtitle2">Contact</Typography>
                        <Typography>{selected?.phone}</Typography>
                        <Typography>{selected?.email}</Typography>

                        <Box mt={2}>
                            <Typography variant="subtitle2">Business Info</Typography>
                            <Typography>City: {selected?.city}</Typography>
                            <Typography>GST: {selected?.gst || "N/A"}</Typography>
                        </Box>

                        <Box mt={2}>
                            <Typography variant="subtitle2">Financial</Typography>
                            <Typography>Total Spent: ₹ {selected?.totalSpent}</Typography>
                            <Typography>Pending: ₹ {selected?.pendingAmount}</Typography>
                        </Box>

                        <Box mt={2}>
                            <Typography variant="subtitle2">Orders</Typography>
                            <Typography>Total Orders: {selected?.totalOrders}</Typography>
                            <Typography>Last Order: {selected?.lastOrder}</Typography>
                        </Box>

                    </Box>

                    {/* FOOTER */}
                    <Box p={2} borderTop="1px solid #eee">
                        <Button fullWidth variant="contained">
                            Create Order
                        </Button>
                    </Box>
                </Box>
            </Drawer>
        </MainCard>
    );
}