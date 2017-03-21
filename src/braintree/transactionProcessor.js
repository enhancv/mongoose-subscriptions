const ProcessorItem = require('../').Schema.ProcessorItem;
const Event = require('./Event');
const addressProcessor = require('./addressProcessor');
const name = require('./name');
const { curry, pick, map, pickBy, identity } = require('lodash/fp');

function fields (customer, braintreeTransaction) {
    const response = {
        _id: braintreeTransaction.id,
        processor: {
            id: braintreeTransaction.id,
            state: ProcessorItem.SAVED,
        },
        amount: braintreeTransaction.amount,
        refundedTransactionId: braintreeTransaction.refundedTransactionId,
        subscriptionId: ProcessorItem.getId(braintreeTransaction.subscriptionId, customer.subscriptions),
        planProcessorId: braintreeTransaction.planId,
        billing: braintreeTransaction.billing ? addressProcessor.fields(braintreeTransaction.billing) : null,
        customer: braintreeTransaction.customer ? {
            name: name.full(braintreeTransaction.customer.firstName, braintreeTransaction.customer.lastName),
            phone: braintreeTransaction.customer.phone,
            company: braintreeTransaction.customer.company,
            email: braintreeTransaction.customer.email,
        } : null,
        currency: braintreeTransaction.currencyIsoCode,
        status: braintreeTransaction.status,
        statusHistory: braintreeTransaction.statusHistory,
        descriptor: pick(['name', 'phone', 'url'], braintreeTransaction.descriptor),
        createdAt: braintreeTransaction.createdAt,
        updatedAt: braintreeTransaction.updatedAt,
        discounts: map(discount => {
            return {
                __t: discount.id,
                amount: discount.amount,
                name: discount.name,
            }
        }, braintreeTransaction.discounts),
    };

    if (braintreeTransaction.paymentInstrumentType === 'credit_card') {
        Object.assign(response, {
            __t: 'TransactionCreditCard',
            maskedNumber: braintreeTransaction.creditCard.maskedNumber,
            countryOfIssuance: braintreeTransaction.creditCard.countryOfIssuance,
            issuingBank: braintreeTransaction.creditCard.issuingBank,
            cardType: braintreeTransaction.creditCard.cardType,
            cardholderName: braintreeTransaction.creditCard.cardholderName,
            expirationMonth: braintreeTransaction.creditCard.expirationMonth,
            expirationYear: braintreeTransaction.creditCard.expirationYear,
        });
    } else if (braintreeTransaction.paymentInstrumentType === 'paypal_account') {
        Object.assign(response, {
            __t: 'TransactionPayPalAccount',
            name: name.full(braintreeTransaction.paypalAccount.payerFirstName, braintreeTransaction.paypalAccount.payerLastName),
            payerId: braintreeTransaction.paypalAccount.payerId,
            email: braintreeTransaction.paypalAccount.payerEmail,
        });
    } else if (braintreeTransaction.paymentInstrumentType === 'apple_pay_card') {
        Object.assign(response, {
            __t: 'TransactionApplePayCard',
            cardType: braintreeTransaction.applePayCard.cardType,
            paymentInstrumentName: braintreeTransaction.applePayCard.paymentInstrumentName,
            expirationMonth: braintreeTransaction.applePayCard.expirationMonth,
            expirationYear: braintreeTransaction.applePayCard.expirationYear,
        });
    } else if (braintreeTransaction.paymentInstrumentType === 'android_pay_card') {
        Object.assign(response, {
            __t: 'AndroidPayCard',
            sourceCardLast4: braintreeTransaction.androidPayCard.sourceCardLast4,
            virtualCardLast4: braintreeTransaction.androidPayCard.virtualCardLast4,
            sourceCardType: braintreeTransaction.androidPayCard.sourceCardType,
            virtualCardType: braintreeTransaction.androidPayCard.virtualCardType,
            expirationMonth: braintreeTransaction.androidPayCard.expirationMonth,
            expirationYear: braintreeTransaction.androidPayCard.expirationYear,
        });
    }

    return pickBy(identity, response);
}

function refund (processor, customer, transaction, amount) {
    ProcessorItem.validateIsSaved(customer);
    ProcessorItem.validateIsSaved(transaction);

    return new Promise((resolve, reject) => {
        function callback (err, result) {
            if (err) {
                reject(err);
            } else if (result.success) {
                processor.emit('event', new Event(Event.TRANSACTION, Event.REFUNDED, result));

                customer.transactions.unshift(fields(customer, result.transaction));
                resolve(customer);
            } else {
                reject(new Error(result.message));
            }
        }

        processor.emit('event', new Event(Event.TRANSACTION, Event.REFUND, amount));

        if (amount) {
            processor.gateway.transaction.refund(transaction.processor.id, amount, callback);
        } else {
            processor.gateway.transaction.refund(transaction.processor.id, callback);
        }
    });
}

module.exports = {
    fields: curry(fields),
    refund: refund,
};
