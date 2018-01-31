const mongoose = require("mongoose");

const Schema = mongoose.Schema;

/**
 * PreviousSubscription Discount
 */
const DiscountPreviousSubscription = new Schema(
    {
        subscriptionId: String,
        preserve: {
            type: Boolean,
            default: true,
        },
    },
    { _id: false }
);

DiscountPreviousSubscription.build = function build(subscription, previous, currentDate) {
    if (!previous || !previous.price) {
        return null;
    }

    const date = currentDate || new Date();

    const prevEnd = (previous.billingPeriodEndDate || date).getTime();
    const prevStart = (previous.billingPeriodStartDate || date).getTime();
    const subStart = (subscription.firstBillingDate || date).getTime();

    if (prevStart > subStart || prevEnd < subStart) {
        return null;
    }

    const amount = previous.price;

    return {
        subscriptionId: previous._id,
        amount: amount.toFixed(2),
        __t: "DiscountPreviousSubscription",
        name: "Refunded Previous Transaction",
    };
};

module.exports = DiscountPreviousSubscription;
