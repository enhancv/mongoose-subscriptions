const ProcessorItem = require('../Schema/ProcessorItem');
const braintree = require('braintree');
const Event = require('./Event');
const name = require('./name');

function processorFields (customer, paymentMethod) {

    const response = {};

    if (paymentMethod.billingAddressId) {
        const billingAddress = customer.addresses.id(paymentMethod.billingAddressId);
        response.billingAddressId = billingAddress.processor.id;
    }

    if (paymentMethod.nonce) {
        response.paymentMethodNonce = paymentMethod.nonce;
    }

    if (customer.defaultPaymentMethodId === paymentMethod.id) {
        response.options = { makeDefault: true };
    }

    return response;
}

function fields (paymentMethod) {
    let response = { };

    if (paymentMethod instanceof braintree.CreditCard) {
        response = {
            __t: 'CreditCard',
            maskedNumber: paymentMethod.maskedNumber,
            countryOfIssuance: paymentMethod.countryOfIssuance,
            issuingBank: paymentMethod.issuingBank,
            cardType: paymentMethod.cardType,
            cardholderName: paymentMethod.cardholderName,
            expirationMonth: paymentMethod.expirationMonth,
            expirationYear: paymentMethod.expirationYear,
        };
    } else if (paymentMethod instanceof braintree.PayPalAccount) {
        response = {
            __t: 'PayPalAccount',
            name: name.full(paymentMethod.payerInfo.firstName, paymentMethod.payerInfo.lastName),
            payerId: paymentMethod.payerInfo.payerId,
            email: paymentMethod.email,
        };
    } else if (paymentMethod instanceof braintree.ApplePayCard) {
        response = {
            __t: 'ApplePayCard',
            cardType: paymentMethod.cardType,
            paymentInstrumentName: paymentMethod.paymentInstrumentName,
            expirationMonth: paymentMethod.expirationMonth,
            expirationYear: paymentMethod.expirationYear,
        };
    } else if (paymentMethod instanceof braintree.AndroidPayCard) {
        response = {
            __t: 'AndroidPayCard',
            sourceCardLast4: paymentMethod.sourceCardLast4,
            virtualCardLast4: paymentMethod.virtualCardLast4,
            sourceCardType: paymentMethod.sourceCardType,
            virtualCardType: paymentMethod.virtualCardType,
            expirationMonth: paymentMethod.expirationMonth,
            expirationYear: paymentMethod.expirationYear,
        };
    }

    Object.assign(response, {
        processor: {
            id: paymentMethod.token,
            state: ProcessorItem.SAVED,
        },
        createdAt: paymentMethod.createdAt,
        updatedAt: paymentMethod.updatedAt,
    });

    return response;
}

function save (processor, customer, paymentMethod) {
    const data = processorFields(customer, paymentMethod);

    return new Promise((resolve, reject) => {
        function callback (err, result) {
            if (err) {
                reject(err);
            } else if (result.success) {
                processor.emit('event', new Event(Event.PAYMENT_METHOD, Event.SAVED, result));
                resolve(Object.assign(paymentMethod, fields(result.paymentMethod), { nonce: null }));
            } else {
                reject(new Error(result.message));
            }
        }

        if (paymentMethod.processor.state === ProcessorItem.CHANGED) {
            processor.emit('event', new Event(Event.PAYMENT_METHOD, Event.UPDATING, data));
            processor.gateway.paymentMethod.update(paymentMethod.processor.id, data, callback);
        } else if (paymentMethod.processor.state === ProcessorItem.INITIAL) {
            data.customerId = customer.processor.id;
            processor.emit('event', new Event(Event.PAYMENT_METHOD, Event.CREATING, data));
            processor.gateway.paymentMethod.create(data, callback);
        } else {
            resolve(paymentMethod);
        }
    });
}

module.exports = {
    fields: fields,
    processorFields: processorFields,
    save: save,
}
