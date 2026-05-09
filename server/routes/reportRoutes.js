const express = require("express");
const router = express.Router();
const { getSalesReport, getInventoryReport, getPurchaseReport, getDashboard } = require("../controllers/reportController");

router.get("/sales-report", getSalesReport);
router.get("/inventory-report", getInventoryReport);
router.get("/purchase-report", getPurchaseReport);
router.get("/dashboard", getDashboard);

module.exports = router;