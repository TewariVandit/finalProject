const mongoose = require("mongoose");

const returnItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product"
  },
  name: String,
  qty: Number,
  price: Number
});

const purchaseReturnSchema = new mongoose.Schema(
  {
    returnNo: {
      type: String,
      required: true
    },

    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true
    },

    // 🔥 optional link to order
    purchaseOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PurchaseOrder"
    },

    items: [returnItemSchema],

    amount: Number,

    status: {
      type: String,
      enum: ["Returned", "Refunded"],
      default: "Returned"
    },

    date: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("PurchaseReturn", purchaseReturnSchema);