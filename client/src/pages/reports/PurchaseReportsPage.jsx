import { useEffect, useState } from "react";
import {
  Box, Typography, Grid, Paper
} from "@mui/material";
import MainCard from "components/MainCard";
import API from "../../api/axios";

import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, ResponsiveContainer
} from "recharts";

const demoPurchaseData = [
  { month: "Jan", expense: 18000, orders: 7 },
  { month: "Feb", expense: 24500, orders: 9 },
  { month: "Mar", expense: 21000, orders: 8 },
  { month: "Apr", expense: 31000, orders: 11 }
];
const demoSupplierData = [
  { name: "ABC Traders", value: 22000 },
  { name: "Fresh Supply", value: 17500 },
  { name: "Metro Wholesale", value: 13500 }
];
const demoCategoryData = [
  { name: "Grocery", value: 28000 },
  { name: "Dairy", value: 14000 },
  { name: "Personal Care", value: 11000 }
];

export default function PurchaseReportsPage() {

  const [data, setData] = useState(demoPurchaseData);
  const [supplierData, setSupplierData] = useState(demoSupplierData);
  const [categoryData, setCategoryData] = useState(demoCategoryData);

  const [total, setTotal] = useState(94500);
  const [orders, setOrders] = useState(35);
  const [suppliers, setSuppliers] = useState(8);
  const [avg, setAvg] = useState(2700);

  // =========================
  // FETCH API
  // =========================
  const fetchReports = async () => {
    try {
      const res = await API.get("/reports/purchase-report");

      setData(res.data.data?.length ? res.data.data : demoPurchaseData);
      setSupplierData(res.data.supplierData?.length ? res.data.supplierData : demoSupplierData);
      setCategoryData(res.data.categoryData?.length ? res.data.categoryData : demoCategoryData);

      setTotal(res.data.totalExpense || 94500);
      setOrders(res.data.totalOrders || 35);
      setSuppliers(res.data.totalSuppliers || 8);
      setAvg(res.data.avg || 2700);

    } catch (err) {
      console.error("Fetch failed", err);
      setData(demoPurchaseData);
      setSupplierData(demoSupplierData);
      setCategoryData(demoCategoryData);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <MainCard>
      <Typography variant="h5" mb={2}>Purchase Reports</Typography>

      <Grid container spacing={2} mb={2}>
        <Grid item xs={3}>
          <Paper sx={{ p: 2 }}>Expense ₹{total}</Paper>
        </Grid>

        <Grid item xs={3}>
          <Paper sx={{ p: 2 }}>Suppliers {suppliers}</Paper>
        </Grid>

        <Grid item xs={3}>
          <Paper sx={{ p: 2 }}>Orders {orders}</Paper>
        </Grid>

        <Grid item xs={3}>
          <Paper sx={{ p: 2 }}>Avg ₹{avg.toFixed(0)}</Paper>
        </Grid>
      </Grid>

      <Grid container spacing={2}>

        {/* 1 */}
        <Grid item size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2 }}>
            <Typography>Expense Trend</Typography>

            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line dataKey="expense" stroke="#d32f2f" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* 2 */}
        <Grid item size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2 }}>
            <Typography>Supplier Spend</Typography>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={supplierData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#1976d2" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* 3 (UNCHANGED STYLE) */}
        <Grid item size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2 }}>
            <Typography>Category Spend</Typography>

            <BarChart width={400} height={300} data={categoryData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#ff9800" />
            </BarChart>
          </Paper>
        </Grid>

        {/* 4 (uses same data like before) */}
        <Grid item size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2 }}>
            <Typography>Monthly Orders</Typography>

            <LineChart width={400} height={300} data={data}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line dataKey="orders" stroke="#2e7d32" />
            </LineChart>
          </Paper>
        </Grid>

        {/* 5 */}
        <Grid item size={{ xs: 12 }}>
          <Paper sx={{ p: 2 }}>
            <Typography>Expense Comparison</Typography>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="expense" fill="#9c27b0" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

      </Grid>
    </MainCard>
  );
}
