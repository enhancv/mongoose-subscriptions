const mongoose = require('mongoose');
const SubscriptionSchema = require('./Schema/Subscription');
const Subscription = mongoose.model('Subscription', SubscriptionSchema);

module.exports = Subscription;
