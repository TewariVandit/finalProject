import { useState, useEffect } from 'react';

import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import MainCard from 'components/MainCard';
import AnalyticEcommerce from 'components/cards/statistics/AnalyticEcommerce';
import MonthlyBarChart from 'sections/dashboard/default/MonthlyBarChart';
import ReportAreaChart from 'sections/dashboard/default/ReportAreaChart';
import UniqueVisitorCard from 'sections/dashboard/default/UniqueVisitorCard';
import SaleReportCard from 'sections/dashboard/default/SaleReportCard';
import OrdersTable from 'sections/dashboard/default/OrdersTable';

import API from "../../api/axios";

const demoDashboard = {
  inventoryValue: 128500,
  totalProducts: 42,
  lowStock: 6,
  totalRevenue: 86500,
  weeklySales: [
    { day: "Mon", amount: 12000 },
    { day: "Tue", amount: 8500 },
    { day: "Wed", amount: 16200 },
    { day: "Thu", amount: 9800 },
    { day: "Fri", amount: 17400 }
  ],
  recentActivity: [
    { title: "Stock Added - Rice", date: "Today", qty: 25 },
    { title: "Stock Removed - Soap", date: "Yesterday", qty: 8 },
    { title: "Stock Added - Milk", date: "This week", qty: 40 }
  ],
  transactions: [
    { name: "Rice", type: "add", qty: 25, date: "Today" },
    { name: "Soap", type: "remove", qty: 8, date: "Yesterday" }
  ],
  turnoverRate: 18,
  deadStock: 3,
  stockAccuracy: 98
};

export default function DashboardDefault() {

  const [data, setData] = useState(demoDashboard);

  const fetchDashboard = async () => {
    try {
      const res = await API.get("/reports/dashboard");
      const apiData = res.data || {};
      setData({
        ...demoDashboard,
        ...apiData,
        weeklySales: apiData.weeklySales?.length ? apiData.weeklySales : demoDashboard.weeklySales,
        recentActivity: apiData.recentActivity?.length ? apiData.recentActivity : demoDashboard.recentActivity,
        transactions: apiData.transactions?.length ? apiData.transactions : demoDashboard.transactions
      });
    } catch (err) {
      console.error(err);
      setData(demoDashboard);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <Grid container rowSpacing={4.5} columnSpacing={2.75}>

      <Grid sx={{ mb: -2.25 }} size={12}>
        <Typography variant="h5">Inventory Dashboard</Typography>
      </Grid>

      {/* TOP CARDS */}
      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <AnalyticEcommerce
          title="Total Inventory Value"
          count={`₹${data.inventoryValue || 0}`}
          percentage={12.3}
          extra="This Month"
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <AnalyticEcommerce
          title="Total Products"
          count={data.totalProducts || 0}
          percentage={8.5}
          extra="New Added"
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <AnalyticEcommerce
          title="Low Stock Items"
          count={data.lowStock || 0}
          percentage={-5.4}
          isLoss
          color="warning"
          extra="Needs Restock"
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
        <AnalyticEcommerce
          title="Total Revenue"
          count={`₹${data.totalRevenue || 0}`}
          percentage={18.2}
          extra="Sales Growth"
        />
      </Grid>

      {/* GRAPH (unchanged component) */}
      <Grid size={{ xs: 12, md: 7, lg: 8 }}>
        <UniqueVisitorCard title="Stock Movement Overview" />
      </Grid>

      {/* SALES */}
      <Grid size={{ xs: 12, md: 5, lg: 4 }}>
        <Typography variant="h5">Weekly Sales Overview</Typography>

        <MainCard sx={{ mt: 2 }} content={false}>
          <Box sx={{ p: 3, pb: 0 }}>
            <Stack sx={{ gap: 2 }}>
              <Typography variant="h6" color="text.secondary">
                This Week Sales
              </Typography>
              <Typography variant="h3">
                ₹{data.weeklySales?.reduce((s, i) => s + i.amount, 0) || 0}
              </Typography>
            </Stack>
          </Box>

          {/* ⚠️ if you later want dynamic chart, we can modify component */}
          <MonthlyBarChart />
        </MainCard>
      </Grid>

      {/* INVENTORY ACTIVITY */}
      <Grid size={{ xs: 12, md: 7, lg: 8 }}>
        <Typography variant="h5">Recent Inventory Activity</Typography>

        <MainCard sx={{ mt: 2 }} content={false}>
          <List>
            {(data.recentActivity || []).map((item, i) => (
              <ListItem key={i} divider>
                <ListItemText
                  primary={item.title}
                  secondary={item.date}
                />
                <Typography>{item.qty}</Typography>
              </ListItem>
            ))}
          </List>
        </MainCard>
      </Grid>

      {/* ANALYTICS */}
      <Grid size={{ xs: 12, md: 5, lg: 4 }}>
        <Typography variant="h5">Inventory Analytics</Typography>

        <MainCard sx={{ mt: 2 }} content={false}>
          <List>
            <ListItemButton divider>
              <ListItemText primary="Stock Turnover Rate" />
              <Typography variant="h5">
                +{data.turnoverRate || 0}%
              </Typography>
            </ListItemButton>

            <ListItemButton divider>
              <ListItemText primary="Dead Stock" />
              <Typography variant="h5">
                {data.deadStock || 0} Items
              </Typography>
            </ListItemButton>

            <ListItemButton>
              <ListItemText primary="Stock Accuracy" />
              <Typography variant="h5">
                {data.stockAccuracy || 0}%
              </Typography>
            </ListItemButton>
          </List>

          <ReportAreaChart />
        </MainCard>
      </Grid>

      {/* SALES REPORT */}
      <Grid size={{ xs: 12, md: 7, lg: 8 }}>
        <SaleReportCard title="Sales & Inventory Report" />
      </Grid>

      {/* STOCK TRANSACTIONS */}
      <Grid size={{ xs: 12, md: 5, lg: 4 }}>
        <Typography variant="h5">Stock Transactions</Typography>

        <MainCard sx={{ mt: 2 }} content={false}>
          <List>
            {(data.transactions || []).map((t, i) => (
              <ListItem key={i} divider>
                <ListItemText
                  primary={`${t.type === "add" ? "Stock Added" : "Stock Removed"} - ${t.name}`}
                  secondary={t.date}
                />
                <Typography>
                  {t.type === "add" ? "+" : "-"}{t.qty}
                </Typography>
              </ListItem>
            ))}
          </List>
        </MainCard>
      </Grid>

    </Grid>
  );
}
