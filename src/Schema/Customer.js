const mongoose = require('mongoose');
const Address = require('./Address');
const PaymentMethod = require('./PaymentMethod');
const Subscription = require('./Subscription');
const Transaction = require('./Transaction');
const ProcessorItem = require('./ProcessorItem');
const SubscriptionStatus = require('./Statuses/SubscriptionStatus');

const Schema = mongoose.Schema;

const Customer = new Schema({
    processor: {
        type: ProcessorItem,
        default: ProcessorItem,
    },
    ipAddress: String,
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        match: /^([\w-.+]+@([\w-]+\.)+[\w-]{2,6})?$/,
    },
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

function markChanged() {
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
}

function cancelProcessor(processor, id) {
    return processor.cancelSubscription(this, id).then(customer => customer.save());
}

function refundProcessor(processor, id, amount) {
    return processor.refundTransaction(this, id, amount).then(customer => customer.save());
}

function loadProcessor(processor) {
    return processor.load(this).then(customer => customer.save());
}

function saveProcessor(processor) {
    this.markChanged();
    return processor.save(this).then(customer => customer.save());
}

function cancelPendingSubscriptions(activeDate) {
    const date = activeDate || new Date();

    this.subscriptions.forEach((sub) => {
        if (
            sub.status === SubscriptionStatus.PENDING
            && sub.firstBillingDate
            && sub.firstBillingDate > date
        ) {
            sub.status = SubscriptionStatus.CANCELED;
        }
    });

    return this;
}

function subscribeToPlan(plan, nonce, addressData, activeDate) {
    const address = this.addresses.create(addressData);
    const paymentMethod = this.paymentMethods.create({
        billingAddressId: address._id,
        nonce,
    });
    const sub = this.subscriptions.create({
        plan,
        paymentMethodId: paymentMethod._id,
        firstBillingDate: this.newSubscriptionStartDate(plan, activeDate),
        price: plan.price,
    });

    this.addresses.push(address);
    this.paymentMethods.push(paymentMethod);
    this.subscriptions.push(sub);
    this.defaultPaymentMethodId = paymentMethod._id;

    return sub;
}

function activeSubscriptions(activeDate) {
    return this.validSubscriptions(activeDate)
        .filter(item => item.status === SubscriptionStatus.ACTIVE);
}

function validSubscriptions(activeDate) {
    const date = activeDate || new Date();

    return this.subscriptions
        .filter(item => item.paidThroughDate >= date)
        .sort((a, b) => b.plan.level - a.plan.level);
}

function validNonTrialSubscriptions(activeDate) {
    const date = activeDate || new Date();

    return this.subscriptions
        .filter(item => item.paidThroughDate >= date)
        .filter(item => !item.isTrial)
        .filter(item => item.status !== SubscriptionStatus.PENDING)
        .sort((a, b) => a.paidThroughDate < b.paidThroughDate);
}

function newSubscriptionOverwritten(plan, activeDate) {
    const subs = this
        .validNonTrialSubscriptions(activeDate)
        .filter(item => plan.level > item.plan.level);

    return subs[0];
}

function newSubscriptionStartDate(plan, activeDate) {
    const startDates = this
        .validNonTrialSubscriptions(activeDate)
        .filter(item => plan.level <= item.plan.level)
        .map(item => item.paidThroughDate);

    return startDates[0];
}

function subscription(activeDate) {
    return this.validSubscriptions(activeDate)[0];
}

Customer.methods.markChanged = markChanged;
Customer.methods.cancelProcessor = cancelProcessor;
Customer.methods.refundProcessor = refundProcessor;
Customer.methods.loadProcessor = loadProcessor;
Customer.methods.saveProcessor = saveProcessor;
Customer.methods.subscribeToPlan = subscribeToPlan;
Customer.methods.validSubscriptions = validSubscriptions;
Customer.methods.activeSubscriptions = activeSubscriptions;
Customer.methods.cancelPendingSubscriptions = cancelPendingSubscriptions;
Customer.methods.validNonTrialSubscriptions = validNonTrialSubscriptions;
Customer.methods.subscription = subscription;
Customer.methods.newSubscriptionStartDate = newSubscriptionStartDate;
Customer.methods.newSubscriptionOverwritten = newSubscriptionOverwritten;

module.exports = Customer;
