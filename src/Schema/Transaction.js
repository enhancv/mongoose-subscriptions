'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ProcessorItem = require('./ProcessorItem');
const TransactionAddress = require('./Transaction/Address');
const TransactionCustomer = require('./Transaction/Customer');
const Status = require('./Status');
const TransactionDiscount = require('./Transaction/Discount');
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
    statusHistory: [Status],
});

Transaction.TransactionCreditCard = CreditCard;
Transaction.TransactionPayPalAccount = PayPalAccount;
Transaction.TransactionApplePayCard = ApplePayCard;
Transaction.TransactionAndroidPayCard = AndroidPayCard;

Transaction.TransactionAddress = TransactionAddress;
Transaction.TransactionCustomer = TransactionCustomer;
Transaction.TransactionDiscount = TransactionDiscount;

module.exports = Transaction;
