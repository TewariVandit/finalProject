const express = require("express");
const router = express.Router();

const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} = require("../controllers/userController");

const protect = require("../middleware/authMiddleware");

router.use(protect);
// GET all (with search + pagination)
router.get("/", getUsers);

// GET single
router.get("/:id", getUserById);

// CREATE
router.post("/", createUser);

// UPDATE
router.put("/:id", updateUser);

// DELETE
router.delete("/:id", deleteUser);

module.exports = router;