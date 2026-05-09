const express = require("express");
const router = express.Router();

const {
  getSalesReturns,createSalesReturn, updateSalesReturn,deleteSalesReturn,  getSales, createSale, updateSaleStatus, deleteSale, getChallans, createChallan, updateDeliveryStatus, deleteChallan } = require("../controllers/salesController.js");
const protect = require("../middleware/authMiddleware.js");
router.use(protect);

// SALES
router.get("/", getSales);
router.post("/", createSale);
router.patch("/:id/status", updateSaleStatus);
router.delete("/:id", deleteSale);

// DELIVERY CHALLAN
router.get("/challans", getChallans);
router.post("/challans", createChallan);
router.patch("/challans/:id/status", updateDeliveryStatus);
router.delete("/challans/:id", deleteChallan);

router.get("/returns", getSalesReturns);
router.post("/returns", createSalesReturn);
router.put("/returns/:id", updateSalesReturn);
router.delete("/returns/:id", deleteSalesReturn);

module.exports = router;