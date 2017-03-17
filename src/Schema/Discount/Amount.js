'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DiscountAmount = new Schema({}, { _id: false });

DiscountAmount.build = function (subscription, name, amount) {
    const cappedAmount = Math.min(amount, subscription.price);

    if (cappedAmount) {
        return {
            amount: cappedAmount.toFixed(2),
            __t: 'DiscountAmount',
            name: name,
        };
    }
};

module.exports = DiscountAmount;
