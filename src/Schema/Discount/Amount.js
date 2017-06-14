const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const DiscountAmount = new Schema({}, { _id: false });

DiscountAmount.build = function build(subscription, name, amount) {
    const cappedAmount = Math.min(amount, subscription.price);

    if (!cappedAmount) {
        return null;
    }

    return {
        amount: cappedAmount.toFixed(2),
        __t: "DiscountAmount",
        name,
    };
};

module.exports = DiscountAmount;
