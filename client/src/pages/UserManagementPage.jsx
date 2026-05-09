import { useState, useEffect } from "react";
import {
  Box, Typography, Button, TextField, Stack,
  Menu, MenuItem as MuiMenuItem, ListItemIcon,
  Drawer, IconButton, Chip, Divider, Paper
} from "@mui/material";

import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloseIcon from "@mui/icons-material/Close";

import { DataGrid } from "@mui/x-data-grid";
import MainCard from "components/MainCard";

import toast from "react-hot-toast";
import API from "../api/axios";
import { digitsOnly, emailRegex, isBlank, phoneRegex } from "utils/validation";

// ================= COMPONENT =================
export default function UserManagementPage() {

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mode, setMode] = useState("view");

  const [selected, setSelected] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    status: "Active"
  });
  const [errors, setErrors] = useState({});

  // ================= FETCH USERS =================
  const fetchUsers = async () => {
    try {
      const { data } = await API.get(`/users?search=${search}`);
      setUsers(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search]);

  // ================= MENU =================
  const handleMenuOpen = (e, row) => {
    setAnchorEl(e.currentTarget);
    setSelected(row);
  };

  const handleMenuClose = () => setAnchorEl(null);

  // ================= ACTIONS =================
  const handleView = () => {
    setMode("view");
    setDrawerOpen(true);
  };

  const handleEdit = () => {
    setMode("edit");
    setForm(selected);
    setErrors({});
    setDrawerOpen(true);
  };

  const handleAdd = () => {
    setMode("add");
    setForm({
      name: "",
      email: "",
      phone: "",
      address: "",
      status: "Active"
    });
    setErrors({});
    setDrawerOpen(true);
  };

  const handleDelete = async () => {
    try {
      await API.delete(`/users/${selected._id}`);
      toast.success("User deleted");
      fetchUsers();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const handleSave = async () => {
    try {
      const nextErrors = {};
      if (isBlank(form.name)) nextErrors.name = "Name is required";
      if (!emailRegex.test(form.email)) nextErrors.email = "Enter a valid email";
      if (!phoneRegex.test(form.phone)) nextErrors.phone = "Enter a valid 10 digit mobile number";
      if (isBlank(form.address)) nextErrors.address = "Address is required";

      const emailExists = users.some((user) => user.email === form.email && (!selected || user._id !== selected._id));
      const phoneExists = users.some((user) => user.phone === form.phone && (!selected || user._id !== selected._id));
      if (emailExists) nextErrors.email = "Email already exists";
      if (phoneExists) nextErrors.phone = "Phone already exists";

      setErrors(nextErrors);
      if (Object.keys(nextErrors).length) {
        toast.error("Please fix the highlighted fields");
        return;
      }

      if (mode === "edit") {
        await API.put(`/users/${selected._id}`, form);
        toast.success("User updated");
      } else {
        await API.post("/users", form);
        toast.success("User added");
      }
      setDrawerOpen(false);
      fetchUsers();

    } catch (err) {
      toast.error(err.response?.data?.message || "Error");
    }

  };

  // ================= STATUS =================
  const getStatus = (status) => (
    <Chip
      label={status}
      variant="outlined"
      color={status === "Active" ? "success" : "error"}
      size="small"
    />
  );

  // ================= TABLE =================
  const columns = [
    { field: "name", headerName: "Name", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "phone", headerName: "Phone", flex: 1 },
    {
      field: "status",
      headerName: "Status",
      renderCell: (p) => getStatus(p.value)
    },
    {
      field: "actions",
      width: 70,
      renderCell: (p) => (
        <IconButton onClick={(e) => handleMenuOpen(e, p.row)}> <MoreVertIcon /> </IconButton>
      )
    }
  ];

  return (<MainCard>
    {/* HEADER */}
    <Box display="flex" justifyContent="space-between" mb={2}>
      <Typography variant="h5">User Management</Typography>

      <Button variant="contained" onClick={handleAdd}>
        + Add User
      </Button>
    </Box>

    {/* SEARCH */}
    <TextField
      fullWidth
      placeholder="Search users..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      sx={{ mb: 2 }}
    />

    {/* TABLE */}
    <Box height={500}>
      <DataGrid
        rows={users}
        getRowId={(row) => row._id} // 🔥 IMPORTANT FIX
        columns={columns}
      />
    </Box>

    {/* MENU */}
    <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
      <MuiMenuItem onClick={() => { handleView(); handleMenuClose(); }}>
        <ListItemIcon><VisibilityIcon fontSize="small" /></ListItemIcon>
        View
      </MuiMenuItem>

      <MuiMenuItem onClick={() => { handleEdit(); handleMenuClose(); }}>
        <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
        Edit
      </MuiMenuItem>

      <MuiMenuItem onClick={() => { handleDelete(); handleMenuClose(); }}>
        <ListItemIcon><DeleteIcon fontSize="small" /></ListItemIcon>
        Delete
      </MuiMenuItem>
    </Menu>

    {/* ================= DRAWER ================= */}
    <Drawer anchor="right" open={drawerOpen} onClose={() => { setDrawerOpen(false); setErrors({}); }}>
      <Box width={420} display="flex" flexDirection="column" height="100%">

        {/* HEADER */}
        <Box
          sx={{
            p: 2,
            bgcolor: "primary.main",
            color: "#fff",
            display: "flex",
            justifyContent: "space-between"
          }}
        >
          <Typography variant="h6">
            {mode === "view" && "User Details"}
            {mode === "edit" && "Edit User"}
            {mode === "add" && "Add User"}
          </Typography>

          <IconButton onClick={() => { setDrawerOpen(false); setErrors({}); }} sx={{ color: "#fff" }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* BODY */}
        <Box p={2} flex={1} overflow="auto">

          {/* VIEW MODE */}
          {mode === "view" && selected && (
            <>
              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6">{selected.name}</Typography>
                <Typography color="text.secondary">{selected.email}</Typography>
                <Typography>{selected.phone}</Typography>
                <Box mt={1}>{getStatus(selected.status)}</Box>
              </Paper>

              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle2">Address</Typography>
                <Typography>{selected.address}</Typography>
              </Paper>
            </>
          )}

          {/* ADD / EDIT FORM */}
          {(mode === "add" || mode === "edit") && (
            <Stack spacing={2}>
              <TextField label="Name" value={form.name}
                error={Boolean(errors.name)}
                helperText={errors.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} />

              <TextField label="Email" value={form.email}
                type="email"
                error={Boolean(errors.email)}
                helperText={errors.email}
                onChange={(e) => setForm({ ...form, email: e.target.value.trim().toLowerCase() })} />

              <TextField label="Phone" value={form.phone}
                inputProps={{ inputMode: "numeric", maxLength: 10 }}
                error={Boolean(errors.phone)}
                helperText={errors.phone}
                onChange={(e) => setForm({ ...form, phone: digitsOnly(e.target.value) })} />

              <TextField label="Address" value={form.address}
                error={Boolean(errors.address)}
                helperText={errors.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })} />

              <TextField select label="Status"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <MuiMenuItem value="Active">Active</MuiMenuItem>
                <MuiMenuItem value="Blocked">Blocked</MuiMenuItem>
              </TextField>
            </Stack>
          )}

        </Box>

        {/* FOOTER */}
        {(mode === "add" || mode === "edit") && (
          <Box sx={{ p: 2, borderTop: "1px solid", borderColor: "divider" }}>
            <Button fullWidth variant="contained" onClick={handleSave}>
              Save User
            </Button>
          </Box>
        )}

      </Box>
    </Drawer>
  </MainCard>

  );
}
