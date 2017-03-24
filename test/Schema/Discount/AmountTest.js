'use strict';

const mongoose = require('mongoose');
const assert = require('assert');
const main = require('../../../src');
const Plan = main.Plan;
const DiscountAmount = main.Schema.Discount.DiscountAmount;
const SubscriptionSchema = main.Schema.Subscription;

describe('Schema/Discount/Amount', function () {
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

    it('discountAmount build should return discount with the amount when it is less than the price', function () {
        const amount = 10;
        const discountTitle = "Test DiscountAmount";

        const expected = {
            amount: amount.toFixed(2),
            __t: 'DiscountAmount',
            name: discountTitle,
        };

        assert.deepEqual(DiscountAmount.build(this.subscription, discountTitle, amount), expected);
    });

    it('discountAmount build should return the price when the amount more than the price', function () {
        const amount = 20;
        const discountTitle = "Test DiscountAmount";

        const expected = {
            amount: this.subscription.price.toFixed(2),
            __t: 'DiscountAmount',
            name: discountTitle,
        };

        assert.deepEqual(DiscountAmount.build(this.subscription, discountTitle, amount), expected);
    });
});
