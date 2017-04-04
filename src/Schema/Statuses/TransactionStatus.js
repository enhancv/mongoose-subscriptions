const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const AUTHORIZATION_EXPIRED = 'authorization_expired';
const AUTHORIZED = 'authorized';
const AUTHORIZING = 'authorizing';
const SETTLEMENT_PENDING = 'settlement_pending';
const SETTLEMENT_CONFIRMED = 'settlement_confirmed';
const SETTLEMENT_DECLINED = 'settlement_declined';
const FAILED = 'failed';
const GATEWAY_REJECTED = 'gateway_rejected';
const PROCESSOR_DECLINED = 'processor_declined';
const SETTLED = 'settled';
const SETTLING = 'settling';
const SUBMITTED_FOR_SETTLEMENT = 'submitted_for_settlement';
const VOIDED = 'voided';

const statuses = [
    AUTHORIZATION_EXPIRED,
    AUTHORIZED,
    AUTHORIZING,
    SETTLEMENT_PENDING,
    SETTLEMENT_CONFIRMED,
    SETTLEMENT_DECLINED,
    FAILED,
    GATEWAY_REJECTED,
    PROCESSOR_DECLINED,
    SETTLED,
    SETTLING,
    SUBMITTED_FOR_SETTLEMENT,
    VOIDED,
];

const TransactionStatus = new Schema({
    status: {
        type: String,
        enum: statuses,
    },
    timestamp: Date,
}, { _id: false });

TransactionStatus.AUTHORIZATION_EXPIRED = AUTHORIZATION_EXPIRED;
TransactionStatus.AUTHORIZED = AUTHORIZED;
TransactionStatus.AUTHORIZING = AUTHORIZING;
TransactionStatus.SETTLEMENT_PENDING = SETTLEMENT_PENDING;
TransactionStatus.SETTLEMENT_CONFIRMED = SETTLEMENT_CONFIRMED;
TransactionStatus.SETTLEMENT_DECLINED = SETTLEMENT_DECLINED;
TransactionStatus.FAILED = FAILED;
TransactionStatus.GATEWAY_REJECTED = GATEWAY_REJECTED;
TransactionStatus.PROCESSOR_DECLINED = PROCESSOR_DECLINED;
TransactionStatus.SETTLED = SETTLED;
TransactionStatus.SETTLING = SETTLING;
TransactionStatus.SUBMITTED_FOR_SETTLEMENT = SUBMITTED_FOR_SETTLEMENT;
TransactionStatus.VOIDED = VOIDED;

TransactionStatus.Statuses = statuses;

module.exports = TransactionStatus;
