'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ProcessorItem = require('./ProcessorItem');

const AMOUNT = 'amount';
const PERCENT = 'percent';

const Discount = new Schema({
    amount: Number,
    processor: {
        type: ProcessorItem,
        default: ProcessorItem,
    },
    numberOfBillingCycles: {
        type: Number,
        default: 1,
        min: 1,
    },
    group: {
        type: String,
        default: 'General',
    },
    kind: String,
    name: String,
}, { _id: false, descriminatorKey: 'kind' });

/**
 * Amount discount
 */
const AmountDiscount = new Schema({ }, { _id: false });

AmountDiscount.build = function (subscription, name, amount) {
    const cappedAmount = Math.min(amount, subscription.price);

    if (cappedAmount) {
        return {
            amount: cappedAmount,
            kind: 'AmountDiscount',
            name: name,
        };
    }
}

/**
 * Percent discount
 */
const PercentDiscount = new Schema({
    percent: { type: Number, max: 100, min: 0 },
}, { _id: false });

PercentDiscount.build = function (subscription, name, percent) {
    const fullAmount = subscription.plan.amount;
    const amount = Math.min(subscription.price, fullAmount * (percent / 100));

    if (amount) {
        return {
            percent: percent,
            amount: amount,
            kind: 'PercentDiscount',
            name: name,
        };
    }
}
/**
 * Coupon Discount
 */
const CouponDiscount = new Schema({
    coupon: {
        type: Schema.Types.ObjectId,
        ref: 'Coupon',
        required: true,
    },
}, { _id: false });

CouponDiscount.build = function (subscription, name, coupon) {
    const amount = coupon.amount(subscription);

    if (amount) {
        return {
            coupon: coupon._id,
            amount: coupon.amount(subscription),
            kind: 'CouponDiscount',
            name: name,
        };
    }
}

/**
 * Inviter discount
 */
const InviterDiscount = new Schema({
    users: [{
        id: Schema.Types.ObjectId,
        isVerified: Boolean,
    }],
    percent: { type: Number, max: 100, min: 0 },
}, { _id: false });

InviterDiscount.build = function (subscription, name, users) {
    const PER_INVITE = 20;
    const invitesCount = users.filter(user => user.isVerified).length;
    const percent = Math.min(100, PER_INVITE * invitesCount);
    const fullAmount = subscription.plan.amount;
    const amount = Math.min(subscription.price, fullAmount * (percent / 100));

    if (amount) {
        return {
            users: users.map(user => {
                return { userId: user._id, isVerified: user.isVerified }
            }),
            percent: percent,
            amount: amount,
            kind: 'PercentDiscount',
            name: name,
        };
    }
}

Discount.AmountDiscount = AmountDiscount;
Discount.PercentDiscount = PercentDiscount;
Discount.InviterDiscount = InviterDiscount;
Discount.CouponDiscount = CouponDiscount;

module.exports = Discount;
