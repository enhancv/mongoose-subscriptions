const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Plan = new Schema({
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
}, { _id: false });

module.exports = Plan;
