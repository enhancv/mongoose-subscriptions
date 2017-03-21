'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Status = new Schema({
    status: String,
    timestamp: Date,
}, { _id: false });

module.exports = Status;
