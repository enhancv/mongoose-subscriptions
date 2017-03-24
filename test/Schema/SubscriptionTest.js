'use strict';

const mongoose = require('mongoose');
const assert = require('assert');
const main = require('../../src');
const SubscriptionSchema = main.Schema.Subscription;

describe('Subscription', function () {

    before(function () {
        this.SubscriptionTest = mongoose.model('SubscriptionTest', SubscriptionSchema);
    });

    it('addDiscounts', function () {
        const sub = new this.SubscriptionTest({
            _id: 'four',
            price: 20,
            plan: {
                name: 'New Test',
                processor: {
                    id: 'new-plan-id',
                    state: 'saved',
                },
                price: 20,
                currency: 'USD',
                description: 'Test Descr',
                createdAt: new Date('2017-02-02'),
                updatedAt: new Date('2017-03-02'),
                billingFrequency: 3,
                level: 2,
            },
            processor: { id: 'id-subscription', state: 'saved' },
            status: 'Active',
            discounts: [{
                __t: 'DiscountAmount',
                amount: 10,
            }],
            paidThroughDate: '2017-03-03',
            paymentMethodId: 'three',
        });

        sub.addDiscounts(subscription => {
            return [
                {
                    __t: 'DiscountPercent',
                    amount: 5,
                    percent: 25,
                }
            ];
        });

        assert.equal('DiscountAmount', sub.discounts[0].__t);

        sub.addDiscounts(subscription => {
            return [
                {
                    __t: 'DiscountPercent',
                    amount: 15,
                    percent: 75,
                }
            ];
        });

        assert.equal('DiscountPercent', sub.discounts[0].__t);
    });
});
