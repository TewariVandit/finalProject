const express = require("express");
const router = express.Router();

const {
  getInventory, updateStock, getInventoryHistory, getPurchaseOrders, createPurchaseOrder, updatePurchaseOrder, deletePurchaseOrder, updateBillStatus, getPurchaseReturns, createPurchaseReturn, updatePurchaseReturn, deletePurchaseReturn, markReturnRefunded
} = require("../controllers/inventoryController.js");
const protect = require("../middleware/authMiddleware");
router.use(protect);
// GET INVENTORY
router.get("/", getInventory);
router.put("/:id/stock", updateStock);
router.get("/history", getInventoryHistory);
router.get("/purchase-orders", getPurchaseOrders);
router.post("/purchase-orders", createPurchaseOrder);
router.put("/purchase-orders/:id", updatePurchaseOrder);
router.delete("/purchase-orders/:id", deletePurchaseOrder);
router.patch("/purchase-orders/:id/payment", updateBillStatus);
// PURCHASE RETURNS
router.get("/purchase-returns", getPurchaseReturns);
router.post("/purchase-returns", createPurchaseReturn);
router.put("/purchase-returns/:id", updatePurchaseReturn);
router.delete("/purchase-returns/:id", deletePurchaseReturn);
router.patch("/purchase-returns/:id/refund", markReturnRefunded);

module.exports = router;