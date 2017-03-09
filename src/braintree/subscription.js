const Customer = require('../Customer');
const ProcessorItem = require('../Schema/ProcessorItem');
const get = require('lodash/fp/get');

function processorFields (customer, subscription) {
    const paymentMethodToken = ProcessorItem.findProcessorId(customer.paymentMethods, subscription.paymentMethodId);

    return {
        planId: subscription.plan.processor.id,
        price: subscription.plan.amount,
        descriptor: subscription.descriptor ? {
            name: subscription.name,
            phone: subscription.phone,
            url: subscription.url,
        } : null,
        paymentMethodToken: paymentMethodToken,
    };
}

function fields (result) {
    const subscription = result.subscription;
    const response = {
        processor: {
            id: subscription.id,
            state: ProcessorItem.SAVED,
        },
        createdAt: subscription.createdAt,
        updatedAt: subscription.updatedAt,
        descriptor: subscription.descriptor,
        state: subscription.state,
        firstBillingDate: subscription.firstBillingDate,
        nextBillingDate: subscription.nextBillingDate,
    };

    return response;
}

function save (gateway, customer, subscription) {
    const fields = processorFields(customer, subscription);

    if (subscription.processor.state === ProcessorItem.CHANGED) {
        return gateway.subscription.update(subscription.processor.id, fields);
    } else if (subscription.processor.state === ProcessorItem.INITIAL) {
        fields.customerId = customer.processor.id;
        return gateway.subscription.create(fields);
    } else {
        return Promise.resolve(null);
    }
}

function subscription (gateway, customer, subscription) {
    ProcessorItem.validateIsSaved(customer);

    return save(gateway, customer, subscription).then(result => result ? Object.assign(subscription, fields(result)) : subscription);
}

subscription.fields = fields;
subscription.processorFields = processorFields;
subscription.save = save;

module.exports = subscription;

