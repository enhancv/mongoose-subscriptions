/* eslint class-methods-use-this: "off" */
/* eslint no-unused-vars: "off" */

const AbstractProcessor = require('./AbstractProcessor');

class NullProcessor extends AbstractProcessor {

    load(customer) {
        return Promise.resolve(customer);
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
}

module.exports = NullProcessor;
