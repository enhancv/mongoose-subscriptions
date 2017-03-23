'use strict';

const assert = require('assert');
const Subscription = require('../../../src/Subscription');
const DiscountInviter = require('../../../src/Schema/Discount/Inviter');
const Plan = require('../../../src/Plan');

describe('Discount/Inviter', function () {
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

    it('discountInviter build should return a correct amount when there are less than 5 users verified', function () {
        const users = [{
            _id: 1,
            isVerified: true
        }, {
            _id: 2,
            isVerified: true
        }, {
            _id: 3,
            isVerified: true
        }, {
            _id: 4,
            isVerified: false
        }];

        const discountTitle = "Test DiscountInviter";

        const expected = {
            users: users.map(user => {
                return { userId: user._id, isVerified: user.isVerified }
            }),
            percent: 60,
            amount: (this.subscription.price * 0.6).toFixed(2),
            __t: 'DiscountInviter',
            name: discountTitle,
        };

        assert.deepEqual(DiscountInviter.build(this.subscription, discountTitle, users), expected);
    });

    it('discountInviter build should return the price as an amount when there are 5 users verified', function () {
        const users = [{
            _id: 1,
            isVerified: true
        }, {
            _id: 2,
            isVerified: true
        }, {
            _id: 3,
            isVerified: true
        }, {
            _id: 4,
            isVerified: true
        }, {
            _id: 4,
            isVerified: true
        }];

        const discountTitle = "Test DiscountInviter";

        const expected = {
            users: users.map(user => {
                return { userId: user._id, isVerified: user.isVerified }
            }),
            percent: 100,
            amount: this.subscription.price.toFixed(2),
            __t: 'DiscountInviter',
            name: discountTitle,
        };

        assert.deepEqual(DiscountInviter.build(this.subscription, discountTitle, users), expected);
    });

    it('discountInviter build should return the full price when there are 0 users', function () {
        const users = [];

        const discountTitle = "Test DiscountInviter";

        assert.deepEqual(DiscountInviter.build(this.subscription, discountTitle, users), undefined);
    });
});
