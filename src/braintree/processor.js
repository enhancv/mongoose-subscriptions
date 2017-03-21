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

    saveMultiple (saveOne, customer, itemsName) {
        return Promise
            .all(customer[itemsName].map(item => saveOne(this, customer, item)))
            .then(items => Object.assign(customer, { [itemsName]: items }))
    }

    updateOne (saveOne, customer, itemsName, itemsId) {
        const item = customer[itemsName].id(itemsId);
        const index = customer[itemsName].indexOf(item);

        return saveOne(this, customer, item)
            .then(item => {
                customer[itemsName][index] = item;
                return customer;
            });
    }

    load (customer) {
        return customerProcessor.load(this, customer);
            // .then(customerObject => transaction.all(this, customerObject));
    }

    save (customer) {
        return customerProcessor.save(this, customer)
            .then(customer => this.saveMultiple(addressProcessor.save, customer, 'addresses'))
            .then(customer => this.saveMultiple(paymentMethodProcessor.save, customer, 'paymentMethods'))
            .then(customer => this.saveMultiple(subscriptionProcessor.save, customer, 'subscriptions'))
            .then(customer => transactionProcessor.all(this, customer));
    }

    cancelSubscription (customer, subscriptionId) {
        return this.updateOne(subscriptionProcessor.cancel, customer, 'subscriptions', subscriptionId);
    }

    refundTransaction (customer, transactionId, amount) {
        return transactionProcessor.refund(this, customer, customer.transactions.id(transactionId), amount)
            .then(transaction => {
                customer.transactions.push(transaction);

                return customer;
            });
    }

    plans () {
        return planProcessor.all(this);
    }
}

module.exports = BraintreeProcessor;
