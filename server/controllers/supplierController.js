const Supplier = require("../models/Supplier.js");

// ================= GET =================
const getSuppliers = async (req, res) => {
  try {
    const search = req.query.search || "";
    const status = req.query.status || "all";

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } }
      ];
    }

    if (status !== "all") {
      query.status = status;
    }

    const suppliers = await Supplier.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Supplier.countDocuments(query);

    res.json({
      success: true,
      data: suppliers,
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

// ================= CREATE =================
const createSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.create(req.body);

    res.json({
      success: true,
      data: supplier
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= UPDATE =================
const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;

    const supplier = await Supplier.findByIdAndUpdate(id, req.body, {
      new: true
    });

    res.json({
      success: true,
      data: supplier
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= DELETE =================
const deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;

    await Supplier.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Deleted"
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= GET ONE =================
const getSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);

    res.json({ success: true, data: supplier });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getSupplier
};