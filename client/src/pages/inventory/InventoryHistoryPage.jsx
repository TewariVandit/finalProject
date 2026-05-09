import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Chip
} from "@mui/material";

import { DataGrid } from "@mui/x-data-grid";
import MainCard from "components/MainCard";
import API from "../../api/axios";
import { toast } from "react-toastify";

export default function InventoryHistory() {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [rowCount, setRowCount] = useState(0);

  const [loading, setLoading] = useState(false);

  // ================= FETCH =================
  const fetchHistory = async () => {
    try {
      setLoading(true);

      const res = await API.get("/inventory/history", {
        params: { page, limit, search }
      });

      const data = res.data;

      setRows(
        data.data.map((item) => ({
          id: item._id,
          product: item.product?.name,
          type: item.type,
          qty: item.qty,
          reason: item.reason,
          date: item.createdAt?.split("T")[0]
        }))
      );

      setRowCount(data.pagination.total);

    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [page, search]);

  // ================= TYPE CHIP =================
  const getType = (type) => (
    <Chip
      label={type === "add" ? "+ Added" : "- Removed"}
      color={type === "add" ? "success" : "error"}
      size="small"
    />
  );

  // ================= TABLE =================
  const columns = [
    { field: "product", headerName: "Product", flex: 1 },
    {
      field: "type",
      headerName: "Action",
      flex: 1,
      renderCell: (p) => getType(p.value)
    },
    { field: "qty", headerName: "Qty", flex: 1 },
    { field: "reason", flex: 2 },
    { field: "date", flex: 1 }
  ];

  return (
    <MainCard>

      <Typography variant="h5" mb={2}>
        Inventory History
      </Typography>

      {/* SEARCH */}
      <Box mb={2}>
        <TextField
          fullWidth
          placeholder="Search product..."
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />
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
        />
      </Box>

    </MainCard>
  );
}