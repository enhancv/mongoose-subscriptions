const ProcessorItem = require('../Schema/ProcessorItem');
const Event = require('./Event');
const name = require('./name');

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

function load (processor, customer) {
    return new Promise ((resolve, reject) => {
        processor.emit('event', new Event(Event.CUSTOMER, Event.LOADING, customer));

        processor.gateway.customer.find(customer.processor.id, function callback (err, result) {
            if (err) {
                reject(err);
            } else if (result.success) {
                processor.emit('event', new Event(Event.CUSTOMER, Event.LOADED, result));
                resolve(Object.assign(customer, fields(result.customer)));
            } else {
                reject(new Error(result.message));
            }
        });
    });
}

module.exports = {
    fields: fields,
    processorFields: processorFields,
    save: save,
    load: load,
};

