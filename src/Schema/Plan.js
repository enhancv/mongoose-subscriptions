'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ProcessorItem = require('./ProcessorItem');
const set = require('lodash/fp/set');

const Plan = new Schema({
    processor: {
        type: ProcessorItem,
        default: ProcessorItem,
    },
    name: String,
    price: Number,
    currency: String,
    description: String,
    createdAt: Date,
    updatedAt: Date,
    billingFrequency: String,
});

module.exports = Plan;
