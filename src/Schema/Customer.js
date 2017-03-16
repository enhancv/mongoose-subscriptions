'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Address = require('./Address');
const PaymentMethod = require('./PaymentMethod');
const Subscription = require('./Subscription');
const Transaction = require('./Transaction');
const ProcessorItem = require('./ProcessorItem');
const originalValue = require('../utils').originalValue;

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

Customer.path('paymentMethods').discriminator('CreditCard', PaymentMethod.CreditCard);
Customer.path('paymentMethods').discriminator('PayPalAccount', PaymentMethod.PayPalAccount);
Customer.path('paymentMethods').discriminator('ApplePayCard', PaymentMethod.ApplePayCard);
Customer.path('paymentMethods').discriminator('AndroidPayCard', PaymentMethod.AndroidPayCard);

Customer.path('transactions').discriminator('TransactionCreditCard', PaymentMethod.CreditCard);
Customer.path('transactions').discriminator('TransactionPayPalAccount', PaymentMethod.PayPalAccount);
Customer.path('transactions').discriminator('TransactionApplePayCard', PaymentMethod.ApplePayCard);
Customer.path('transactions').discriminator('TransactionAndroidPayCard', PaymentMethod.AndroidPayCard);

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

Customer.methods.cancel = function cancel (processor, id) {
    const subscription = ProcessorItem.find(this.subscriptions, id);
    return processor.cancelSubscription(this, subscription);
}

Customer.methods.saveProcessor = function saveProcessor (processor) {
    this.markChanged();

    return processor.save(this).then(customer => {
        // Diff old discounts with new discounts to find out Coupons to update
        return customer.save();
    });
}

Customer.methods.activeSubscriptions = function activeSubscriptions (activeDate) {
    const date = activeDate || new Date();

    return this.populate().subscriptions
        .filter((subscription) =>  {
            return subscription.paidThroughDate <= date;
        })
        .sort((a, b) => a.plan.level - b.plan.level);
}

Customer.methods.subscription = function subscription (activeDate) {
    return this.activeSubscriptions(activeDate)[0];
}

Customer.plugin(originalValue, { fields: ['transactions', 'subscriptions', 'paymentMethods', 'addresses'] });

module.exports = Customer;
