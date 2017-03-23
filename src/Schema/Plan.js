'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ProcessorItem = require('./ProcessorItem');

const Plan = new Schema({
    processor: {
        type: ProcessorItem,
        default: ProcessorItem,
    },
    name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    currency: {
        type: String,
        required: true,
        match: /[A-Za-z]{3}/,
    },
    description: String,
    createdAt: Date,
    updatedAt: Date,
    level: {
        type: Number,
        default: 1,
    },
    billingFrequency: {
        type: Number,
        required: true,
    },
});

Plan.statics.loadProcessor = function load (processor) {
    return processor.plans()
        .then(plans => {
            return Promise.all(plans.map((plan) => {
                return this
                    .findOne({ 'processor.id': plan.processor.id })
                    .then((existing) => {
                        return (existing ? Object.assign(existing, plan) : new (this)(plan)).save();
                    });
            }))
        });
}


module.exports = Plan;
