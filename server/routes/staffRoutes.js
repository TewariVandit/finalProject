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
router.post("/", upload.single("image"), createStaff);
router.put("/:id", upload.single("image"), updateStaff);
router.delete("/:id", deleteStaff);

module.exports = router;