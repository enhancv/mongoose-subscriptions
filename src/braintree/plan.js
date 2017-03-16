const ProcessorItem = require('../Schema/ProcessorItem');

function fields (braintreePlan) {
    return {
        processor: {
            id: braintreePlan.id,
            state: ProcessorItem.SAVED,
        },
        name: braintreePlan.name,
        price: braintreePlan.price,
        currency: braintreePlan.currencyIsoCode,
        description: braintreePlan.description,
        createdAt: braintreePlan.createdAt,
        updatedAt: braintreePlan.updatedAt,
        billingFrequency: braintreePlan.billingFrequency,
    };
}

function all (processor) {
    return new Promise((resolve, reject) => {
        processor.gateway.plan.all((err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result.plans.map(braintreePlan => fields(braintreePlan)));
            }
        });
    });
}

module.exports = {
    fields: fields,
    all: all,
};
