'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const AddressSchema = require('./AddressSchema');
const PaymentMethodSchema = require('./PaymentMethodSchema');
const SubscriptionSchema = require('./SubscriptionSchema');

const CustomerSchema = new Schema({
    name: String,
    addresses: [AddressSchema],
    paymentMethods: [PaymentMethodSchema],
    defaultPaymentMethodId: String,
    subscriptions: [SubscriptionSchema],
});

module.exports = CustomerSchema;
