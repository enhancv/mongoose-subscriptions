const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const PayPalAccount = new Schema(
    {
        email: String,
        name: String,
        payerId: String,
    },
    { _id: false }
);

module.exports = PayPalAccount;
