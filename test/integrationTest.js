'use strict';

const assert = require('assert');
const sinon = require('sinon');
const database = require('./database');
const main = require('../src');
const NullProcessor = require('../src/NullProcessor');

describe('Customer Integration', database([Customer, Plan, Coupon], function () {
    it('Should be able to instantiate a Customer', function () {
        let plan = null;
        let coupon = null;

        const processor = sinon.stub(new NullProcessor());
        const newPlan = new Plan({
            name: 'Test',
            processor: {
                id: 'test-plan-id',
                state: 'saved',
            },
            currency: 'USD',
            description: 'Test Descr',
            createdAt: '2017-02-02',
            updatedAt: '2017-03-02',
            billingFrequency: 3,
            level: 1,
        });

        const existingPlan = new Plan({
            name: 'Test',
            processor: {
                id: 'test-plan-id',
                state: 'saved',
            },
            currency: 'USD',
            description: 'Test Descr',
            createdAt: '2017-02-02',
            updatedAt: '2017-03-02',
            billingFrequency: 3,
            level: 1,
        });

        processor.plans.resolves([testPlan])

        return Plan.loadProcessor(processor)
            .then(plans => {
                plan = plans[1];

                coupon = new Coupon.CouponPercent({
                    name: 'Testing JKALSD',
                    numberOfBillingCycles: 2,
                    description: 'For testing purposes',
                    percent: '10',
                    usedCountMax: 2,
                });

                return coupon.save();
            }).then(testingCoupon => {
                coupon = testingCoupon;

                const customer = new Customer({
                    name: 'Pesho Peshev',
                    phone: '+35988911111',
                    email: 'seer@example.com',
                    ipAddress: '10.0.0.2',
                    defaultPaymentMethodId: 'three',
                    addresses: [
                        {
                            _id: 'one',
                            company: 'Example company',
                            name: 'Pesho Peshev Stoevski',
                            country: 'BG',
                            locality: 'Sofia',
                            streetAddress: 'Tsarigradsko Shose 4',
                            extendedAddress: 'floor 3',
                            postalCode: '1000',
                        },
                    ],
                    paymentMethods: [
                        {
                            _id: 'three',
                            nonce: 'fake-valid-no-billing-address-nonce',
                            billingAddressId: 'one',
                        },
                    ],
                    subscriptions: [
                        {
                            _id: 'four',
                            plan: plan,
                            status: 'Active',
                            descriptor: {
                                name: 'Enhancv*Pro Plan',
                                phone: '0888415433',
                                url: 'enhancv.com',
                            },
                            paymentMethodId: 'three',
                        },
                    ],
                });

                customer.subscriptions.id('four')
                    .addDiscounts(subscription => [DiscountCoupon.build(subscription, coupon)]);

                return customer.save()
                    .then(customer => customer.saveProcessor(processor))
                    .then(customer => {
                        const customerObject = customer;
                        const subscriptionObject = customerObject.subscriptions[0];
                        const discountObject = customerObject.subscriptions[0].discounts[0];
                        const paymentMethodObject = customerObject.paymentMethods[0];
                        const addressObject = customerObject.addresses[0];
                        const transactionObject = customerObject.transactions[0];
                        const transactionDiscountObject = customerObject.transactions[0].discounts[0];

                        sinon.assert.match(
                            customerObject,
                            {
                                phone: '+35988911111',
                                name: 'Pesho Peshev',
                                email: 'seer@example.com',
                                ipAddress: '10.0.0.2',
                                defaultPaymentMethodId: 'three',
                                processor: {
                                    id: sinon.match.string,
                                    state: 'saved',
                                },
                            }
                        );

                        sinon.assert.match(
                            addressObject,
                            {
                                updatedAt: sinon.match.date,
                                createdAt: sinon.match.date,
                                _id: 'one',
                                company: 'Example company',
                                name: 'Pesho Peshev Stoevski',
                                country: 'BG',
                                locality: 'Sofia',
                                streetAddress: 'Tsarigradsko Shose 4',
                                extendedAddress: 'floor 3',
                                postalCode: '1000',
                                processor: {
                                    id: sinon.match.string,
                                    state: 'saved',
                                },
                            }
                        );

                        sinon.assert.match(
                            paymentMethodObject,
                            {
                                updatedAt: sinon.match.date,
                                createdAt: sinon.match.date,
                                __t: 'CreditCard',
                                _id: 'three',
                                nonce: sinon.match.falsy,
                                billingAddressId: 'one',
                                processor: {
                                    id: sinon.match.string,
                                    state: 'saved',
                                },
                            }
                        );

                        sinon.assert.match(
                            subscriptionObject,
                            {
                                _id: 'four',
                                descriptor: {
                                    name: 'Enhancv*Pro Plan',
                                    phone: '0888415433',
                                    url: 'enhancv.com',
                                },
                                firstBillingDate: sinon.match.date,
                                nextBillingDate: sinon.match.date,
                                paidThroughDate: sinon.match.date,
                                paymentMethodId: 'three',
                                plan: {
                                    name: 'Monthly',
                                    price: 14.9,
                                    currency: 'USD',
                                    description: '',
                                    createdAt: sinon.match.date,
                                    updatedAt: sinon.match.date,
                                    billingFrequency: 1,
                                    level: 1,
                                    processor: {
                                        id: 'monthly',
                                        state: 'saved',
                                    },
                                },
                                planProcessorId: 'monthly',
                                price: 14.9,
                                processor: {
                                    id: sinon.match.string,
                                    state: 'saved',
                                },
                                status: 'Active',
                            }
                        );

                        sinon.assert.match(
                            discountObject,
                            {
                                __t: "DiscountCoupon",
                                amount: 1.49,
                                coupon: {
                                    __t: "CouponPercent",
                                    description: "For testing purposes",
                                    name: "Testing JKALSD",
                                    numberOfBillingCycles: 2,
                                    percent: 10,
                                    usedCount: 1,
                                    usedCountMax: 2
                                },
                                group: "General",
                                name: "Testing JKALSD",
                                numberOfBillingCycles: 1,
                                processor: { id: "DiscountCoupon", state: "saved" }
                            }
                        );

                        sinon.assert.match(
                            transactionDiscountObject,
                            {
                                amount: 1.49,
                                __t: 'DiscountCoupon',
                                name: 'DiscountCoupon',
                            }
                        )

                        sinon.assert.match(
                            transactionObject,
                            {
                                _id: sinon.match.string,
                                amount: 13.41,
                                refundedTransactionId: null,
                                subscriptionId: 'four',
                                planProcessorId: 'monthly',
                                billing: {
                                    name: 'Pesho Peshev Stoevski',
                                    company: 'Example company',
                                    country: 'BG',
                                    locality: 'Sofia',
                                    streetAddress: 'Tsarigradsko Shose 4',
                                    extendedAddress: 'floor 3',
                                    postalCode: '1000'
                                },
                                customer: {
                                    phone: '+35988911111',
                                    name: 'Pesho Peshev',
                                    email: 'seer@example.com',
                                },
                                currency: 'USD',
                                status: 'submitted_for_settlement',
                                descriptor: {
                                    name: 'Enhancv*Pro Plan',
                                    phone: '0888415433',
                                    url: 'enhancv.com',
                                },
                                createdAt: sinon.match.date,
                                updatedAt: sinon.match.date,
                                __t: 'TransactionCreditCard',
                                processor: {
                                    id: sinon.match.string,
                                    state: 'saved',
                                }
                            }
                        );

                        return customer.cancelProcessor(processor, 'four');
                    })
                    .then(customer => {
                        const subscription = customer.subscriptions[0];
                        const transaction = customer.transactions[0];

                        assert.equal(subscription.status, 'Canceled');
                        assert.equal(subscription.statusHistory.length, 2);

                        sinon.assert.match(subscription.statusHistory[0], {
                            timestamp: sinon.match.date,
                            status: 'Canceled',
                        });

                        sinon.assert.match(subscription.statusHistory[1], {
                            timestamp: sinon.match.date,
                            status: 'Active',
                        });

                        return new Promise((resolve, reject) => {
                            gateway.testing.settle(transaction.processor.id, (err, settleResult) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    resolve(customer);
                                }
                            });
                        });
                    }).then(customer => {
                        const transaction = customer.transactions[0];
                        return customer.refundProcessor(processor, transaction._id, 3.5);
                    }).then(customer => {
                        const transactionRefund = customer.transactions[0];
                        const transactionOriginal = customer.transactions[1];

                        sinon.assert.match(
                            transactionRefund,
                            {
                                _id: sinon.match.string,
                                amount: 3.5,
                                refundedTransactionId: transactionOriginal._id,
                                subscriptionId: 'four',
                                planProcessorId: null,
                                billing: {
                                    name: 'Pesho Peshev Stoevski',
                                    company: 'Example company',
                                    country: 'BG',
                                    locality: 'Sofia',
                                    streetAddress: 'Tsarigradsko Shose 4',
                                    extendedAddress: 'floor 3',
                                    postalCode: '1000'
                                },
                                customer: {
                                    phone: '+35988911111',
                                    name: 'Pesho Peshev',
                                    email: 'seer@example.com',
                                },
                                currency: 'USD',
                                status: 'submitted_for_settlement',
                                createdAt: sinon.match.date,
                                updatedAt: sinon.match.date,
                                processor: {
                                    id: sinon.match.string,
                                    state: 'saved',
                                }
                            }
                        );

                        return customer.refundProcessor(processor, transactionOriginal._id);
                    }).then(customer => {
                        const transactionRefund = customer.transactions[0];
                        const transactionOriginal = customer.transactions[2];

                        sinon.assert.match(
                            transactionRefund,
                            {
                                _id: sinon.match.string,
                                amount: 9.91,
                                refundedTransactionId: transactionOriginal._id,
                                subscriptionId: 'four',
                                planProcessorId: null,
                                billing: {
                                    name: 'Pesho Peshev Stoevski',
                                    company: 'Example company',
                                    country: 'BG',
                                    locality: 'Sofia',
                                    streetAddress: 'Tsarigradsko Shose 4',
                                    extendedAddress: 'floor 3',
                                    postalCode: '1000'
                                },
                                customer: {
                                    phone: '+35988911111',
                                    name: 'Pesho Peshev',
                                    email: 'seer@example.com',
                                },
                                currency: 'USD',
                                status: 'submitted_for_settlement',
                                createdAt: sinon.match.date,
                                updatedAt: sinon.match.date,
                                processor: {
                                    id: sinon.match.string,
                                    state: 'saved',
                                }
                            }
                        );
                        originalCustomer = customer;
                        const newCustomer = new Customer({ processor: { id: customer.processor.id, state: 'saved' } });
                        return newCustomer.loadProcessor(processor);
                    }).then(newCustomer => {
                        assert.equal(newCustomer.paymentMethods[0].billingAddressId, newCustomer.addresses[0]._id);
                        assert.equal(newCustomer.subscriptions[0].paymentMethodId, newCustomer.paymentMethods[0]._id);
                        assert.equal(newCustomer.subscriptions[0].processor.id, originalCustomer.subscriptions[0].processor.id);
                        assert.equal(newCustomer.paymentMethods[0].processor.id, originalCustomer.paymentMethods[0].processor.id);

                        assert.deepEqual(
                            newCustomer.transactions.map(item => item._id),
                            originalCustomer.transactions.map(item => item._id),
                            'Should have the same transactions and in the same order'
                        );

                        const events = [
                            { name: 'plan', action: 'loading' },
                            { name: 'plan', action: 'loaded' },
                            { name: 'customer', action: 'creating' },
                            { name: 'customer', action: 'saved' },
                            { name: 'address', action: 'creating' },
                            { name: 'address', action: 'saved' },
                            { name: 'paymentMethod', action: 'creating' },
                            { name: 'paymentMethod', action: 'saved' },
                            { name: 'subscription', action: 'creating' },
                            { name: 'subscription', action: 'saved' },
                            { name: 'subscription', action: 'canceling' },
                            { name: 'subscription', action: 'canceled' },
                            { name: 'transaction', action: 'refund' },
                            { name: 'transaction', action: 'refund' },
                            { name: 'transaction', action: 'refund' },
                            { name: 'transaction', action: 'refund' },
                            { name: 'customer', action: 'loading' },
                            { name: 'customer', action: 'loaded' },
                        ];

                        events.forEach((event, index) => {
                            assert.ok(
                                eventSpy.getCall(index).calledWithMatch(event),
                                'Emmited event ' + event.name + ' with action ' + event.action + ' on call ' + index
                            );
                        })
                    });
            });
    });
}));
