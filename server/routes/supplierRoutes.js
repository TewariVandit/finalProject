const express = require("express");
const router = express.Router();

const {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getSupplier
} = require("../controllers/supplierController.js");

router.get("/", getSuppliers);
router.post("/", createSupplier);
router.put("/:id", updateSupplier);
router.delete("/:id", deleteSupplier);
router.get("/:id", getSupplier);

module.exports = router;