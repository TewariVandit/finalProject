const Product = require("../models/Product");
const InventoryHistory = require("../models/InventoryHistory");
const { setStockLevel } = require("../utils/stockMovement");

// ================= SEARCH =================
const searchProducts = async (req, res) => {
    try {
        const { q } = req.query;

        const products = await Product.find({
            name: { $regex: q, $options: "i" }
        })
            .select("name price stock image") // 🔥 only needed fields
            .limit(10);

        res.json({ success: true, data: products });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ================= GET =================
const getProducts = async (req, res) => {
    try {
        const { search = "", limit = 10 } = req.query;

        let filter = {};

        if (search) {
            filter.name = { $regex: search, $options: "i" };
        }

        const products = await Product.find(filter)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        res.json({ success: true, data: products });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
// ================= CREATE =================
const createProduct = async (req, res) => {
    try {
        const { name, sku, category, subcategory, price, stock, description } = req.body;

        const mainImage = req.files?.image?.[0]?.filename
            ? `/public/products/${req.files.image[0].filename}`
            : "";

        const galleryImages = req.files?.images
            ? req.files.images.map(f => `/public/products/${f.filename}`)
            : [];

        const product = await Product.create({
            name,
            sku,
            category,
            subcategory,
            price: Number(price),
            stock: Number(stock || 0),
            description,
            image: mainImage,
            images: galleryImages
        });

        if (Number(product.stock || 0) > 0) {
            await InventoryHistory.create({
                product: product._id,
                type: "add",
                qty: product.stock,
                reason: "Opening stock",
                previousStock: 0,
                newStock: product.stock
            });
        }

        res.json({ success: true, data: product });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ================= UPDATE =================
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const existing = await Product.findById(id);
        if (!existing) {
            return res.status(404).json({ message: "Product not found" });
        }

        const updateData = { ...req.body };
        const hasStockUpdate = Object.prototype.hasOwnProperty.call(updateData, "stock");
        const nextStock = hasStockUpdate ? Number(updateData.stock) : existing.stock;

        if (req.files?.image) {
            updateData.image = `/public/products/${req.files.image[0].filename}`;
        }

        if (req.files?.images) {
            updateData.images = req.files.images.map(f => `/public/products/${f.filename}`);
        }

        delete updateData.stock;

        await Product.findByIdAndUpdate(id, updateData, { new: true });

        const product = hasStockUpdate && Number(existing.stock || 0) !== nextStock
            ? await setStockLevel({ productId: id, stock: nextStock, reason: "Product stock edit" })
            : await Product.findById(id);

        res.json({ success: true, data: product });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ================= DELETE =================
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        await Product.findByIdAndDelete(id);

        res.json({ success: true });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    searchProducts
};
