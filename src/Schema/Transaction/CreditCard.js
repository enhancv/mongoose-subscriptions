const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CreditCard = new Schema({
    maskedNumber: String,
    cardType: String,
    cardholderName: String,
    expirationMonth: String,
    expirationYear: String,
    countryOfIssuance: String,
    issuingBank: String,
}, { _id: false });

module.exports = CreditCard;
