import { useEffect, useState } from "react";
import {
  Box, Typography, TextField, MenuItem, Stack, Chip,
  IconButton, Drawer, Button, Menu,
  MenuItem as MuiMenuItem, ListItemIcon, Snackbar, Alert
} from "@mui/material";

import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import VisibilityIcon from "@mui/icons-material/Visibility";

import MainCard from "components/MainCard";
import API from "../../api/axios";
import { digitsOnly, gstRegex, isBlank, phoneRegex } from "utils/validation";

// ================= EMPTY FORM =================
const emptyForm = {
  name: "",
  phone: "",
  city: "",
  gst: "",
  status: "Active"
};

export default function SuppliersPage() {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [rowCount, setRowCount] = useState(0);

  const [selected, setSelected] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mode, setMode] = useState("view");

  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);

  const [loading, setLoading] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    msg: "",
    type: "success"
  });

  // ================= FETCH =================
  const fetchSuppliers = async () => {
    try {
      setLoading(true);

      const res = await API.get("/suppliers", {
        params: {
          search,
          status: statusFilter,
          page,
          limit
        }
      });

      const data = res.data;

      setRows(
        data.data.map((item) => ({
          id: item._id,
          ...item
        }))
      );

      setRowCount(data.pagination.total);

    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, msg: "Fetch failed", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, [search, statusFilter, page]);

  // ================= HANDLERS =================
  const handleAdd = () => {
    setMode("add");
    setForm(emptyForm);
    setErrors({});
    setDrawerOpen(true);
  };

  const handleEdit = () => {
    setMode("edit");
    setForm(selected);
    setErrors({});
    setDrawerOpen(true);
    setAnchorEl(null);
  };

  const handleDelete = async () => {
    try {
      await API.delete(`/suppliers/${selected.id}`);
      setSnackbar({ open: true, msg: "Deleted", type: "error" });
      fetchSuppliers();
    } catch (err) {
      console.error(err);
    }
    setAnchorEl(null);
  };

  const handleSave = async () => {
    try {
      const nextErrors = {};
      if (isBlank(form.name)) nextErrors.name = "Supplier name is required";
      if (!phoneRegex.test(form.phone)) nextErrors.phone = "Enter a valid 10 digit mobile number";
      if (isBlank(form.city)) nextErrors.city = "City is required";
      if (form.gst && !gstRegex.test(form.gst.toUpperCase())) nextErrors.gst = "Enter a valid GST number";

      setErrors(nextErrors);
      if (Object.keys(nextErrors).length) {
        setSnackbar({
          open: true,
          msg: "Please fix the highlighted fields",
          type: "error"
        });
        return;
      }

      if (mode === "edit") {
        await API.put(`/suppliers/${form.id}`, form);
        setSnackbar({ open: true, msg: "Updated", type: "success" });
      } else {
        await API.post("/suppliers", form);
        setSnackbar({ open: true, msg: "Created", type: "success" });
      }

      setDrawerOpen(false);
      fetchSuppliers();

    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, msg: "Save failed", type: "error" });
    }
  };

  // ================= UI HELPERS =================
  const getStatus = (status) => (
    <Chip label={status} color="success" size="small" />
  );

  // ================= TABLE =================
  const columns = [
    { field: "name", headerName: "Supplier", flex: 1 },
    { field: "phone", headerName: "Phone", flex: 1 },
    { field: "city", headerName: "City", flex: 1 },
    { field: "totalOrders", headerName: "Orders", flex: 1 },
    { field: "totalPurchased", headerName: "₹ Purchased", flex: 1 },
    { field: "pending", headerName: "₹ Pending", flex: 1 },
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
      <Typography variant="h5" mb={2}>
        Suppliers
      </Typography>

      {/* TOP BAR */}
      <Stack direction="row" spacing={2} mb={2}>
        <TextField
          fullWidth
          placeholder="Search..."
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />

        <TextField
          select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="Active">Active</MenuItem>
          <MenuItem value="Inactive">Inactive</MenuItem>
        </TextField>

        <Button variant="contained" onClick={handleAdd}>
          Add Supplier
        </Button>
      </Stack>

      {/* TABLE */}
      <div style={{ height: 500 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          paginationMode="server"
          rowCount={rowCount}
          pageSize={limit}
          page={page - 1}
          onPageChange={(newPage) => setPage(newPage + 1)}
          slots={{ toolbar: GridToolbar }}
        />
      </div>

      {/* MENU */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MuiMenuItem
          onClick={() => {
            setMode("view");
            setDrawerOpen(true);
            setAnchorEl(null);
          }}
        >
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          View
        </MuiMenuItem>

        <MuiMenuItem onClick={handleEdit}>Edit</MuiMenuItem>
        <MuiMenuItem onClick={handleDelete}>Delete</MuiMenuItem>
      </Menu>

      {/* DRAWER */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
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
            {mode === "add"
              ? "Add Supplier"
              : mode === "edit"
                ? "Edit Supplier"
                : "Supplier Details"}
          </Typography>
        </Box>
        <Box width={400} p={3}>


          {mode === "view" ? (
            <>
              <Typography>Name: {selected?.name}</Typography>
              <Typography>Phone: {selected?.phone}</Typography>
              <Typography>City: {selected?.city}</Typography>
              <Typography>GST: {selected?.gst || "N/A"}</Typography>
              <Typography mt={2}>
                Total Purchase: ₹ {selected?.totalPurchased}
              </Typography>
              <Typography>
                Pending: ₹ {selected?.pending}
              </Typography>
            </>
          ) : (
            <Stack spacing={2}>
              <TextField
                label="Name"
                value={form.name}
                error={Boolean(errors.name)}
                helperText={errors.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
              />
              <TextField
                label="Phone"
                value={form.phone}
                inputProps={{ inputMode: "numeric", maxLength: 10 }}
                error={Boolean(errors.phone)}
                helperText={errors.phone}
                onChange={(e) =>
                  setForm({ ...form, phone: digitsOnly(e.target.value) })
                }
              />
              <TextField
                label="City"
                value={form.city}
                error={Boolean(errors.city)}
                helperText={errors.city}
                onChange={(e) =>
                  setForm({ ...form, city: e.target.value })
                }
              />
              <TextField
                label="GST"
                value={form.gst}
                error={Boolean(errors.gst)}
                helperText={errors.gst}
                onChange={(e) =>
                  setForm({ ...form, gst: e.target.value.toUpperCase() })
                }
              />

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
