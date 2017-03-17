const EventEmitter = require('events');
const plan = require('./plan');
const customer = require('./customer');
const address = require('./address');
const paymentMethod = require('./paymentMethod');
const subscription = require('./subscription');
const transaction = require('./transaction');

class BraintreeProcessor extends EventEmitter {
    constructor (gateway) {
        super();
        this.gateway = gateway;
    }

    saveMultiple (saveOne, customer, itemsName) {
        return Promise
            .all(customer[itemsName].map(item => saveOne(this, customer, item)))
            .then(items => Object.assign(customer, { [itemsName]: items }))
    }

    save (customerObject) {
        return customer.save(this, customerObject)
            .then(customerObject => this.saveMultiple(address.save, customerObject, 'addresses'))
            .then(customerObject => this.saveMultiple(paymentMethod.save, customerObject, 'paymentMethods'))
            .then(customerObject => this.saveMultiple(subscription.save, customerObject, 'subscriptions'))
            .then(customerObject => transaction.all(this, customerObject));
    }

    cancelSubscription (customerObject, subscriptionObject) {
        return subscription.cancel(this, customerObject, subscriptionObject);
    }

    refundTransaction (customerObject, transactionObject, amount) {
        return transaction.refund(this, customerObject, transactionObject, amount);
    }

    plans () {
        return plan.all(this);
    }
}

module.exports = BraintreeProcessor;
