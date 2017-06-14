"use strict";

const mongoose = require("mongoose");
const assert = require("assert");
const main = require("../../../src");
const Coupon = main.Coupon;

describe("Schema/Coupon", function() {
    it("Coupon isLimitReached should return true when usedCount is more than the max", function() {
        const coupon = new Coupon({
            usedCount: 6,
            usedCountMax: 5,
        });

        assert.ok(coupon.isUseLimitReached());
    });

    it("Coupon isLimitReached should return false when usedCount is less than the max", function() {
        const coupon = new Coupon({
            usedCount: 2,
            usedCountMax: 5,
        });

        assert.equal(coupon.isUseLimitReached(), false);
    });

    it("Coupon isLimitReached should return false when there is not max used count", function() {
        const coupon = new Coupon({
            usedCount: 2,
        });

        assert.equal(coupon.isUseLimitReached(), false);
    });

    it("Coupon isExpired should return true when expire date is in the past", function() {
        const coupon = new Coupon({
            expireAt: "2017-03-29T16:12:26Z",
        });

        assert.ok(coupon.isExpired("2017-03-31T16:12:26Z"));
    });

    it("Coupon isExpired should return false when expire date is in the future", function() {
        const coupon = new Coupon({
            expireAt: "2017-04-29T16:12:26Z",
        });

        assert.equal(coupon.isExpired("2017-03-31T16:12:26Z"), false);
    });

    it("Coupon isExpired should return false when the coupon don't expire", function() {
        const coupon = new Coupon({});

        assert.equal(coupon.isExpired("2017-03-31T16:12:26Z"), false);
    });

    const validateState = [
        {
            name: "missing coupon",
            coupon: null,
            expected: "Invalid promocode",
        },
        {
            name: "expired coupon",
            coupon: new Coupon({ expireAt: "2016-04-29T16:12:26Z" }),
            expected: "Promocode expired",
        },
        {
            name: "coupon uses limit reached",
            coupon: new Coupon({ usedCount: 6, usedCountMax: 5 }),
            expected: "Promocode limit reached",
        },
    ];

    validateState.forEach(test => {
        it(`Coupon validateState will error when ${test.name}`, function() {
            const error = Coupon.validateState(test.coupon);
            assert.equal(error.message, test.expected);
        });
    });

    it("Coupon validateState will not error", function() {
        const coupon = new Coupon({});
        const error = Coupon.validateState(coupon);
        assert.ok(!error);
    });

    const findOneAndValidate = [
        {
            name: "expired coupon",
            coupon: new Coupon({ name: "test", expireAt: "2016-04-29T16:12:26Z" }),
            expected: "Promocode expired",
        },
        {
            name: "coupon uses limit reached",
            coupon: new Coupon({ name: "test", usedCount: 6, usedCountMax: 5 }),
            expected: "Promocode limit reached",
        },
    ];

    findOneAndValidate.forEach(test => {
        it(`Coupon findOneAndValidate will error when ${test.name}`, function() {
            return test.coupon
                .save()
                .then(coupon => {
                    return Coupon.findOneAndValidate({ _id: coupon._id });
                })
                .then(coupon => {
                    assert.ok(!true, `Should not find ${test.name}`);
                })
                .catch(error => {
                    assert.equal(error.message, test.expected);
                });
        });
    });

    it("Coupon findOneAndValidate will not error", function() {
        const coupon = new Coupon({ name: "test" });

        return coupon
            .save()
            .then(coupon => {
                return Coupon.findOneAndValidate({ _id: coupon._id });
            })
            .then(couponFound => {
                assert.ok(couponFound.equals(coupon));
            });
    });
});
