const ProcessorItem = require('../Schema/ProcessorItem');
const Event = require('./Event');

function processorFieldsDiscounts (originalDiscounts, discounts) {
    const result = {};

    const update = discounts
        .filter(discount => discount.processor.id)
        .map(discount => {
            return {
                existingId: discount.__t,
                amount: discount.amount,
                numberOfBillingCycles: discount.numberOfBillingCycles,
            };
        });

    if (update.length) {
        result.update = update;
    }

    const add = discounts
        .filter(discount => !discount.processor.id)
        .map(discount => {
            return {
                inheritedFromId: discount.__t,
                amount: discount.amount,
                numberOfBillingCycles: discount.numberOfBillingCycles,
            };
        });

    if (add.length) {
        result.add = add;
    }

    const remove = originalDiscounts
        .filter(original => original.processor.id && !discounts.find(discount => original.__t === discount.__t))
        .map(discount => discount.processor.id);

    if (remove.length) {
        result.remove = remove;
    }

    return result;
}

function processorFields (customer, subscription) {
    if (!subscription.plan.processor.id) {
        throw new Error('Subscription must have a plan with id');
    }

    const result = { planId: subscription.plan.processor.id };
    const paymentMethod = customer.paymentMethods.id(subscription.paymentMethodId);

    if (paymentMethod) {
        if (!paymentMethod.processor.id) {
            throw new Error('Must be valid payment method with token');
        }
        result.paymentMethodToken = paymentMethod.processor.id;
    }

    if (subscription.descriptor) {
        result.descriptor = {
            name: subscription.descriptor.name,
            phone: subscription.descriptor.phone,
            url: subscription.descriptor.url,
        };
    }

    const discounts = processorFieldsDiscounts(subscription.original.discounts, subscription.discounts);

    if (Object.keys(discounts).length) {
        result.discounts = discounts;
    }

    return result;
}

function fieldsDiscounts (originalDiscounts, resultDiscounts) {
    return resultDiscounts.map(discount => {
        const original = originalDiscounts.find(original => original.processor.id === discount.id || original.__t === discount.id);
        const newDiscount = {
            __t: 'DiscountAmount',
            amount: discount.amount,
            numberOfBillingCycles: discount.numberOfBillingCycles,
        }
        const mapped = original || newDiscount;

        mapped.processor = { id: discount.id, state: ProcessorItem.SAVED };

        return mapped;
    });
}

function fields (originalDiscounts, subscription) {
    const discounts = fieldsDiscounts(originalDiscounts, subscription.discounts);
    const response = {
        processor: {
            id: subscription.id,
            state: ProcessorItem.SAVED,
        },
        planProcessorId: subscription.planId,
        discounts: discounts,
        createdAt: subscription.createdAt,
        updatedAt: subscription.updatedAt,
        paidThroughDate: subscription.paidThroughDate,
        descriptor: subscription.descriptor,
        status: subscription.status,
        price: subscription.price,
        statusHistory: subscription.statusHistory.map(status => {
            return {
                timestamp: status.timestamp,
                status: status.status,
            }
        }),
        firstBillingDate: subscription.firstBillingDate,
        nextBillingDate: subscription.nextBillingDate,
    };

    return response;
}

function cancel (processor, customer, subscription) {
    return new Promise((resolve, reject) => {
        processor.emit('event', new Event(Event.SUBSCRIPTION, Event.CANCELING, subscription));
        processor.gateway.subscription.cancel(subscription.processor.id, (err, result) => {
            if (err) {
                reject(err);
            } else {
                processor.emit('event', new Event(Event.SUBSCRIPTION, Event.CANCELED, result));
                resolve(Object.assign(subscription, fields(subscription.discounts, result.subscription)));
            }
        })
    });
}

function save (processor, customer, subscription) {
    const data = processorFields(customer, subscription);

    return new Promise((resolve, reject) => {
        function callback (err, result) {
            if (err) {
                reject(err);
            } else if (result.success) {
                processor.emit('event', new Event(Event.SUBSCRIPTION, Event.SAVED, result));
                resolve(Object.assign(subscription, fields(subscription.discounts, result.subscription)));
            } else {
                reject(new Error(result.message));
            }
        }

        if (subscription.processor.state === ProcessorItem.LOCAL) {
            resolve(subscription);
        } else if (subscription.processor.state === ProcessorItem.CHANGED) {
            processor.emit('event', new Event(Event.SUBSCRIPTION, Event.UPDATING, data));
            processor.gateway.subscription.update(subscription.processor.id, data, callback);
        } else if (subscription.processor.state === ProcessorItem.INITIAL) {
            processor.emit('event', new Event(Event.SUBSCRIPTION, Event.CREATING, data));
            processor.gateway.subscription.create(data, callback);
        } else {
            resolve(subscription);
        }
    });
}

module.exports = {
    processorFieldsDiscounts: processorFieldsDiscounts,
    processorFields: processorFields,
    fieldsDiscounts: fieldsDiscounts,
    fields: fields,
    cancel: cancel,
    save: save,
};
