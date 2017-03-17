'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ProcessorItem = require('./ProcessorItem');
const TransactionAddress = require('./TransactionAddress');
const TransactionCustomer = require('./TransactionCustomer');
const TransactionStatus = require('./TransactionStatus');
const TransactionDiscount = require('./TransactionDiscount');
const Descriptor = require('./Descriptor');
const CreditCard = require('./Transaction/CreditCard');
const PayPalAccount = require('./Transaction/PayPalAccount');
const ApplePayCard = require('./Transaction/ApplePayCard');
const AndroidPayCard = require('./Transaction/AndroidPayCard');

const Transaction = new Schema({
    _id: String,
    processor: {
        type: ProcessorItem,
        default: ProcessorItem,
    },
    amount: Number,
    currency: String,
    subscriptionId: String,
    planProcessorId: String,
    refundedTransactionId: String,
    billing: TransactionAddress,
    discounts: [TransactionDiscount],
    descriptor: Descriptor,
    customer: TransactionCustomer,
    status: String,
    createdAt: Date,
    updatedAt: Date,
    statusHistory: [TransactionStatus],
});

Transaction.CreditCard = CreditCard;
Transaction.PayPalAccount = PayPalAccount;
Transaction.ApplePayCard = ApplePayCard;
Transaction.AndroidPayCard = AndroidPayCard;

module.exports = Transaction;
