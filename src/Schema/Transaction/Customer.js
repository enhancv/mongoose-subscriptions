const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const TransactionCustomer = new Schema({
    company: String,
    email: String,
    name: String,
    phone: String,
}, { _id: false });

module.exports = TransactionCustomer;
