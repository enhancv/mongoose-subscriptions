'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ProcessorItem = require('../ProcessorItem');

/**
 * Coupon Discount
 */
const DiscountCoupon = new Schema({
    coupon: {
        type: Schema.Types.ObjectId,
        ref: 'Coupon',
        required: true,
    },
}, { _id: false });

DiscountCoupon.build = function (subscription, coupon, currentDate) {
    const amount = coupon.currentAmount(subscription);
    const today = currentDate || new Date();

    if (coupon.usedCount >= coupon.usedCountMax) {
        return null;
    }

    if (coupon.startAt && coupon.startAt < today) {
        return null;
    }

    if (coupon.expireAt && coupon.expireAt < today) {
        return null;
    }

    if (amount) {
        return {
            coupon: coupon,
            amount: amount.toFixed(2),
            __t: 'DiscountCoupon',
            name: coupon.name,
        };
    }
}

DiscountCoupon.pre('save', function (next) {
    if (
        this.original
        && this.coupon
        && this.original.processor.state === ProcessorItem.INITIAL
        && this.processor.state === ProcessorItem.SAVED
    ) {
        const coupon = this.coupon;
        coupon.usedCount += 1;
        coupon.save(next);
    } else {
        next();
    }
});

module.exports = DiscountCoupon;
