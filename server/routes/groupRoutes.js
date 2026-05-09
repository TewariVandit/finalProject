const express = require("express");
const router = express.Router();

const {
  createGroup,
  getGroups,
  updateGroup,
  deleteGroup,
  addProductToGroup,
  removeProductFromGroup
} = require("../controllers/groupController");
const protect = require("../middleware/authMiddleware");
router.use(protect);

router.get("/", getGroups);
router.post("/", createGroup);
router.put("/:id", updateGroup);
router.delete("/:id", deleteGroup);

router.post("/:groupId/add-product", addProductToGroup);
router.delete("/:groupId/remove-product/:productId", removeProductFromGroup);

module.exports = router;