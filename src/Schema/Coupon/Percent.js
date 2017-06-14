const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const CouponPercent = new Schema({
    percent: {
        type: Number,
        required: true,
        min: 0,
    },
});

CouponPercent.methods.currentAmount = function currentAmount(subscription) {
    return Math.min(subscription.plan.price, subscription.plan.price * (this.percent / 100));
};

module.exports = CouponPercent;
