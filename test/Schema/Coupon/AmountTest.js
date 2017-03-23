'use strict';

const assert = require('assert');
const main = require('../../../src');
const Customer = main.Customer;
const Plan = main.Plan;
const Coupon = main.Coupon;
const CouponAmount = main.Schema.Coupon.CouponPercent;

describe('Schema/Coupon/Amount', function () {
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

    it('coupon amount should return valid result based on the subscription', function () {
        const coupon = new Coupon.CouponAmount({
            amount: 10
        });

        assert.deepEqual(coupon.currentAmount(this.subscription), coupon.amount)
    });

    it('coupon amount should return the full price when amount is more than the subscription price', function () {
        const coupon = new Coupon.CouponAmount({
            amount: 20
        });

        assert.deepEqual(coupon.currentAmount(this.subscription), this.subscription.price)
    });
});
