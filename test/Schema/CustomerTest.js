'use strict';

const assert = require('assert');
const sinon = require('sinon');
const database = require('../database');
const main = require('../../src');
const NullProcessor = main.NullProcessor;
const Customer = main.Customer;
const assign = require('lodash/fp/assign');

describe('Customer', database([Customer], function () {
    beforeEach(function () {
        this.plan = {
            processorId: 'id-plan',
            price: 4,
            billingFrequency: 3,
            level: 2,
        };

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
                    paidThroughDate: '2017-03-03',
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

    changeSets.forEach(function (test) {
        it(`Should be process changes for ${test.name}`, function () {
            return this.customer.save()
                .then((customer) => {
                    Object.assign(customer, test.customer);
                    Object.assign(customer.addresses[0], test.address);
                    Object.assign(customer.paymentMethods[0], test.payment);
                    Object.assign(customer.subscriptions[0], test.sub);
                    customer.markChanged();

                    assert.equal(customer.processor.state, test.expected.customer ? 'changed' : 'saved');
                    assert.equal(customer.addresses[0].processor.state, test.expected.address ? 'changed' : 'saved');
                    assert.equal(customer.paymentMethods[0].processor.state, test.expected.payment ? 'changed' : 'saved');
                    assert.equal(customer.subscriptions[0].processor.state, test.expected.sub ? 'changed' : 'saved');
                });
        });
    });

    it('Should correctly apply saveProcessor', function () {
        const markChangedSpy = sinon.spy(this.customer, 'markChanged');
        const spy = sinon.stub(this.processor, 'save').resolves(this.customer);

        return this.customer.save()
            .then(customer => customer.saveProcessor(this.processor))
            .then(customer => {
                assert.equal(customer, this.customer);
                sinon.assert.calledOnce(markChangedSpy);
                sinon.assert.calledOnce(spy);
                sinon.assert.calledWith(spy, this.customer);
            })
    });

    it('Should correctly apply cancelProcessor', function () {
        const spy = sinon.stub(this.processor, 'cancelSubscription').resolves(this.customer);

        return this.customer.save()
            .then(customer => customer.cancelProcessor(this.processor, 'sub-id'))
            .then(customer => {
                assert.equal(customer, this.customer);
                sinon.assert.calledOnce(spy);
                sinon.assert.calledWith(spy, this.customer, 'sub-id');
            })
    });

    it('Should correctly apply refundProcessor', function () {
        const spy = sinon.stub(this.processor, 'refundTransaction').resolves(this.customer);

        return this.customer.save()
            .then(customer => customer.refundProcessor(this.processor, 'transaction-id', 123))
            .then(customer => {
                assert.equal(customer, this.customer);
                sinon.assert.calledOnce(spy);
                sinon.assert.calledWith(spy, this.customer, 'transaction-id', 123);
            })
    });

    it('Should correctly apply loadProcessor', function () {
        const spy = sinon.stub(this.processor, 'load').resolves(this.customer);

        return this.customer.save()
            .then(customer => customer.loadProcessor(this.processor))
            .then(customer => {
                assert.equal(customer, this.customer);
                sinon.assert.calledOnce(spy);
                sinon.assert.calledWith(spy, this.customer);
            })
    });

    const activeSubs = [
        {
            name: 'Only one sub',
            subs: [{ id: 1, level: 2, status: 'Active', isTrial: false, paidThroughDate: '2017-02-02'}],
            expectedActive: [1],
            expectedValid: [1],
            expectedValidNonTrial: [1],
            expectedSubscription: 1,
        },
        {
            name: 'With expired sub',
            subs: [{ id: 1, level: 2, status: 'Active', isTrial: false, paidThroughDate: '2017-01-01'}],
            expectedActive: [],
            expectedValid: [],
            expectedValidNonTrial: [],
            expectedSubscription: null,
        },
        {
            name: 'With non-active sub',
            subs: [{ id: 1, level: 2, status: 'Past Due', isTrial: false, paidThroughDate: '2017-02-02'}],
            expectedActive: [],
            expectedValid: [1],
            expectedValidNonTrial: [1],
            expectedSubscription: 1,
        },
        {
            name: 'Valid but not active sub, no expired',
            subs: [
                { id: 2, level: 1, status: 'Active', isTrial: false, paidThroughDate: '2017-01-01'},
                { id: 3, level: 2, status: 'Active', isTrial: true, paidThroughDate: '2017-02-02'},
                { id: 1, level: 3, status: 'Past Due', isTrial: false, paidThroughDate: '2017-02-02'},
            ],
            expectedActive: [3],
            expectedValid: [1, 3],
            expectedValidNonTrial: [1],
            expectedSubscription: 1,
        },
        {
            name: 'Correct level order',
            subs: [
                { id: 3, level: 3, status: 'Active', isTrial: true, paidThroughDate: '2017-02-02'},
                { id: 1, level: 1, status: 'Active', isTrial: false, paidThroughDate: '2017-03-02'},
                { id: 2, level: 2, status: 'Active', isTrial: false, paidThroughDate: '2017-02-02'},
            ],
            expectedActive: [3, 2, 1],
            expectedValid: [3, 2, 1],
            expectedValidNonTrial: [1, 2],
            expectedSubscription: 3,
        },
    ];

    activeSubs.forEach(function (test) {
        it(`Should get active subscriptions for ${test.name}`, function () {
            this.customer.subscriptions = test.subs.map(sub => {
                return {
                    _id: sub.id,
                    plan: {
                        processorId: `plan-${sub.id}`,
                        price: 5,
                        billingFrequency: 1,
                        level: sub.level,
                    },
                    isTrial: sub.isTrial,
                    status: sub.status,
                    paidThroughDate: sub.paidThroughDate,
                    processor: { id: `sub-${sub.id}`, state: 'saved' },
                    paymentMethodId: 'three',
                };
            });

            return this.customer.save()
                .then((customer) => {
                    const nowDate = new Date('2017-01-10');
                    const active = customer.activeSubscriptions(nowDate);
                    const valid = customer.validSubscriptions(nowDate)
                    const validNonTrial = customer.validNonTrialSubscriptions(nowDate)
                    const subscription = customer.subscription(nowDate);

                    assert.deepEqual(
                        active.map(sub => sub._id),
                        test.expectedActive,
                        'Should have correct activeSubscriptions'
                    );
                    assert.deepEqual(
                        valid.map(sub => sub._id),
                        test.expectedValid,
                        'Should have correct validSubscriptions'
                    );
                    assert.deepEqual(
                        validNonTrial.map(sub => sub._id),
                        test.expectedValidNonTrial,
                        'Should have correct validNonTrialSubscriptions'
                    );
                    assert.equal(
                        subscription && subscription._id,
                        test.expectedSubscription,
                        'Should have correct subscription'
                    );
                });
        });
    });

    const newSubscriptionStartDate = [
        {
            name: 'the plan with matching level',
            subs: [
                { paidThroughDate: '2017-04-06', status: 'Active', isTrial: false, level: 1 },
                { paidThroughDate: '2017-03-06', status: 'Active', isTrial: true, level: 2 },
                { paidThroughDate: '2017-03-05', status: 'Active', isTrial: false, level: 3 },
                { paidThroughDate: '2017-02-10', status: 'Active', isTrial: false, level: 2 },
                { paidThroughDate: '2017-02-10', status: 'Canceled', isTrial: false, level: 3 },
            ],
            plan: {
                processorId: 'p-3',
                price: 10,
                level: 2,
            },
            expected: new Date('2017-03-05'),
        },
        {
            name: 'no valid sub matches plan',
            subs: [
                { paidThroughDate: '2017-04-06', status: 'Active', isTrial: false, level: 1 },
                { paidThroughDate: '2017-01-05', status: 'Active', isTrial: false, level: 2 },
            ],
            plan: {
                processorId: 'p-3',
                price: 10,
                level: 2,
            },
            expected: undefined,
        },
    ];

    newSubscriptionStartDate.forEach(test => {
        it(`Should get the firstBillingDate for ${test.name}`, function () {
            const nowDate = new Date('2017-01-10');

            this.customer.subscriptions = test.subs.map(sub => {
                return {
                    _id: sub._id,
                    plan: {
                        price: 10,
                        processorId: `p-${sub._id}`,
                        level: sub.level,
                    },
                    isTrial: sub.isTrial,
                    processor: { id: sub._id, state: 'saved' },
                    status: sub.status,
                    paidThroughDate: sub.paidThroughDate,
                    paymentMethodId: 'three',
                };
            });

            const firstBillingDate = this.customer.newSubscriptionStartDate(test.plan, nowDate);
            assert.deepEqual(firstBillingDate, test.expected);
        });
    });

    it('Should subscribe to new plan', function () {
        const nowDate = new Date('2017-01-10');

        const addressData = {
            company: 'Example company 2',
            name: 'Pesho Peshev Stoevski 2',
            country: 'BG',
            locality: 'Sofia',
            streetAddress: 'Tsarigradsko Shose 5',
            extendedAddress: 'floor 4',
            postalCode: '1000',
        };

        const plan = {
            price: 10,
            processorId: '2',
            level: 2,
        };

        return this.customer.save()
            .then(customer => {
                return Customer.findById(customer._id);
            })
            .then(customer => {
                customer.subscribeToPlan(plan, 'nonce-test', addressData, nowDate);

                sinon.assert.match(customer.addresses[1], addressData);
                sinon.assert.match(customer.subscriptions[1].plan, plan);
                sinon.assert.match(customer.subscriptions[1].firstBillingDate, new Date('2017-03-03'));

                assert.equal(
                    customer.subscriptions[1].paymentMethodId,
                    customer.paymentMethods[1]._id
                );

                assert.equal(
                    customer.paymentMethods[1].billingAddressId,
                    customer.addresses[1]._id
                );
            })
    });
}));
