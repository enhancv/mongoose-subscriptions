const ProcessorItem = require('../Schema/ProcessorItem');
const address = require('./address');
const Plan = require('../Plan');

function fields (customer, braintreeTransaction) {
    const refundTransactionId = ProcessorItem.findProcessorId(
        customer.transactions,
        braintreeTransaction.refundTransactionId
    );

    return {
        processor: {
            id: braintreeTransaction.id,
            state: ProcessorItem.SAVED,
        },
        amount: braintreeTransaction.amount,
        refundTransactionId: refundTransactionId,
        planProcessorId: braintreeTransaction.planId,
        billing: address.fields({ address: braintreeTransaction.billing }),
        customer: braintreeTransaction.customer,
        paymentInstrumentType: braintreeTransaction.paymentInstrumentType,
        currency: braintreeTransaction.currencyIsoCode,
        status: braintreeTransaction.status,
        statusHistory: braintreeTransaction.statusHistory,
        descriptor: braintreeTransaction.descriptor,
        createdAt: braintreeTransaction.createdAt,
        updatedAt: braintreeTransaction.updatedAt,
    };
}

function sync (gateway, customer) {
    ProcessorItem.validateIsSaved(customer);

    return gateway.transaction
        .search(search => search.customerId().is(customer.processor.id))
        .then(braintreeTransactions => {
            const length = braintreeTransactions.length();
            let current = 0;

            return new Promise((resolve, reject) => {
                const transactions = [];

                braintreeTransactions.each((err, braintreeTransaction) => {
                    if (err) {
                        reject(err);
                    } else {
                        transactions.push(fields(customer, braintreeTransaction));
                        current += 1;
                        if (current >= length) {
                            resolve(transactions);
                        }
                    }
                });
            });
        });
}

module.exports = {
    sync: sync,
    fields: fields,
}
