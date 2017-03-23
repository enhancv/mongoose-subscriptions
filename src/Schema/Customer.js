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

Customer.path('paymentMethods').discriminator('CreditCard', PaymentMethod.CreditCard);
Customer.path('paymentMethods').discriminator('PayPalAccount', PaymentMethod.PayPalAccount);
Customer.path('paymentMethods').discriminator('ApplePayCard', PaymentMethod.ApplePayCard);
Customer.path('paymentMethods').discriminator('AndroidPayCard', PaymentMethod.AndroidPayCard);

Customer.path('transactions').discriminator('TransactionCreditCard', Transaction.TransactionCreditCard);
Customer.path('transactions').discriminator('TransactionPayPalAccount', Transaction.TransactionPayPalAccount);
Customer.path('transactions').discriminator('TransactionApplePayCard', Transaction.TransactionApplePayCard);
Customer.path('transactions').discriminator('TransactionAndroidPayCard', Transaction.TransactionAndroidPayCard);

Customer.methods.markChanged = function () {
    if (this.processor.id && this.isModified('name email phone ipAddress defaultPaymentMethodId')) {
        this.processor.state = ProcessorItem.CHANGED;
    }

    ['addresses', 'subscriptions', 'paymentMethods'].forEach(collectionName => {
        this[collectionName].forEach((item, index) => {
            if (item.processor.id && this.isModified(`${collectionName}.${index}`)) {
                item.processor.state = ProcessorItem.CHANGED;
            }
        });
    });

    return this;
}

Customer.methods.cancelProcessor = function cancel (processor, id) {
    return processor.cancelSubscription(this, id).then(customer => customer.save());
}

Customer.methods.refundProcessor = function refund (processor, id, amount) {
    return processor.refundTransaction(this, id, amount).then(customer => customer.save());
}

Customer.methods.loadProcessor = function load (processor) {
    return processor.load(this).then(customer => customer.save());
}

Customer.methods.saveProcessor = function saveProcessor (processor) {
    this.markChanged();
    return processor.save(this).then(customer => customer.save());
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

module.exports = Customer;
