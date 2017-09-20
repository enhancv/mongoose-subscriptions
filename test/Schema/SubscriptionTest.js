"use strict";

const mongoose = require("mongoose");
const assert = require("assert");
const main = require("../../src");
const SubscriptionSchema = main.Schema.Subscription;

describe("Subscription", function() {
    before(function() {
        this.SubscriptionTest = mongoose.model("SubscriptionTest", SubscriptionSchema);
    });

    it("Should initialize dates correctly with initializeDates", function() {
        const sub = new this.SubscriptionTest({
            plan: {
                billingFrequency: 2,
            },
            processor: { state: "local" },
            firstBillingDate: "2017-03-03",
        });

        sub.initializeDates();

        assert.deepEqual(sub.paidThroughDate, new Date("2017-05-03"));
        assert.deepEqual(sub.billingPeriodStartDate, new Date("2017-03-03"));
        assert.deepEqual(sub.billingPeriodEndDate, new Date("2017-05-03"));
        assert.deepEqual(sub.nextBillingDate, new Date("2017-05-04"));
        assert.equal(sub.billingDayOfMonth, 4);
    });

    it("Should calculate free billing cycles correctly without discounts", function() {
        const sub = new this.SubscriptionTest({
            plan: {
                billingFrequency: 2,
            },
            processor: { state: "local" },
            firstBillingDate: "2017-03-03",
        });

        sub.initializeDates();

        assert.deepEqual(sub.numberOfFreeBillingCycles, 0);
        assert.deepEqual(sub.paidThroughWithFreeDate, new Date("2017-05-03"));
        assert.deepEqual(sub.nextBillingWithFreeDate, new Date("2017-05-04"));
    });

    it("Should calculate free billing cycles correctly with discounts", function() {
        const sub = new this.SubscriptionTest({
            plan: {
                billingFrequency: 2,
                price: 20,
            },
            discounts: [
                {
                    amount: 5,
                    numberOfBillingCycles: 3,
                    currentBillingCycle: 1,
                },
                {
                    amount: 5,
                    numberOfBillingCycles: 3,
                    currentBillingCycle: 2,
                },
                {
                    amount: 10,
                    numberOfBillingCycles: 5,
                    currentBillingCycle: 3,
                },
            ],
            price: 20,
            processor: { state: "local" },
            firstBillingDate: "2017-03-03",
        });

        sub.initializeDates();

        assert.deepEqual(sub.numberOfFreeBillingCycles, 1);
        assert.deepEqual(sub.paidThroughWithFreeDate, new Date("2017-07-03"));
        assert.deepEqual(sub.nextBillingWithFreeDate, new Date("2017-07-04"));
    });

    it("Should initialize dates correctly with initializeDates and trial in days", function() {
        const sub = new this.SubscriptionTest({
            plan: {
                billingFrequency: 2,
            },
            processor: { state: "local" },
            createdAt: "2017-03-03",
            isTrial: true,
            trialDuration: 4,
            trialDurationUnit: "day",
        });

        sub.initializeDates();

        assert.deepEqual(sub.firstBillingDate, new Date("2017-03-07"));
        assert.deepEqual(sub.paidThroughDate, null);
        assert.deepEqual(sub.billingPeriodStartDate, null);
        assert.deepEqual(sub.billingPeriodEndDate, null);
        assert.deepEqual(sub.nextBillingDate, new Date("2017-03-07"));
        assert.equal(sub.billingDayOfMonth, 7);
    });

    it("Should initialize dates correctly with initializeDates and trial in months", function() {
        const sub = new this.SubscriptionTest({
            plan: {
                billingFrequency: 2,
            },
            processor: { state: "local" },
            createdAt: "2017-03-03",
            isTrial: true,
            trialDuration: 2,
            trialDurationUnit: "month",
        });

        sub.initializeDates();

        assert.deepEqual(sub.firstBillingDate, new Date("2017-05-03"));
        assert.deepEqual(sub.paidThroughDate, null);
        assert.deepEqual(sub.billingPeriodStartDate, null);
        assert.deepEqual(sub.billingPeriodEndDate, null);
        assert.deepEqual(sub.nextBillingDate, new Date("2017-05-03"));
        assert.equal(sub.billingDayOfMonth, 3);
    });

    it("addDiscounts", function() {
        const sub = new this.SubscriptionTest({
            _id: "four",
            price: 20,
            plan: {
                processorId: "new-plan-id",
                price: 20,
                currency: "USD",
            },
            processor: { id: "id-subscription", state: "saved" },
            status: "Active",
            discounts: [
                {
                    __t: "DiscountAmount",
                    amount: 10,
                },
            ],
            paidThroughDate: "2017-03-03",
            paymentMethodId: "three",
        });

        sub.addDiscounts(subscription => {
            return [
                {
                    __t: "DiscountPercent",
                    amount: 5,
                    percent: 25,
                },
            ];
        });

        assert.equal("DiscountAmount", sub.discounts[0].__t);

        sub.addDiscounts(subscription => {
            return [
                {
                    __t: "DiscountPercent",
                    amount: 15,
                    percent: 75,
                },
            ];
        });

        assert.equal("DiscountPercent", sub.discounts[0].__t);
        assert.deepEqual(new Date("2017-03-03"), sub.paidThroughDate, "Keep old paidThroughDate");
    });

    it("addDiscounts when there are preserved discounts", function() {
        const sub = new this.SubscriptionTest({
            _id: "four",
            price: 20,
            plan: {
                processorId: "new-plan-id",
                price: 20,
                currency: "USD",
            },
            processor: { id: "id-subscription", state: "saved" },
            status: "Active",
            discounts: [
                {
                    subscriptionId: "five",
                    __t: "DiscountPreviousSubscription",
                    amount: 10,
                },
            ],
            paidThroughDate: "2017-03-03",
            paymentMethodId: "three",
        });

        sub.addDiscounts(subscription => {
            return [
                {
                    __t: "DiscountPercent",
                    amount: 5,
                    percent: 25,
                },
            ];
        });

        assert.equal(2, sub.discounts.length);
    });

    const numberOfFreeBillingCyclesTests = [
        {
            name: "no discounts",
            discounts: [],
            expected: 0,
        },
        {
            name: "discount without total price",
            discounts: [
                {
                    amount: 10,
                    __t: "DiscountAmount",
                },
            ],
            expected: 0,
        },
        {
            name: "one full discount",
            discounts: [
                {
                    amount: 20,
                    __t: "DiscountAmount",
                },
            ],
            expected: 1,
        },
        {
            name: "one full discount on second month",
            discounts: [
                {
                    amount: 20,
                    numberOfBillingCycles: 3,
                    currentBillingCycle: 2,
                    __t: "DiscountAmount",
                },
            ],
            expected: 1,
        },
        {
            name: "several discounts without total price",
            discounts: [
                {
                    amount: 10,
                },
                {
                    amount: 5,
                },
            ],
            expected: 0,
        },
        {
            name: "several discounts with combined total price",
            discounts: [
                {
                    amount: 10,
                },
                {
                    amount: 10,
                },
            ],
            expected: 1,
        },
        {
            name: "several discounts with one longer",
            discounts: [
                {
                    amount: 10,
                    numberOfBillingCycles: 3,
                },
                {
                    amount: 10,
                },
            ],
            expected: 1,
        },
        {
            name: "several discounts with differnt lifespans",
            discounts: [
                {
                    amount: 5,
                    numberOfBillingCycles: 3,
                    currentBillingCycle: 1,
                },
                {
                    amount: 5,
                    numberOfBillingCycles: 3,
                    currentBillingCycle: 2,
                },
                {
                    amount: 10,
                    numberOfBillingCycles: 5,
                    currentBillingCycle: 3,
                },
            ],
            expected: 1,
        },
        {
            name: "discount with 0 current billing cycle",
            discounts: [
                {
                    amount: 20,
                    numberOfBillingCycles: 3,
                    currentBillingCycle: 0,
                },
            ],
            expected: 3,
        },
    ];

    numberOfFreeBillingCyclesTests.forEach(function(test) {
        it(`Should calculate numberOfFreeBillingCycles correctly for ${test.name}`, function() {
            const sub = new this.SubscriptionTest({
                _id: "four",
                price: 20,
                plan: {
                    processorId: "new-plan-id",
                    price: 20,
                    billingFrequency: 2,
                    currency: "USD",
                },
                processor: { id: "id-subscription", state: "saved" },
                status: "Active",
                discounts: test.discounts,
                firstBillingDate: "2017-01-31T00:00:00.000Z",
                paymentMethodId: "three",
            });

            assert.equal(sub.numberOfFreeBillingCycles, test.expected);
        });
    });

    it("addDiscounts", function() {
        const sub = new this.SubscriptionTest({
            _id: "four",
            price: 20,
            plan: {
                processorId: "new-plan-id",
                price: 20,
                billingFrequency: 2,
                currency: "USD",
            },
            processor: { id: "id-subscription", state: "saved" },
            status: "Active",
            discounts: [
                {
                    __t: "DiscountAmount",
                    amount: 10,
                },
            ],
            firstBillingDate: "2017-01-31T00:00:00.000Z",
            paymentMethodId: "three",
        });

        sub.addDiscounts(subscription => {
            return [
                {
                    __t: "DiscountPercent",
                    amount: 20,
                    percent: 100,
                    numberOfBillingCycles: 3,
                    currentBillingCycle: 2,
                },
            ];
        });

        assert.equal(1, sub.numberOfFreeBillingCycles);
    });
});
