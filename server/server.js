const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();
const clientDistPath = path.join(__dirname, "../client/dist");

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use("/public", express.static("public"));
app.use(express.static(clientDistPath));

const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:3000,http://localhost:5000,http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));

// Routes
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/staff", require("./routes/staffRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/groups", require("./routes/groupRoutes"));
app.use("/api/inventory", require("./routes/inventoryRoutes"));
app.use("/api/suppliers", require("./routes/supplierRoutes"));
app.use("/api/sales", require("./routes/salesRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));

app.use((err, req, res, next) => {
  if (err) {
    return res.status(400).json({ message: err.message || "Request failed" });
  }
  next();
});

app.get(/.*/, (req, res, next) => {
  if (req.path.startsWith("/api") || req.path.startsWith("/public")) return next();
  res.set("Cache-Control", "no-store");
  res.sendFile(path.join(clientDistPath, "index.html"));
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
