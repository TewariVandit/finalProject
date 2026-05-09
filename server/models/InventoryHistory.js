const mongoose = require("mongoose");

const inventoryHistorySchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },

    type: {
      type: String,
      enum: ["add", "remove"],
      required: true
    },

    qty: {
      type: Number,
      required: true
    },

    reason: {
      type: String
    },

    previousStock: Number,
    newStock: Number
  },
  { timestamps: true }
);

module.exports = mongoose.model("InventoryHistory", inventoryHistorySchema);