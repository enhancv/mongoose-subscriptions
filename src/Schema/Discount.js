const mongoose = require("mongoose");
const ProcessorItem = require("./ProcessorItem");
const DiscountAmount = require("./Discount/Amount");
const DiscountPercent = require("./Discount/Percent");
const DiscountCoupon = require("./Discount/Coupon");
const DiscountPreviousSubscription = require("./Discount/PreviousSubscription");
const originals = require("mongoose-originals");

const Discount = new mongoose.Schema(
    {
        amount: Number,
        processor: {
            type: ProcessorItem,
            default: ProcessorItem,
        },
        numberOfBillingCycles: {
            type: Number,
            default: 1,
            min: 1,
        },
        neverExpires: Boolean,
        currentBillingCycle: {
            type: Number,
            default: 0,
            min: 0,
        },
        preserve: {
            type: Boolean,
            default: false,
        },
        name: String,
    },
    { _id: false }
);

Discount.DiscountAmount = DiscountAmount;
Discount.DiscountPercent = DiscountPercent;
Discount.DiscountCoupon = DiscountCoupon;
Discount.DiscountPreviousSubscription = DiscountPreviousSubscription;

Discount.plugin(originals, { fields: ["processor"] });

Discount.virtual("isAddedToProcessor").get(function isAddedToProcessor() {
    const original = this.snapshotOriginal || this.original;
    return (
        original &&
        original.processor.state === ProcessorItem.INITIAL &&
        this.processor.state === ProcessorItem.SAVED
    );
});
Discount.virtual("numberOfBillingcyclesLeft").get(function isAddedToProcessor() {
    return this.numberOfBillingCycles - this.currentBillingCycle;
});

module.exports = Discount;
