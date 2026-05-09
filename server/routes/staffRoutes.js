const express = require("express");
const router = express.Router();

const {
  getStaff,
  createStaff,
  updateStaff,
  deleteStaff
} = require("../controllers/staffController");
const upload = require("../middleware/upload");
const protect = require("../middleware/authMiddleware");
router.use(protect);

router.get("/", getStaff);

router.use((req, res, next) => {
  if (req.admin?.role !== "Admin") {
    return res.status(403).json({ message: "Only admin can manage staff" });
  }
  next();
});

router.post("/", upload.single("image"), createStaff);
router.put("/:id", upload.single("image"), updateStaff);
router.delete("/:id", deleteStaff);

module.exports = router;
