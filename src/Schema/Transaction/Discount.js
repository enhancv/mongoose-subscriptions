const mongoose = require("mongoose");

const TransactionDiscount = new mongoose.Schema(
    {
        amount: Number,
        name: String,
    },
    { _id: false }
);

module.exports = TransactionDiscount;
