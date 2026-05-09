import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Chip,
  Stack,
  Avatar,
  TextField
} from "@mui/material";

import { DataGrid } from "@mui/x-data-grid";
import MainCard from "components/MainCard";
import API from "../api/axios";
import { toast } from "react-toastify";

export default function InventoryPage() {
  const [rows, setRows] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [rowCount, setRowCount] = useState(0);

  const [search, setSearch] = useState("");

  const [stats, setStats] = useState({
    total: 0,
    low: 0,
    out: 0
  });

  const [topStock, setTopStock] = useState([]);

  // ================= FETCH =================
  const fetchInventory = async () => {
    try {
      setLoading(true);

      const res = await API.get("/inventory", {
        params: {
          page,
          limit,
          filter,
          search
        }
      });

      const data = res.data;

      setRows(
        data.data.map((item) => ({
          id: item._id,
          name: item.name,
          category: item.category,
          stock: item.stock
        }))
      );

      setRowCount(data.pagination.total);
      setStats(data.stats);
      setTopStock(data.topStock);

    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch inventory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [page, filter, search]);

  // ================= STATUS =================
  const getStatus = (stock) => (
    <Chip
      label={stock === 0 ? "Out" : stock < 10 ? "Low" : "Healthy"}
      size="small"
      color={
        stock === 0 ? "error" : stock < 10 ? "warning" : "success"
      }
    />
  );

  const maxStock = Math.max(...rows.map((i) => i.stock), 1);

  // ================= TABLE =================
  const columns = [
    {
      field: "name",
      headerName: "Product",
      flex: 1,
      renderCell: (p) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <Avatar>{p.value?.[0]}</Avatar>
          <Typography>{p.value}</Typography>
        </Stack>
      )
    },
    { field: "category", flex: 1 },
    {
      field: "stock",
      flex: 1,
      renderCell: (p) => (
        <Box width="100%">
          <Typography variant="body2">{p.value}</Typography>

          <Box
            sx={{
              height: 6,
              borderRadius: 5,
              mt: 0.5,
              background: "#eee"
            }}
          >
            <Box
              sx={{
                width: `${(p.value / maxStock) * 100}%`,
                height: "100%",
                borderRadius: 5,
                background:
                  p.value === 0
                    ? "#ef4444"
                    : p.value < 10
                    ? "#f59e0b"
                    : "#22c55e"
              }}
            />
          </Box>
        </Box>
      )
    },
    {
      field: "status",
      flex: 1,
      renderCell: (p) => getStatus(p.row.stock)
    }
  ];

  return (
    <MainCard>

      {/* HEADER */}
      <Typography variant="h5" mb={2}>
        Inventory Overview
      </Typography>

      {/* SEARCH */}
      <Box mb={2}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search product..."
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />
      </Box>

      {/* FILTER */}
      <Stack direction="row" spacing={1} mb={2}>
        {[
          { key: "all", label: `All (${stats.total})` },
          { key: "low", label: `Low (${stats.low})` },
          { key: "out", label: `Out (${stats.out})` }
        ].map((f) => (
          <Chip
            key={f.key}
            label={f.label}
            clickable
            onClick={() => {
              setFilter(f.key);
              setPage(1);
            }}
            color={filter === f.key ? "primary" : "default"}
            variant={filter === f.key ? "filled" : "outlined"}
          />
        ))}
      </Stack>

      {/* TOP STOCK */}
      <Box mb={2}>
        <Typography variant="subtitle2" mb={1}>
          Highest Stock Items
        </Typography>

        <Stack direction="row" spacing={1}>
          {topStock.map((item, index) => (
            <Chip
              key={index}
              label={`${item.name} (${item.stock})`}
              color="success"
            />
          ))}
        </Stack>
      </Box>

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
          sx={{
            "& .MuiDataGrid-row:hover": {
              backgroundColor: "#f9fafb"
            }
          }}
        />
      </Box>

    </MainCard>
  );
}