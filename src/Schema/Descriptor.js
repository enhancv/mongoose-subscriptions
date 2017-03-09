'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Descriptor = new Schema({
    name: {
        type: String,
        minlength: 22,
        // [3 letter company] * [up to 18 letter product]
        // [7 letter company] * [up to 14 letter product]
        // [12 letter company] * [up to 9 letter product]
        match: /$([^\*]{7}\*.{,18})|([^\*]{7}\*.{,14})|([^\*]{12}\*.{,9})^/,
    },
    phone: {
        type: String,
        maxlength: 14,
        minlength: 10,
        match: /[0-9\.\-]{10,14}/,
    },
    url: {
        type: String,
        maxlength: 13,
    },
}, { _id: false });

module.exports = Descriptor;
