'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TransactionDiscount = new Schema({
    __t: String,
    amount: Number,
    name: String,
}, { _id: false });

module.exports = TransactionDiscount;
