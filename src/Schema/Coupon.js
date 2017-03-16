'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Coupon = new Schema({
    name: String,
    description: String,
    numberOfBillingCycles: {
        type: Number,
        min: 1,
    },
    kind: String,
    createdAt: Date,
    updatedAt: Date,
    startAt: Date,
    expireAt: Date,
    usedCount: Number,
    usedCountMax: Number,
});

const CouponAmount = new Schema({
    amount: Number,
});

CouponAmount.methods.amount = function (subscription) {
    return this.amount;
}

const CouponPercent = new Schema({
    percent: Number,
});

CouponPercent.methods.amount = function (subscription) {
    return subscription.plan.price * this.percent / 100;
}

Coupon.CouponAmount = CouponAmount;
Coupon.CouponPercent = CouponPercent;

module.exports = Coupon;
