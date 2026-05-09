const express = require("express");
const router = express.Router();

const upload = require("../middleware/productUpload");

const {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    searchProducts
} = require("../controllers/productController");

// multiple fields
const multiUpload = upload.fields([
    { name: "image", maxCount: 1 },
    { name: "images", maxCount: 5 }
]);

const protect = require("../middleware/authMiddleware");
router.use(protect);
router.get("/", getProducts);
router.post("/", multiUpload, createProduct);
router.put("/:id", multiUpload, updateProduct);
router.delete("/:id", deleteProduct);
router.get("/search", searchProducts);

module.exports = router;