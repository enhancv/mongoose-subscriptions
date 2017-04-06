const mongoose = require('mongoose');
const CouponAmount = require('./Coupon/Amount');
const CouponPercent = require('./Coupon/Percent');

const Schema = mongoose.Schema;

const Coupon = new Schema({
    name: String,
    description: String,
    numberOfBillingCycles: {
        type: Number,
        min: 1,
    },
    createdAt: Date,
    updatedAt: Date,
    startAt: Date,
    expireAt: Date,
    usedCount: {
        type: Number,
        default: 0,
        min: 0,
    },
    usedCountMax: {
        type: Number,
        min: 0,
        default: Infinity,
    },
});

Coupon.methods.isExpired = function isExpired(currentDate) {
    const date = ((currentDate && new Date(currentDate)) || Date.now());

    return Boolean(this.expireAt && date > this.expireAt);
};

Coupon.methods.isUseLimitReached = function isUseLimitReached() {
    return Boolean(this.usedCountMax && this.usedCount > this.usedCountMax);
};

Coupon.CouponAmount = CouponAmount;
Coupon.CouponPercent = CouponPercent;

module.exports = Coupon;
