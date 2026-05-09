const express =  require("express");
const {
  getNotifications,
  getUnreadCount,
  markAllAsRead,
  markOneAsRead,
  createNotification
} = require ("../controllers/notificationController.js");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", getNotifications);
router.get("/unread-count", getUnreadCount);

router.patch("/mark-all-read", markAllAsRead);
router.patch("/:id/read", markOneAsRead);

router.post("/", createNotification);

module.exports = router;