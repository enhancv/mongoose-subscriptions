const mongoose = require('mongoose');

const Schema = mongoose.Schema;

/**
 * Percent discount
 */
const DiscountPercent = new Schema({
    percent: {
        type: Number,
        max: 100,
        min: 0,
    },
}, { _id: false });

DiscountPercent.build = function build(subscription, name, percent) {
    const amount = Math.min(subscription.price, subscription.price * (percent / 100));

    if (!amount) {
        return null;
    }

    return {
        percent,
        amount: amount.toFixed(2),
        __t: 'DiscountPercent',
        name,
    };
};

module.exports = DiscountPercent;
