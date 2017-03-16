'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ProcessorItem = require('./ProcessorItem');
const TransactionAddress = require('./TransactionAddress');
const TransactionCustomer = require('./TransactionCustomer');
const TransactionStatus = require('./TransactionStatus');
const Descriptor = require('./Descriptor');

const Transaction = new Schema({
    _id: String,
    processor: {
        type: ProcessorItem,
        default: ProcessorItem,
    },
    kind: String,
    amount: Number,
    currency: String,
    subscriptionId: String,
    planProcessorId: String,
    refundedTransactionId: String,
    billing: TransactionAddress,
    descriptor: Descriptor,
    customer: TransactionCustomer,
    status: String,
    createdAt: Date,
    updatedAt: Date,
    statusHistory: [TransactionStatus],
}, { descriminatorKey: 'kind' });

module.exports = Transaction;
