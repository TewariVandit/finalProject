import { useState, useEffect } from "react";
import {
  Box, Typography, Button, TextField, MenuItem, Stack,
  IconButton, Drawer, Menu, MenuItem as MuiMenuItem,
  ListItemIcon, Avatar, Chip
} from "@mui/material";

import { DataGrid, GridToolbar } from "@mui/x-data-grid";

import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloseIcon from "@mui/icons-material/Close";

import toast, { Toaster } from "react-hot-toast";
import MainCard from "components/MainCard";
import API from "../api/axios";
import { getAssetUrl } from "utils/assetUrl";
import { emailRegex, isBlank, validateImageFile } from "utils/validation";

export default function StaffPage() {

  const [staff, setStaff] = useState([]);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);

  const [editData, setEditData] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "Staff",
    status: "Active",
    image: null
  });

  const [preview, setPreview] = useState("");
  const [errors, setErrors] = useState({});

  // ================= FETCH =================
  const fetchStaff = async () => {
    try {
      const { data } = await API.get(`/staff?search=${search}`);
      setStaff(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [search]);

  // ================= DEBOUNCE =================
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // ================= IMAGE UPLOAD =================
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const imageError = validateImageFile(file);
    if (imageError) {
      setErrors((prev) => ({ ...prev, image: imageError }));
      toast.error(imageError);
      e.target.value = "";
      return;
    }

    setErrors((prev) => ({ ...prev, image: "" }));
    setForm({ ...form, image: file });
    setPreview(URL.createObjectURL(file));


  };

  // ================= VALIDATION =================
  const validateForm = () => {
    const nextErrors = {};

    if (isBlank(form.name)) nextErrors.name = "Name is required";
    if (!emailRegex.test(form.email)) nextErrors.email = "Enter a valid email";
    if (!editData && (!form.password || form.password.length < 6)) {
      nextErrors.password = "Password must be at least 6 characters";
    }
    if (editData && form.password && form.password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters";
    }

    const exists = staff.some(
      (s) =>
        s.email === form.email &&
        (!editData || s._id !== editData._id)
    );

    if (exists) {
      nextErrors.email = "Email already exists";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      toast.error("Please fix the highlighted fields");
      return false;
    }

    return true;


  };

  // ================= SAVE =================
  const handleSave = async () => {
    if (!validateForm()) return;


    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("email", form.email);
      if (form.password) formData.append("password", form.password);
      formData.append("role", form.role);
      formData.append("status", form.status);

      if (form.image) {
        formData.append("image", form.image);
      }

      if (editData) {
        await API.put(`/staff/${editData._id}`, formData);
        toast.success("Updated");
      } else {
        await API.post("/staff", formData);
        toast.success("Added");
      }

      handleClose();
      fetchStaff();

    } catch (err) {
      toast.error(err.response?.data?.message || "Error");
    }


  };

  // ================= DELETE =================
  const handleDelete = async () => {
    try {
      await API.delete(`/staff/${selectedRow._id}`);
      toast.success("Deleted");
      fetchStaff();
    } catch {
      toast.error("Delete failed");
    }
  };

  // ================= EDIT =================
  const handleEdit = (row) => {
    const img = getAssetUrl(row.image);
    setEditData(row);
    setForm({
      name: row.fullName,
      email: row.email,
      password: "",
      role: row.role,
      status: row.status,
      image: null
    });
    setPreview(img || "");
    setErrors({});
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditData(null);
    setForm({
      name: "",
      email: "",
      password: "",
      role: "Staff",
      status: "Active",
      image: null
    });
    setPreview("");
    setErrors({});
  };

  // ================= MENU =================
  const handleMenuOpen = (e, row) => {
    setAnchorEl(e.currentTarget);
    setSelectedRow(row);
  };

  const handleMenuClose = () => setAnchorEl(null);

  // ================= UI =================
  const getStatus = (status) => (
    <Chip label={status} color={status === "Active" ? "success" : "default"} size="small" />
  );

  const getRole = (role) => (
    <Chip label={role} color={role === "Admin" ? "primary" : "secondary"} size="small" />
  );

  // ================= TABLE =================
  const columns = [
    {
      field: "avatar",
      width: 70,
      renderCell: (p) => (<Avatar src={getAssetUrl(p.row.image)}>
        {p.row.fullName?.charAt(0)} </Avatar>
      )
    },
    { field: "fullName", headerName: "Name", flex: 1 },
    { field: "email", flex: 1 },
    {
      field: "role",
      flex: 1,
      renderCell: (p) => getRole(p.row.role)
    },
    {
      field: "status",
      flex: 1,
      renderCell: (p) => getStatus(p.row.status)
    },
    {
      field: "action",
      width: 80,
      renderCell: (p) => (
        <IconButton onClick={(e) => handleMenuOpen(e, p.row)}> <MoreVertIcon /> </IconButton>
      )
    }
  ];

  return (<MainCard> <Toaster />


    {/* HEADER */}
    <Box display="flex" justifyContent="space-between" mb={2}>
      <Typography variant="h5">Staff Management</Typography>
      <Button variant="contained" onClick={() => setOpen(true)}>
        Add Staff
      </Button>
    </Box>

    {/* SEARCH */}
    <TextField
      fullWidth
      placeholder="Search staff..."
      value={searchInput}
      onChange={(e) => setSearchInput(e.target.value)}
      sx={{ mb: 2 }}
    />

    {/* TABLE */}
    <Box height={500}>
      <DataGrid
        rows={staff}
        getRowId={(row) => row._id}
        columns={columns}
        slots={{ toolbar: GridToolbar }}
      />
    </Box>

    {/* MENU */}
    <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
      <MuiMenuItem onClick={() => { handleEdit(selectedRow); handleMenuClose(); }}>
        <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
        Edit
      </MuiMenuItem>

      <MuiMenuItem onClick={() => { handleDelete(); handleMenuClose(); }}>
        <ListItemIcon><DeleteIcon fontSize="small" /></ListItemIcon>
        Delete
      </MuiMenuItem>

      <MuiMenuItem onClick={() => { setViewOpen(true); handleMenuClose(); }}>
        <ListItemIcon><VisibilityIcon fontSize="small" /></ListItemIcon>
        View
      </MuiMenuItem>
    </Menu>

    {/* DRAWER */}
    <Drawer anchor="right" open={open} onClose={handleClose}>
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
          {editData ? "Edit Staff" : "Add Staff"}
        </Typography>
      </Box> 
      <Box p={3} width={350} >
        {/* IMAGE UPLOAD */}
        <Box
          sx={{
            border: "2px dashed #ccc",
            borderRadius: 2,
            height: 120,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mt: 2,
            cursor: "pointer"
          }}
          component="label"
        >
          {preview ? (
            <Avatar src={preview} sx={{ width: 80, height: 80 }} />
          ) : (
            "Upload Image"
          )}
            <input hidden type="file" accept="image/png,image/jpeg,image/webp" onChange={handleImageChange} />
        </Box>
        {errors.image && <Typography color="error" variant="caption">{errors.image}</Typography>}

        <Stack spacing={2} mt={2}>
          <TextField label="Name" value={form.name}
            error={Boolean(errors.name)}
            helperText={errors.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} />

          <TextField label="Email" value={form.email}
            type="email"
            error={Boolean(errors.email)}
            helperText={errors.email}
            onChange={(e) => setForm({ ...form, email: e.target.value.trim().toLowerCase() })} />

          <TextField
            label={editData ? "New Password (optional)" : "Password"}
            value={form.password}
            type="password"
            error={Boolean(errors.password)}
            helperText={errors.password || (editData ? "Leave blank to keep current password" : "")}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <TextField select label="Role" value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <MenuItem value="Admin">Admin</MenuItem>
            <MenuItem value="Staff">Staff</MenuItem>
          </TextField>

          <TextField select label="Status" value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Inactive">Inactive</MenuItem>
          </TextField>

          <Button variant="contained" onClick={handleSave}>
            Save
          </Button>
        </Stack>
      </Box>
    </Drawer>
  </MainCard>


  );
}
