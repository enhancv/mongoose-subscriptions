const mongoose = require('mongoose');
const ProcessorItem = require('./ProcessorItem');

const Schema = mongoose.Schema;

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

Plan.statics.updateOrCreate = function findOrCreate(plan) {
    return this
        .findOne({ 'processor.id': plan.processor.id })
        .then((existing) => {
            const syncedPlan = existing ? Object.assign(existing, plan) : new (this)(plan);
            return syncedPlan.save();
        });
};

Plan.statics.loadProcessor = function load(processor) {
    return processor.plans()
        .then((plans) => {
            const updates = plans.map(plan => this.updateOrCreate(plan));
            return Promise.all(updates);
        });
};


module.exports = Plan;
