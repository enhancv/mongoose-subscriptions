'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ProcessorItem = require('./ProcessorItem');
const Descriptor = require('./Descriptor');

const Subscription = new Schema({
    id: String,
    processor: {
        type: ProcessorItem,
        default: ProcessorItem,
    },
    plan: {
        type: Schema.Types.ObjectId,
        ref: 'Plan',
        required: true,
    },
    paymentMethodId: String,
    firstBillingDate: Date,
    nextBillingDate: Date,
    status: String,
    price: Number,
    descriptor: Descriptor,
    trialDuration: Number,
    trialDurationUnit: {
        type: String,
        enum: ['month', 'day'],
    },
}, { _id: false });

module.exports = Subscription;
