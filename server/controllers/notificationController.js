const Notification = require("../models/Notification.js");


const getNotifications = async (req, res) => {
  try {
    const userId = req.user_id;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Notification.countDocuments({ user: userId });

    res.json({
      success: true,
      data: notifications,
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

const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user_id;

    const count = await Notification.countDocuments({
      user: userId,
      isRead: false
    });

    res.json({ success: true, count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user_id;

    await Notification.updateMany(
      { user: userId, isRead: false },
      { isRead: true }
    );

    res.json({ success: true, message: "All marked as read" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const markOneAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    await Notification.findByIdAndUpdate(id, { isRead: true });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createNotification = async (req, res) => {
  try {
    const { user, title, message, type, meta } = req.body;

    const notification = await Notification.create({
      user,
      title,
      message,
      type,
      meta
    });

    res.json({ success: true, data: notification });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAllAsRead,
  markOneAsRead,
  createNotification,
};