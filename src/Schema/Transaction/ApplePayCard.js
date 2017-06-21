const mongoose = require("mongoose");

const ApplePayCard = new mongoose.Schema(
    {
        paymentInstrumentName: String,
        cardType: String,
        expirationMonth: String,
        expirationYear: String,
    },
    { _id: false }
);

module.exports = ApplePayCard;
