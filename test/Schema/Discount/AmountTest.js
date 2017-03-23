'use strict';

const assert = require('assert');
const main = require('../../../src');
const Customer = main.Customer;
const Plan = main.Plan;
const DiscountAmount = main.Schema.Discount.DiscountAmount;

describe('Schema/Discount/Amount', function () {
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

    //TODO: What happens when the amount is less than 0
});
