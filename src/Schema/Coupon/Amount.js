'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CouponAmount = new Schema({
    amount: {
        type: Number,
        required: true,
    },
});

CouponAmount.methods.currentAmount = function (subscription) {
    return this.amount;
};

module.exports = CouponAmount;
