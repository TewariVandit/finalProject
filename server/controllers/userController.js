const User = require("../models/User");

// ================= GET USERS =================
const getUsers = async (req, res) => {
  try {
    const search = req.query.search || "";

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const query = {
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ]
    };

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: users,
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

// ================= GET SINGLE USER =================
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    res.json({ success: true, data: user });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= CREATE USER =================
const createUser = async (req, res) => {
  try {
    const { name, email, phone, address, status } = req.body;

    // 🔥 check duplicate phone
    const phoneExists = await User.findOne({ phone });
    if (phoneExists) {
      return res.status(400).json({ message: "Phone already exists" });
    }

    // 🔥 check duplicate email
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const user = await User.create({
      name,
      email,
      phone,
      address,
      status
    });

    res.json({ success: true, data: user });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= UPDATE USER =================
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, status } = req.body;

    // 🔥 check duplicate phone (exclude self)
    const phoneExists = await User.findOne({
      phone,
      _id: { $ne: id }
    });

    if (phoneExists) {
      return res.status(400).json({ message: "Phone already exists" });
    }

    // 🔥 check duplicate email
    const emailExists = await User.findOne({
      email,
      _id: { $ne: id }
    });

    if (emailExists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { name, email, phone, address, status },
      { new: true }
    );

    res.json({ success: true, data: user });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= DELETE USER =================
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    await User.findByIdAndDelete(id);

    res.json({ success: true, message: "User deleted" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};