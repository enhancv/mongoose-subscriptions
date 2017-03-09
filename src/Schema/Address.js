'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ProcessorItem = require('./ProcessorItem');

const Address = new Schema({
    id: String,
    processor: {
        type: ProcessorItem,
        default: ProcessorItem,
    },
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

module.exports = Address;
