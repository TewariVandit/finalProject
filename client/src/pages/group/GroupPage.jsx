import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  Stack,
  Chip,
  Collapse,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Avatar,
  Autocomplete
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";

import MainCard from "components/MainCard";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { getAssetUrl } from "utils/assetUrl";
import { isBlank } from "utils/validation";

export default function GroupManagement() {
  const [groups, setGroups] = useState([]);
  const [expanded, setExpanded] = useState(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const [form, setForm] = useState({ name: "" });

  // 🔥 PRODUCT SEARCH
  const [productOptions, setProductOptions] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [search, setSearch] = useState("");

  // ================= FETCH GROUPS =================
  const fetchGroups = async () => {
    try {
      const { data } = await API.get("/groups");
      setGroups(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  // ================= SEARCH PRODUCTS =================
  useEffect(() => {
    const delay = setTimeout(async () => {
      try {
        const { data } = await API.get("/products", {
          params: {
            search: search || "",   // 👈 empty = default results
            limit: 10
          }
        });

        setProductOptions(data.data || []);
      } catch (err) {
        console.error(err);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [search]);

  // ================= GROUP CRUD =================
  const handleSave = async () => {
    try {
      if (isBlank(form.name)) return toast.error("Group name is required");

      if (editData) {
        await API.put(`/groups/${editData._id}`, form);
        toast.success("Updated");
      } else {
        await API.post("/groups", form);
        toast.success("Created");
      }

      fetchGroups();
      handleCloseDialog();

    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    await API.delete(`/groups/${id}`);
    fetchGroups();
  };

  const handleEdit = (g) => {
    setEditData(g);
    setForm({ name: g.name });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditData(null);
    setForm({ name: "" });
  };

  // ================= ADD PRODUCT =================
  const addProduct = async (groupId) => {
    if (!selectedProduct) return;

    await API.post(`/groups/${groupId}/add-product`, {
      productId: selectedProduct._id
    });

    setSelectedProduct(null);
    fetchGroups();
  };

  // ================= REMOVE PRODUCT =================
  const removeProduct = async (groupId, productId) => {
    await API.delete(`/groups/${groupId}/remove-product/${productId}`);
    fetchGroups();
  };

  return (
    <MainCard>

      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Typography variant="h5">Groups</Typography>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
        >
          Add Group
        </Button>
      </Box>

      {/* GROUPS */}
      <Grid container spacing={3}>
        {groups.map((group) => (
          <Grid item xs={12} md={6} key={group._id}>

            <Card sx={{ borderRadius: 4, overflow: "hidden" }}>

              {/* HEADER */}
              <Box
                sx={{
                  p: 3,
                  color: "#fff",
                  background: group.color || "linear-gradient(135deg,#667eea,#764ba2)",
                  display: "flex",
                  justifyContent: "space-between"
                }}
              >
                <Box>
                  <Typography variant="h6">{group.name}</Typography>
                  <Typography variant="body2">
                    {group.products?.length || 0} Products
                  </Typography>
                </Box>

                <Box>
                  <IconButton onClick={() => handleEdit(group)} sx={{ color: "#fff" }}>
                    <EditIcon />
                  </IconButton>

                  <IconButton onClick={() => handleDelete(group._id)} sx={{ color: "#fff" }}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>

              {/* TOGGLE */}
              <Box p={2}>
                <Button fullWidth onClick={() =>
                  setExpanded(expanded === group._id ? null : group._id)
                }>
                  {expanded === group._id ? "Hide" : "View Products"}
                </Button>
              </Box>

              {/* PRODUCTS */}
              <Collapse in={expanded === group._id}>
                <Box p={2} bgcolor="#fafafa">

                  {/* PRODUCT CARDS */}
                  <Stack spacing={1}>
                    {group.products?.map((p) => (
                      <Box
                        key={p._id}
                        sx={{
                          p: 1,
                          borderRadius: 2,
                          bgcolor: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between"
                        }}
                      >

                        {/* LEFT SIDE */}
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar
                            src={getAssetUrl(p.image)}
                            sx={{ width: 45, height: 45 }}
                          />

                          <Box>
                            <Typography fontWeight={600}>{p.name}</Typography>
                            <Typography variant="caption">
                              ₹{p.price} • Stock {p.stock}
                            </Typography>
                          </Box>
                        </Stack>

                        {/* REMOVE */}
                        <IconButton
                          size="small"
                          onClick={() => removeProduct(group._id, p._id)}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Stack>

                  {/* ADD PRODUCT */}
                  <Box mt={2}>

                    <Autocomplete
                      options={productOptions}
                      getOptionLabel={(opt) => opt.name || ""}
                      value={selectedProduct}
                      onChange={(e, val) => setSelectedProduct(val)}
                      onInputChange={(e, val) => setSearch(val)}

                      renderOption={(props, option) => (
                        <Box {...props} display="flex" gap={2}>
                          <Avatar
                            src={getAssetUrl(option.image)}
                          />
                          <Box>
                            <Typography>{option.name}</Typography>
                            <Typography variant="caption">
                              ₹{option.price}
                            </Typography>
                          </Box>
                        </Box>
                      )}

                      renderInput={(params) => (
                        <TextField {...params} placeholder="Search product..." />
                      )}
                    />

                    <Button
                      fullWidth
                      sx={{ mt: 1 }}
                      variant="contained"
                      onClick={() => addProduct(group._id)}
                    >
                      Add Product
                    </Button>

                  </Box>

                </Box>
              </Collapse>

            </Card>
          </Grid>
        ))}
      </Grid>

      {/* DIALOG */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>
          {editData ? "Edit Group" : "Add Group"}
        </DialogTitle>

        <DialogContent>
          <TextField
            fullWidth
            label="Group Name"
            value={form.name}
            onChange={(e) => setForm({ name: e.target.value })}
            sx={{ mt: 2 }}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

    </MainCard>
  );
}
