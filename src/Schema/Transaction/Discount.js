const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const TransactionDiscount = new Schema({
    amount: Number,
    name: String,
}, { _id: false });

module.exports = TransactionDiscount;
