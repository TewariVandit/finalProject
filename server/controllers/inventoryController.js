const Product = require("../models/Product.js");
const InventoryHistory = require("../models/InventoryHistory.js");
const PurchaseOrder = require("../models/PurchaseOrder.js");
const Supplier = require("../models/Supplier.js");
const PurchaseReturn = require("../models/PurchaseReturn");

const getInventory = async (req, res) => {
  try {
    const filter = req.query.filter || "all";

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    let query = {};

    // FILTER LOGIC
    if (filter === "low") {
      query.stock = { $gt: 0, $lt: 10 };
    } else if (filter === "out") {
      query.stock = 0;
    }

    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: "i" } },
        { category: { $regex: req.query.search, $options: "i" } }
      ];
    }

    const products = await Product.find(query)
      .sort({ stock: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Product.countDocuments(query);

    // ===== STATS =====
    const totalCount = await Product.countDocuments();
    const lowCount = await Product.countDocuments({
      stock: { $gt: 0, $lt: 10 }
    });
    const outCount = await Product.countDocuments({
      stock: 0
    });

    // ===== TOP STOCK =====
    const topStock = await Product.find()
      .sort({ stock: -1 })
      .limit(5)
      .select("name stock");

    res.json({
      success: true,
      data: products,
      stats: {
        total: totalCount,
        low: lowCount,
        out: outCount
      },
      topStock,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// ================= UPDATE STOCK =================
const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock, reason } = req.body;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const previousStock = product.stock;

    // determine type
    const type = stock > previousStock ? "add" : "remove";
    const qty = Math.abs(stock - previousStock);

    product.stock = stock;
    await product.save();

    // create history entry
    await InventoryHistory.create({
      product: product._id,
      type,
      qty,
      reason,
      previousStock,
      newStock: stock
    });

    res.json({
      success: true,
      message: "Stock updated",
      data: product
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getInventoryHistory = async (req, res) => {
  try {
    const search = req.query.search || "";

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    let query = {};

    const history = await InventoryHistory.find(query)
      .populate("product", "name")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // SEARCH FILTER (after populate)
    let filtered = history;

    if (search) {
      filtered = history.filter((h) =>
        h.product?.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    const total = await InventoryHistory.countDocuments();

    res.json({
      success: true,
      data: filtered,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createPurchaseOrder = async (req, res) => {
  try {
    const data = req.body;

    const order = await PurchaseOrder.create(data);

    // ===== UPDATE STOCK + HISTORY =====
    for (const item of data.items) {
      if (!item.product) continue;

      const product = await Product.findById(item.product);

      if (!product) continue;

      const previousStock = product.stock;
      const newStock = previousStock + item.qty;

      product.stock = newStock;
      await product.save();

      // history entry
      await InventoryHistory.create({
        product: product._id,
        type: "add",
        qty: item.qty,
        reason: `PO: ${data.orderNo}`,
        previousStock,
        newStock
      });
    }

    // ===== UPDATE SUPPLIER =====
    await Supplier.findByIdAndUpdate(data.supplier, {
      $inc: {
        totalOrders: 1,
        totalPurchased: data.grandTotal
      }
    });

    res.json({
      success: true,
      data: order
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getPurchaseOrders = async (req, res) => {
  try {
    const search = req.query.search || "";
    const status = req.query.status || "all";

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    let query = {};

    if (status !== "all") {
      query.status = status;
    }

    const orders = await PurchaseOrder.find(query)
      .populate("supplier", "name")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // SEARCH
    let filtered = orders;

    if (search) {
      filtered = orders.filter(
        (o) =>
          o.orderNo.toLowerCase().includes(search.toLowerCase()) ||
          o.supplier?.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    const total = await PurchaseOrder.countDocuments(query);

    res.json({
      success: true,
      data: filtered,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updatePurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await PurchaseOrder.findByIdAndUpdate(id, req.body, {
      new: true
    });

    res.json({ success: true, data: order });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deletePurchaseOrder = async (req, res) => {
  try {
    const { id } = req.params;

    await PurchaseOrder.findByIdAndDelete(id);

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateBillStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus, paymentMode } = req.body;

    const order = await PurchaseOrder.findByIdAndUpdate(
      id,
      {
        paymentStatus,
        paymentMode
      },
      { new: true }
    );

    res.json({
      success: true,
      data: order
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createPurchaseReturn = async (req, res) => {
  try {
    const returnData = await PurchaseReturn.create(req.body);

    res.status(201).json({
      success: true,
      data: returnData
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getPurchaseReturns = async (req, res) => {
  try {
    const returns = await PurchaseReturn.find()
      .populate("supplier", "name")
      .populate("purchaseOrder", "orderNo")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: returns
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updatePurchaseReturn = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await PurchaseReturn.findByIdAndUpdate(
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

const deletePurchaseReturn = async (req, res) => {
  try {
    const { id } = req.params;

    await PurchaseReturn.findByIdAndDelete(id);

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


const markReturnRefunded = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await PurchaseReturn.findByIdAndUpdate(
      id,
      { status: "Refunded" },
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


module.exports = {
  getInventory,
  updateStock,
  getInventoryHistory,
  createPurchaseOrder,
  getPurchaseOrders,
  updatePurchaseOrder,
  deletePurchaseOrder,
  updateBillStatus,
  createPurchaseReturn,
  getPurchaseReturns,
  updatePurchaseReturn,
  deletePurchaseReturn,
  markReturnRefunded
};