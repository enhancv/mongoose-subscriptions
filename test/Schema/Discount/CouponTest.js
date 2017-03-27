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

    const fields = [
        {
            name: 'is used more than the max',
            fields: {
                name: 'Coupon test',
                amount: 10,
                usedCount: 3,
                usedCountMax: 2,
                startAt: '2016-09-29T16:12:26Z',
                expireAt: '2016-12-29T16:12:26Z'
            },
            isValid: false,
        }, {
            name: 'starts in the future',
            fields: {
                name: 'Coupon test',
                amount: 10,
                usedCount: 3,
                usedCountMax: 5,
                startAt: '2016-11-29T16:12:26Z',
                expireAt: '2016-12-29T16:12:26Z'
            },
            isValid: false,
        }, {
            name: 'expires in the past',
            fields: {
                name: 'Coupon test',
                amount: 10,
                usedCount: 3,
                usedCountMax: 5,
                startAt: '2016-07-29T16:12:26Z',
                expireAt: '2016-09-29T16:12:26Z'
            },
            isValid: false,
        }, {
            name: 'is in the range and is not used more than the max',
            fields: {
                name: 'Coupon test',
                amount: 10,
                usedCount: 3,
                usedCountMax: 5,
                startAt: '2016-09-29T16:12:26Z',
                expireAt: '2016-12-29T16:12:26Z'
            },
            isValid: true,
        }, {
            name: 'is with amount 0',
            fields: {
                name: 'Coupon test',
                amount: 0,
                usedCount: 3,
                usedCountMax: 5,
                startAt: '2016-09-29T16:12:26Z',
                expireAt: '2016-12-29T16:12:26Z'
            },
            isValid: false,
        },
    ];

    fields.forEach(function (test) {
        it(`DiscountCoupon should be valid when it ${test.name}`, function () {
            const coupon = new Coupon.CouponAmount(test.fields);
            const result = DiscountCoupon.build(this.subscription, coupon, new Date('2016-10-29T16:12:26Z'));
            const isValid = !!result;

            assert.equal(isValid, test.isValid);
        });
    });
});
