const mongoose = require("mongoose");

const TransactionCustomer = new mongoose.Schema(
    {
        company: String,
        email: String,
        name: String,
        phone: String,
    },
    { _id: false }
);

module.exports = TransactionCustomer;
