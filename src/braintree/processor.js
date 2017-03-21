const EventEmitter = require('events');
const planProcessor = require('./planProcessor');
const customerProcessor = require('./customerProcessor');
const addressProcessor = require('./addressProcessor');
const paymentMethodProcessor = require('./paymentMethodProcessor');
const subscriptionProcessor = require('./subscriptionProcessor');
const transactionProcessor = require('./transactionProcessor');

class BraintreeProcessor extends EventEmitter {
    constructor (gateway) {
        super();
        this.gateway = gateway;
    }

    load (customer) {
        return customerProcessor.load(this, customer);
    }

    save (customer) {
        return customerProcessor.save(this, customer)
            .then(() => Promise.all(customer.addresses.map(item => addressProcessor.save(this, customer, item))))
            .then(() => Promise.all(customer.paymentMethods.map(item => paymentMethodProcessor.save(this, customer, item))))
            .then(() => Promise.all(customer.subscriptions.map(item => subscriptionProcessor.save(this, customer, item))))
            .then(() => customer);
    }

    cancelSubscription (customer, subscriptionId) {
        return subscriptionProcessor.cancel(this, customer, customer.subscriptions.id(subscriptionId));
    }

    refundTransaction (customer, transactionId, amount) {
        return transactionProcessor.refund(this, customer, customer.transactions.id(transactionId), amount);
    }

    plans () {
        return planProcessor.all(this);
    }
}

module.exports = BraintreeProcessor;
