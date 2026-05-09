const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    phone: {
      type: String,
      required: true
    },

    city: String,

    gst: String,

    totalOrders: {
      type: Number,
      default: 0
    },

    totalPurchased: {
      type: Number,
      default: 0
    },

    pending: {
      type: Number,
      default: 0
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Supplier", supplierSchema);