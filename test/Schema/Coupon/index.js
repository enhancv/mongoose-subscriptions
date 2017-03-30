'use strict';

const mongoose = require('mongoose');
const assert = require('assert');
const main = require('../../../src');
const Coupon = main.Coupon;

describe('Schema/Coupon', function () {
    it('Coupon isLimitReached should return true when usedCount is more than the max', function () {
        const coupon = new Coupon({
            usedCount: 6,
            usedCountMax: 5
        });

        assert.ok(coupon.isUseLimitReached());
    });

    it('Coupon isLimitReached should return false when usedCount is less than the max', function () {
        const coupon = new Coupon({
            usedCount: 2,
            usedCountMax: 5
        });

        assert.equal(coupon.isUseLimitReached(), false);
    });

    it('Coupon isLimitReached should return false when there is not max used count', function () {
        const coupon = new Coupon({
            usedCount: 2
        });

        assert.equal(coupon.isUseLimitReached(), false);
    });

    it('Coupon isExpired should return true when expire date is in the past', function () {
        const coupon = new Coupon({
            expireAt: '2017-03-29T16:12:26Z'
        });

        assert.ok(coupon.isExpired('2017-03-31T16:12:26Z'));
    });

    it('Coupon isExpired should return false when expire date is in the future', function () {
        const coupon = new Coupon({
            expireAt: '2017-04-29T16:12:26Z'
        });

        assert.equal(coupon.isExpired('2017-03-31T16:12:26Z'), false);
    });

    it('Coupon isExpired should return false when the coupon don\'t expire', function () {
        const coupon = new Coupon({
        });

        assert.equal(coupon.isExpired('2017-03-31T16:12:26Z'), false);
    });
});
