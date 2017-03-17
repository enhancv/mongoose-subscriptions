'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Inviter discount
 */
const DiscountInviter = new Schema({
    users: [{
        id: Schema.Types.ObjectId,
        isVerified: Boolean,
    }],
    percent: {
        type: Number,
        max: 100,
        min: 0
    },
}, { _id: false });

DiscountInviter.build = function (subscription, name, users) {
    const PER_INVITE = 20;
    const invitesCount = users.filter(user => user.isVerified).length;
    const percent = Math.min(100, PER_INVITE * invitesCount);
    const amount = Math.min(subscription.price, subscription.price * (percent / 100));

    if (amount) {
        return {
            users: users.map(user => {
                return { userId: user._id, isVerified: user.isVerified }
            }),
            percent: percent,
            amount: amount.toFixed(2),
            __t: 'DiscountInviter',
            name: name,
        };
    }
}

module.exports = DiscountInviter;
