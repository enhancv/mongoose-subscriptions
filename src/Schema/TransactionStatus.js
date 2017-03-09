'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TransactionStatus = new Schema({
    status: String,
    timestamp: Date,
}, { _id: false });

module.exports = TransactionStatus;
