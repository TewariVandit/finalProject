const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  amount: Number,
  date: String
});

const paymentSchema = new mongoose.Schema({
  method: String,
  amount: Number
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    phone: {
      type: String,
      required: true,
      unique: true
    },
    address: String,
    status: {
      type: String,
      enum: ["Active", "Blocked"],
      default: "Active"
    },
    orders: [orderSchema],
    payments: [paymentSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);