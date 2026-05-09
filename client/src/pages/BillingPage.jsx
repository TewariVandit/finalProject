import { useState } from "react";
import {
  Box, Typography, TextField, Button, Grid, Paper,
  IconButton, Stack, Divider, MenuItem, Dialog,
  DialogTitle, DialogContent, DialogActions
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";

import MainCard from "components/MainCard";
import toast from "react-hot-toast";
import { digitsOnly, isBlank, phoneRegex } from "utils/validation";

// ================= DATA =================
const initialProducts = [
  { id: 1, name: "Rice", price: 50, stock: 20 },
  { id: 2, name: "Milk", price: 30, stock: 10 },
  { id: 3, name: "Soap", price: 25, stock: 15 },
  { id: 4, name: "Sugar", price: 45, stock: 5 }
];

export default function BillingPage() {
  const [products] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);

  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    payment: "Cash"
  });

  const [openInvoice, setOpenInvoice] = useState(false);
  const [errors, setErrors] = useState({});

  // ================= FILTER =================
  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  // ================= CART =================
  const addToCart = (p) => {
    const exist = cart.find((c) => c.id === p.id);

    if (exist) {
      if (exist.qty < p.stock) {
        setCart(cart.map((c) =>
          c.id === p.id ? { ...c, qty: c.qty + 1 } : c
        ));
      }
    } else {
      setCart([...cart, { ...p, qty: 1 }]);
    }
  };

  const updateQty = (id, qty) => {
    const product = products.find((p) => p.id === id);
    const safeQty = Number(qty);
    if (!Number.isInteger(safeQty) || safeQty < 1 || safeQty > product.stock) return;

    setCart(cart.map((c) =>
      c.id === id ? { ...c, qty: safeQty } : c
    ));
  };

  const removeItem = (id) => {
    setCart(cart.filter((c) => c.id !== id));
  };

  // ================= TOTAL =================
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  // ================= CHECKOUT =================
  const handleCheckout = () => {
    const nextErrors = {};
    if (isBlank(customer.name)) nextErrors.name = "Customer name is required";
    if (!phoneRegex.test(customer.phone)) nextErrors.phone = "Enter a valid 10 digit mobile number";
    if (!cart.length) nextErrors.cart = "Add at least one item";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      toast.error(nextErrors.cart || "Please fix the highlighted fields");
      return;
    }
    setOpenInvoice(true);
  };

  const invoiceId = "INV-" + Date.now();

  return (
    <MainCard>
      <Typography variant="h5" mb={2}>
        POS Billing System
      </Typography>

      <Grid container spacing={2}>

        {/* ================= PRODUCTS ================= */}
        <Grid item xs={12} md={5}>
          <TextField
            fullWidth
            placeholder="Search product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ mb: 2 }}
          />

          <Paper sx={{ maxHeight: 500, overflow: "auto", p: 1 }}>
            <Grid container spacing={1}>
              {filtered.map((p) => (
                <Grid item xs={6} key={p.id}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      border: "1px solid #eee",
                      cursor: "pointer",
                      "&:hover": { bgcolor: "#f9fafb" }
                    }}
                    onClick={() => addToCart(p)}
                  >
                    <Typography fontWeight={500}>{p.name}</Typography>
                    <Typography variant="caption">
                      ₹{p.price} • Stock {p.stock}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* ================= BILLING ================= */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>

            {/* CUSTOMER */}
            <Typography variant="subtitle1" mb={1}>
              Customer Details
            </Typography>

            <Grid container spacing={1} mb={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth label="Name"
                  value={customer.name}
                  error={Boolean(errors.name)}
                  helperText={errors.name}
                  onChange={(e)=>setCustomer({...customer,name:e.target.value})}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  fullWidth label="Phone"
                  value={customer.phone}
                  inputProps={{ inputMode: "numeric", maxLength: 10 }}
                  error={Boolean(errors.phone)}
                  helperText={errors.phone}
                  onChange={(e)=>setCustomer({...customer,phone:digitsOnly(e.target.value)})}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  select fullWidth label="Payment Method"
                  value={customer.payment}
                  onChange={(e)=>setCustomer({...customer,payment:e.target.value})}
                >
                  <MenuItem value="Cash">Cash</MenuItem>
                  <MenuItem value="UPI">UPI</MenuItem>
                  <MenuItem value="Card">Card</MenuItem>
                </TextField>
              </Grid>
            </Grid>

            {/* CART */}
            <Typography variant="subtitle1" mb={1}>
              Cart Items
            </Typography>

            <Stack spacing={1}>
              {cart.map((item) => (
                <Box
                  key={item.id}
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{
                    p: 1,
                    border: "1px solid #eee",
                    borderRadius: 1
                  }}
                >
                  <Typography sx={{ flex: 1 }}>{item.name}</Typography>

                  <TextField
                    type="number"
                    size="small"
                    value={item.qty}
                    inputProps={{ min: 1, max: item.stock, step: 1 }}
                    onChange={(e)=>updateQty(item.id,e.target.value)}
                    sx={{ width: 60 }}
                  />

                  <Typography width={80} textAlign="right">
                    ₹{item.price * item.qty}
                  </Typography>

                  <IconButton onClick={()=>removeItem(item.id)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
            </Stack>

            <Divider sx={{ my: 2 }} />

            {/* TOTAL CARD */}
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: "#f9fafb"
              }}
            >
              <Typography>Subtotal: ₹ {subtotal}</Typography>
              <Typography>Tax (5%): ₹ {tax.toFixed(2)}</Typography>
              <Typography variant="h6">
                Total: ₹ {total.toFixed(2)}
              </Typography>
            </Box>

            <Button
              fullWidth
              variant="contained"
              sx={{ mt: 2 }}
              onClick={handleCheckout}
            >
              Generate Invoice
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* ================= INVOICE ================= */}
      <Dialog open={openInvoice} onClose={()=>setOpenInvoice(false)} fullWidth maxWidth="sm">

        {/* HEADER */}
        <DialogTitle
          sx={{
            bgcolor: "primary.main",
            color: "#fff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          Invoice

          <IconButton onClick={()=>setOpenInvoice(false)} sx={{ color: "#fff" }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ mt: 2 }}>
          <Typography>Invoice ID: {invoiceId}</Typography>
          <Typography>Date: {new Date().toLocaleString()}</Typography>

          <Typography mt={2}>Customer: {customer.name}</Typography>
          <Typography>Payment: {customer.payment}</Typography>

          <Divider sx={{ my: 2 }} />

          {cart.map((i)=>(
            <Stack key={i.id} direction="row" justifyContent="space-between">
              <Typography>{i.name} x{i.qty}</Typography>
              <Typography>₹{i.price*i.qty}</Typography>
            </Stack>
          ))}

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6">
            Total: ₹ {total.toFixed(2)}
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={()=>window.print()}>Print</Button>
          <Button onClick={()=>setOpenInvoice(false)}>Close</Button>
        </DialogActions>

      </Dialog>
    </MainCard>
  );
}
