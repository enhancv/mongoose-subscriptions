const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ACTIVE = "Active";
const CANCELED = "Canceled";
const EXPIRED = "Expired";
const PAST_DUE = "Past Due";
const PENDING = "Pending";

const statuses = [ACTIVE, CANCELED, EXPIRED, PAST_DUE, PENDING];

const SubscriptionStatus = new Schema(
    {
        status: {
            type: String,
            enum: statuses,
        },
        timestamp: Date,
    },
    { _id: false }
);

SubscriptionStatus.ACTIVE = ACTIVE;
SubscriptionStatus.CANCELED = CANCELED;
SubscriptionStatus.EXPIRED = EXPIRED;
SubscriptionStatus.PAST_DUE = PAST_DUE;
SubscriptionStatus.PENDING = PENDING;

SubscriptionStatus.Statuses = statuses;

module.exports = SubscriptionStatus;
