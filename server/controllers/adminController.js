const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");

// @desc Login Admin
const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email });

  if (admin && (await bcrypt.compare(password, admin.password))) {
    generateToken(res, admin._id);

    res.json({
      _id: admin._id,
      fullName: admin.fullName,
      email: admin.email,
      image: admin.image,
    });
  } else {
    res.status(401).json({ message: "Invalid email or password" });
  }
};

// @desc Get Admin Profile
const getAdminProfile = async (req, res) => {
  res.json(req.admin);
};

// @desc Update Admin Profile
const updateAdminProfile = async (req, res) => {
  const admin = await Admin.findById(req.admin._id);

  if (admin) {
    admin.fullName = req.body.fullName || admin.fullName;
    admin.email = req.body.email || admin.email;

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      admin.password = await bcrypt.hash(req.body.password, salt);
    }

    if (req.file) {
      admin.image = `/public/uploads/${req.file.filename}`;
    }

    const updated = await admin.save();

    res.json(updated);
  }
};

// @desc Logout
const logoutAdmin = (req, res) => {
  res.cookie("jwt", "", { maxAge: 0 });
  res.json({ message: "Logged out successfully" });
};

module.exports = {
  loginAdmin,
  getAdminProfile,
  updateAdminProfile,
  logoutAdmin,
};