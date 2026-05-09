const Sale = require("../models/Sale");
const Product = require("../models/Product");
const SalesReturn = require("../models/SalesReturn");
const { recordStockMovement } = require("../utils/stockMovement");

const createSale = async (req, res) => {
    try {
        const items = req.body.items || [];

        if (!items.length) {
            return res.status(400).json({ message: "Add at least one item" });
        }

        for (const item of items) {
            if (!item.product) {
                return res.status(400).json({ message: `Select a saved product for ${item.name || "each item"}` });
            }

            const qty = Number(item.qty);
            if (!Number.isInteger(qty) || qty <= 0) {
                return res.status(400).json({ message: "Quantity must be greater than 0" });
            }

            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(404).json({ message: "Product not found" });
            }

            if (Number(product.stock || 0) < qty) {
                return res.status(400).json({ message: `Not enough stock for ${product.name}` });
            }
        }

        const sale = await Sale.create({
            ...req.body,
            items: items.map((item) => ({
                ...item,
                qty: Number(item.qty),
                price: Number(item.price)
            })),
            total: Number(req.body.total || 0)
        });

        for (const item of sale.items) {
            await recordStockMovement({
                productId: item.product,
                type: "remove",
                qty: item.qty,
                reason: `Sale: ${sale._id}`
            });
        }

        res.status(201).json({ success: true, data: sale });

    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const getSales = async (req, res) => {
    try {
        const sales = await Sale.find().sort({ createdAt: -1 });

        res.json({
            success: true,
            data: sales
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const updateSaleStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const updated = await Sale.findByIdAndUpdate(
            id,
            { status: req.body.status },
            { new: true }
        );

        res.json({ success: true, data: updated });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const deleteSale = async (req, res) => {
    try {
        const sale = await Sale.findById(req.params.id);
        if (!sale) {
            return res.status(404).json({ message: "Sale not found" });
        }

        for (const item of sale.items || []) {
            if (!item.product) continue;
            await recordStockMovement({
                productId: item.product,
                type: "add",
                qty: item.qty,
                reason: `Sale deleted: ${sale._id}`
            });
        }

        await Sale.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const getChallans = async (req, res) => {
    try {
        const data = await Sale.find({
            "delivery.challanNo": { $exists: true }
        }).sort({ createdAt: -1 });

        res.json({
            success: true,
            data
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const createChallan = async (req, res) => {
    try {
        const { saleId } = req.body;

        const sale = await Sale.findByIdAndUpdate(
            saleId,
            {
                delivery: {
                    ...req.body.delivery,
                    status: "Pending"
                }
            },
            { new: true }
        );

        res.json({ success: true, data: sale });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const updateDeliveryStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const updateData = {
            "delivery.status": status
        };

        if (status === "Delivered") {
            updateData["delivery.deliveryDate"] =
                new Date().toISOString().split("T")[0];
        }

        const updated = await Sale.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        res.json({ success: true, data: updated });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const deleteChallan = async (req, res) => {
    try {
        await Sale.findByIdAndUpdate(req.params.id, {
            $unset: { delivery: "" }
        });

        res.json({ success: true });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const createSalesReturn = async (req, res) => {
    try {
        const returnData = await SalesReturn.create(req.body);

        res.json({
            success: true,
            data: returnData
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getSalesReturns = async (req, res) => {
    try {
        const data = await SalesReturn.find().sort({ createdAt: -1 });

        res.json({
            success: true,
            data
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const updateSalesReturn = async (req, res) => {
    try {
        const { id } = req.params;

        const updated = await SalesReturn.findByIdAndUpdate(
            id,
            req.body,
            { new: true }
        );

        res.json({
            success: true,
            data: updated
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const deleteSalesReturn = async (req, res) => {
    try {
        const { id } = req.params;

        await SalesReturn.findByIdAndDelete(id);

        res.json({
            success: true
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    createSale,
    getSales,
    updateSaleStatus,
    deleteSale,
    getChallans,
    createChallan,
    updateDeliveryStatus,
    deleteChallan,
    createSalesReturn,
    getSalesReturns,
    updateSalesReturn,
    deleteSalesReturn
};
