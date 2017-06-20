const mongoose = require("mongoose");
const shortid = require("shortid");
const addmonths = require("addmonths");
const ProcessorItem = require("./ProcessorItem");
const Descriptor = require("./Descriptor");
const originals = require("mongoose-originals");
const Discount = require("./Discount");
const Plan = require("./Plan");
const SubscriptionStatus = require("./Statuses/SubscriptionStatus");

const Schema = mongoose.Schema;

const Subscription = new Schema({
    _id: {
        type: String,
        default: shortid.generate,
    },
    processor: {
        type: ProcessorItem,
        default: ProcessorItem,
    },
    plan: {
        type: Plan,
        required: true,
    },
    discounts: [Discount],
    paymentMethodId: String,
    firstBillingDate: Date,
    paidThroughDate: Date,
    status: {
        type: String,
        enum: SubscriptionStatus.Statuses,
    },
    price: Number,
    statusHistory: [SubscriptionStatus],
    descriptor: Descriptor,
    isTrial: {
        type: Boolean,
        default: false,
    },
    trialDuration: Number,
    trialDurationUnit: {
        type: String,
        enum: ["month", "day"],
    },
});

Subscription.virtual("nextBillingDate")
    .get(function getNextBillingDate() {
        return this.paidThroughDate;
    })
    .set(function setNextBillingDate(value) {
        this.paidThroughDate = value;
    });

Subscription.methods.addDiscounts = function find(callback) {
    const newDiscounts = callback(this);
    const oldDiscounts = this.discounts;

    this.discounts = oldDiscounts
        .concat(newDiscounts)
        .filter(item => item)
        .map(item => {
            const itemObject = this.discounts.create(item);
            itemObject.initOriginals();
            return itemObject;
        })
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 1);

    const discount = this.discounts[0];

    if (discount && this.firstBillingDate && discount.amount === this.price) {
        this.paidThroughDate = addmonths(
            this.firstBillingDate,
            this.plan.billingFrequency * discount.numberOfBillingCycles
        );
    }

    return this;
};

Subscription.plugin(originals, { fields: ["discounts", "status"] });

Subscription.path("discounts").discriminator("DiscountAmount", Discount.DiscountAmount);
Subscription.path("discounts").discriminator("DiscountPercent", Discount.DiscountPercent);
Subscription.path("discounts").discriminator("DiscountCoupon", Discount.DiscountCoupon);
Subscription.path("discounts").discriminator(
    "DiscountPreviousSubscription",
    Discount.DiscountPreviousSubscription
);

module.exports = Subscription;
