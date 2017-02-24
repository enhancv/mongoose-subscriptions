const mongoose = require('mongoose');
const CustomerSchema = require('./CustomerSchema');
const Customer = mongoose.model('Customer', CustomerSchema);

module.exports = Customer;
