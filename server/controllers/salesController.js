const Sale = require("../models/Sale");
const Product = require("../models/Product");
const SalesReturn = require("../models/SalesReturn");

const createSale = async (req, res) => {
    try {
        const sale = await Sale.create(req.body);

        // 🔥 reduce stock
        for (let item of req.body.items) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: -item.qty }
            });
        }

        res.status(201).json({ success: true, data: sale });

    } catch (err) {
        res.status(500).json({ message: err.message });
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
        await Sale.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: err.message });
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
}