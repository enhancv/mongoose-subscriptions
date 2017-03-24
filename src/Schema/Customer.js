const mongoose = require('mongoose');
const Address = require('./Address');
const PaymentMethod = require('./PaymentMethod');
const Subscription = require('./Subscription');
const Transaction = require('./Transaction');
const ProcessorItem = require('./ProcessorItem');

const Schema = mongoose.Schema;

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

const paymentMethods = Customer.path('paymentMethods');
const transactions = Customer.path('transactions');

paymentMethods.discriminator('CreditCard', PaymentMethod.CreditCard);
paymentMethods.discriminator('PayPalAccount', PaymentMethod.PayPalAccount);
paymentMethods.discriminator('ApplePayCard', PaymentMethod.ApplePayCard);
paymentMethods.discriminator('AndroidPayCard', PaymentMethod.AndroidPayCard);

transactions.discriminator('TransactionCreditCard', Transaction.TransactionCreditCard);
transactions.discriminator('TransactionPayPalAccount', Transaction.TransactionPayPalAccount);
transactions.discriminator('TransactionApplePayCard', Transaction.TransactionApplePayCard);
transactions.discriminator('TransactionAndroidPayCard', Transaction.TransactionAndroidPayCard);

Customer.methods.markChanged = function markChanged() {
    if (this.processor.id && this.isModified('name email phone ipAddress defaultPaymentMethodId')) {
        this.processor.state = ProcessorItem.CHANGED;
    }

    ['addresses', 'subscriptions', 'paymentMethods'].forEach((collectionName) => {
        this[collectionName].forEach((item, index) => {
            if (item.processor.id && this.isModified(`${collectionName}.${index}`)) {
                item.processor.state = ProcessorItem.CHANGED;
            }
        });
    });

    return this;
};

Customer.methods.cancelProcessor = function cancelProcessor(processor, id) {
    return processor.cancelSubscription(this, id).then(customer => customer.save());
};

Customer.methods.refundProcessor = function refundProcessor(processor, id, amount) {
    return processor.refundTransaction(this, id, amount).then(customer => customer.save());
};

Customer.methods.loadProcessor = function loadProcessor(processor) {
    return processor.load(this).then(customer => customer.save());
};

Customer.methods.saveProcessor = function saveProcessor(processor) {
    this.markChanged();
    return processor.save(this).then(customer => customer.save());
};

Customer.methods.activeSubscriptions = function activeSubscriptions(activeDate) {
    const date = activeDate || new Date();

    return this.populate().subscriptions
        .filter(item => item.paidThroughDate >= date && item.status === 'Active')
        .sort((a, b) => b.plan.level - a.plan.level);
};

Customer.methods.subscription = function subscription(activeDate) {
    return this.activeSubscriptions(activeDate)[0];
};

module.exports = Customer;
