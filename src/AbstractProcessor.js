/* eslint class-methods-use-this: "off" */
/* eslint no-unused-vars: "off" */

const EventEmitter = require("events");

class AbstractProcessor extends EventEmitter {
    isNotImplemented(featureName) {
        throw new Error(`${featureName} is not implemented by ${this.constructor.name}`);
    }

    load(customer) {
        this.isNotImplemented("Load customer");
    }

    save(customer) {
        this.isNotImplemented("Save customer");
    }

    cancelSubscription(customer, subscriptionId) {
        this.isNotImplemented("Cancel subscription");
    }

    refundTransaction(customer, transactionId, amount) {
        this.isNotImplemented("Refund transaction");
    }
}

module.exports = AbstractProcessor;
