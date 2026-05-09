import { useEffect, useState } from "react";
import {
  Box, Typography, Grid, Paper
} from "@mui/material";
import MainCard from "components/MainCard";
import API from "../../api/axios";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";

const demoStock = [
  { name: "Rice", stock: 120 },
  { name: "Milk", stock: 45 },
  { name: "Soap", stock: 80 },
  { name: "Sugar", stock: 25 }
];
const demoLow = demoStock.filter((item) => item.stock < 50);
const demoMovement = [
  { name: "Rice", stock: 35 },
  { name: "Milk", stock: 18 },
  { name: "Soap", stock: 22 }
];
const demoConsumption = [
  { name: "Rice", stock: 12 },
  { name: "Milk", stock: 16 },
  { name: "Soap", stock: 9 }
];

export default function InventoryReportsPage() {

  const [stock, setStock] = useState(demoStock);
  const [low, setLow] = useState(demoLow);
  const [movement, setMovement] = useState(demoMovement);
  const [consumption, setConsumption] = useState(demoConsumption);

  // =========================
  // FETCH API
  // =========================
  const fetchInventory = async () => {
    try {
      const res = await API.get("/reports/inventory-report");

      setStock(res.data.stockData?.length ? res.data.stockData : demoStock);
      setLow(res.data.lowStockData?.length ? res.data.lowStockData : demoLow);
      setMovement(res.data.movementData?.length ? res.data.movementData : demoMovement);
      setConsumption(res.data.consumptionData?.length ? res.data.consumptionData : demoConsumption);

    } catch (err) {
      console.error("Fetch failed", err);
      setStock(demoStock);
      setLow(demoLow);
      setMovement(demoMovement);
      setConsumption(demoConsumption);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  return (
    <MainCard>
      <Typography variant="h5" mb={2}>Inventory Reports</Typography>

      <Grid container spacing={2}>

        {/* 1 */}
        <Grid item size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2 }}>
            <Typography>Stock Levels</Typography>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stock}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="stock" fill="#2e7d32" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* 2 */}
        <Grid item size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2 }}>
            <Typography>Low Stock</Typography>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={low}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="stock" fill="#d32f2f" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* 3 (UNCHANGED STYLE) */}
        <Grid item size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2 }}>
            <Typography>Stock Movement</Typography>

            <BarChart width={400} height={300} data={movement}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="stock" fill="#1976d2" />
            </BarChart>
          </Paper>
        </Grid>

        {/* 4 (UNCHANGED STYLE) */}
        <Grid item size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2 }}>
            <Typography>Consumption</Typography>

            <BarChart width={400} height={300} data={consumption}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="stock" fill="#ff9800" />
            </BarChart>
          </Paper>
        </Grid>

        {/* 5 */}
        <Grid item size={{ xs: 12 }}>
          <Paper sx={{ p: 2 }}>
            <Typography>Stock Summary</Typography>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stock}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="stock" fill="#9c27b0" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

      </Grid>
    </MainCard>
  );
}
