const Customer = require('../Customer');
const ProcessorItem = require('../Schema/ProcessorItem');
const fp = require('lodash/fp');
const { firstName, lastName, fullName } = require('../utils');

function processorFields (customer) {
    return {
        firstName: firstName(customer.name),
        lastName: lastName(customer.name),
        email: customer.email,
        phone: customer.phone,
        customFields: {
            ipAddress: customer.ipAddress,
        }
    };
}

function fields (result) {
    const customer = result.customer;
    const response = {
        name: fullName(customer.firstName, customer.lastName),
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

function save (gateway, customer) {
    const fields = processorFields(customer);

    if (customer.processor.state === ProcessorItem.CHANGED) {
        return gateway.customer.update(customer.processor.id, fields);
    } else if (customer.processor.state === ProcessorItem.INITIAL) {
        return gateway.customer.create(fields);
    } else {
        return Promise.resolve(null);
    }
}

function customer (gateway, customer) {
    return save(gateway, customer).then(result => result ? Object.assign(customer, fields(result)) : customer);
}

customer.fields = fields;
customer.processorFields = processorFields;
customer.save = save;

module.exports = customer;

