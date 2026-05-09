const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    title: {
      type: String,
      required: true
    },

    message: {
      type: String
    },

    type: {
      type: String,
      enum: ["message", "comment", "system", "alert"],
      default: "system"
    },

    isRead: {
      type: Boolean,
      default: false
    },

    meta: {
      type: Object // optional extra data (postId, senderId etc.)
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Notification", notificationSchema);