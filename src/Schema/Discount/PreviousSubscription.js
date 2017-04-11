const mongoose = require('mongoose');

const Schema = mongoose.Schema;

/**
 * PreviousSubscription Discount
 */
const DiscountPreviousSubscription = new Schema({
    subscriptionId: Number,
}, { _id: false });

DiscountPreviousSubscription.build = function build(subscription, previous) {
    if (!previous) {
        return null;
    }

    const prevEnd = previous.paidThroughDate.getTime();
    const prevStart = previous.firstBillingDate.getTime();
    const subStart = subscription.firstBillingDate.getTime();

    if (prevStart > subStart || prevEnd < subStart) {
        return null;
    }

    const remaining = (subStart - prevStart) / (prevEnd - prevStart);
    const amount = previous.price - (previous.price * remaining);

    return {
        subscriptionId: previous._id,
        amount: amount.toFixed(2),
        __t: 'DiscountPreviousSubscription',
        name: 'Refunded Previous Transaction',
    };
};

module.exports = DiscountPreviousSubscription;
