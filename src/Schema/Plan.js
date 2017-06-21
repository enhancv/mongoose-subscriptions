const mongoose = require("mongoose");

const Plan = new mongoose.Schema(
    {
        processorId: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        billingFrequency: {
            type: Number,
            default: 1,
        },
        level: {
            type: Number,
            default: 1,
        },
        name: String,
    },
    { _id: false }
);

module.exports = Plan;
