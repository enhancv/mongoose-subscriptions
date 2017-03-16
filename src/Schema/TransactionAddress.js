'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TransactionAddress = new Schema({
    company: String,
    name: String,
    country: String,
    locality: String,
    streetAddress: String,
    extendedAddress: String,
    postalCode: String,
    createdAt: Date,
    updatedAt: Date,
}, { _id: false });

module.exports = TransactionAddress;
