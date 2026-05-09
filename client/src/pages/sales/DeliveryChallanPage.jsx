import { useState, useEffect } from "react";
import {
    Box, Typography, TextField, MenuItem, Stack, Grid, Chip,
    IconButton, Drawer, Button, Menu, MenuItem as MuiMenuItem,
    ListItemIcon, Divider, Dialog, DialogTitle, DialogContent
} from "@mui/material";

import { DataGrid, GridToolbar } from "@mui/x-data-grid";

import MoreVertIcon from "@mui/icons-material/MoreVert";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloseIcon from "@mui/icons-material/Close";

import MainCard from "components/MainCard";
import API from "../../api/axios";

export default function DeliveryChallanPage() {

    const [rows, setRows] = useState([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const [selected, setSelected] = useState(null);
    const [viewOpen, setViewOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);

    const [addOpen, setAddOpen] = useState(false);

    // ================= FORM =================
    const emptyForm = {
        saleId: "",
        delivery: {
            challanNo: "",
            orderNo: "",
            driver: "",
            vehicle: "",
            dispatchDate: ""
        }
    };

    const [form, setForm] = useState(emptyForm);

    // ================= FETCH =================
    const fetchChallans = async () => {
        const res = await API.get("/sales/challans");

        setRows(
            res.data.data.map((s) => ({
                id: s._id,
                challanNo: s.delivery?.challanNo,
                orderNo: s.delivery?.orderNo,
                customer: s.customer,
                items: s.items,
                driver: s.delivery?.driver,
                vehicle: s.delivery?.vehicle,
                status: s.delivery?.status,
                dispatchDate: s.delivery?.dispatchDate,
                deliveryDate: s.delivery?.deliveryDate
            }))
        );
    };

    useEffect(() => {
        fetchChallans();
    }, []);

    // ================= FILTER =================
    const filteredRows = rows.filter((r) =>
        (r.customer?.toLowerCase().includes(search.toLowerCase()) ||
            r.challanNo?.toLowerCase().includes(search.toLowerCase())) &&
        (statusFilter === "all" || r.status === statusFilter)
    );

    // ================= STATUS =================
    const getStatus = (status) => {
        const color =
            status === "Delivered"
                ? "success"
                : status === "In Transit"
                ? "info"
                : "warning";

        return <Chip label={status} color={color} size="small" />;
    };

    // ================= UPDATE STATUS =================
    const updateStatus = async (value) => {
        await API.patch(`/sales/challans/${selected.id}/status`, {
            status: value
        });

        fetchChallans();
        setSelected({ ...selected, status: value });
    };

    // ================= CREATE =================
    const createChallan = async () => {
        await API.post("/sales/challans", form);
        fetchChallans();
        setAddOpen(false);
    };

    // ================= SUMMARY =================
    const total = filteredRows.length;
    const pending = filteredRows.filter((r) => r.status === "Pending").length;
    const transit = filteredRows.filter((r) => r.status === "In Transit").length;
    const delivered = filteredRows.filter((r) => r.status === "Delivered").length;

    // ================= COLUMNS =================
    const columns = [
        { field: "challanNo", headerName: "Challan No", flex: 1 },
        { field: "orderNo", headerName: "Order No", flex: 1 },
        { field: "customer", headerName: "Customer", flex: 1 },
        {
            field: "items",
            headerName: "Items",
            flex: 1,
            renderCell: (p) => `${p.row.items.length} items`
        },
        { field: "driver", headerName: "Driver", flex: 1 },
        { field: "vehicle", headerName: "Vehicle", flex: 1 },
        { field: "status", headerName: "Status", flex: 1, renderCell: (p) => getStatus(p.row.status) },
        { field: "dispatchDate", headerName: "Dispatch", flex: 1 },
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
            <Typography variant="h5" mb={2}>Delivery Challan</Typography>

            {/* FILTER */}
            <Stack direction="row" spacing={2} mb={2}>
                <TextField fullWidth placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />

                <TextField select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="In Transit">In Transit</MenuItem>
                    <MenuItem value="Delivered">Delivered</MenuItem>
                </TextField>

                <Button variant="contained" onClick={() => setAddOpen(true)}>
                    Add Challan
                </Button>
            </Stack>

            {/* SUMMARY */}
            <Grid container spacing={2} mb={2}>
                <Grid item xs={3}><Box p={2} bgcolor="primary.light"><Typography>Total</Typography><Typography>{total}</Typography></Box></Grid>
                <Grid item xs={3}><Box p={2} bgcolor="warning.light"><Typography>Pending</Typography><Typography>{pending}</Typography></Box></Grid>
                <Grid item xs={3}><Box p={2} bgcolor="info.light"><Typography>Transit</Typography><Typography>{transit}</Typography></Box></Grid>
                <Grid item xs={3}><Box p={2} bgcolor="success.light"><Typography>Delivered</Typography><Typography>{delivered}</Typography></Box></Grid>
            </Grid>

            {/* TABLE */}
            <div style={{ height: 500 }}>
                <DataGrid rows={filteredRows} columns={columns} slots={{ toolbar: GridToolbar }} />
            </div>

            {/* MENU */}
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                <MuiMenuItem onClick={() => { setViewOpen(true); setAnchorEl(null); }}>
                    <ListItemIcon><VisibilityIcon fontSize="small" /></ListItemIcon>
                    View
                </MuiMenuItem>
            </Menu>

            {/* VIEW DRAWER */}
            <Drawer anchor="right" open={viewOpen} onClose={() => setViewOpen(false)}>
                <Box width={400} p={3}>
                    <Typography variant="h6">{selected?.challanNo}</Typography>

                    <Typography>{selected?.customer}</Typography>

                    <Divider sx={{ my: 2 }} />

                    {selected?.items?.map((i, idx) => (
                        <Box key={idx} display="flex" justifyContent="space-between">
                            <Typography>{i.name}</Typography>
                            <Typography>Qty: {i.qty}</Typography>
                        </Box>
                    ))}

                    <Divider sx={{ my: 2 }} />

                    <Typography>Driver: {selected?.driver}</Typography>
                    <Typography>Vehicle: {selected?.vehicle}</Typography>
                    <Typography>Dispatch: {selected?.dispatchDate}</Typography>
                    <Typography>Delivery: {selected?.deliveryDate || "Pending"}</Typography>

                    <TextField
                        select
                        fullWidth
                        sx={{ mt: 2 }}
                        value={selected?.status || ""}
                        onChange={(e) => updateStatus(e.target.value)}
                    >
                        <MenuItem value="Pending">Pending</MenuItem>
                        <MenuItem value="In Transit">In Transit</MenuItem>
                        <MenuItem value="Delivered">Delivered</MenuItem>
                    </TextField>
                </Box>
            </Drawer>

            {/* ADD CHALLAN */}
            <Dialog open={addOpen} onClose={() => setAddOpen(false)} fullWidth>
                <DialogTitle>Add Challan</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} mt={1}>

                        <TextField label="Sale ID"
                            value={form.saleId}
                            onChange={(e) => setForm({ ...form, saleId: e.target.value })}
                        />

                        <TextField label="Challan No"
                            onChange={(e) => setForm({
                                ...form,
                                delivery: { ...form.delivery, challanNo: e.target.value }
                            })}
                        />

                        <TextField label="Order No"
                            onChange={(e) => setForm({
                                ...form,
                                delivery: { ...form.delivery, orderNo: e.target.value }
                            })}
                        />

                        <TextField label="Driver"
                            onChange={(e) => setForm({
                                ...form,
                                delivery: { ...form.delivery, driver: e.target.value }
                            })}
                        />

                        <TextField label="Vehicle"
                            onChange={(e) => setForm({
                                ...form,
                                delivery: { ...form.delivery, vehicle: e.target.value }
                            })}
                        />

                        <TextField type="date"
                            onChange={(e) => setForm({
                                ...form,
                                delivery: { ...form.delivery, dispatchDate: e.target.value }
                            })}
                        />

                        <Button variant="contained" onClick={createChallan}>
                            Save
                        </Button>

                    </Stack>
                </DialogContent>
            </Dialog>

        </MainCard>
    );
}