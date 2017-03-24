'use strict';

const mongoose = require('mongoose');
const assert = require('assert');
const main = require('../../../src');
const Plan = main.Plan;
const DiscountPercent = main.Schema.Discount.DiscountPercent;
const SubscriptionSchema = main.Schema.Subscription;

describe('Schema/Discount/Percent', function () {
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

    it('discountAmount build should return the correct amount when the percent value is correct', function () {
        const percent = 28;
        const discountTitle = "Test DiscountAmount";

        const expected = {
            percent: percent,
            amount: (this.subscription.price * (percent / 100)).toFixed(2),
            __t: 'DiscountPercent',
            name: discountTitle,
        };

        assert.deepEqual(DiscountPercent.build(this.subscription, discountTitle, percent), expected);
    });

    it('discountAmount build should return the full price when the percentage is more than 100', function () {
        const percent = 185;
        const discountTitle = "Test DiscountAmount";

        const expected = {
            percent: percent,
            amount: this.subscription.price.toFixed(2),
            __t: 'DiscountPercent',
            name: discountTitle,
        };

        assert.deepEqual(DiscountPercent.build(this.subscription, discountTitle, percent), expected);
    });
});
