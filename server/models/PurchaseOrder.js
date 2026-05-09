const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product"
  },
  name: String,
  qty: Number,
  price: Number
});

const purchaseOrderSchema = new mongoose.Schema(
  {
    orderNo: { type: String, required: true },

    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true
    },

    items: [itemSchema],

    total: Number,
    tax: Number,
    grandTotal: Number,

    status: {
      type: String,
      enum: ["Pending", "Ordered"],
      default: "Pending"
    },

    // 🔥 ADD THESE 👇
    billNo: String,

    paymentStatus: {
      type: String,
      enum: ["Paid", "Pending"],
      default: "Pending"
    },

    paymentMode: {
      type: String,
      enum: ["Cash", "Bank", "UPI"],
      default: "Cash"
    },

    billDate: String,

    date: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("PurchaseOrder", purchaseOrderSchema);