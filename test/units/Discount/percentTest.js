'use strict';

const assert = require('assert');
const Subscription = require('../../../src/Subscription');
const DiscountPercent = require('../../../src/Schema/Discount/Percent');
const Plan = require('../../../src/Plan');

describe('Discount/Percent', function () {
    beforeEach(function() {
        const plan = new Plan({
            processor: { id: 'test1', state: 'saved' },
            name: 'Test',
            price: 19.90,
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
            price: 19.90,
            paymentMethodId: 'three',
            processor: { id: 'gzsxjb', state: 'saved' },
        });
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

    //TODO: What happens when the percentage is less than 0
});
