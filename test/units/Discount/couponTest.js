'use strict';

const assert = require('assert');
const Coupon = require('../../../src/Coupon');
const Subscription = require('../../../src/Subscription');
const DiscountCoupon = require('../../../src/Schema/Discount/Coupon');
const Plan = require('../../../src/Plan');

describe('Discount/Coupon', function () {
    beforeEach(function() {
        const plan = new Plan({
            processor: { id: 'test1', state: 'saved' },
            name: 'Test',
            price: 12,
            currency: 'USD',
            billingFrequency: 1,
        });

        this.subscription = new Subscription({
            _id: 'four',
            plan: plan,
            status: 'Active',
            descriptor: {
                name: 'Tst*Mytest',
                phone: 8899039032,
                url: 'example.com',
            },
            paymentMethodId: 'three',
            processor: { id: 'gzsxjb', state: 'saved' },
        });
    });

    it('discountCoupon build should return null when usedCount is more or equal than usedCountMax', function () {
        const coupon = new Coupon.CouponAmount({
            name: 'Coupon test',
            amount: 20,
            usedCount: 3,
            usedCountMax: 2,
            startAt: '2016-09-29T16:12:26Z',
            expireAt: '2017-09-29T16:12:26Z'
        });

        assert.deepEqual(DiscountCoupon.build(this.subscription, coupon), null);
    });

    it('discountCoupon build should return null when the coupon starts in the past', function () {
        const coupon = new Coupon.CouponAmount({
            name: 'Coupon test',
            amount: 20,
            usedCount: 3,
            usedCountMax: 5,
            startAt: '2016-08-29T16:12:26Z',
            expireAt: '2016-09-29T16:12:26Z'
        });

        assert.deepEqual(DiscountCoupon.build(this.subscription, coupon, new Date('2016-10-29T16:12:26Z')), null);
    });

    it('discountCoupon build should return null when the coupon expires in the past', function () {
        const coupon = new Coupon.CouponAmount({
            name: 'Coupon test',
            amount: 20,
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
            amount: 20,
            usedCount: 3,
            usedCountMax: 5,
            startAt: '2016-09-29T16:12:26Z',
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
