const ProcessorItem = require('../Schema/ProcessorItem');
const Event = require('./Event');
const addressProcessor = require('./addressProcessor');
const Plan = require('../Plan');
const name = require('./name');

function filedsDiscount (discount) {
    braintreeTransaction
}

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
        descriptor: braintreeTransaction.descriptor ? {
            name: braintreeTransaction.descriptor.name,
            phone: braintreeTransaction.descriptor.phone,
            url: braintreeTransaction.descriptor.url,
        } : null,
        createdAt: braintreeTransaction.createdAt,
        updatedAt: braintreeTransaction.updatedAt,
        discounts: braintreeTransaction.discounts ? braintreeTransaction.discounts.map(discount => {
            return {
                __t: discount.id,
                amount: discount.amount,
                name: discount.name,
            }
        }) : null,
    };

    if (braintreeTransaction.paymentInstrumentType === 'credit_card') {
        result.__t = 'TransactionCreditCard';
        result.maskedNumber = braintreeTransaction.creditCard.maskedNumber;
        result.countryOfIssuance = braintreeTransaction.creditCard.countryOfIssuance;
        result.issuingBank = braintreeTransaction.creditCard.issuingBank;
        result.cardType = braintreeTransaction.creditCard.cardType;
        result.cardholderName = braintreeTransaction.creditCard.cardholderName;
        result.expirationMonth = braintreeTransaction.creditCard.expirationMonth;
        result.expirationYear = braintreeTransaction.creditCard.expirationYear;
    } else if (braintreeTransaction.paymentInstrumentType === 'paypal_account') {
        result.__t = 'TransactionPayPalAccount';
        result.name = name.full(braintreeTransaction.paypalAccount.payerFirstName, braintreeTransaction.paypalAccount.payerLastName);
        result.payerId = braintreeTransaction.paypalAccount.payerId;
        result.email = braintreeTransaction.paypalAccount.payerEmail;
    } else if (braintreeTransaction.paymentInstrumentType === 'apple_pay_card') {
        result.__t = 'TransactionApplePayCard';
        result.cardType = braintreeTransaction.applePayCard.cardType;
        result.paymentInstrumentName = braintreeTransaction.applePayCard.paymentInstrumentName;
        result.expirationMonth = braintreeTransaction.applePayCard.expirationMonth;
        result.expirationYear = braintreeTransaction.applePayCard.expirationYear;
    } else if (braintreeTransaction.paymentInstrumentType === 'android_pay_card') {
        result.__t = 'AndroidPayCard',
        result.sourceCardLast4 = braintreeTransaction.androidPayCard.sourceCardLast4;
        result.virtualCardLast4 = braintreeTransaction.androidPayCard.virtualCardLast4;
        result.sourceCardType = braintreeTransaction.androidPayCard.sourceCardType;
        result.virtualCardType = braintreeTransaction.androidPayCard.virtualCardType;
        result.expirationMonth = braintreeTransaction.androidPayCard.expirationMonth;
        result.expirationYear = braintreeTransaction.androidPayCard.expirationYear;
    }

    return result;
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
                resolve(fields(customer, result.transaction));
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

function all (processor, customer) {
    ProcessorItem.validateIsSaved(customer);

    return new Promise((resolve, reject) => {
        processor.emit('event', new Event(Event.TRANSACTION, Event.LOADING));
        processor.gateway.transaction.search(
            function (search) {
                return search.customerId().is(customer.processor.id);
            },
            function (err, braintreeTransactions) {
                if (err) {
                    reject(err);
                } else {
                    processor.emit('event', new Event(Event.TRANSACTION, Event.LOADED, braintreeTransactions));
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
    refund: refund,
};
