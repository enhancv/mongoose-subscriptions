'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CouponPercent = new Schema({
    percent: {
        type: Number,
        required: true,
    },
});

CouponPercent.methods.currentAmount = function (subscription) {
    return subscription.plan.price * this.percent / 100;
}

module.exports = CouponPercent;
