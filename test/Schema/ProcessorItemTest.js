'use strict';

const mongoose = require('mongoose');
const assert = require('assert');
const main = require('../../src');
const Plan = main.Plan;
const SubscriptionSchema = main.Schema.Subscription;
const ProcessorItem = main.Schema.ProcessorItem;

describe('ProcessorItem', function () {
    before(function() {
        this.SubscriptionTest = mongoose.model('SubscriptionTest', SubscriptionSchema);
        this.plan = new Plan({
            processor: { id: 'test1', state: 'saved' },
            name: 'Test',
            price: 19.90,
            currency: 'USD',
            billingFrequency: 1,
        });

        const processorIds = ['dasdsa', 'axcxas', 'acgers', 'potirt'];
        const subscriptions = [];

        processorIds.forEach((processorId, index) => {
            subscriptions.push(new this.SubscriptionTest({
                _id: 'four' + index,
                plan: this.plan,
                status: 'Active',
                descriptor: {
                    name: 'Tst*Mytest',
                    phone: 8899039032,
                    url: 'example.com',
                },
                price: 19.90,
                paymentMethodId: 'three',
                processor: { id: processorId, state: 'saved' },
            }));
        });

        this.subscriptions = subscriptions;
    });

    const errorTests = [{
        name: 'item processor is not present',
        fields: {
            _id: 'four',
            status: 'Active',
            descriptor: {
                name: 'Tst*Mytest',
                phone: 8899039032,
                url: 'example.com',
            },
            price: 19.90,
            paymentMethodId: 'three'
        },
        isValid: false
    }, {
        name: 'item processor id is not present',
        fields: {
            _id: 'four',
            status: 'Active',
            descriptor: {
                name: 'Tst*Mytest',
                phone: 8899039032,
                url: 'example.com',
            },
            price: 19.90,
            paymentMethodId: 'three',
            processor: { state: 'saved' }
        },
        isValid: false
    }, {
        name: 'item processor state is not saved',
        fields: {
            _id: 'four',
            status: 'Active',
            descriptor: {
                name: 'Tst*Mytest',
                phone: 8899039032,
                url: 'example.com',
            },
            price: 19.90,
            paymentMethodId: 'three',
            processor: { id: 'gzsxjb', state: 'initial' }
        },
        isValid: false
    }];

    errorTests.forEach(function(test) {
        it(`ProcessorItem validate should throw error when ${test.name}`, function () {
            const subscription = new this.SubscriptionTest(test.fields);
            subscription.plan = this.plan;

            assert.throws(function() { ProcessorItem.validateIsSaved(subscription, "Subscription Item test") }, Error);
        });
    });

    it('ProcessorItem validate should return the item when it is valid', function () {
        const subscription = this.subscriptions[0];

        assert.deepEqual(ProcessorItem.validateIsSaved(subscription, "Subscription Item test"), subscription);
    });

    it('ProcessorItem getId should return item id when there is such item', function() {
        const searchedProcessorId = 'dasdsa';

        assert.deepEqual(ProcessorItem.getId(searchedProcessorId, this.subscriptions), this.subscriptions[0]._id);
    });

    it('ProcessorItem getId should return null when there is no processorId provided', function() {
        const searchedProcessorId = 'dasdsa';

        assert.deepEqual(ProcessorItem.getId(undefined, this.subscriptions), null);
    });

    it('ProcessorItem getId should return null when there is no item with such processor', function() {
        const searchedProcessorId = 'no-such-id';

        assert.deepEqual(ProcessorItem.getId(searchedProcessorId, this.subscriptions), null);
    });
});
