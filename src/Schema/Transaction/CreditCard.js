const mongoose = require("mongoose");

const CreditCard = new mongoose.Schema(
    {
        maskedNumber: String,
        cardType: String,
        cardholderName: String,
        expirationMonth: String,
        expirationYear: String,
        countryOfIssuance: String,
        issuingBank: String,
    },
    { _id: false }
);

module.exports = CreditCard;
