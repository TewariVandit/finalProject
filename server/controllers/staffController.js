const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// ================= GET STAFF =================
const getStaff = async (req, res) => {
  try {
    const search = req.query.search || "";

    const query = {
      $and: [
        { role: { $in: ["Admin", "Staff"] } },
        {
          $or: [
            { fullName: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } }
          ]
        }
      ]
    };

    const staff = await Admin.find(query).sort({ createdAt: -1 });

    res.json({ success: true, data: staff });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= CREATE STAFF =================
const createStaff = async (req, res) => {
  try {
    const { name, email, role, status, password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const exists = await Admin.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const staff = await Admin.create({
      fullName: name,
      email,
      password: await hashPassword(password),
      role,
      status,
      image: req.file ? `/public/uploads/${req.file.filename}` : ""
    });

    res.json({ success: true, data: staff });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= UPDATE STAFF =================
const updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, status, password } = req.body;

    const updateData = {
      fullName: name,
      email,
      role,
      status
    };

    if (req.file) {
      updateData.image = `/public/uploads/${req.file.filename}`;
    }

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }
      updateData.password = await hashPassword(password);
    }

    const staff = await Admin.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    res.json({ success: true, data: staff });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= DELETE STAFF =================
const deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;

    await Admin.findByIdAndDelete(id);

    res.json({ success: true, message: "Deleted" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getStaff,
  createStaff,
  updateStaff,
  deleteStaff
};
