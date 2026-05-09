import { useState, useEffect } from "react";
import {
  Box, Typography, Grid, Paper, TextField, MenuItem, Stack
} from "@mui/material";
import MainCard from "components/MainCard";
import API from "../../api/axios";

import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, ResponsiveContainer
} from "recharts";

const demoSalesData = [
  { month: "Jan", revenue: 25000, orders: 18 },
  { month: "Feb", revenue: 32000, orders: 24 },
  { month: "Mar", revenue: 28500, orders: 21 },
  { month: "Apr", revenue: 41000, orders: 29 }
];
const demoPaymentData = [
  { method: "Cash", value: 14 },
  { method: "UPI", value: 22 },
  { method: "Bank", value: 8 }
];
const demoProductData = [
  { name: "Rice", sold: 120 },
  { name: "Milk", sold: 90 },
  { name: "Soap", sold: 64 }
];

export default function SalesReportsPage() {
  const [filter, setFilter] = useState("monthly");

  const [salesData, setSalesData] = useState(demoSalesData);
  const [paymentData, setPaymentData] = useState(demoPaymentData);
  const [productData, setProductData] = useState(demoProductData);

  // =========================
  // FETCH API (same as your pattern)
  // =========================
  const fetchReports = async () => {
    try {
      const res = await API.get("/reports/sales-report");

      setSalesData(res.data.salesData?.length ? res.data.salesData : demoSalesData);
      setPaymentData(res.data.paymentData?.length ? res.data.paymentData : demoPaymentData);
      setProductData(res.data.productData?.length ? res.data.productData : demoProductData);

    } catch (err) {
      console.error("Fetch failed", err);
      setSalesData(demoSalesData);
      setPaymentData(demoPaymentData);
      setProductData(demoProductData);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // =========================
  // SAME KPI LOGIC
  // =========================
  const revenue = salesData.reduce((s, d) => s + (d.revenue || 0), 0);
  const orders = salesData.reduce((s, d) => s + (d.orders || 0), 0);

  return (
    <MainCard>
      <Stack direction="row" justifyContent="space-between" mb={2}>
        <Typography variant="h5">Sales Reports</Typography>

        <TextField
          select
          size="small"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <MenuItem value="monthly">Monthly</MenuItem>
        </TextField>
      </Stack>

      {/* KPI */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={3}>
          <Paper sx={{ p: 2 }}>
            Revenue ₹{revenue}
          </Paper>
        </Grid>

        <Grid item xs={3}>
          <Paper sx={{ p: 2 }}>
            Orders {orders}
          </Paper>
        </Grid>

        <Grid item xs={3}>
          <Paper sx={{ p: 2 }}>
            Growth 12%
          </Paper>
        </Grid>

        <Grid item xs={3}>
          <Paper sx={{ p: 2 }}>
            AOV ₹{orders ? (revenue / orders).toFixed(0) : 0}
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={2}>

        {/* 1 */}
        <Grid item size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2 }}>
            <Typography>Revenue Trend</Typography>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid stroke="#ccc" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line dataKey="revenue" stroke="#1976d2" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* 2 (UNCHANGED WIDTH STYLE) */}
        <Grid item size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2 }}>
            <Typography>Orders Trend</Typography>

            <LineChart width={400} height={300} data={salesData}>
              <CartesianGrid stroke="#ccc" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line dataKey="orders" stroke="#2e7d32" />
            </LineChart>
          </Paper>
        </Grid>

        {/* 3 */}
        <Grid item size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2 }}>
            <Typography>Revenue vs Orders</Typography>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid stroke="#ccc" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#1976d2" />
                <Bar dataKey="orders" fill="#2e7d32" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* 4 */}
        <Grid item size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2 }}>
            <Typography>Payment Methods</Typography>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={paymentData}>
                <XAxis dataKey="method" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#9c27b0" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* 5 */}
        <Grid item size={{ xs: 12 }}>
          <Paper sx={{ p: 2 }}>
            <Typography>Top Products</Typography>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productData}>
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
