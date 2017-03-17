'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ApplePayCard = new Schema({
    paymentInstrumentName: String,
    cardType: String,
    expirationMonth: String,
    expirationYear: String,
}, { _id: false });

module.exports = ApplePayCard;
