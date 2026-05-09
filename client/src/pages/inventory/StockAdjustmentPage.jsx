import { useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Grid,
  Paper,
  IconButton,
  Menu,
  MenuItem as MuiMenuItem,
  ListItemIcon
} from "@mui/material";

import { DataGrid } from "@mui/x-data-grid";

import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";

import MainCard from "components/MainCard";
import API from "../../api/axios";
import { toast } from "react-toastify";
import { isNonNegativeInteger } from "utils/validation";

export default function InventoryPage() {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [rowCount, setRowCount] = useState(0);

  const [stats, setStats] = useState({
    total: 0,
    low: 0,
    out: 0
  });

  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [newStock, setNewStock] = useState("");
  const [stockError, setStockError] = useState("");

  const [anchorEl, setAnchorEl] = useState(null);

  // ================= FETCH =================
  const fetchInventory = async () => {
    try {
      setLoading(true);

      const res = await API.get("/inventory", {
        params: { page, limit, filter, search }
      });

      const data = res.data;

      setRows(
        data.data.map((item) => ({
          id: item._id,
          name: item.name,
          category: item.category,
          stock: item.stock,
          updated: item.updatedAt?.split("T")[0]
        }))
      );

      setRowCount(data.pagination.total);
      setStats(data.stats);

    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [page, filter, search]);

  // ================= UPDATE =================
  const handleUpdate = async () => {
    try {
      if (!isNonNegativeInteger(newStock)) {
        setStockError("Stock must be 0 or more");
        toast.error("Enter a valid stock quantity");
        return;
      }

      await API.put(`/inventory/${selected.id}/stock`, {
        stock: Number(newStock)
      });

      toast.success("Stock updated");

      setOpen(false);
      setStockError("");
      fetchInventory();

    } catch (err) {
      console.error(err);
      toast.error("Update failed");
    }
  };

  // ================= STATUS =================
  const getStatus = (stock) => (
    <Chip
      label={stock === 0 ? "Out" : stock < 10 ? "Low" : "Healthy"}
      variant="outlined"
      color={
        stock === 0 ? "error" : stock < 10 ? "warning" : "success"
      }
      size="small"
    />
  );

  // ================= MENU =================
  const handleMenuOpen = (e, row) => {
    setAnchorEl(e.currentTarget);
    setSelected(row);
  };

  const handleMenuClose = () => setAnchorEl(null);

  // ================= TABLE =================
  const columns = [
    { field: "name", headerName: "Product", flex: 1 },
    { field: "category", flex: 1 },
    { field: "stock", flex: 1 },
    {
      field: "status",
      flex: 1,
      renderCell: (p) => getStatus(p.row.stock)
    },
    { field: "updated", flex: 1 },
    {
      field: "actions",
      headerName: "",
      width: 70,
      sortable: false,
      renderCell: (p) => (
        <IconButton onClick={(e) => handleMenuOpen(e, p.row)}>
          <MoreVertIcon />
        </IconButton>
      )
    }
  ];

  return (
    <MainCard>

      <Typography variant="h5" mb={2}>
        Inventory Management
      </Typography>

      {/* FILTER */}
      <Stack direction="row" spacing={2} mb={2}>
        <TextField
          fullWidth
          placeholder="Search products..."
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />

        <TextField
          select
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setPage(1);
          }}
          sx={{ width: 180 }}
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="low">Low</MenuItem>
          <MenuItem value="out">Out</MenuItem>
        </TextField>
      </Stack>

      {/* SUMMARY */}
      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="caption">Total</Typography>
            <Typography variant="h6">{stats.total}</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="caption">Low Stock</Typography>
            <Typography variant="h6" color="warning.main">
              {stats.low}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="caption">Out of Stock</Typography>
            <Typography variant="h6" color="error.main">
              {stats.out}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* TABLE */}
      <Box height={500}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          paginationMode="server"
          rowCount={rowCount}
          pageSize={limit}
          page={page - 1}
          onPageChange={(newPage) => setPage(newPage + 1)}
          rowsPerPageOptions={[10]}
        />
      </Box>

      {/* MENU */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MuiMenuItem
          onClick={() => {
            setNewStock(selected.stock);
            setOpen(true);
            handleMenuClose();
          }}
        >
          <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
          Update Stock
        </MuiMenuItem>
      </Menu>

      {/* DIALOG */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">

        <DialogTitle sx={{ bgcolor: "primary.main", color: "#fff" }}>
          Update Stock
          <IconButton onClick={() => setOpen(false)} sx={{ color: "#fff", float: "right" }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ mt: 2 }}>
          <Typography mb={2}>{selected?.name}</Typography>

          <TextField
            label="Stock"
            type="number"
            fullWidth
            value={newStock}
            inputProps={{ min: 0, step: 1 }}
            error={Boolean(stockError)}
            helperText={stockError}
            onChange={(e) => {
              setStockError("");
              setNewStock(e.target.value.replace(/\D/g, ""));
            }}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdate}>
            Save
          </Button>
        </DialogActions>

      </Dialog>

    </MainCard>
  );
}
