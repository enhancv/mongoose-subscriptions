const ProcessorItem = require('../Schema/ProcessorItem');
const Plan = require('../Plan');

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

function sync (gateway) {
    return gateway.plan.all()
        .then((result) => {
            return Promise.all(result.plans.map((braintreePlan) => {
                return Plan
                    .findOne({ 'processor.id': braintreePlan.id })
                    .then(existing => {
                        const plan = existing || new Plan({ processor: { id: braintreePlan.id }});
                        Object.assign(plan, fields(braintreePlan));

                        return plan.save();
                    });
            }));
        });
}

module.exports = {
    sync: sync,
    fields: fields,
}
