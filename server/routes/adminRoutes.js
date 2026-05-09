const express = require("express");
const router = express.Router();
const {
  loginAdmin,
  getAdminProfile,
  updateAdminProfile,
  logoutAdmin,
} = require("../controllers/adminController");

const protect = require("../middleware/authMiddleware");
const multer = require("multer");

// Image Upload Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Routes
router.post("/login", loginAdmin);
router.post("/logout", logoutAdmin);
router.get("/profile", protect, getAdminProfile);
router.put("/profile", protect, upload.single("image"), updateAdminProfile);

module.exports = router;