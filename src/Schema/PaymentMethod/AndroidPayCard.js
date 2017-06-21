const mongoose = require("mongoose");

const AndroidPayCard = new mongoose.Schema(
    {
        sourceCardLast4: String,
        virtualCardLast4: String,
        sourceCardType: String,
        virtualCardType: String,
        expirationMonth: String,
        expirationYear: String,
    },
    { _id: false }
);

module.exports = AndroidPayCard;
