'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ProcessorItem = require('./ProcessorItem');

const PaymentMethod = new Schema({
    _id: String,
    processor: {
        type: ProcessorItem,
        default: ProcessorItem,
    },
    nonce: String,
    billingAddressId: String,
    createdAt: Date,
    updatedAt: Date,
    kind: {
        type: String,
    },
}, { discriminatorKey: 'kind' });

const CreditCard = new Schema({
    maskedNumber: String,
    cardType: String,
    cardholderName: String,
    expirationMonth: String,
    expirationYear: String,
    countryOfIssuance: String,
    issuingBank: String,
}, { _id: false });

const PayPalAccount = new Schema({
    email: String,
    name: String,
    payerId: String,
}, { _id: false });

const ApplePayCard = new Schema({
    paymentInstrumentName: String,
    cardType: String,
    expirationMonth: String,
    expirationYear: String,
}, { _id: false });

const AndroidPayCard = new Schema({
    sourceCardLast4: String,
    virtualCardLast4: String,
    sourceCardType: String,
    virtualCardType: String,
    expirationMonth: String,
    expirationYear: String,
}, { _id: false });

PaymentMethod.CreditCard = CreditCard;
PaymentMethod.PayPalAccount = PayPalAccount;
PaymentMethod.ApplePayCard = ApplePayCard;
PaymentMethod.AndroidPayCard = AndroidPayCard;

module.exports = PaymentMethod;
