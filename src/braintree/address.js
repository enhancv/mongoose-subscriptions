const Customer = require('../Customer');
const ProcessorItem = require('../Schema/ProcessorItem');
const { firstName, lastName, fullName } = require('../utils');

function processorFields (address) {
    return {
        company: address.company,
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
                processor.emit('event', 'Address Saved', result);
                resolve(Object.assign(address, fields(result)));
            } else {
                reject(new Error(result.message));
            }
        }

        if (address.processor.state === ProcessorItem.CHANGED) {
            processor.emit('event', 'Updating address');
            processor.gateway.address.update(customer.processor.id, address.processor.id, data, callback);
        } else if (address.processor.state === ProcessorItem.INITIAL) {
            data.customerId = customer.processor.id;
            processor.emit('event', 'Creating address');
            processor.gateway.address.create(data, callback);
        } else {
            resolve(address);
        }
    });
}

module.exports = {
    fields: fields,
    processorFields: processorFields,
    save: save,
};

