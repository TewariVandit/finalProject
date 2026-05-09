import { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  MenuItem as MuiMenuItem,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import VisibilityIcon from "@mui/icons-material/Visibility";
import toast from "react-hot-toast";

import MainCard from "components/MainCard";
import API from "../api/axios";
import { getAssetUrl } from "utils/assetUrl";
import { decimalOnly, isBlank, isNonNegativeInteger, isPositiveNumber, validateImageFile } from "utils/validation";

const emptyForm = {
  name: "",
  sku: "",
  category: "",
  subcategory: "",
  price: "",
  stock: "",
  description: "",
  image: "",
  imageFile: null,
  images: [],
  imagesFiles: []
};

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState({});
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [selected, setSelected] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  const fetchProducts = async () => {
    const { data } = await API.get("/products");
    setProducts(data.data || []);
  };

  const fetchCategories = async () => {
    const { data } = await API.get("/categories");
    const nextCategories = {};
    (data.data || []).forEach((category) => {
      nextCategories[category.name] = category.subcategories || [];
    });
    setCategories(nextCategories);
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const getStockStatus = (stock) => (
    <Chip
      label={stock === 0 ? "Out" : stock < 10 ? "Low" : "In Stock"}
      color={stock === 0 ? "error" : stock < 10 ? "warning" : "success"}
      size="small"
    />
  );

  const validate = () => {
    const nextErrors = {};

    if (isBlank(form.name)) nextErrors.name = "Product name is required";
    if (isBlank(form.sku)) nextErrors.sku = "SKU is required";
    if (isBlank(form.category)) nextErrors.category = "Category is required";
    if (!isPositiveNumber(form.price)) nextErrors.price = "Enter a valid price";
    if (!isNonNegativeInteger(form.stock)) nextErrors.stock = "Stock must be 0 or more";

    const exists = products.some((product) => product.sku === form.sku && (!editData || product._id !== editData._id));
    if (exists) nextErrors.sku = "SKU already exists";

    if (form.imageFile) {
      const imageError = validateImageFile(form.imageFile);
      if (imageError) nextErrors.image = imageError;
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      toast.error("Please fix the highlighted fields");
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("sku", form.sku.trim());
      formData.append("category", form.category);
      formData.append("subcategory", form.subcategory);
      formData.append("price", Number(form.price));
      formData.append("stock", Number(form.stock));
      formData.append("description", form.description.trim());

      if (form.imageFile) formData.append("image", form.imageFile);
      form.imagesFiles.forEach((file) => formData.append("images", file));

      if (editData) {
        await API.put(`/products/${editData._id}`, formData);
        toast.success("Product updated");
      } else {
        await API.post("/products", formData);
        toast.success("Product added");
      }

      handleClose();
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Product save failed");
    }
  };

  const handleEdit = (row) => {
    setEditData(row);
    setForm({
      ...emptyForm,
      ...row,
      imageFile: null,
      images: row.images || [],
      imagesFiles: []
    });
    setErrors({});
    setOpen(true);
  };

  const handleDelete = async () => {
    try {
      await API.delete(`/products/${selected._id}`);
      toast.success("Product deleted");
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  const handleClose = () => {
    setOpen(false);
    setEditData(null);
    setForm(emptyForm);
    setErrors({});
  };

  const handleMenuOpen = (event, row) => {
    setAnchorEl(event.currentTarget);
    setSelected(row);
  };

  const handleMenuClose = () => setAnchorEl(null);

  const handleMainImage = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const imageError = validateImageFile(file);
    if (imageError) {
      setErrors((prev) => ({ ...prev, image: imageError }));
      toast.error(imageError);
      event.target.value = "";
      return;
    }

    setErrors((prev) => ({ ...prev, image: "" }));
    setForm({ ...form, image: URL.createObjectURL(file), imageFile: file });
  };

  const handleGallery = (event) => {
    const files = Array.from(event.target.files).slice(0, 5);
    const invalid = files.map(validateImageFile).find(Boolean);

    if (invalid) {
      toast.error(invalid);
      event.target.value = "";
      return;
    }

    setForm({
      ...form,
      images: files.map((file) => URL.createObjectURL(file)),
      imagesFiles: files
    });
  };

  const columns = [
    {
      field: "image",
      width: 80,
      renderCell: (params) => <Avatar src={getAssetUrl(params.value)} />
    },
    { field: "name", headerName: "Name", flex: 1 },
    { field: "sku", headerName: "SKU", flex: 1 },
    { field: "category", headerName: "Category", flex: 1 },
    { field: "price", headerName: "Price", flex: 1 },
    { field: "stock", headerName: "Stock", flex: 1 },
    {
      field: "status",
      headerName: "Status",
      renderCell: (params) => getStockStatus(params.row.stock)
    },
    {
      field: "actions",
      headerName: "",
      width: 70,
      renderCell: (params) => (
        <IconButton onClick={(event) => handleMenuOpen(event, params.row)}>
          <MoreVertIcon />
        </IconButton>
      )
    }
  ];

  return (
    <MainCard>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography variant="h5">Inventory</Typography>
        <Button variant="contained" onClick={() => setOpen(true)}>
          + Add Product
        </Button>
      </Box>

      <Box height={500}>
        <DataGrid rows={products} getRowId={(row) => row._id} columns={columns} />
      </Box>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MuiMenuItem onClick={() => { handleEdit(selected); handleMenuClose(); }}>
          <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
          Edit
        </MuiMenuItem>
        <MuiMenuItem onClick={() => { handleDelete(); handleMenuClose(); }}>
          <ListItemIcon><DeleteIcon fontSize="small" /></ListItemIcon>
          Delete
        </MuiMenuItem>
        <MuiMenuItem onClick={handleMenuClose}>
          <ListItemIcon><VisibilityIcon fontSize="small" /></ListItemIcon>
          View
        </MuiMenuItem>
      </Menu>

      <Drawer anchor="right" open={open} onClose={handleClose}>
        <Box sx={{ p: 2, bgcolor: "primary.main", color: "#fff", display: "flex", justifyContent: "space-between" }}>
          <Typography>{editData ? "Edit Product" : "Add Product"}</Typography>
          <IconButton onClick={handleClose} sx={{ color: "#fff" }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Box width={420} p={2}>
          <Divider sx={{ my: 2 }} />
          <Stack spacing={2}>
            <TextField
              label="Product Name"
              value={form.name}
              error={Boolean(errors.name)}
              helperText={errors.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
            />
            <TextField
              label="SKU"
              value={form.sku}
              error={Boolean(errors.sku)}
              helperText={errors.sku}
              onChange={(event) => setForm({ ...form, sku: event.target.value.trim().toUpperCase() })}
            />
            <TextField
              select
              label="Category"
              value={form.category}
              error={Boolean(errors.category)}
              helperText={errors.category}
              onChange={(event) => setForm({ ...form, category: event.target.value, subcategory: "" })}
            >
              {Object.keys(categories).map((category) => (
                <MenuItem key={category} value={category}>{category}</MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Subcategory"
              value={form.subcategory}
              onChange={(event) => setForm({ ...form, subcategory: event.target.value })}
            >
              {(categories[form.category] || []).map((subcategory) => (
                <MenuItem key={subcategory} value={subcategory}>{subcategory}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Price"
              type="number"
              value={form.price}
              inputProps={{ min: 0, step: "0.01" }}
              error={Boolean(errors.price)}
              helperText={errors.price}
              onChange={(event) => setForm({ ...form, price: decimalOnly(event.target.value) })}
            />
            <TextField
              label="Stock"
              type="number"
              value={form.stock}
              inputProps={{ min: 0, step: 1 }}
              error={Boolean(errors.stock)}
              helperText={errors.stock}
              onChange={(event) => setForm({ ...form, stock: event.target.value.replace(/\D/g, "") })}
            />
            <TextField
              label="Description"
              multiline
              minRows={3}
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
            />

            <Box
              component="label"
              sx={{ border: "2px dashed", borderRadius: 2, height: 150, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", overflow: "hidden" }}
            >
              <input hidden type="file" accept="image/png,image/jpeg,image/webp" onChange={handleMainImage} />
              {form.image ? (
                <img src={getAssetUrl(form.image)} style={{ maxHeight: "100%", maxWidth: "100%" }} alt={form.name || "Product"} />
              ) : (
                "Upload Image"
              )}
            </Box>
            {errors.image && <Typography color="error" variant="caption">{errors.image}</Typography>}

            <Button component="label" variant="outlined">
              Upload Gallery Images
              <input hidden multiple type="file" accept="image/png,image/jpeg,image/webp" onChange={handleGallery} />
            </Button>

            <Button variant="contained" onClick={handleSave}>
              Save Product
            </Button>
          </Stack>
        </Box>
      </Drawer>
    </MainCard>
  );
}
