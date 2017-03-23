'use strict';

const assert = require('assert');
const main = require('../../../src');
const Customer = main.Customer;
const Plan = main.Plan;
const Coupon = main.Coupon;
const CouponPercent = main.Schema.Coupon.CouponPercent;

describe('Schema/Coupon/Percent', function () {
    beforeEach(function() {
        const plan = new Plan({
            processor: { id: 'test1', state: 'saved' },
            name: 'Test',
            price: 19.90,
            currency: 'USD',
            billingFrequency: 1,
        });

        this.customer = new Customer({
            subscriptions: [
                {
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
                }
            ]
        });

        this.subscription = this.customer.subscriptions[0];
    });

    it('coupon percent should return valid result based on the subscription', function () {
        const coupon = new Coupon.CouponPercent({
            percent: 20
        });

        assert.deepEqual(coupon.currentAmount(this.subscription), this.subscription.price * 0.2)
    });

    it('coupon percent should return the full price when percent is more than 100', function () {
        const coupon = new Coupon.CouponPercent({
            percent: 180
        });

        assert.deepEqual(coupon.currentAmount(this.subscription), this.subscription.price)
    });
});
