const Customer = require('../Customer');
const ProcessorItem = require('../Schema/ProcessorItem');
const braintree = require('braintree');

function processorFields (customer, paymentMethod) {
    const billingAddressId = ProcessorItem.findProcessorId(customer.addresses, paymentMethod.billingAddressId);

    const response = {
        billingAddressId: billingAddressId,
    };

    if (paymentMethod.nonce) {
        response.paymentMethodNonce = paymentMethod.nonce;
    }
    if (customer.defaultPaymentMethodId === paymentMethod.id) {
        response.options = { makeDefault: true };
    }

    return response;
}

function fields (result) {
    const paymentMethod = result.paymentMethod;
    let response = { };

    if (paymentMethod instanceof braintree.CreditCard) {
        response = {
            kind: 'CreditCard',
            maskedNumber: paymentMethod.maskedNumber,
            cardType: paymentMethod.cardType,
            cardholderName: paymentMethod.cardholderName,
            expirationMonth: paymentMethod.expirationMonth,
            expirationYear: paymentMethod.expirationYear,
        };
    } else if (paymentMethod instanceof braintree.PayPalAccount) {
        response = {
            kind: 'PayPalAccount',
            email: paymentMethod.email,
        };
    } else if (paymentMethod instanceof braintree.ApplePayCard) {
        response = {
            kind: 'ApplePayCard',
            cardType: paymentMethod.cardType,
            paymentInstrumentName: paymentMethod.paymentInstrumentName,
            expirationMonth: paymentMethod.expirationMonth,
            expirationYear: paymentMethod.expirationYear,
        };
    } else if (paymentMethod instanceof braintree.AndroidPayCard) {
        response = {
            kind: 'AndroidPayCard',
            cardType: paymentMethod.cardType,
            sourceDescription: paymentMethod.sourceDescription,
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

function save (gateway, customer, paymentMethod, index) {
    const fields = processorFields(customer, paymentMethod);

    if (paymentMethod.processor.state === ProcessorItem.CHANGED) {
        return gateway.paymentMethod.update(paymentMethod.processor.id, fields);
    } else if (paymentMethod.processor.state === ProcessorItem.INITIAL) {
        fields.customerId = customer.processor.id;
        return gateway.paymentMethod.create(fields);
    } else {
        return Promise.resolve(null);
    }
}

function paymentMethod (gateway, customer, paymentMethod) {
    ProcessorItem.validateIsSaved(customer);

    return save(gateway, customer, paymentMethod).then(result => result ? Object.assign(paymentMethod, fields(result)) : paymentMethod);
}

paymentMethod.fields = fields;
paymentMethod.processorFields = processorFields;
paymentMethod.save = save;

module.exports = paymentMethod;

