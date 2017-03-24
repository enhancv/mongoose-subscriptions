'use strict';

const mongoose = require('mongoose');
const assert = require('assert');
const main = require('../../../src');
const Coupon = main.Coupon;
const Plan = main.Plan;
const DiscountCoupon = main.Schema.Discount.DiscountCoupon;
const SubscriptionSchema = main.Schema.Subscription;

describe('Schema/Discount/Coupon', function () {
    before(function() {
        this.SubscriptionTest = mongoose.model('SubscriptionTest', SubscriptionSchema);
    });

    beforeEach(function() {
        const plan = new Plan({
            processor: { id: 'test1', state: 'saved' },
            name: 'Test',
            price: 19.90,
            currency: 'USD',
            billingFrequency: 1,
        });

        this.subscription = {
            _id: 'four',
            plan: plan,
            status: 'Active',
            descriptor: {
                name: 'Tst*Mytest',
                phone: 8899039032,
                url: 'example.com',
            },
            price: 19.90,
            paymentMethodId: 'three',
            processor: { id: 'gzsxjb', state: 'saved' },
        };
    });

    it('discountCoupon build should return null when usedCount is more or equal than usedCountMax', function () {
        const coupon = new Coupon.CouponAmount({
            name: 'Coupon test',
            amount: 10,
            usedCount: 3,
            usedCountMax: 2,
            startAt: '2016-09-29T16:12:26Z',
            expireAt: '2017-09-29T16:12:26Z'
        });

        assert.deepEqual(DiscountCoupon.build(this.subscription, coupon), null);
    });

    it('discountCoupon build should return null when the coupon starts in the future', function () {
        const coupon = new Coupon.CouponAmount({
            name: 'Coupon test',
            amount: 10,
            usedCount: 3,
            usedCountMax: 5,
            startAt: '2016-11-29T16:12:26Z',
            expireAt: '2016-12-29T16:12:26Z'
        });

        assert.deepEqual(DiscountCoupon.build(this.subscription, coupon, new Date('2016-10-29T16:12:26Z')), null);
    });

    it('discountCoupon build should return null when the coupon expires in the past', function () {
        const coupon = new Coupon.CouponAmount({
            name: 'Coupon test',
            amount: 10,
            usedCount: 3,
            usedCountMax: 5,
            startAt: '2016-09-29T16:12:26Z',
            expireAt: '2016-07-29T16:12:26Z'
        });

        assert.deepEqual(DiscountCoupon.build(this.subscription, coupon, new Date('2016-08-29T16:12:26Z')), null);
    });

    it('discountCoupon build should return correct object when data is correct', function () {
        const coupon = new Coupon.CouponAmount({
            name: 'Coupon test',
            amount: 10,
            usedCount: 3,
            usedCountMax: 5,
            startAt: '2016-07-29T16:12:26Z',
            expireAt: '2016-12-29T16:12:26Z'
        });

        const expected = {
            coupon: coupon,
            amount: coupon.amount.toFixed(2),
            __t: 'DiscountCoupon',
            name: coupon.name,
        }

        assert.deepEqual(DiscountCoupon.build(this.subscription, coupon, new Date('2016-08-29T16:12:26Z')), expected);
    });
});
