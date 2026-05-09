const mongoose = require("mongoose");

const saleItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    },
    name: String,
    qty: Number,
    price: Number
});

const saleSchema = new mongoose.Schema(
    {
        customer: {
            type: String,
            required: true
        },

        items: [saleItemSchema],

        total: Number,

        staff: String,

        payment: {
            type: String,
            enum: ["Cash", "UPI", "Bank"],
            default: "Cash"
        },

        status: {
            type: String,
            enum: ["Paid", "Pending"],
            default: "Pending"
        },

        txnId: String,

        date: String,

        delivery: {
            challanNo: String,
            orderNo: String,

            driver: String,
            vehicle: String,

            status: {
                type: String,
                enum: ["Pending", "In Transit", "Delivered"],
                default: "Pending"
            },

            dispatchDate: String,
            deliveryDate: String
        }
    },

    { timestamps: true }
);

module.exports = mongoose.model("Sale", saleSchema);