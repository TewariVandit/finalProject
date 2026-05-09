const Product = require("../models/Product");

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
            price,
            stock,
            description,
            image: mainImage,
            images: galleryImages
        });

        res.json({ success: true, data: product });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ================= UPDATE =================
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const updateData = { ...req.body };

        if (req.files?.image) {
            updateData.image = `/public/products/${req.files.image[0].filename}`;
        }

        if (req.files?.images) {
            updateData.images = req.files.images.map(f => `/public/products/${f.filename}`);
        }

        const product = await Product.findByIdAndUpdate(id, updateData, { new: true });

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
