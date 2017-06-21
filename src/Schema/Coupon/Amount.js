const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const CouponAmount = new Schema({
    amount: {
        type: Number,
        required: true,
    },
});

CouponAmount.methods.currentAmount = function currentAmount(subscription) {
    return Math.min(subscription.plan.price, this.amount);
};

module.exports = CouponAmount;
