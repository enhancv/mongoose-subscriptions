const ProcessorItem = require('../').Schema.ProcessorItem;
const Event = require('./Event');
const name = require('./name');
const addressProcessor = require('./addressProcessor');
const paymentMethodProcessor = require('./paymentMethodProcessor');
const subscriptionProcessor = require('./subscriptionProcessor');
const transactionProcessor = require('./transactionProcessor');
const { getOr, uniqBy, get, flatten, map, sortBy, reverse, curry } = require('lodash/fp');

function processorFields (customer) {
    return {
        firstName: name.first(customer.name),
        lastName: name.last(customer.name),
        email: customer.email,
        phone: customer.phone,
        customFields: {
            ipAddress: customer.ipAddress,
        }
    };
}

function fields (customer) {
    const response = {
        name: name.full(customer.firstName, customer.lastName),
        email: customer.email,
        phone: customer.phone,
        ipAddress: customer.customFields.ipAddress,
        processor: {
            id: customer.id,
            state: ProcessorItem.SAVED,
        }
    };

    return response;
}

function save (processor, customer) {
    const data = processorFields(customer);

    return new Promise ((resolve, reject) => {
        function callback (err, result) {
            if (err) {
                reject(err);
            } else if (result.success) {
                processor.emit('event', new Event(Event.CUSTOMER, Event.SAVED, result));
                resolve(Object.assign(customer, fields(result.customer)));
            } else {
                reject(new Error(result.message));
            }
        }

        if (customer.processor.state === ProcessorItem.CHANGED) {
            processor.emit('event', new Event(Event.CUSTOMER, Event.UPDATING, data));
            processor.gateway.customer.update(customer.processor.id, data, callback);
        } else if (customer.processor.state === ProcessorItem.INITIAL) {
            processor.emit('event', new Event(Event.CUSTOMER, Event.CREATING, data));
            processor.gateway.customer.create(data, callback);
        } else {
            resolve(customer);
        }
    });
}

function extractFromCollection (name, collection) {
    const nested = map(get(name), collection);
    return uniqBy(get('id'), flatten(nested));
}

function mergeCollection (collection, braintreeCollection, customizer) {
    braintreeCollection.forEach(braintreeItem => {
        const index = collection.findIndex(item => item.processor.id === braintreeItem.id);

        if (index !== -1) {
            Object.assign(collection[index], customizer(braintreeItem, collection[index]));
        } else {
            collection.push(customizer(braintreeItem));
        }
    });
    return collection;
}

function load (processor, customer) {
    ProcessorItem.validateIsSaved(customer);

    return new Promise ((resolve, reject) => {
        processor.emit('event', new Event(Event.CUSTOMER, Event.LOADING, customer));

        processor.gateway.customer.find(customer.processor.id, function callback (err, customerResult) {
            if (err) {
                reject(err);
            } else {
                processor.emit('event', new Event(Event.CUSTOMER, Event.LOADED, customerResult));
                Object.assign(customer, fields(customerResult));

                const subscriptionsResult = extractFromCollection('subscriptions', customerResult.paymentMethods);
                const transactionsResult = reverse(sortBy(get('createdAt'), extractFromCollection('transactions', subscriptionsResult)));

                mergeCollection(
                    customer.addresses,
                    customerResult.addresses,
                    addressProcessor.fields
                );

                mergeCollection(
                    customer.paymentMethods,
                    customerResult.paymentMethods,
                    paymentMethodProcessor.fields(customer)
                );

                mergeCollection(
                    customer.subscriptions,
                    subscriptionsResult,
                    (subscription, original) => subscriptionProcessor.fields(customer, getOr([], 'discounts', original), subscription)
                );

                mergeCollection(
                    customer.transactions,
                    transactionsResult,
                    transactionProcessor.fields(customer)
                );

                resolve(customer);
            }
        });
    });
}

module.exports = {
    fields: curry(fields),
    processorFields: curry(processorFields),
    save: save,
    load: load,
};

