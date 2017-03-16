const Customer = require('../Customer');
const ProcessorItem = require('../Schema/ProcessorItem');

function processorFieldsDiscounts (originalDiscounts, discounts) {
    const result = {};

    const update = discounts
        .filter(discount => discount.processor.id)
        .map(discount => {
            return {
                existingId: discount.kind,
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
                inheritedFromId: discount.kind,
                amount: discount.amount,
                numberOfBillingCycles: discount.numberOfBillingCycles,
            };
        });

    if (add.length) {
        result.add = add;
    }

    const remove = originalDiscounts
        .filter(original => original.processor.id && !discounts.find(discount => original.kind === discount.kind))
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
        const original = originalDiscounts.find(original => original.processor.id === discount.id || original.kind === discount.id);
        const newDiscount = {
            kind: 'DiscountAmount',
            amount: discount.amount,
            numberOfBillingCycles: discount.numberOfBillingCycles,
        }
        const mapped = original || newDiscount;

        mapped.processor = { id: discount.id, state: ProcessorItem.SAVED };

        return mapped;
    });
}

function fields (originalDiscounts, result) {
    const subscription = result.subscription;
    const response = {
        processor: {
            id: subscription.id,
            state: ProcessorItem.SAVED,
        },
        planProcessorId: subscription.planId,
        discounts: fieldsDiscounts(originalDiscounts, subscription.discounts),
        createdAt: subscription.createdAt,
        updatedAt: subscription.updatedAt,
        paidThroughDate: subscription.paidThroughDate,
        descriptor: subscription.descriptor,
        status: subscription.status,
        firstBillingDate: subscription.firstBillingDate,
        nextBillingDate: subscription.nextBillingDate,
    };

    return response;
}

function cancel (gateway, customer, subscription) {
    return new Promise((resolve, reject) => {
        gateway.subscription.cancel(subscription.processor.id, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(Object.assign(subscription, fields(subscription.discounts, result)));
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
                processor.emit('event', 'Subscription Saved');
                resolve(Object.assign(subscription, fields(subscription.discounts, result)));
            } else {
                reject(new Error(result.message));
            }
        }

        if (subscription.processor.state === ProcessorItem.LOCAL) {
            resolve(subscription);
        } else if (subscription.processor.state === ProcessorItem.CHANGED) {
            processor.emit('event', 'Updating subscription');
            processor.gateway.subscription.update(subscription.processor.id, data, callback);
        } else if (subscription.processor.state === ProcessorItem.INITIAL) {
            processor.emit('event', 'Creating subscription');
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
