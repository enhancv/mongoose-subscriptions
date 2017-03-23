'use strict';

const assert = require('assert');
const sinon = require('sinon');
const database = require('../database');
const main = require('../../src');
const NullProcessor = main.NullProcessor;
const Customer = main.Customer;
const Plan = main.Plan;
const assign = require('lodash/fp/assign');

describe('Customer', database([Customer], function () {
    beforeEach(function () {
        this.plan = new Plan({
            name: 'New Test',
            processor: { id: 'id-plan', state: 'saved' },
            price: 4,
            currency: 'USD',
            billingFrequency: 3,
            level: 2,
        });

        this.customer = new Customer({
            name: 'Pesho Peshev',
            phone: '+35988911111',
            email: 'seer@example.com',
            ipAddress: '10.0.0.2',
            defaultPaymentMethodId: 'three',
            processor: { id: 'id-customer', state: 'saved' },
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
                    processor: { id: 'id-address', state: 'saved' },
                },
            ],
            paymentMethods: [
                {
                    _id: 'three',
                    __t: 'PayPalAccount',
                    email: 'test@example.com',
                    processor: { id: 'id-paymentMethod', state: 'saved' },
                    billingAddressId: 'one',
                },
            ],
            subscriptions: [
                {
                    _id: 'four',
                    plan: this.plan,
                    processor: { id: 'id-subscription', state: 'saved' },
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

        this.processor = new NullProcessor();
    });

    const changeSets = [
        {
            name: 'only name',
            customer: { name: 'New name' },
            expected: { customer: true, address: false, payment: false, sub: false },
        },
        {
            name: 'only email',
            customer: { email: 'test@example.com' },
            expected: { customer: true, address: false, payment: false, sub: false },
        },
        {
            name: 'multiple fields',
            customer: { name: 'New name', email: 'test@example.com' },
            expected: { customer: true, address: false, payment: false, sub: false },
        },
        {
            name: 'same value',
            customer: { email: 'seer@example.com' },
            expected: { customer: false, address: false, payment: false, sub: false },
        },
        {
            name: 'only address',
            address: { company: 'test' },
            expected: { customer: false, address: true, payment: false, sub: false },
        },
        {
            name: 'only address but same value',
            address: { postalCode: '1000' },
            expected: { customer: false, address: false, payment: false, sub: false },
        },
        {
            name: 'only payment',
            payment: { email: 'other@example.com' },
            expected: { customer: false, address: false, payment: true, sub: false },
        },
        {
            name: 'only subscription',
            sub: { paymentMethodId: 'other' },
            expected: { customer: false, address: false, payment: false, sub: true },
        },
    ];

    changeSets.forEach(function (change) {
        it(`Should be process changes for ${change.name}`, function () {
            return this.customer.save()
                .then((customer) => {
                    Object.assign(customer, change.customer);
                    Object.assign(customer.addresses[0], change.address);
                    Object.assign(customer.paymentMethods[0], change.payment);
                    Object.assign(customer.subscriptions[0], change.sub);
                    customer.markChanged();

                    assert.equal(customer.processor.state, change.expected.customer ? 'changed' : 'saved');
                    assert.equal(customer.addresses[0].processor.state, change.expected.address ? 'changed' : 'saved');
                    assert.equal(customer.paymentMethods[0].processor.state, change.expected.payment ? 'changed' : 'saved');
                    assert.equal(customer.subscriptions[0].processor.state, change.expected.sub ? 'changed' : 'saved');
                });
        });
    });
}));
