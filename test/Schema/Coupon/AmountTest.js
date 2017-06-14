"use strict";

const assert = require("assert");
const mongoose = require("mongoose");
const main = require("../../../src");
const Coupon = main.Coupon;
const CouponAmount = main.Schema.Coupon.CouponPercent;
const SubscriptionSchema = main.Schema.Subscription;

describe("Schema/Coupon/Amount", function() {
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

    it("CouponAmount should return valid result based on the subscription", function() {
        const coupon = new Coupon.CouponAmount({
            amount: 10,
        });

        assert.deepEqual(coupon.currentAmount(this.subscription), coupon.amount);
    });

    it("CouponAmount should return the full price when amount is more than the subscription price", function() {
        const coupon = new Coupon.CouponAmount({
            amount: 20,
        });

        assert.deepEqual(coupon.currentAmount(this.subscription), this.subscription.price);
    });
});
