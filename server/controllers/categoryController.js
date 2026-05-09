const Category = require("../models/Category");

// ================= GET =================
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });

    res.json({ success: true, data: categories });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= CREATE =================
const createCategory = async (req, res) => {
  try {
    const { name, subcategories } = req.body;

    const exists = await Category.findOne({ name });
    if (exists) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const category = await Category.create({
      name,
      subcategories
    });

    res.json({ success: true, data: category });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= UPDATE =================
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, subcategories } = req.body;

    const exists = await Category.findOne({
      name,
      _id: { $ne: id }
    });

    if (exists) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const category = await Category.findByIdAndUpdate(
      id,
      { name, subcategories },
      { new: true }
    );

    res.json({ success: true, data: category });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= DELETE =================
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    await Category.findByIdAndDelete(id);

    res.json({ success: true, message: "Deleted" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
};