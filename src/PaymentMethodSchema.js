'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PaymentMethodSchema = new Schema({
    display: String,
    type: String,
});

module.exports = PaymentMethodSchema;
