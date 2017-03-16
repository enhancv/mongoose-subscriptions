const Customer = require('../Customer');
const ProcessorItem = require('../Schema/ProcessorItem');
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

function save (processor, customer) {
    const data = processorFields(customer);

    return new Promise ((resolve, reject) => {
        function callback (err, result) {
            if (err) {
                reject(err);
            } else if (result.success) {
                processor.emit('event', 'Customer Saved', result);
                resolve(Object.assign(customer, fields(result)));
            } else {
                reject(new Error(result.message));
            }
        }

        if (customer.processor.state === ProcessorItem.CHANGED) {
            processor.emit('event', 'Updating customer');
            processor.gateway.customer.update(customer.processor.id, data, callback);
        } else if (customer.processor.state === ProcessorItem.INITIAL) {
            processor.emit('event', 'Creating customer');
            processor.gateway.customer.create(data, callback);
        } else {
            resolve(customer);
        }
    });
}

module.exports = {
    fields: fields,
    processorFields: processorFields,
    save: save,
};

