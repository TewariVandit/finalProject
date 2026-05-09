import { useState, useEffect } from "react";
import {
    Autocomplete, Box, Typography, TextField, MenuItem, Chip, Stack, Button, Grid,
    IconButton, Drawer, Menu, MenuItem as MuiMenuItem,
    ListItemIcon, Dialog, DialogTitle, DialogContent, Divider 
} from "@mui/material";

import { DataGrid, GridToolbar } from "@mui/x-data-grid";

import MoreVertIcon from "@mui/icons-material/MoreVert";
import VisibilityIcon from "@mui/icons-material/Visibility";

import MainCard from "components/MainCard";
import API from "../api/axios";
import toast from "react-hot-toast";
import { decimalOnly, isBlank, isPositiveNumber } from "utils/validation";

export default function SalesPage() {

    const [rows, setRows] = useState([]);
    const [search, setSearch] = useState("");
    const [staffFilter, setStaffFilter] = useState("all");

    const [selected, setSelected] = useState(null);
    const [viewOpen, setViewOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);

    const [addOpen, setAddOpen] = useState(false);
    const [userOptions, setUserOptions] = useState([]);
    const [staffOptions, setStaffOptions] = useState([]);
    const [productOptions, setProductOptions] = useState([]);
    const [userSearch, setUserSearch] = useState("");
    const [staffSearch, setStaffSearch] = useState("");
    const [productSearch, setProductSearch] = useState("");

    // ================= FORM =================
    const emptySale = {
        customer: "",
        items: [{ product: "", name: "", qty: 1, price: 0, stock: 0 }],
        total: 0,
        staff: "",
        payment: "Cash",
        status: "Paid",
        txnId: "",
        date: ""
    };

    const [form, setForm] = useState(emptySale);
    const [errors, setErrors] = useState({});

    // ================= FETCH =================
    const fetchSales = async () => {
        const res = await API.get("/sales");

        setRows(
            res.data.data.map((s) => ({
                id: s._id,
                customer: s.customer,
                products: s.items.map(i => i.name),
                total: s.total,
                staff: s.staff,
                status: s.status,
                payment: s.payment,
                txnId: s.txnId,
                date: s.date,
                items: s.items
            }))
        );
    };

    useEffect(() => {
        fetchSales();
    }, []);

    useEffect(() => {
        const timer = setTimeout(async () => {
            try {
                const { data } = await API.get("/users", { params: { search: userSearch } });
                setUserOptions(data.data || []);
            } catch (err) {
                setUserOptions([]);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [userSearch]);

    useEffect(() => {
        const timer = setTimeout(async () => {
            try {
                const { data } = await API.get("/staff", { params: { search: staffSearch } });
                setStaffOptions(data.data || []);
            } catch (err) {
                setStaffOptions([]);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [staffSearch]);

    useEffect(() => {
        const timer = setTimeout(async () => {
            try {
                const { data } = await API.get("/products", { params: { search: productSearch, limit: 10 } });
                setProductOptions(data.data || []);
            } catch (err) {
                setProductOptions([]);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [productSearch]);

    // ================= CALCULATE =================
    const calculateTotal = (items) => {
        const total = items.reduce((sum, i) => sum + i.qty * i.price, 0);
        setForm(prev => ({ ...prev, items, total }));
    };

    // ================= CREATE =================
    const createSale = async () => {
        const nextErrors = {};
        if (isBlank(form.customer)) nextErrors.customer = "Customer is required";
        if (isBlank(form.staff)) nextErrors.staff = "Staff is required";
        form.items.forEach((item, index) => {
            if (isBlank(item.product)) nextErrors[`item-${index}`] = "Select a product";
            if (!isPositiveNumber(item.qty)) nextErrors[`qty-${index}`] = "Valid qty required";
            if (!isPositiveNumber(item.price)) nextErrors[`price-${index}`] = "Valid price required";
            if (Number(item.qty) > Number(item.stock || 0)) nextErrors[`qty-${index}`] = `Only ${item.stock || 0} in stock`;
        });

        setErrors(nextErrors);
        if (Object.keys(nextErrors).length) {
            toast.error("Please fix the highlighted fields");
            return;
        }

        await API.post("/sales", {
            ...form,
            items: form.items.map(({ product, name, qty, price }) => ({
                product,
                name,
                qty,
                price
            }))
        });
        fetchSales();
        setAddOpen(false);
        setForm(emptySale);
        setErrors({});
        toast.success("Sale created");
    };

    // ================= UPDATE STATUS =================
    const updateStatus = async (value) => {
        await API.patch(`/sales/${selected.id}/status`, { status: value });
        fetchSales();
        setSelected({ ...selected, status: value });
    };

    // ================= FILTER =================
    const filteredRows = rows.filter((row) =>
        (row.customer.toLowerCase().includes(search.toLowerCase()) ||
            row.products.join(",").toLowerCase().includes(search.toLowerCase())) &&
        (staffFilter === "all" || row.staff === staffFilter)
    );

    const totalRevenue = filteredRows.reduce((s, r) => s + r.total, 0);
    const staffFilterOptions = [...new Set(rows.map((row) => row.staff).filter(Boolean))];

    // ================= UI =================
    const getStatus = (status) => (
        <Chip label={status} color={status === "Paid" ? "success" : "warning"} size="small" />
    );

    const columns = [
        { field: "customer", headerName: "Customer", flex: 1 },
        { field: "products", headerName: "Products", flex: 1, renderCell: p => p.row.products.join(", ") },
        { field: "total", headerName: "₹ Total", flex: 1 },
        { field: "payment", headerName: "Payment", flex: 1 },
        { field: "txnId", headerName: "Txn ID", flex: 1 },
        { field: "staff", headerName: "Staff", flex: 1 },
        { field: "status", headerName: "Status", flex: 1, renderCell: p => getStatus(p.row.status) },
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
            <Typography variant="h5" mb={2}>Sales Management</Typography>

            {/* TOP BAR */}
            <Stack direction="row" spacing={2} mb={2}>
                <TextField fullWidth placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />

                <TextField select value={staffFilter} onChange={(e) => setStaffFilter(e.target.value)}>
                    <MenuItem value="all">All</MenuItem>
                    {staffFilterOptions.map((staff) => (
                        <MenuItem key={staff} value={staff}>{staff}</MenuItem>
                    ))}
                </TextField>

                <Button variant="contained" onClick={() => setAddOpen(true)}>
                    Add Sale
                </Button>
            </Stack>

            {/* SUMMARY */}
            <Grid container spacing={2} mb={2}>
                <Grid item xs={6}>
                    <Box p={2} bgcolor="primary.light" borderRadius={2}>
                        <Typography>Total Sales</Typography>
                        <Typography variant="h5">{filteredRows.length}</Typography>
                    </Box>
                </Grid>

                <Grid item xs={6}>
                    <Box p={2} bgcolor="success.light" borderRadius={2}>
                        <Typography>Revenue</Typography>
                        <Typography variant="h5">₹ {totalRevenue}</Typography>
                    </Box>
                </Grid>
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
                    <Typography variant="h6">Invoice</Typography>

                    <Typography mt={2}>{selected?.customer}</Typography>
                    <Typography>{selected?.date}</Typography>

                    <Stack mt={2}>
                        {selected?.items?.map((i, idx) => (
                            <Box key={idx} display="flex" justifyContent="space-between">
                                <Typography>{i.name} × {i.qty}</Typography>
                                <Typography>₹ {i.qty * i.price}</Typography>
                            </Box>
                        ))}
                    </Stack>

                    <Divider sx={{ my: 2 }} />

                    <Typography>Total: ₹ {selected?.total}</Typography>

                    <TextField
                        select
                        fullWidth
                        sx={{ mt: 2 }}
                        value={selected?.status || ""}
                        onChange={(e) => updateStatus(e.target.value)}
                    >
                        <MenuItem value="Paid">Paid</MenuItem>
                        <MenuItem value="Pending">Pending</MenuItem>
                    </TextField>
                </Box>
            </Drawer>

            {/* ADD SALE DIALOG */}
            <Dialog open={addOpen} onClose={() => setAddOpen(false)} fullWidth>
                <DialogTitle>Add Sale</DialogTitle>
                <DialogContent>

                    <Stack spacing={2} mt={1}>
                        <Autocomplete
                            freeSolo
                            options={userOptions}
                            getOptionLabel={(option) => typeof option === "string" ? option : option.name || ""}
                            inputValue={form.customer}
                            onInputChange={(event, value) => {
                                setUserSearch(value);
                                setForm({ ...form, customer: value });
                            }}
                            onChange={(event, value) => {
                                const name = typeof value === "string" ? value : value?.name || "";
                                setForm({ ...form, customer: name });
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Customer"
                                    error={Boolean(errors.customer)}
                                    helperText={errors.customer}
                                />
                            )}
                        />

                        {form.items.map((item, index) => (
                            <Stack key={index} direction="row" spacing={1}>
                                <Autocomplete
                                    options={productOptions}
                                    getOptionLabel={(option) => typeof option === "string" ? option : option.name || ""}
                                    inputValue={item.name}
                                    sx={{ minWidth: 220 }}
                                    onInputChange={(event, value, reason) => {
                                        if (reason === "reset") return;
                                        setProductSearch(value);
                                        const items = [...form.items];
                                        items[index] = { ...items[index], product: "", name: value, price: 0, stock: 0 };
                                        calculateTotal(items);
                                    }}
                                    onChange={(event, value) => {
                                        const items = [...form.items];
                                        if (value && typeof value !== "string") {
                                            items[index] = {
                                                ...items[index],
                                                product: value._id,
                                                name: value.name,
                                                price: Number(value.price || 0),
                                                stock: Number(value.stock || 0)
                                            };
                                        }
                                        calculateTotal(items);
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Product"
                                            error={Boolean(errors[`item-${index}`])}
                                            helperText={errors[`item-${index}`]}
                                        />
                                    )}
                                />
                                <TextField type="number" label="Qty"
                                    value={item.qty}
                                    inputProps={{ min: 1, step: 1 }}
                                    error={Boolean(errors[`qty-${index}`])}
                                    helperText={errors[`qty-${index}`]}
                                    onChange={(e) => {
                                        const items = [...form.items];
                                        items[index].qty = Number(e.target.value.replace(/\D/g, ""));
                                        calculateTotal(items);
                                    }}
                                />
                                <TextField type="number" label="Price"
                                    value={item.price}
                                    inputProps={{ min: 0, step: "0.01" }}
                                    error={Boolean(errors[`price-${index}`])}
                                    helperText={errors[`price-${index}`]}
                                    onChange={(e) => {
                                        const items = [...form.items];
                                        items[index].price = Number(decimalOnly(e.target.value));
                                        calculateTotal(items);
                                    }}
                                />
                            </Stack>
                        ))}

                        <Button onClick={() =>
                            calculateTotal([...form.items, { product: "", name: "", qty: 1, price: 0, stock: 0 }])
                        }>
                            + Add Item
                        </Button>

                        <Typography>Total: ₹ {form.total}</Typography>

                        <Autocomplete
                            freeSolo
                            options={staffOptions}
                            getOptionLabel={(option) => typeof option === "string" ? option : option.fullName || option.name || ""}
                            inputValue={form.staff}
                            onInputChange={(event, value) => {
                                setStaffSearch(value);
                                setForm({ ...form, staff: value });
                            }}
                            onChange={(event, value) => {
                                const name = typeof value === "string" ? value : value?.fullName || value?.name || "";
                                setForm({ ...form, staff: name });
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Staff"
                                    error={Boolean(errors.staff)}
                                    helperText={errors.staff}
                                />
                            )}
                        />

                        <TextField select label="Payment" value={form.payment}
                            onChange={(e) => setForm({ ...form, payment: e.target.value })}
                        >
                            <MenuItem value="Cash">Cash</MenuItem>
                            <MenuItem value="UPI">UPI</MenuItem>
                            <MenuItem value="Bank">Bank</MenuItem>
                        </TextField>

                        <Button variant="contained" onClick={createSale}>
                            Save Sale
                        </Button>
                    </Stack>

                </DialogContent>
            </Dialog>

        </MainCard>
    );
}
