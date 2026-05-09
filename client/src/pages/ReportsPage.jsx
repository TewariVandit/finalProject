import { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Grid,
  MenuItem,
  TextField,
  Paper,
  Stack,
  Button
} from "@mui/material";
import MainCard from "components/MainCard";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  ResponsiveContainer
} from "recharts";

import { saveAs } from "file-saver";

// ================= DATA =================
const salesData = [
  { date: "Jan", revenue: 12000, orders: 20 },
  { date: "Feb", revenue: 18000, orders: 30 },
  { date: "Mar", revenue: 15000, orders: 25 },
  { date: "Apr", revenue: 22000, orders: 40 },
  { date: "May", revenue: 26000, orders: 45 }
];

const productData = [
  { name: "Rice", sold: 120 },
  { name: "Milk", sold: 90 },
  { name: "Soap", sold: 60 },
  { name: "Sugar", sold: 40 }
];

const paymentData = [
  { method: "Cash", value: 40 },
  { method: "UPI", value: 80 },
  { method: "Card", value: 30 }
];

// ================= COMPONENT =================
export default function ReportsPage() {

  const downloadChart = (id) => {
    const chart = document.getElementById(id);
    if (!chart) return;

    const svg = chart.querySelector("svg");
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svg);

    const blob = new Blob([source], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${id}.svg`;
    link.click();
  };

  const [filter, setFilter] = useState("monthly");
  const [productSearch, setProductSearch] = useState("");

  // ================= FILTER PRODUCTS =================
  const filteredProducts = useMemo(() => {
    return productData.filter((p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase())
    );
  }, [productSearch]);

  // ================= KPI =================
  const totalRevenue = salesData.reduce((s, d) => s + d.revenue, 0);
  const totalOrders = salesData.reduce((s, d) => s + d.orders, 0);

  const growth =
    ((salesData[salesData.length - 1].revenue -
      salesData[0].revenue) /
      salesData[0].revenue) *
    100;

  const avgOrderValue = totalRevenue / totalOrders;

  // ================= EXPORT =================
  const exportCSV = () => {
    const csv = [
      ["Date", "Revenue", "Orders"],
      ...salesData.map((d) => [d.date, d.revenue, d.orders])
    ]
      .map((e) => e.join(","))
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;"
    });

    saveAs(blob, "analytics-report.csv");
  };

  return (
    <MainCard>
      {/* HEADER */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        spacing={2}
        mb={2}
      >
        <Typography variant="h5">Analytics Dashboard</Typography>

        <Stack direction="row" spacing={2}>
          <TextField
            select
            size="small"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <MenuItem value="daily">Daily</MenuItem>
            <MenuItem value="monthly">Monthly</MenuItem>
          </TextField>

          <Button variant="contained" onClick={exportCSV}>
            Export Report
          </Button>
        </Stack>
      </Stack>

      {/* KPI CARDS */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, bgcolor: "#e3f2fd" }}>
            <Typography>Total Revenue</Typography>
            <Typography variant="h6">₹ {totalRevenue}</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, bgcolor: "#e8f5e9" }}>
            <Typography>Total Orders</Typography>
            <Typography variant="h6">{totalOrders}</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, bgcolor: "#fff3e0" }}>
            <Typography>Growth</Typography>
            <Typography variant="h6">
              {growth.toFixed(1)}%
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, bgcolor: "#f3e5f5" }}>
            <Typography>Avg Order Value</Typography>
            <Typography variant="h6">
              ₹ {avgOrderValue.toFixed(0)}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* FILTER PRODUCTS */}
      <Box mb={2}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search product..."
          value={productSearch}
          onChange={(e) =>
            setProductSearch(e.target.value)
          }
        />
      </Box>

      {/* CHARTS GRID */}
      <Grid container spacing={2}>
        {/* 1 Revenue */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2 }}>
            <Typography mb={2}>Revenue Trend</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid stroke="#ccc" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line dataKey="revenue" stroke="#1976d2" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* 2 Orders */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2 }}>
            <Typography mb={2}>Orders Trend</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid stroke="#ccc" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line dataKey="orders" stroke="#2e7d32" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* 4 Revenue vs Orders */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2 }}>
            <Typography mb={2}>Revenue vs Orders</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid stroke="#ccc" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#1976d2" />
                <Bar dataKey="orders" fill="#2e7d32" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* 5 Payment */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2 }}>
            <Typography mb={2}>Payment Methods</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={paymentData}>
                <CartesianGrid stroke="#ccc" />
                <XAxis dataKey="method" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#9c27b0" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* 3 Products */}
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 2 }}>
            <Typography mb={2}>Top Products</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={filteredProducts}>
                <CartesianGrid stroke="#ccc" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sold" fill="#ff9800" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </MainCard>
  );
}