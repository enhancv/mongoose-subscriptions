'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AddressSchema = new Schema({
    company: String,
    createdAt: Date,
    updatedAt: Date,
    firstName: String,
    lastName: String,
    countryCode: String,
    locality: String,
    streetAddress: String,
    extendedAddress: String,
    postalCode: String,
});

module.exports = AddressSchema;
