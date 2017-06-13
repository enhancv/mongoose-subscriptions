const mongoose = require("mongoose");
const CustomerSchema = require("./Schema/Customer");

const Customer = mongoose.model("Customer", CustomerSchema);

module.exports = Customer;
