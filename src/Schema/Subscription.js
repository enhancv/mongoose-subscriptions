const mongoose = require("mongoose");
const shortid = require("shortid");
const XDate = require("xdate");
const ProcessorItem = require("./ProcessorItem");
const Descriptor = require("./Descriptor");
const originals = require("mongoose-originals");
const Discount = require("./Discount");
const Plan = require("./Plan");
const SubscriptionStatus = require("./Statuses/SubscriptionStatus");

const Subscription = new mongoose.Schema({
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
    nextBillingDate: Date,
    paidThroughDate: Date,
    failureCount: Number,
    daysPastDue: Number,
    billingPeriodEndDate: Date,
    billingPeriodStartDate: Date,
    billingDayOfMonth: Number,
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
    deleted: Boolean,
    trialDuration: Number,
    trialDurationUnit: {
        type: String,
        enum: ["month", "day"],
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: Date,
});

function addTrial(trialDuration, trialDurationUnit, date) {
    switch (trialDurationUnit) {
        case "day":
            return new XDate(date, true).addDays(trialDuration);
        case "month":
            return new XDate(date, true).addMonths(trialDuration);
        default:
            return date;
    }
}

Subscription.virtual("numberOfFreeBillingCycles").get(function numberOfFreeBillingCycles() {
    return this.discounts.reduce((max, current) => {
        const discountsPrice = this.discounts
            .filter(discount => {
                return current.numberOfBillingcyclesLeft <= discount.numberOfBillingcyclesLeft;
            })
            .map(discount => discount.amount)
            .reduce((sum, value) => sum + value, 0);

        return discountsPrice >= this.price ? current.numberOfBillingcyclesLeft : max;
    }, 0);
});

Subscription.virtual("numberOfFreeMonths").get(function numberOfFreeMonths() {
    return this.numberOfFreeBillingCycles * this.plan.billingFrequency;
});

Subscription.virtual("nextBillingWithFreeDate").get(function numberOfFreeMonths() {
    return this.nextBillingDate
        ? new XDate(this.nextBillingDate, true).addMonths(this.numberOfFreeMonths).toDate()
        : null;
});

Subscription.virtual("paidThroughWithFreeDate").get(function numberOfFreeMonths() {
    return this.paidThroughDate
        ? new XDate(this.paidThroughDate, true).addMonths(this.numberOfFreeMonths).toDate()
        : null;
});

Subscription.virtual("billingPeriodEndWithFreeDate").get(function numberOfFreeMonths() {
    return this.billingPeriodEndDate
        ? new XDate(this.billingPeriodEndDate, true).addMonths(this.numberOfFreeMonths).toDate()
        : null;
});

Subscription.method("initializeDates", function initializeLocalDates() {
    if (this.processor.state === ProcessorItem.LOCAL) {
        if (this.isTrial) {
            this.firstBillingDate =
                this.firstBillingDate ||
                addTrial(this.trialDuration, this.trialDurationUnit, this.createdAt);
            this.nextBillingDate = this.nextBillingDate || this.firstBillingDate;
            this.billingDayOfMonth = this.billingDayOfMonth || this.nextBillingDate.getDate();
        } else {
            this.firstBillingDate = this.firstBillingDate || this.createdAt;
            this.paidThroughDate =
                this.paidThroughDate ||
                new XDate(this.firstBillingDate, true).addMonths(this.plan.billingFrequency);
            this.billingPeriodStartDate = this.billingPeriodStartDate || this.firstBillingDate;
            this.billingPeriodEndDate = this.billingPeriodEndDate || this.paidThroughDate;
            this.nextBillingDate =
                this.nextBillingDate || new XDate(this.paidThroughDate, true).addDays(1);
            this.billingDayOfMonth = this.billingDayOfMonth || this.nextBillingDate.getDate();
        }
    }
});

Subscription.pre("save", function(next) {
    this.initializeDates();
    next();
});

Subscription.method("addDiscounts", function addDiscounts(callback) {
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

    return this;
});

Subscription.method("inBillingPeriod", function inBillingPeriod(activeDate) {
    const date = activeDate || new Date();
    const startOfDay = new XDate(date, true).clearTime();
    const endOfDay = new XDate(date, true).addDays(1).clearTime();

    if (this.isTrial) {
        const trialStartDate = addTrial(
            -this.trialDuration,
            this.trialDurationUnit,
            this.firstBillingDate
        );
        return trialStartDate <= endOfDay && startOfDay <= this.firstBillingDate;
    } else if (this.billingPeriodStartDate && this.billingPeriodEndDate) {
        const start = this.billingPeriodStartDate;
        const endDate = new XDate(this.billingPeriodEndWithFreeDate, true).addDays(1);
        return start <= endOfDay && startOfDay <= endDate;
    }
});

Subscription.plugin(originals, {
    fields: [
        "discounts",
        "plan",
        "paymentMethodId",
        "firstBillingDate",
        "paidThroughDate",
        "status",
        "price",
        "descriptor",
        "isTrial",
        "trialDuration",
        "trialDurationUnit",
    ],
});

Subscription.path("discounts").discriminator("DiscountAmount", Discount.DiscountAmount);
Subscription.path("discounts").discriminator("DiscountPercent", Discount.DiscountPercent);
Subscription.path("discounts").discriminator("DiscountCoupon", Discount.DiscountCoupon);
Subscription.path("discounts").discriminator(
    "DiscountPreviousSubscription",
    Discount.DiscountPreviousSubscription
);

module.exports = Subscription;
