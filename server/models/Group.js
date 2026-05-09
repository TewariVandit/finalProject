const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
      }
    ],

    color: {
      type: String,
      default: "linear-gradient(135deg, #667eea, #764ba2)"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Group", groupSchema);