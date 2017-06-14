"use strict";

const mongoose = require("mongoose");
const assert = require("assert");
const main = require("../../../src");
const DiscountAmount = main.Schema.Discount.DiscountAmount;
const SubscriptionSchema = main.Schema.Subscription;

describe("Schema/Discount/Amount", function() {
    before(function() {
        this.SubscriptionTest = mongoose.model("SubscriptionTest", SubscriptionSchema);
    });

    beforeEach(function() {
        const plan = {
            processorId: "test1",
            price: 19.9,
            billingFrequency: 1,
        };

        this.subscription = {
            _id: "four",
            plan: plan,
            status: "Active",
            descriptor: {
                name: "Tst*Mytest",
                phone: 8899039032,
                url: "example.com",
            },
            price: 19.9,
            paymentMethodId: "three",
            processor: { id: "gzsxjb", state: "saved" },
        };
    });

    it("DiscountAmount should return the amount provided when it is less than the price", function() {
        const amount = 10;
        const discountTitle = "Test DiscountAmount";

        const expected = {
            amount: amount.toFixed(2),
            __t: "DiscountAmount",
            name: discountTitle,
        };

        assert.deepEqual(DiscountAmount.build(this.subscription, discountTitle, amount), expected);
    });

    it("DiscountAmount should return null when the amount is zero", function() {
        const amount = 0;
        const discountTitle = "Test DiscountAmount";

        assert.deepEqual(DiscountAmount.build(this.subscription, discountTitle, amount), null);
    });

    it("DiscountAmount should return the subscription price when the amount is more than it", function() {
        const amount = 20;
        const discountTitle = "Test DiscountAmount";

        const expected = {
            amount: this.subscription.price.toFixed(2),
            __t: "DiscountAmount",
            name: discountTitle,
        };

        assert.deepEqual(DiscountAmount.build(this.subscription, discountTitle, amount), expected);
    });
});
