
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

const salesReturnSchema = new mongoose.Schema(
  {
    returnNo: {
      type: String,
      required: true
    },

    orderNo: String,

    customer: {
      type: String,
      required: true
    },

    items: [returnItemSchema],

    refundAmount: Number,

    refundMode: {
      type: String,
      enum: ["Cash", "UPI", "Bank"],
      default: "Cash"
    },

    status: {
      type: String,
      enum: ["Requested", "Approved", "Refunded"],
      default: "Requested"
    },

    date: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("SalesReturn", salesReturnSchema);