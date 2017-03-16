const ProcessorItem = require('../Schema/ProcessorItem');
const address = require('./address');
const Plan = require('../Plan');
const { fullName } = require('../utils');

function fields (customer, braintreeTransaction) {
    const subscription = customer.subscriptions.find(sub => sub.processor.id === braintreeTransaction.subscriptionId);

    const result = {
        _id: braintreeTransaction.id,
        processor: {
            id: braintreeTransaction.id,
            state: ProcessorItem.SAVED,
        },
        amount: braintreeTransaction.amount,
        refundedTransactionId: braintreeTransaction.refundedTransactionId,
        subscriptionId: subscription ? subscription.id : null,
        planProcessorId: braintreeTransaction.planId,
        billing: address.fields({ address: braintreeTransaction.billing }),
        customer: {
            name: fullName(braintreeTransaction.customer.firstName, braintreeTransaction.customer.lastName),
            phone: braintreeTransaction.customer.phone,
            company: braintreeTransaction.customer.company,
            email: braintreeTransaction.customer.email,
        },
        currency: braintreeTransaction.currencyIsoCode,
        status: braintreeTransaction.status,
        statusHistory: braintreeTransaction.statusHistory,
        descriptor: braintreeTransaction.descriptor ? {
            name: braintreeTransaction.descriptor.name,
            phone: braintreeTransaction.descriptor.phone,
            url: braintreeTransaction.descriptor.url,
        } : null,
        createdAt: braintreeTransaction.createdAt,
        updatedAt: braintreeTransaction.updatedAt,
    };

    if (braintreeTransaction.paymentInstrumentType === 'credit_card') {
        result.kind = 'TransactionCreditCard';
        result.maskedNumber = braintreeTransaction.creditCard.maskedNumber;
        result.countryOfIssuance = braintreeTransaction.creditCard.countryOfIssuance;
        result.issuingBank = braintreeTransaction.creditCard.issuingBank;
        result.cardType = braintreeTransaction.creditCard.cardType;
        result.cardholderName = braintreeTransaction.creditCard.cardholderName;
        result.expirationMonth = braintreeTransaction.creditCard.expirationMonth;
        result.expirationYear = braintreeTransaction.creditCard.expirationYear;
    } else if (braintreeTransaction.paymentInstrumentType === 'paypal_account') {
        result.kind = 'TransactionPayPalAccount';
        result.name = fullName(braintreeTransaction.paypalAccount.payerFirstName, braintreeTransaction.paypalAccount.payerLastName);
        result.payerId = braintreeTransaction.paypalAccount.payerId;
        result.email = braintreeTransaction.paypalAccount.payerEmail;
    } else if (braintreeTransaction.paymentInstrumentType === 'apple_pay_card') {
        result.kind = 'TransactionApplePayCard';
        result.cardType = braintreeTransaction.applePayCard.cardType;
        result.paymentInstrumentName = braintreeTransaction.applePayCard.paymentInstrumentName;
        result.expirationMonth = braintreeTransaction.applePayCard.expirationMonth;
        result.expirationYear = braintreeTransaction.applePayCard.expirationYear;
    } else if (braintreeTransaction.paymentInstrumentType === 'android_pay_card') {
        result.kind = 'AndroidPayCard',
        result.sourceCardLast4 = braintreeTransaction.androidPayCard.sourceCardLast4;
        result.virtualCardLast4 = braintreeTransaction.androidPayCard.virtualCardLast4;
        result.sourceCardType = braintreeTransaction.androidPayCard.sourceCardType;
        result.virtualCardType = braintreeTransaction.androidPayCard.virtualCardType;
        result.expirationMonth = braintreeTransaction.androidPayCard.expirationMonth;
        result.expirationYear = braintreeTransaction.androidPayCard.expirationYear;
    }

    return result;
}

function all (processor, customer) {
    ProcessorItem.validateIsSaved(customer);

    return new Promise((resolve, reject) => {
        processor.gateway.transaction.search(
            function (search) {
                return search.customerId().is(customer.processor.id);
            },
            function (err, braintreeTransactions) {
                if (err) {
                    reject(err);
                } else {
                    const length = braintreeTransactions.length();
                    let current = 0;

                    const transactions = [];

                    braintreeTransactions.each((err, braintreeTransaction) => {
                        if (err) {
                            reject(err);
                        } else {
                            transactions.push(fields(customer, braintreeTransaction));
                            current += 1;
                            if (current >= length) {
                                customer.transactions = transactions;
                                resolve(customer);
                            }
                        }
                    });
                }
            }
        );
    });
}

module.exports = {
    all: all,
    fields: fields,
};
