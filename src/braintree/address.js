const Customer = require('../Customer');
const ProcessorItem = require('../Schema/ProcessorItem');
const fp = require('lodash/fp');
const { firstName, lastName, fullName } = require('../utils');

function processorFields (address) {
    return {
        firstName: firstName(address.name),
        lastName: lastName(address.name),
        countryCodeAlpha2: address.country,
        locality: address.locality,
        streetAddress: address.streetAddress,
        extendedAddress: address.extendedAddress,
        postalCode: address.postalCode,
    };
}

function fields (result) {
    const address = result.address;
    const response = {
        processor: {
            id: address.id,
            state: ProcessorItem.SAVED,
        },
        name: fullName(address.firstName, address.lastName),
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

function save (gateway, customer, address) {
    const fields = processorFields(customer);

    if (address.processor.state === ProcessorItem.CHANGED) {
        return gateway.address.update(customer.processor.id, address.processor.id, fields);
    } else if (address.processor.state === ProcessorItem.INITIAL) {
        fields.customerId = customer.processor.id;
        return gateway.address.create(fields);
    } else {
        return Promise.resolve(null);
    }
}

function address (gateway, customer, address) {
    ProcessorItem.validateIsSaved(customer);

    return save(gateway, customer, address).then(result => result ? Object.assign(address, fields(result)) : address);
}

address.fields = fields;
address.processorFields = processorFields;
address.save = save;

module.exports = address;

