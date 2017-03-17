'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ProcessorItem = require('./ProcessorItem');
const Descriptor = require('./Descriptor');
const originalValue = require('../utils').originalValue;
const Discount = require('./Discount');

const Subscription = new Schema({
    _id: String,
    processor: {
        type: ProcessorItem,
        default: ProcessorItem,
    },
    plan: {
        type: Schema.Types.ObjectId,
        ref: 'Plan',
        required: true,
    },
    planProcessorId: String,
    discounts: [Discount],
    paymentMethodId: String,
    firstBillingDate: Date,
    nextBillingDate: Date,
    paidThroughDate: Date,
    status: String,
    price: Number,
    descriptor: Descriptor,
    trialDuration: Number,
    trialDurationUnit: {
        type: String,
        enum: ['month', 'day'],
    },
});

Subscription.methods.addDiscounts = function find (callback) {
    const newDiscounts = callback(this)
    const oldDiscounts = this.discounts;

    this.discounts = oldDiscounts
        .concat(newDiscounts)
        .filter(item => item)
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 1);

    return this;
};

Subscription.plugin(originalValue, { fields: ['discounts'] });

Subscription.path('discounts').discriminator('DiscountAmount', Discount.DiscountAmount);
Subscription.path('discounts').discriminator('DiscountPercent', Discount.DiscountPercent);
Subscription.path('discounts').discriminator('DiscountInviter', Discount.DiscountInviter);
Subscription.path('discounts').discriminator('DiscountCoupon', Discount.DiscountCoupon);

module.exports = Subscription;
