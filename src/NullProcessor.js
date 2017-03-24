/* eslint class-methods-use-this: "off" */
/* eslint no-unused-vars: "off" */

const AbstractProcessor = require('./AbstractProcessor');

class NullProcessor extends AbstractProcessor {

    load(customer) {
        return customer;
    }

    save(customer) {
        return Promise.resolve(customer);
    }

    cancelSubscription(customer, subscriptionId) {
        return Promise.resolve(customer);
    }

    refundTransaction(customer, transactionId, amount) {
        return Promise.resolve(customer);
    }

    plans() {
        return Promise.resolve([]);
    }
}

module.exports = NullProcessor;
