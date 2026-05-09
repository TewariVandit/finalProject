import { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Stack,
  Drawer,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  Chip,
  InputAdornment
} from "@mui/material";

import { DataGrid } from "@mui/x-data-grid";

import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";

import toast, { Toaster } from "react-hot-toast";
import MainCard from "components/MainCard";
import API from "../../api/axios";
import { isBlank } from "utils/validation";

export default function CategoryManagement() {

  const [categories, setCategories] = useState([]);

  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const [anchorEl, setAnchorEl] = useState(null);
  const [selected, setSelected] = useState(null);

  const [form, setForm] = useState({
    name: "",
    subcategories: []
  });

  const [subInput, setSubInput] = useState("");
  const [errors, setErrors] = useState({});

  // ================= FETCH =================
  const fetchCategories = async () => {
    try {
      const { data } = await API.get("/categories");
      setCategories(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // ================= SUBCATEGORY =================
  const addSubcategory = () => {
    const value = subInput.trim();


    if (!value) return;

    if (form.subcategories.includes(value)) {
      toast.error("Already added");
      return;
    }

    setForm({
      ...form,
      subcategories: [...form.subcategories, value]
    });

    setSubInput("");


  };

  const removeSubcategory = (index) => {
    setForm({
      ...form,
      subcategories: form.subcategories.filter((_, i) => i !== index)
    });
  };

  // ================= VALIDATION =================
  const validate = () => {
    const nextErrors = {};

    if (isBlank(form.name)) nextErrors.name = "Category name is required";


    const exists = categories.some(
      (c) =>
        c.name.toLowerCase() === form.name.trim().toLowerCase() &&
        (!editData || c._id !== editData._id)
    );

    if (exists) {
      nextErrors.name = "Category already exists";
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
    if (!validate()) return;


    try {
      const payload = {
        name: form.name.trim(),
        subcategories: form.subcategories
      };

      if (editData) {
        await API.put(`/categories/${editData._id}`, payload);
        toast.success("Updated");
      } else {
        await API.post("/categories", payload);
        toast.success("Added");
      }

      handleClose();
      fetchCategories();

    } catch (err) {
      toast.error(err.response?.data?.message || "Error");
    }


  };

  // ================= EDIT =================
  const handleEdit = (row) => {
    setEditData(row);
    setForm({
      name: row.name,
      subcategories: row.subcategories || []
    });
    setOpen(true);
  };

  // ================= DELETE =================
  const handleDelete = async () => {
    try {
      await API.delete(`/categories/${selected._id}`);
      toast.success("Deleted");
      fetchCategories();
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleClose = () => {
    setOpen(false);
    setEditData(null);
    setForm({ name: "", subcategories: [] });
    setSubInput("");
    setErrors({});
  };

  // ================= MENU =================
  const handleMenuOpen = (e, row) => {
    setAnchorEl(e.currentTarget);
    setSelected(row);
  };

  const handleMenuClose = () => setAnchorEl(null);

  // ================= TABLE =================
  const columns = [
    {
      field: "name",
      headerName: "Category",
      flex: 1
    },
    {
      field: "subcategories",
      headerName: "Subcategories",
      flex: 2,
      renderCell: (params) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            height: "100%",
            flexWrap: "wrap",
            gap: 1
          }}
        >
          {params.value?.map((s, i) => (<Chip key={i} label={s} size="small" />
          ))} </Box>
      )
    },
    {
      field: "actions",
      width: 70,
      renderCell: (p) => (
        <IconButton onClick={(e) => handleMenuOpen(e, p.row)}> <MoreVertIcon /> </IconButton>
      )
    }
  ];

  return (<MainCard> <Toaster />


    {/* HEADER */}
    <Box display="flex" justifyContent="space-between" mb={2}>
      <Typography variant="h5">Categories</Typography>

      <Button variant="contained" onClick={() => setOpen(true)}>
        + Add Category
      </Button>
    </Box>

    {/* TABLE */}
    <Box height={500}>
      <DataGrid
        rows={categories}
        getRowId={(row) => row._id}
        columns={columns}
      />
    </Box>

    {/* MENU */}
    <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
      <MenuItem onClick={() => { handleEdit(selected); handleMenuClose(); }}>
        <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
        Edit
      </MenuItem>

      <MenuItem onClick={() => { handleDelete(); handleMenuClose(); }}>
        <ListItemIcon><DeleteIcon fontSize="small" /></ListItemIcon>
        Delete
      </MenuItem>
    </Menu>

    {/* DRAWER */}
    <Drawer anchor="right" open={open} onClose={handleClose}>
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
        <Typography variant="h6">
          {editData ? "Edit Category" : "Add Category"}
        </Typography>

        <IconButton onClick={handleClose} sx={{ color: "#fff" }}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Box width={420} p={2}>

        {/* HEADER */}

        <Divider sx={{ my: 2 }} />

        {/* FORM */}
        <Stack spacing={3}>

          <TextField
            label="Category Name"
            value={form.name}
            error={Boolean(errors.name)}
            helperText={errors.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          {/* SUBCATEGORY */}
          <Box>
            <Typography variant="subtitle2" mb={1}>
              Subcategories
            </Typography>

            <TextField
              fullWidth
              placeholder="Add subcategory"
              value={subInput}
              onChange={(e) => setSubInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addSubcategory()}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={addSubcategory}>
                      <AddIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            {/* CHIPS */}
            <Stack direction="row" spacing={1} mt={2} flexWrap="wrap">
              {form.subcategories.map((s, i) => (
                <Chip
                  key={i}
                  label={s}
                  onDelete={() => removeSubcategory(i)}
                />
              ))}
            </Stack>
          </Box>

          <Button variant="contained" onClick={handleSave}>
            Save Category
          </Button>

        </Stack>

      </Box>
    </Drawer>
  </MainCard>


  );
}
