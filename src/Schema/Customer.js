'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Address = require('./Address');
const PaymentMethod = require('./PaymentMethod');
const Subscription = require('./Subscription');
const Transaction = require('./Transaction');
const ProcessorItem = require('./ProcessorItem');

const Customer = new Schema({
    processor: {
        type: ProcessorItem,
        default: ProcessorItem,
    },
    ipAddress: String,
    name: String,
    email: String,
    phone: String,
    addresses: [Address],
    paymentMethods: [PaymentMethod],
    defaultPaymentMethodId: String,
    subscriptions: [Subscription],
    transactions: [Transaction],
});

Customer.path('paymentMethods')

Customer.path('paymentMethods').discriminator('CreditCard', PaymentMethod.CreditCard);
Customer.path('paymentMethods').discriminator('PayPalAccount', PaymentMethod.PayPalAccount);
Customer.path('paymentMethods').discriminator('ApplePayCard', PaymentMethod.ApplePayCard);
Customer.path('paymentMethods').discriminator('AndroidPayCard', PaymentMethod.AndroidPayCard);

Customer.methods.markChanged = function () {
    if (this.processor.id && this.isModified('name email phone ipAddress defaultPaymentMethodId')) {
        this.processor.state = ProcessorItem.CHANGED;
    }
    ['addresses', 'subscriptions', 'paymentMethods'].forEach(collectionName => {
        this[collectionName].forEach((item, index) => {
            if (this.processor.id && this.isModified(`${collectionName}[${index}]`)) {
                item.state = ProcessorItem.CHANGED;
            }
        });
    });

    return this;
}

module.exports = Customer;
