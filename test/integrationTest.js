'use strict';

const assert = require('assert');
const sinon = require('sinon');
const braintree = require('braintree');
const database = require('./database');
const gateway = require('./gateway');
const Schema = require('mongoose').Schema;
const Customer = require('../src/Customer');
const DiscountCoupon = require('../src/Schema/Discount/Coupon');
const Plan = require('../src/Plan');
const Coupon = require('../src/Coupon');
const BraintreeProcessor = require('../src/braintree/processor')
const processor = new BraintreeProcessor(gateway);

// processor.on('event', (name, data) => {
//     console.log(name, data);
// })

describe('Customer', database([Customer, Plan, Coupon], function () {
    it('Should be able to instantiate a Customer', function () {
        this.timeout(160000);

        let plan = null;
        let coupon = null;

        return Plan.sync(processor)
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
                    });
            });
    });
}));
