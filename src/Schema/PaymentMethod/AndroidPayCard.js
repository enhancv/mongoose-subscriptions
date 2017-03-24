const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const AndroidPayCard = new Schema({
    sourceCardLast4: String,
    virtualCardLast4: String,
    sourceCardType: String,
    virtualCardType: String,
    expirationMonth: String,
    expirationYear: String,
}, { _id: false });

module.exports = AndroidPayCard;
