const ProcessorItem = require('../').Schema.ProcessorItem;
const Event = require('./Event');
const name = require('./name');
const { curry } = require('lodash/fp');

function processorFields (address) {
    return {
        company: address.company,
        firstName: name.first(address.name),
        lastName: name.last(address.name),
        countryCodeAlpha2: address.country,
        locality: address.locality,
        streetAddress: address.streetAddress,
        extendedAddress: address.extendedAddress,
        postalCode: address.postalCode,
    };
}

function fields (address) {
    const response = {
        processor: {
            id: address.id,
            state: ProcessorItem.SAVED,
        },
        name: name.full(address.firstName, address.lastName),
        company: address.company,
        createdAt: address.createdAt,
        updatedAt: address.updatedAt,
        country: address.countryCodeAlpha2,
        locality: address.locality,
        streetAddress: address.streetAddress,
        extendedAddress: address.extendedAddress,
        postalCode: address.postalCode,
    };

    return response;
}

function save (processor, customer, address) {
    const data = processorFields(address);

    return new Promise ((resolve, reject) => {
        function callback (err, result) {
            if (err) {
                reject(err);
            } else if (result.success) {
                processor.emit('event', new Event(Event.ADDRESS, Event.SAVED, result));
                Object.assign(address, fields(result.address));

                resolve(customer);
            } else {
                reject(new Error(result.message));
            }
        }

        if (address.processor.state === ProcessorItem.CHANGED) {
            processor.emit('event', new Event(Event.ADDRESS, Event.UPDATING, data));
            processor.gateway.address.update(customer.processor.id, address.processor.id, data, callback);
        } else if (address.processor.state === ProcessorItem.INITIAL) {
            data.customerId = customer.processor.id;
            processor.emit('event', new Event(Event.ADDRESS, Event.CREATING, data));
            processor.gateway.address.create(data, callback);
        } else {
            resolve(address);
        }
    });
}

module.exports = {
    fields: curry(fields),
    processorFields: curry(processorFields),
    save: save,
};

