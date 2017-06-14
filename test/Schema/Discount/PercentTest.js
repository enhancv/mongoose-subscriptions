"use strict";

const mongoose = require("mongoose");
const assert = require("assert");
const main = require("../../../src");
const DiscountPercent = main.Schema.Discount.DiscountPercent;
const SubscriptionSchema = main.Schema.Subscription;

describe("Schema/Discount/Percent", function() {
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

    it("DiscountPercent should return the percent and the calculated amount when is is from 1-100", function() {
        const percent = 28;
        const discountTitle = "Test DiscountAmount";

        const expected = {
            percent: percent,
            amount: (this.subscription.price * (percent / 100)).toFixed(2),
            __t: "DiscountPercent",
            name: discountTitle,
        };

        assert.deepEqual(
            DiscountPercent.build(this.subscription, discountTitle, percent),
            expected
        );
    });

    it("DiscountPercent should return the full price as an amount when the percent is more than 100", function() {
        const percent = 185;
        const discountTitle = "Test DiscountAmount";

        const expected = {
            percent: percent,
            amount: this.subscription.price.toFixed(2),
            __t: "DiscountPercent",
            name: discountTitle,
        };

        assert.deepEqual(
            DiscountPercent.build(this.subscription, discountTitle, percent),
            expected
        );
    });

    it("DiscountPercent should return null when the percent is 0", function() {
        const percent = 0;
        const discountTitle = "Test DiscountAmount";

        assert.deepEqual(DiscountPercent.build(this.subscription, discountTitle, percent), null);
    });
});
