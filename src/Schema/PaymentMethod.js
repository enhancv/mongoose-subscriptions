const mongoose = require("mongoose");
const shortid = require("shortid");
const ProcessorItem = require("./ProcessorItem");
const CreditCard = require("./PaymentMethod/CreditCard");
const PayPalAccount = require("./PaymentMethod/PayPalAccount");
const ApplePayCard = require("./PaymentMethod/ApplePayCard");
const AndroidPayCard = require("./PaymentMethod/AndroidPayCard");
const originals = require("mongoose-originals");

const PaymentMethod = new mongoose.Schema({
    _id: {
        type: String,
        default: shortid.generate,
    },
    processor: {
        type: ProcessorItem,
        default: ProcessorItem,
    },
    nonce: {
        type: String,
        default: null,
    },
    billingAddressId: String,
    createdAt: Date,
    updatedAt: Date,
});

PaymentMethod.CreditCard = CreditCard;
PaymentMethod.PayPalAccount = PayPalAccount;
PaymentMethod.ApplePayCard = ApplePayCard;
PaymentMethod.AndroidPayCard = AndroidPayCard;

function billingAddress() {
    return this.ownerDocument().addresses.id(this.billingAddressId);
}

PaymentMethod.method("billingAddress", billingAddress);

PaymentMethod.plugin(originals, { fields: ["billingAddressId", "nonce", "processor"] });

module.exports = PaymentMethod;
