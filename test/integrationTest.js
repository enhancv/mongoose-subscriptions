'use strict';

const assert = require('assert');
const sinon = require('sinon');
const braintree = require('braintree');
const database = require('./database');
const gateway = require('./gateway');
const Schema = require('mongoose').Schema;
const Customer = require('../src/Customer');
const DiscountSchema = require('../src/Schema/Discount');
const Plan = require('../src/Plan');
const BraintreeProcessor = require('../src/braintree/processor')
const processor = new BraintreeProcessor(gateway);

describe('Customer', database([Customer, Plan], function () {
    it('Should be able to instantiate a Customer', function () {
        this.timeout(160000);

        return Plan.sync(processor).then(plans => {
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
                        plan: plans[1],
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

            return customer.save()
                .then(customer => customer.saveProcessor(processor))
                .then(customer => {
                    const customerObject = customer.toObject();
                    const subscriptionObject = customerObject.subscriptions[0];
                    const paymentMethodObject = customerObject.paymentMethods[0];
                    const addressObject = customerObject.addresses[0];
                    const transactionObject = customerObject.transactions[0];

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
                            }
                        }
                    );

                    sinon.assert.match(
                        paymentMethodObject,
                        {
                            updatedAt: sinon.match.date,
                            createdAt: sinon.match.date,
                            kind: 'CreditCard',
                            _id: 'three',
                            nonce: sinon.match.falsy,
                            billingAddressId: 'one',
                            processor: {
                                id: sinon.match.string,
                                state: 'saved',
                            }
                        }
                    );

                    sinon.assert.match(
                        subscriptionObject,
                        {
                            nextBillingDate: sinon.match.date,
                            firstBillingDate: sinon.match.date,
                            descriptor: {
                                name: 'Enhancv*Pro Plan',
                                phone: '0888415433',
                                url: 'enhancv.com',
                            },
                            paidThroughDate: sinon.match.date,
                            planProcessorId: 'monthly',
                            _id: 'four',
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
                            status: 'Active',
                            paymentMethodId: 'three',
                            discounts: [],
                            processor: {
                                id: sinon.match.string,
                                state: 'saved',
                            }
                        }
                    );

                    sinon.assert.match(
                        transactionObject,
                        {
                            _id: sinon.match.string,
                            amount: 14.9,
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
                            kind: 'TransactionCreditCard',
                            statusHistory: [
                                { timestamp: sinon.match.date, status: 'authorized' },
                                { timestamp: sinon.match.date, status: 'submitted_for_settlement' },
                            ],
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
