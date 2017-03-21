'use strict';

const assert = require('assert');
const sinon = require('sinon');
const database = require('../database');
const mongoose = require('mongoose');
const braintree = require('braintree');
const Plan = require('../../src/Plan');
const Customer = require('../../src/Customer');
const ProcessorItem = require('../../src/Schema/ProcessorItem');
const subscriptionProcessor = require('../../src/braintree/subscriptionProcessor');

describe('subscriptionProcessor', database([Customer, Plan], function () {

    beforeEach(function () {
        this.subscriptionResult = {
            success: true,
            subscription: {
                addOns: [],
                balance: "0.00",
                billingDayOfMonth: 29,
                billingPeriodEndDate: "2016-10-28",
                billingPeriodStartDate: "2016-09-29",
                createdAt: "2016-09-29T16:12:26Z",
                updatedAt: "2016-09-30T12:25:18Z",
                currentBillingCycle: 1,
                daysPastDue: null,
                discounts: [
                    {
                        amount: "0.00",
                        currentBillingCycle: 1,
                        id: "DiscountAmount",
                        name: "Signup promocode",
                        neverExpires: false,
                        numberOfBillingCycles: 1,
                        quantity: 1,
                    },
                ],
                "statusHistory" : [
                    {
                        "timestamp" : "2016-11-02T18:30:25Z",
                        "status" : "Canceled",
                        "user" : "kerin@enhancv.com",
                        "subscriptionSource" : "api",
                        "balance" : "0.00",
                        "price" : "14.90",
                        "currencyIsoCode" : "USD",
                        "planId" : "monthly"
                    },
                    {
                        "timestamp" : "2016-10-05T11:37:40Z",
                        "status" : "Active",
                        "user" : null,
                        "subscriptionSource" : "recurring",
                        "balance" : "0.00",
                        "price" : "14.90",
                        "currencyIsoCode" : "USD",
                        "planId" : "monthly"
                    },
                ],
                failureCount: 0,
                firstBillingDate: "2016-09-29",
                id: "gzsxjb",
                merchantAccountId: "enhancvUSD",
                neverExpires: true,
                nextBillAmount: "14.90",
                nextBillingPeriodAmount: "14.90",
                nextBillingDate: "2016-10-29",
                numberOfBillingCycles: null,
                paidThroughDate: "2016-10-28",
                paymentMethodToken: "gpjt3m",
                planId: "monthly",
                price: "14.90",
                status: "Active",
                trialDuration: null,
                trialDurationUnit: null,
                trialPeriod: false,
                descriptor: {
                    name: "Enhancv*Pro Plan",
                    phone: "0888415433",
                    url: "enhancv.com",
                },
            }
        };

        this.plan = new Plan({
            processor: { id: 'test1', state: 'saved' },
            name: 'Test',
            price: 12,
            currency: 'USD',
            billingFrequency: 1,
        });

        this.customer = new Customer({
            name: 'Pesho',
            email: 'seer@example.com',
            ipAddress: '10.0.0.2',
            processor: { id: '64601260', state: 'saved' },
            defaultPaymentMethodId: 'three',
            addresses: [
                {
                    _id: 'one',
                    processor: { id: 'fc', state: 'saved' },
                    firstName: 'Pesho', lastName: 'Stanchev',
                },
            ],
            paymentMethods: [
                {
                    _id: 'three',
                    __t: 'CreditCard',
                    billingAddressId: 'one',
                    processor: { id: 'gpjt3m', state: 'saved' },
                },
            ],
            subscriptions: [
                {
                    _id: 'four',
                    plan: this.plan,
                    status: 'Active',
                    descriptor: {
                        name: 'Tst*Mytest',
                        phone: 8899039032,
                        url: 'example.com',
                    },
                    discounts: [
                        {
                            processor: {
                                id: 'DiscountAmount',
                                state: 'saved',
                            },
                            __t: 'DiscountAmount',
                            amount: 20,
                            numberOfBillingCycles: 2,
                            name: 'Test',
                        },
                        {
                            processor: {},
                            __t: 'DiscountPercent',
                            amount: 10,
                            percent: 20,
                            numberOfBillingCycles: 1,
                            name: 'Test',
                        },
                    ],
                    paymentMethodId: 'three',
                    processor: { id: 'gzsxjb', state: 'saved' },
                },
            ]
        });
    });

    it('processorFieldsDiscounts when deleting', function () {
        const originalDiscounts = [{
            processor: { id: 'DiscountAmount', state: 'saved' },
            __t: 'DiscountAmount',
            amount: 10,
            numberOfBillingCycles: 1,
            name: 'Test',
        }];

        const discounts = [];
        const expected = {
            remove: [ 'DiscountAmount' ]
        };

        assert.deepEqual(subscriptionProcessor.processorFieldsDiscounts(originalDiscounts, discounts), expected);
    });

    it('processorFieldsDiscounts when adding', function () {
        const originalDiscounts = [];

        const newDiscount = {
            processor: {},
            __t: 'DiscountAmount',
            numberOfBillingCycles: 1,
            amount: 20,
            name: 'Test2',
        }

        const discounts = originalDiscounts.concat([newDiscount]);
        const expected = {
            add: [
                {
                    inheritedFromId: 'DiscountAmount',
                    amount: 20,
                    numberOfBillingCycles: 1
                }
            ],
        };

        assert.deepEqual(subscriptionProcessor.processorFieldsDiscounts(originalDiscounts, discounts), expected);
    });

    it('processorFieldsDiscounts when updating', function () {
        const originalDiscounts = [{
            processor: { id: 'DiscountAmount', state: 'saved' },
            __t: 'DiscountAmount',
            amount: 10,
            numberOfBillingCycles: 1,
            name: 'Test',
        }];

        const discounts = [{
            processor: { id: 'DiscountAmount', state: 'saved' },
            __t: 'DiscountAmount',
            amount: 20,
            numberOfBillingCycles: 2,
            name: 'Test',
        }];

        const expected = {
            update: [
                {
                    existingId: 'DiscountAmount',
                    amount: 20,
                    numberOfBillingCycles: 2
                }
            ],
        };

        assert.deepEqual(subscriptionProcessor.processorFieldsDiscounts(originalDiscounts, discounts), expected);
    });

    it('processorFieldsDiscounts when modifing everything', function () {
        const originalDiscounts = [
            {
                processor: { id: 'DiscountAmount', state: 'saved' },
                __t: 'DiscountAmount',
                amount: 10,
                numberOfBillingCycles: 1,
                name: 'Test',
            },
            {
                processor: { id: 'PercentDiscount', state: 'saved' },
                __t: 'PercentDiscount',
                amount: 7,
                percent: 5,
                numberOfBillingCycles: 1,
                name: 'Test 2',
            }
        ];

        const discounts = [
            {
                processor: { id: 'DiscountAmount', state: 'saved' },
                __t: 'DiscountAmount',
                amount: 20,
                numberOfBillingCycles: 2,
                name: 'Test',
            },
            {
                processor: {},
                __t: 'DiscountCoupon',
                amount: 20,
                coupon: 'test',
                numberOfBillingCycles: 1,
                name: 'Test',
            },
        ];

        const expected = {
            update: [
                {
                    existingId: 'DiscountAmount',
                    amount: 20,
                    numberOfBillingCycles: 2
                }
            ],
            add: [
                {
                    inheritedFromId: 'DiscountCoupon',
                    amount: 20,
                    numberOfBillingCycles: 1
                }
            ],
            remove: ['PercentDiscount'],
        };

        assert.deepEqual(subscriptionProcessor.processorFieldsDiscounts(originalDiscounts, discounts), expected);
    });

    it('processorFields should map models to braintree data', function () {
        return this.customer.save().then(customer => {
            const fields = subscriptionProcessor.processorFields(customer, customer.subscriptions[0]);

            const expected = {
                planId: 'test1',
                paymentMethodToken: 'gpjt3m',
                descriptor: {
                    name: 'Tst*Mytest',
                    phone: '8899039032',
                    url: 'example.com',
                },
                discounts: {
                    update: [
                        {
                            existingId: 'DiscountAmount',
                            amount: 20,
                            numberOfBillingCycles: 2,
                        },
                    ],
                    add: [
                        {
                            inheritedFromId: 'DiscountPercent',
                            amount: 10,
                            numberOfBillingCycles: 1,
                        },
                    ],
                }
            };

            assert.deepEqual(fields, expected);
        });
    });

    it('fieldsDiscounts should map resul data into discount models', function () {
        const originalDiscounts = [
            {
                processor: { id: 'DiscountAmount', state: 'saved' },
                __t: 'DiscountAmount',
                amount: 20,
                numberOfBillingCycles: 2,
                name: 'Test',
            },
            {
                processor: {},
                __t: 'DiscountCoupon',
                amount: 20,
                coupon: 'test',
                numberOfBillingCycles: 1,
                name: 'Test',
            },
        ];

        const resultDiscounts = [
            {
                amount: "12.00",
                currentBillingCycle: 1,
                id: "DiscountAmount",
                name: "Signup promocode",
                neverExpires: false,
                numberOfBillingCycles: 1,
                quantity: 1,
            },
            {
                amount: "15.00",
                currentBillingCycle: 1,
                id: "DiscountCoupon",
                name: "Signup promocode 2",
                neverExpires: false,
                numberOfBillingCycles: 1,
                quantity: 1,
            },
            {
                amount: "2.00",
                currentBillingCycle: 1,
                id: "DiscountPercent",
                name: "Signup promocode",
                neverExpires: false,
                numberOfBillingCycles: 1,
                quantity: 1,
            },
        ];

        const expected = [
            {
                processor: { id: 'DiscountAmount', state: 'saved' },
                __t: 'DiscountAmount',
                amount: 20,
                numberOfBillingCycles: 2,
                name: 'Test',
            },
            {
                processor: { id: 'DiscountCoupon', state: 'saved' },
                __t: 'DiscountCoupon',
                amount: 20,
                coupon: 'test',
                numberOfBillingCycles: 1,
                name: 'Test',
            },
            {
                processor: { id: 'DiscountPercent', state: 'saved' },
                __t: 'DiscountAmount',
                amount: '2.00',
                numberOfBillingCycles: 1,
            },
        ];

        const fields = subscriptionProcessor.fieldsDiscounts(originalDiscounts, resultDiscounts);

        assert.deepEqual(fields, expected);
    });

    it('fields should map result data into a model', function () {
        const originalDiscounts = [
            {
                processor: {},
                __t: 'DiscountAmount',
                amount: 20,
                numberOfBillingCycles: 2,
                name: 'Test',
            }
        ];

        const fields = subscriptionProcessor.fields(this.customer, originalDiscounts, this.subscriptionResult.subscription);

        const expected = {
            processor: { id: 'gzsxjb', state: 'saved' },
            discounts:
            [
                {
                    processor: { id: 'DiscountAmount', state: 'saved' },
                    __t: 'DiscountAmount',
                    amount: 20,
                    numberOfBillingCycles: 2,
                    name: 'Test'
                }
            ],
            price: 14.9,
            planProcessorId: 'monthly',
            createdAt: '2016-09-29T16:12:26Z',
            updatedAt: '2016-09-30T12:25:18Z',
            paidThroughDate: '2016-10-28',
            paymentMethodId: 'three',
            descriptor: {
                name: 'Enhancv*Pro Plan',
                phone: '0888415433',
                url: 'enhancv.com'
            },
            status: 'Active',
            statusHistory: [
                {
                    timestamp: "2016-11-02T18:30:25Z",
                    status: "Canceled",
                },
                {
                    timestamp: "2016-10-05T11:37:40Z",
                    status: "Active",
                },
            ],
            firstBillingDate: '2016-09-29',
            nextBillingDate: '2016-10-29',
        };

        assert.deepEqual(fields, expected);
    });

    it('save should call create endpoint on new subscription', function () {
        const gateway = {
            subscription: {
                create: sinon.stub().callsArgWith(1, null, this.subscriptionResult),
            },
        };
        const processor = {
            gateway: gateway,
            emit: sinon.spy(),
        };

        this.customer.subscriptions[0].processor = { id: null, state: ProcessorItem.INITIAL };

        return this.customer
            .save()
            .then(customer => subscriptionProcessor.save(processor, customer, customer.subscriptions[0]))
            .then(customer => {
                const subscription = this.customer.subscriptions[0];

                sinon.assert.calledWith(processor.emit, 'event', sinon.match.has('name', 'subscription').and(sinon.match.has('action', 'saved')));
                sinon.assert.calledOnce(gateway.subscription.create);
                assert.deepEqual(subscription.processor.toObject(), { id: 'gzsxjb', state: 'saved' });
            });
    });

    it('save should call update endpoint on existing subscription', function () {
        const gateway = {
            subscription: {
                update: sinon.stub().callsArgWith(2, null, this.subscriptionResult),
            },
        };
        const processor = {
            gateway: gateway,
            emit: sinon.spy(),
        };

        this.customer.subscriptions[0].processor.state = ProcessorItem.CHANGED;

        return this.customer
            .save()
            .then(customer => subscriptionProcessor.save(processor, customer, customer.subscriptions[0]))
            .then(customer => {
                const subscription = this.customer.subscriptions[0];

                sinon.assert.calledWith(processor.emit, 'event', sinon.match.has('name', 'subscription').and(sinon.match.has('action', 'saved')));
                sinon.assert.calledWith(gateway.subscription.update, 'gzsxjb');
                assert.deepEqual(new Date("2016-10-28"), subscription.paidThroughDate);
            });
    });

    it('save should send a rejection on api error', function () {
        const apiError = new Error('error');

        const gateway = {
            subscription: {
                update: sinon.stub().callsArgWith(2, apiError),
            },
        };
        const processor = {
            gateway: gateway,
            emit: sinon.spy(),
        };

        this.customer.subscriptions[0].processor.state = ProcessorItem.CHANGED;

        return this.customer
            .save()
            .then(customer => subscriptionProcessor.save(processor, customer, customer.subscriptions[0]))
            .catch(error => {
                sinon.assert.neverCalledWith(processor.emit, 'event', sinon.match.has('action', 'saved'));
                assert.equal(error, apiError);
            });
    });

    it('save should send a rejection on api result failure', function () {
        const gateway = {
            subscription: {
                update: sinon.stub().callsArgWith(2, null, { success: false, message: 'some error' }),
            },
        };
        const processor = {
            gateway: gateway,
            emit: sinon.spy(),
        };

        this.customer.subscriptions[0].processor.state = ProcessorItem.CHANGED;

        return this.customer
            .save()
            .then(customer => subscriptionProcessor.save(processor, customer, customer.subscriptions[0]))
            .catch(error => {
                sinon.assert.neverCalledWith(processor.emit, 'event', sinon.match.has('action', 'saved'));
                assert.equal(error.message, 'some error');
            });
    });
}));
