'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ProcessorItem = require('./ProcessorItem');
const Address = require('./Address');
const TransactionCustomer = require('./TransactionCustomer');
const TransactionStatus = require('./TransactionStatus');
const Descriptor = require('./Descriptor');

const Transaction = new Schema({
    id: String,
    processor: {
        type: ProcessorItem,
        default: ProcessorItem,
    },
    amount: Number,
    currency: String,
    planProcessorId: String,
    refundTransactionId: String,
    billing: Address,
    descriptor: Descriptor,
    customer: TransactionCustomer,
    paymentInstrumentType: String,
    status: String,
    createdAt: Date,
    updatedAt: Date,
    statusHistory: [TransactionStatus],
}, { _id: false });

module.exports = Transaction;
