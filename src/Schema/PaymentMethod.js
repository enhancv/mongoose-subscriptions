'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ProcessorItem = require('./ProcessorItem');

const PaymentMethod = new Schema({
    id: String,
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
        required: true,
    },
}, { discriminatorKey: 'kind', _id: false });

const CreditCard = new Schema({
    maskedNumber: String,
    cardType: String,
    cardholderName: String,
    expirationMonth: String,
    expirationYear: String,
}, { _id: false });

const PayPalAccount = new Schema({
    email: String,
}, { _id: false });

const ApplePayCard = new Schema({
    paymentInstrumentName: String,
    cardType: String,
    expirationMonth: String,
    expirationYear: String,
}, { _id: false });

const AndroidPayCard = new Schema({
    sourceDescription: String,
    cardType: String,
    expirationMonth: String,
    expirationYear: String,
}, { _id: false });

PaymentMethod.CreditCard = CreditCard;
PaymentMethod.PayPalAccount = PayPalAccount;
PaymentMethod.ApplePayCard = ApplePayCard;
PaymentMethod.AndroidPayCard = AndroidPayCard;

module.exports = PaymentMethod;
