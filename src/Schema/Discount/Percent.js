'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Percent discount
 */
const DiscountPercent = new Schema({
    percent: {
        type: Number,
        max: 100,
        min: 0
    },
}, { _id: false });

DiscountPercent.build = function (subscription, name, percent) {
    const amount = Math.min(subscription.price, subscription.price * (percent / 100));

    if (amount) {
        return {
            percent: percent,
            amount: amount.toFixed(2),
            __t: 'DiscountPercent',
            name: name,
        };
    }
}

module.exports = DiscountPercent;
