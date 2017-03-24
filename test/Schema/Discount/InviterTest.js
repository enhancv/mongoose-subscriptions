'use strict';

const mongoose = require('mongoose');
const assert = require('assert');
const main = require('../../../src');
const Plan = main.Plan;
const DiscountInviter = main.Schema.Discount.DiscountInviter;
const SubscriptionSchema = main.Schema.Subscription;

describe('Schema/Discount/Inviter', function () {
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
            name: '3 verified',
            users: [{
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
            }],
            expected: { percent: 60 }
        }, {
            name: '5 verified',
            users: [{
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
                _id: 5,
                isVerified: true
            }],
            expected: { percent: 100 }
        }, {
            name: '7 verified',
            users: [{
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
                _id: 5,
                isVerified: true
            }, {
                _id: 6,
                isVerified: true
            }, {
                _id: 7,
                isVerified: true
            }],
            expected: { percent: 100 }
        }
    ];

    fields.forEach(function (test) {
        it(`DiscountInviter should return correct percent when there are ${test.name}`, function () {
            const result = DiscountInviter.build(this.subscription, "Inviter Test", test.users);

            assert.deepEqual(result.percent, test.expected.percent);
        });
    });
});
