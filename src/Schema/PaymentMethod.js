'use strict';

const mongoose = require('mongoose');
const shortid = require('shortid');
const Schema = mongoose.Schema;
const ProcessorItem = require('./ProcessorItem');
const CreditCard = require('./PaymentMethod/CreditCard');
const PayPalAccount = require('./PaymentMethod/PayPalAccount');
const ApplePayCard = require('./PaymentMethod/ApplePayCard');
const AndroidPayCard = require('./PaymentMethod/AndroidPayCard');

const PaymentMethod = new Schema({
    _id: {
        type: String,
        default: shortid.generate,
    },
    processor: {
        type: ProcessorItem,
        default: ProcessorItem,
    },
    nonce: {
        type: String,
        default: null,
    },
    billingAddressId: String,
    createdAt: Date,
    updatedAt: Date,
});

PaymentMethod.CreditCard = CreditCard;
PaymentMethod.PayPalAccount = PayPalAccount;
PaymentMethod.ApplePayCard = ApplePayCard;
PaymentMethod.AndroidPayCard = AndroidPayCard;

module.exports = PaymentMethod;
