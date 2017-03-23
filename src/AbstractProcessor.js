const EventEmitter = require('events');

class AbstractProcessor extends EventEmitter {
    isNotImplemented (featureName) {
        throw new Error(featureName + ' is not implemented by ' + this.constructor.name);
    }

    load (customer) {
        isNotImplemented('Load customer');
    }

    save (customer) {
        isNotImplemented('Save customer');
    }

    cancelSubscription (customer, subscriptionId) {
        isNotImplemented('Cancel subscription');
    }

    refundTransaction (customer, transactionId, amount) {
        isNotImplemented('Refund transaction');
    }

    plans () {
        isNotImplemented('Load plans');
    }
}

module.exports = AbstractProcessor;
