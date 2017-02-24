'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SubscriptionSchema = new Schema({
    id: String,
    paymentMethodId: String,
    firstBillingDate: Date,
    nextBillingDate: Date,
    status: String,
    trialDays: Number,
});

module.exports = SubscriptionSchema;
