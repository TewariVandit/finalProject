const Admin = require("../models/Admin");

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
    const { name, email, role, status } = req.body;

    const exists = await Admin.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const staff = await Admin.create({
      fullName: name,
      email,
      password: "123456",
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
    const { name, email, role, status } = req.body;

    const updateData = {
      fullName: name,
      email,
      role,
      status
    };

    if (req.file) {
      updateData.image = `/public/uploads/${req.file.filename}`;
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