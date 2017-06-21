const mongoose = require("mongoose");
const ProcessorItem = require("./ProcessorItem");
const TransactionAddress = require("./Transaction/Address");
const TransactionCustomer = require("./Transaction/Customer");
const TransactionStatus = require("./Statuses/TransactionStatus");
const TransactionDiscount = require("./Transaction/Discount");
const Descriptor = require("./Descriptor");
const CreditCard = require("./Transaction/CreditCard");
const PayPalAccount = require("./Transaction/PayPalAccount");
const ApplePayCard = require("./Transaction/ApplePayCard");
const AndroidPayCard = require("./Transaction/AndroidPayCard");

const Transaction = new mongoose.Schema({
    _id: String,
    processor: {
        type: ProcessorItem,
        default: ProcessorItem,
    },
    amount: Number,
    currency: String,
    subscriptionId: {
        type: String,
        default: null,
    },
    planProcessorId: {
        type: String,
        default: null,
    },
    refundedTransactionId: {
        type: String,
        default: null,
    },
    billing: TransactionAddress,
    discounts: [TransactionDiscount],
    descriptor: Descriptor,
    customer: TransactionCustomer,
    status: {
        type: String,
        enum: TransactionStatus.Statuses,
    },
    createdAt: Date,
    updatedAt: Date,
    statusHistory: [TransactionStatus],
});

Transaction.TransactionCreditCard = CreditCard;
Transaction.TransactionPayPalAccount = PayPalAccount;
Transaction.TransactionApplePayCard = ApplePayCard;
Transaction.TransactionAndroidPayCard = AndroidPayCard;

Transaction.TransactionAddress = TransactionAddress;
Transaction.TransactionCustomer = TransactionCustomer;
Transaction.TransactionDiscount = TransactionDiscount;

module.exports = Transaction;
