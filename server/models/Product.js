const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    sku: {
      type: String,
      required: true,
      unique: true
    },

    category: {
      type: String,
      required: true
    },

    subcategory: {
      type: String
    },

    price: {
      type: Number,
      required: true
    },

    stock: {
      type: Number,
      default: 0
    },

    description: String,

    image: String, // main image

    images: [String] // gallery
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);  