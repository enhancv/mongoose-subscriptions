"use strict";

const mongoose = require("mongoose");
const assert = require("assert");
const main = require("../../../src");
const Coupon = main.Coupon;
const CouponPercent = main.Schema.Coupon.CouponPercent;
const SubscriptionSchema = main.Schema.Subscription;

describe("Schema/Coupon/Percent", function() {
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

    it("CouponPercent should return valid result based on the subscription", function() {
        const coupon = new Coupon.CouponPercent({
            percent: 20,
        });

        assert.deepEqual(coupon.currentAmount(this.subscription), this.subscription.price * 0.2);
    });

    it("CouponPercent should return the full price when percent is more than 100", function() {
        const coupon = new Coupon.CouponPercent({
            percent: 180,
        });

        assert.deepEqual(coupon.currentAmount(this.subscription), this.subscription.price);
    });
});
