"use strict";

const assert = require("assert");
const sinon = require("sinon");
const database = require("../database");
const main = require("../../src");
const NullProcessor = main.NullProcessor;
const Customer = main.Customer;
const assign = require("lodash/fp/assign");
const pick = require("lodash/fp/pick");
const initializeSubscriptionDates = require("../initializeSubscriptionDates");

describe(
    "Customer",
    database([Customer], function() {
        beforeEach(function() {
            this.plan = {
                processorId: "id-plan",
                price: 4,
                billingFrequency: 3,
                level: 2,
            };

            this.customer = new Customer({
                name: "Pesho Peshev",
                phone: "+35988911111",
                email: "seer@example.com",
                ipAddress: "10.0.0.2",
                defaultPaymentMethodId: "three",
                processor: { id: "id-customer", state: "saved" },
                addresses: [
                    {
                        _id: "one",
                        phone: "123123123",
                        company: "Example company",
                        name: "Pesho Peshev Stoevski",
                        country: "BG",
                        locality: "Sofia",
                        streetAddress: "Tsarigradsko Shose 4",
                        extendedAddress: "floor 3",
                        postalCode: "1000",
                        processor: { id: "id-address", state: "saved" },
                    },
                ],
                paymentMethods: [
                    {
                        _id: "three",
                        __t: "PayPalAccount",
                        email: "test@example.com",
                        processor: { id: "id-paymentMethod", state: "saved" },
                        billingAddressId: "one",
                    },
                ],
                subscriptions: [
                    {
                        _id: "four",
                        plan: this.plan,
                        processor: { id: "id-subscription", state: "saved" },
                        status: "Active",
                        price: 13.2,
                        descriptor: {
                            name: "Enhancv*Pro Plan",
                            phone: "0888415433",
                            url: "enhancv.com",
                        },
                        trialDuration: 0,
                        trialDurationUnit: "day",
                        firstBillingDate: "2017-02-03",
                        statusHistory: [{ status: "Active", timestamp: "2017-03-03" }],
                        paymentMethodId: "three",
                    },
                ],
            });

            this.customer.subscriptions = this.customer.subscriptions.map(sub =>
                initializeSubscriptionDates(sub)
            );

            this.processor = new NullProcessor();
        });

        const changeSets = [
            {
                name: "only name",
                customer: { name: "New name" },
                expected: {
                    customer: true,
                    address: false,
                    payment: false,
                    sub: false,
                },
            },
            {
                name: "only email",
                customer: { email: "test@example.com" },
                expected: {
                    customer: true,
                    address: false,
                    payment: false,
                    sub: false,
                },
            },
            {
                name: "multiple fields",
                customer: { name: "New name", email: "test@example.com" },
                expected: {
                    customer: true,
                    address: false,
                    payment: false,
                    sub: false,
                },
            },
            {
                name: "same value",
                customer: { email: "seer@example.com" },
                expected: {
                    customer: false,
                    address: false,
                    payment: false,
                    sub: false,
                },
            },
            {
                name: "only address",
                address: { company: "test" },
                expected: {
                    customer: false,
                    address: true,
                    payment: false,
                    sub: false,
                },
            },
            {
                name: "only address but same value",
                address: { postalCode: "1000" },
                expected: {
                    customer: false,
                    address: false,
                    payment: false,
                    sub: false,
                },
            },
            {
                name: "only payment",
                payment: { nonce: "some-nonce" },
                expected: {
                    customer: false,
                    address: false,
                    payment: true,
                    sub: false,
                },
            },
            {
                name: "only subscription",
                sub: { paymentMethodId: "other" },
                expected: {
                    customer: false,
                    address: false,
                    payment: false,
                    sub: true,
                },
            },
            {
                name: "change deleted status on subscription",
                sub: { deleted: true },
                expected: {
                    customer: false,
                    address: false,
                    payment: false,
                    sub: false,
                },
            },
        ];

        changeSets.forEach(function(test) {
            it(`Should be process changes for ${test.name}`, function() {
                return this.customer.save().then(customer => {
                    Object.assign(customer, test.customer);
                    Object.assign(customer.addresses[0], test.address);
                    Object.assign(customer.paymentMethods[0], test.payment);
                    Object.assign(customer.subscriptions[0], test.sub);
                    customer.markChanged();

                    assert.equal(
                        customer.processor.state,
                        test.expected.customer ? "changed" : "saved"
                    );
                    assert.equal(
                        customer.addresses[0].processor.state,
                        test.expected.address ? "changed" : "saved"
                    );
                    assert.equal(
                        customer.paymentMethods[0].processor.state,
                        test.expected.payment ? "changed" : "saved"
                    );
                    assert.equal(
                        customer.subscriptions[0].processor.state,
                        test.expected.sub ? "changed" : "saved"
                    );
                });
            });
        });

        it("Should return a correct vaule for getUnusedAddress", function() {
            assert.equal(null, this.customer.getUnusedAddress());

            this.customer.addresses.push(this.customer.addresses.create({ phone: "123123123" }));

            assert.equal("123123123", this.customer.getUnusedAddress().phone);

            this.customer.paymentMethods.push(
                this.customer.paymentMethods.create({
                    billingAddressId: this.customer.getUnusedAddress().id,
                })
            );

            assert.equal(null, this.customer.getUnusedAddress());
        });

        const setDefaultPaymentMethod = [
            {
                name: "same payment type and new address data",
                customer: {
                    defaultPaymentMethodId: null,
                    addresses: [
                        {
                            _id: "one",
                            phone: "123123123",
                            company: "Example company",
                            name: "Pesho Peshev Stoevski",
                            country: "BG",
                            locality: "Sofia",
                            streetAddress: "Tsarigradsko Shose 4",
                            extendedAddress: "floor 3",
                            postalCode: "1000",
                            processor: { id: "id-address", state: "saved" },
                        },
                        {
                            _id: "two",
                            name: "Pesho Peshev Stoevski",
                            processor: { id: "id-address", state: "saved" },
                        },
                    ],
                },
                paymentMethod: { nonce: "nonce-1", __t: "PayPalAccount", _id: "pm-1" },
                address: { name: "Pesho Change" },
                expected: {
                    addresses: [
                        {
                            processor: { state: "saved", id: "id-address" },
                            postalCode: "1000",
                            extendedAddress: "floor 3",
                            streetAddress: "Tsarigradsko Shose 4",
                            locality: "Sofia",
                            country: "BG",
                            name: "Pesho Peshev Stoevski",
                            company: "Example company",
                            phone: "123123123",
                            _id: "one",
                        },
                        {
                            _id: "two",
                            name: "Pesho Change",
                            processor: { id: "id-address", state: "changed" },
                        },
                    ],
                    paymentMethods: [
                        {
                            processor: { state: "saved", id: "id-paymentMethod" },
                            nonce: null,
                            __t: "PayPalAccount",
                            billingAddressId: "one",
                            email: "test@example.com",
                            _id: "three",
                        },
                        {
                            processor: { state: "inital" },
                            nonce: "nonce-1",
                            __t: "PayPalAccount",
                            billingAddressId: "two",
                            _id: "pm-1",
                        },
                    ],
                },
            },
            {
                name: "unused address data",
                customer: {},
                paymentMethod: { nonce: "nonce-1", __t: "PayPalAccount" },
                address: { name: "Pesho Change" },
                expected: {
                    addresses: [
                        {
                            processor: { state: "changed", id: "id-address" },
                            postalCode: "1000",
                            extendedAddress: "floor 3",
                            streetAddress: "Tsarigradsko Shose 4",
                            locality: "Sofia",
                            country: "BG",
                            name: "Pesho Change",
                            company: "Example company",
                            phone: "123123123",
                            _id: "one",
                        },
                    ],
                    paymentMethods: [
                        {
                            processor: { state: "changed", id: "id-paymentMethod" },
                            nonce: "nonce-1",
                            __t: "PayPalAccount",
                            billingAddressId: "one",
                            email: "test@example.com",
                            _id: "three",
                        },
                    ],
                },
            },
            {
                name: "different payment type",
                customer: {},
                paymentMethod: { nonce: "nonce-1", __t: "CreditCard", _id: "new-pt" },
                address: { name: "Pesho Change" },
                expected: {
                    addresses: [
                        {
                            processor: { state: "changed", id: "id-address" },
                            postalCode: "1000",
                            extendedAddress: "floor 3",
                            streetAddress: "Tsarigradsko Shose 4",
                            locality: "Sofia",
                            country: "BG",
                            name: "Pesho Change",
                            company: "Example company",
                            phone: "123123123",
                            _id: "one",
                        },
                    ],
                    paymentMethods: [
                        {
                            processor: { state: "saved", id: "id-paymentMethod" },
                            __t: "PayPalAccount",
                            billingAddressId: "one",
                            nonce: null,
                            email: "test@example.com",
                            _id: "three",
                        },
                        {
                            billingAddressId: "one",
                            __t: "CreditCard",
                            nonce: "nonce-1",
                            processor: { state: "inital" },
                            _id: "new-pt",
                        },
                    ],
                },
            },
            {
                name: "Customer without default payment method and no address",
                customer: { defaultPaymentMethodId: null },
                paymentMethod: { nonce: "nonce-1", __t: "PayPalAccount", _id: "new-pt" },
                expected: {
                    addresses: [
                        {
                            processor: { state: "saved", id: "id-address" },
                            postalCode: "1000",
                            extendedAddress: "floor 3",
                            streetAddress: "Tsarigradsko Shose 4",
                            locality: "Sofia",
                            country: "BG",
                            name: "Pesho Peshev Stoevski",
                            company: "Example company",
                            phone: "123123123",
                            _id: "one",
                        },
                    ],
                    paymentMethods: [
                        {
                            processor: { state: "saved", id: "id-paymentMethod" },
                            __t: "PayPalAccount",
                            billingAddressId: "one",
                            nonce: null,
                            email: "test@example.com",
                            _id: "three",
                        },
                        {
                            __t: "PayPalAccount",
                            nonce: "nonce-1",
                            processor: { state: "inital" },
                            _id: "new-pt",
                        },
                    ],
                },
            },
            {
                name: "Customer without default payment method new address",
                customer: { defaultPaymentMethodId: null },
                paymentMethod: { nonce: "nonce-1", __t: "PayPalAccount", _id: "new-pt" },
                address: { name: "Pesho Change", _id: "new-addr" },
                expected: {
                    addresses: [
                        {
                            processor: { state: "saved", id: "id-address" },
                            postalCode: "1000",
                            extendedAddress: "floor 3",
                            streetAddress: "Tsarigradsko Shose 4",
                            locality: "Sofia",
                            country: "BG",
                            name: "Pesho Peshev Stoevski",
                            company: "Example company",
                            phone: "123123123",
                            _id: "one",
                        },
                        {
                            processor: { state: "inital" },
                            name: "Pesho Change",
                            _id: "new-addr",
                        },
                    ],
                    paymentMethods: [
                        {
                            processor: { state: "saved", id: "id-paymentMethod" },
                            __t: "PayPalAccount",
                            billingAddressId: "one",
                            nonce: null,
                            email: "test@example.com",
                            _id: "three",
                        },
                        {
                            __t: "PayPalAccount",
                            nonce: "nonce-1",
                            billingAddressId: "new-addr",
                            processor: { state: "inital" },
                            _id: "new-pt",
                        },
                    ],
                },
            },
        ];

        setDefaultPaymentMethod.forEach(function(test) {
            it(`Should process setDefaultPaymentMethod for ${test.name}`, function() {
                return this.customer.save().then(customer => {
                    Object.assign(customer, test.customer);
                    const paymentMethod = customer.setDefaultPaymentMethod(
                        test.paymentMethod,
                        test.address
                    );

                    const result = customer.markChanged().toObject();

                    assert.deepEqual(result.addresses, test.expected.addresses);
                    assert.deepEqual(result.paymentMethods, test.expected.paymentMethods);
                });
            });
        });

        it("Should correctly apply saveProcessor", function() {
            const markChangedSpy = sinon.spy(this.customer, "markChanged");
            const spy = sinon.stub(this.processor, "save").resolves(this.customer);

            return this.customer.saveProcessor(this.processor).then(customer => {
                assert.equal(customer, this.customer);
                sinon.assert.calledOnce(markChangedSpy);
                sinon.assert.calledOnce(spy);
                sinon.assert.calledWith(spy, this.customer);
            });
        });

        it("Should correctly apply cancelProcessor", function() {
            const spy = sinon.stub(this.processor, "cancelSubscription").resolves(this.customer);

            return this.customer.cancelProcessor(this.processor, "sub-id").then(customer => {
                assert.equal(customer, this.customer);
                sinon.assert.calledOnce(spy);
                sinon.assert.calledWith(spy, this.customer, "sub-id");
            });
        });

        it("Should correctly apply refundProcessor", function() {
            const spy = sinon.stub(this.processor, "refundTransaction").resolves(this.customer);

            return this.customer
                .refundProcessor(this.processor, "transaction-id", 123)
                .then(customer => {
                    assert.equal(customer, this.customer);
                    sinon.assert.calledOnce(spy);
                    sinon.assert.calledWith(spy, this.customer, "transaction-id", 123);
                });
        });

        it("Should correctly apply loadProcessor", function() {
            const spy = sinon.stub(this.processor, "load").resolves(this.customer);

            return this.customer.loadProcessor(this.processor).then(customer => {
                assert.equal(customer, this.customer);
                sinon.assert.calledOnce(spy);
                sinon.assert.calledWith(spy, this.customer);
            });
        });

        it("Should not call loadProcessor for non-saved customers", function() {
            const spy = sinon.stub(this.processor, "load");
            const customer = new Customer({
                name: "Pesho Peshev",
                phone: "+35988911111",
                email: "seer@example.com",
            });

            return customer.loadProcessor(this.processor).then(result => {
                assert.equal(result, customer);
                sinon.assert.notCalled(spy);
            });
        });

        const activeSubs = [
            {
                name: "Only one sub",
                subs: [
                    {
                        _id: "one",
                        level: 2,
                        status: "Active",
                        isTrial: false,
                        firstBillingDate: "2017-01-02",
                        billingFrequency: 1,
                        state: "saved",
                    },
                ],
                nowDate: new Date("2017-01-10"),
                expectedActive: ["one"],
                expectedValid: ["one"],
                expectedSubscription: "one",
            },
            {
                name: "Sub with tricky timing",
                subs: [
                    {
                        level: 2,
                        billingFrequency: 1,
                        firstBillingDate: new Date("2017-07-14T00:00:00.000Z"),
                        _id: "one",
                        status: "Canceled",
                        isTrial: false,
                        discounts: [],
                        state: "saved",
                    },
                ],
                nowDate: new Date("2017-07-13T22:08:23.000Z"),
                expectedActive: [],
                expectedValid: ["one"],
                expectedSubscription: "one",
            },
            {
                name: "Switching subs",
                subs: [
                    {
                        level: 2,
                        billingFrequency: 1,
                        firstBillingDate: new Date("2017-07-14T00:00:00.000Z"),
                        _id: "one",
                        status: "Canceled",
                        isTrial: false,
                        discounts: [],
                        state: "saved",
                    },
                    {
                        level: 2,
                        billingFrequency: 1,
                        firstBillingDate: new Date("2017-08-15T00:00:00.000Z"),
                        _id: "two",
                        status: "Active",
                        isTrial: false,
                        discounts: [],
                        state: "saved",
                    },
                ],
                nowDate: new Date("2017-08-14T22:08:23.000Z"),
                expectedActive: ["two"],
                expectedValid: ["two", "one"],
                expectedSubscription: "two",
            },
            {
                name: "Switching subs next day",
                subs: [
                    {
                        level: 2,
                        billingFrequency: 1,
                        firstBillingDate: new Date("2017-07-14T00:00:00.000Z"),
                        _id: "one",
                        status: "Canceled",
                        isTrial: false,
                        discounts: [],
                        state: "saved",
                    },
                    {
                        level: 2,
                        billingFrequency: 1,
                        firstBillingDate: new Date("2017-08-15T00:00:00.000Z"),
                        _id: "two",
                        status: "Active",
                        isTrial: false,
                        discounts: [],
                        state: "saved",
                    },
                ],
                nowDate: new Date("2017-08-15T22:08:23.000Z"),
                expectedActive: ["two"],
                expectedValid: ["two"],
                expectedSubscription: "two",
            },
            {
                name: "With expired sub",
                subs: [
                    {
                        _id: "one",
                        level: 2,
                        status: "Active",
                        isTrial: false,
                        firstBillingDate: "2016-12-01",
                        billingFrequency: 1,
                        state: "saved",
                    },
                ],
                nowDate: new Date("2017-01-10"),
                expectedActive: [],
                expectedValid: [],
                expectedSubscription: null,
            },
            {
                name: "With non-active sub",
                subs: [
                    {
                        _id: "one",
                        level: 2,
                        status: "Past Due",
                        isTrial: false,
                        firstBillingDate: "2017-01-02",
                        billingFrequency: 1,
                        state: "saved",
                    },
                ],
                nowDate: new Date("2017-01-10"),
                expectedActive: [],
                expectedValid: ["one"],
                expectedSubscription: "one",
            },
            {
                name: "Valid but not active sub, no expired",
                subs: [
                    {
                        _id: "two",
                        level: 1,
                        status: "Active",
                        isTrial: false,
                        firstBillingDate: "2016-12-01",
                        billingFrequency: 1,
                        state: "saved",
                    },
                    {
                        _id: "three",
                        level: 2,
                        status: "Active",
                        isTrial: true,
                        trialDuration: 20,
                        firstBillingDate: "2017-01-15",
                        billingFrequency: 1,
                        state: "saved",
                    },
                    {
                        _id: "one",
                        level: 3,
                        status: "Past Due",
                        isTrial: false,
                        firstBillingDate: "2017-01-02",
                        billingFrequency: 1,
                        state: "changed",
                    },
                    {
                        _id: "four",
                        level: 3,
                        status: "Active",
                        isTrial: false,
                        firstBillingDate: "2017-01-02",
                        billingFrequency: 1,
                        state: "inital",
                    },
                ],
                nowDate: new Date("2017-01-10"),
                expectedActive: ["three"],
                expectedValid: ["one", "three"],
                expectedSubscription: "one",
            },
            {
                name: "Correct level order",
                subs: [
                    {
                        _id: "three",
                        level: 3,
                        status: "Active",
                        isTrial: true,
                        trialDuration: 20,
                        firstBillingDate: "2017-01-15",
                        billingFrequency: 1,
                        state: "saved",
                    },
                    {
                        _id: "one",
                        level: 1,
                        status: "Active",
                        isTrial: false,
                        firstBillingDate: "2017-01-02",
                        billingFrequency: 2,
                        state: "saved",
                    },
                    {
                        _id: "four",
                        level: 1,
                        status: "Active",
                        isTrial: false,
                        firstBillingDate: "2017-02-02",
                        billingFrequency: 1,
                        state: "saved",
                    },
                    {
                        _id: "two",
                        level: 2,
                        status: "Active",
                        isTrial: false,
                        firstBillingDate: "2017-01-02",
                        billingFrequency: 1,
                        state: "saved",
                    },
                    {
                        _id: "five",
                        level: 2,
                        status: "Active",
                        isTrial: false,
                        firstBillingDate: "2017-01-03",
                        billingFrequency: 1,
                        state: "saved",
                    },
                    {
                        _id: "six",
                        level: 2,
                        status: "Active",
                        isTrial: false,
                        firstBillingDate: "2017-01-03",
                        billingFrequency: 1,
                        state: "saved",
                        deleted: true,
                    },
                ],
                nowDate: new Date("2017-01-10"),
                expectedActive: ["three", "five", "two", "one"],
                expectedValid: ["three", "five", "two", "one"],
                expectedSubscription: "three",
            },
        ];

        activeSubs.forEach(function(test) {
            it(`Should get active subscriptions for ${test.name}`, function() {
                this.customer.subscriptions = test.subs.map(sub => {
                    return {
                        _id: sub._id,
                        plan: {
                            processorId: `plan-${sub._id}`,
                            price: 5,
                            billingFrequency: sub.billingFrequency,
                            level: sub.level,
                        },
                        isTrial: sub.isTrial,
                        status: sub.status,
                        deleted: sub.deleted,
                        trialDuration: sub.trialDuration,
                        trialDurationUnit: "day",
                        firstBillingDate: sub.firstBillingDate,
                        processor: { id: `sub-${sub._id}`, state: sub.state },
                        paymentMethodId: "three",
                    };
                });

                this.customer.subscriptions = this.customer.subscriptions.map(sub =>
                    initializeSubscriptionDates(sub)
                );

                return this.customer.save().then(customer => {
                    const nowDate = test.nowDate;
                    const active = customer.activeSubscriptions(nowDate);
                    const valid = customer.validSubscriptions(nowDate);
                    const subscription = customer.subscription(nowDate);

                    assert.deepEqual(
                        active.map(sub => sub._id),
                        test.expectedActive,
                        "Should have correct activeSubscriptions"
                    );
                    assert.deepEqual(
                        valid.map(sub => sub._id),
                        test.expectedValid,
                        "Should have correct validSubscriptions"
                    );
                    assert.equal(
                        subscription && subscription._id,
                        test.expectedSubscription,
                        "Should have correct subscription"
                    );
                });
            });
        });

        it("Should correctly cancel subscriptions", function() {
            this.customer.subscriptions = [
                {
                    plan: { processorId: `plan-1`, price: 10 },
                    status: "Expired",
                    processor: { id: `sub-1`, state: "saved" },
                },
                {
                    plan: { processorId: `plan-2`, price: 10 },
                    status: "Active",
                    processor: { id: `sub-2`, state: "saved" },
                },
                {
                    plan: { processorId: `plan-3`, price: 10 },
                    status: "Past Due",
                    processor: { id: `sub-3`, state: "saved" },
                },
                {
                    plan: { processorId: `plan-4`, price: 10 },
                    status: "Pending",
                    processor: { id: `sub-4`, state: "saved" },
                },
                {
                    plan: { processorId: `plan-5`, price: 10 },
                    status: "Canceled",
                    processor: { id: `sub-5`, state: "saved" },
                },
            ];

            this.customer.cancelSubscriptions();

            const expected = ["Expired", "Canceled", "Canceled", "Canceled", "Canceled"];

            assert.deepEqual(this.customer.subscriptions.map(item => item.status), expected);
        });

        it("Should correctly filter unsaved and changed subscriptions", function() {
            this.customer.subscriptions = [
                {
                    firstBillingDate: "2017-07-05T15:07:37.967Z",
                    plan: {
                        name: "Basic",
                        price: 4.99,
                        processorId: "basic",
                        level: 1,
                        billingFrequency: 1,
                    },
                    _id: "s0",
                    isTrial: true,
                    statusHistory: [],
                    discounts: [],
                    processor: { state: "local" },
                },
                {
                    plan: {
                        name: "Pro - Quarterly",
                        price: 44.97,
                        processorId: "pro-quarterly",
                        level: 2,
                        billingFrequency: 3,
                    },
                    firstBillingDate: null,
                    price: 44.97,
                    _id: "s1",
                    isTrial: false,
                    statusHistory: [],
                    discounts: [],
                    processor: { state: "inital" },
                },
                {
                    plan: {
                        name: "Pro - Quarterly",
                        price: 44.97,
                        processorId: "pro-quarterly",
                        level: 2,
                        billingFrequency: 3,
                    },
                    firstBillingDate: null,
                    price: 44.97,
                    _id: "s2",
                    isTrial: false,
                    statusHistory: [],
                    discounts: [],
                    processor: { state: "inital" },
                },
                {
                    firstBillingDate: "2017-07-05T15:07:37.967Z",
                    plan: {
                        name: "Basic",
                        price: 4.99,
                        processorId: "basic",
                        level: 1,
                        billingFrequency: 1,
                    },
                    _id: "s3",
                    isTrial: false,
                    statusHistory: [],
                    discounts: [],
                    processor: { state: "changed" },
                },
            ];

            this.customer.addresses = [
                {
                    _id: "a-1",
                    processor: { id: "id-address-1", state: "saved" },
                },
                {
                    _id: "a-2",
                    processor: { id: "id-address-2", state: "changed" },
                },
                {
                    _id: "a-3",
                    processor: { state: "inital" },
                },
            ];

            this.customer.paymentMethods = [
                {
                    _id: "pm-1",
                    __t: "PayPalAccount",
                    processor: { id: "id-paymentMethod-1", state: "saved" },
                    billingAddressId: "a-1",
                },
                {
                    _id: "pm-2",
                    __t: "PayPalAccount",
                    processor: { id: "id-paymentMethod-2", state: "changed" },
                    billingAddressId: "a-2",
                },
                {
                    _id: "pm-3",
                    __t: "PayPalAccount",
                    processor: { state: "inital" },
                    billingAddressId: "a-3",
                },
            ];

            this.customer.resetProcessor();

            assert.deepEqual(this.customer.subscriptions.map(item => item._id), ["s0", "s3"]);
            assert.deepEqual(this.customer.paymentMethods.map(item => item._id), ["pm-1", "pm-2"]);
            assert.deepEqual(this.customer.addresses.map(item => item._id), ["a-1", "a-2"]);
            assert.equal(this.customer.subscriptions.id("s3").processor.state, "saved");
        });

        it("Should correctly add address with data", function() {
            const addressData = {
                company: "Example 2 company",
                name: "Pesho 2 Peshev Stoevski",
                country: "US",
                locality: "New York",
                streetAddress: "Street 4",
                extendedAddress: "floor 3",
                postalCode: "NXZ123",
            };

            const result = this.customer.addAddress(addressData);

            sinon.assert.match(result, addressData);
            sinon.assert.match(result._id, sinon.match.string);

            assert.equal(this.customer.addresses[1], result);
        });

        it("Should correctly add addPaymentMethodNonce", function() {
            const nonce = "test-nonce";
            const result = this.customer.addPaymentMethodNonce(nonce, this.customer.addresses[0]);

            sinon.assert.match(result, {
                _id: sinon.match.string,
                nonce: nonce,
                billingAddressId: this.customer.addresses[0]._id,
            });

            assert.equal(this.customer.paymentMethods[1], result);
            assert.equal(this.customer.defaultPaymentMethod(), result);
        });

        const addSubscription = [
            {
                name: "no previous subscriptions",
                subs: [],
                plan: {
                    level: 1,
                },
                expected: {
                    firstBillingDate: null,
                    discount: false,
                },
            },
            {
                name: "do not take lower level trials into account",
                subs: [
                    {
                        _id: "one",
                        level: 2,
                        status: "Active",
                        processorState: "saved",
                        isTrial: true,
                        firstBillingDate: "2017-01-02",
                    },
                ],
                plan: {
                    level: 2,
                },
                expected: {
                    firstBillingDate: null,
                    discount: false,
                },
            },
            {
                name: "do not take higher level trials into account",
                subs: [
                    {
                        _id: "one",
                        level: 4,
                        status: "Active",
                        processorState: "saved",
                        isTrial: true,
                        firstBillingDate: "2017-01-02",
                    },
                ],
                plan: {
                    level: 2,
                },
                expected: {
                    firstBillingDate: null,
                    discount: false,
                },
            },
            {
                name: "start after previous plan of equal level",
                subs: [
                    {
                        _id: "one",
                        level: 2,
                        status: "Active",
                        processorState: "saved",
                        isTrial: false,
                        firstBillingDate: "2017-01-02",
                    },
                ],
                plan: {
                    level: 2,
                },
                expected: {
                    firstBillingDate: new Date("2017-02-02"),
                    discount: false,
                },
            },
            {
                name: "start after previous plan of higher level",
                subs: [
                    {
                        _id: "one",
                        level: 4,
                        status: "Active",
                        processorState: "saved",
                        isTrial: false,
                        firstBillingDate: "2017-01-02",
                    },
                ],
                plan: {
                    level: 2,
                },
                expected: {
                    firstBillingDate: new Date("2017-02-02"),
                    discount: false,
                },
            },
            {
                name: "discount based on previous plan of lower level",
                subs: [
                    {
                        _id: "one",
                        level: 1,
                        status: "Active",
                        processorState: "saved",
                        isTrial: false,
                        firstBillingDate: "2017-01-02",
                    },
                ],
                plan: {
                    level: 2,
                },
                expected: {
                    firstBillingDate: null,
                    discount: 7.42,
                },
            },
            {
                name: "start after previous canceled subscription",
                subs: [
                    {
                        _id: "one",
                        level: 2,
                        status: "Canceled",
                        processorState: "saved",
                        isTrial: false,
                        firstBillingDate: "2017-01-02",
                    },
                ],
                plan: {
                    level: 2,
                },
                expected: {
                    firstBillingDate: new Date("2017-02-02"),
                    discount: false,
                },
            },
            {
                name: "start discount previous canceled subscription of lower level",
                subs: [
                    {
                        _id: "one",
                        level: 1,
                        status: "Canceled",
                        processorState: "saved",
                        isTrial: false,
                        firstBillingDate: "2017-01-02",
                    },
                ],
                plan: {
                    level: 2,
                },
                expected: {
                    firstBillingDate: null,
                    discount: 7.42,
                },
            },
            {
                name: "no discount of local subscriptions",
                subs: [
                    {
                        _id: "one",
                        level: 1,
                        status: "Canceled",
                        processorState: "local",
                        isTrial: false,
                        firstBillingDate: "2017-01-02",
                    },
                ],
                plan: {
                    level: 2,
                },
                expected: {
                    firstBillingDate: null,
                    discount: false,
                },
            },
            {
                name: "start after latest subscription",
                subs: [
                    {
                        _id: "one",
                        level: 2,
                        status: "Canceled",
                        processorState: "saved",
                        isTrial: false,
                        firstBillingDate: "2017-01-02",
                    },
                    {
                        _id: "two",
                        level: 3,
                        status: "Active",
                        processorState: "saved",
                        isTrial: false,
                        firstBillingDate: "2017-01-08",
                    },
                ],
                plan: {
                    level: 2,
                },
                expected: {
                    firstBillingDate: new Date("2017-02-08"),
                    discount: false,
                },
            },
            {
                name: "ignore pending subscriptions",
                subs: [
                    {
                        _id: "one",
                        level: 2,
                        status: "Canceled",
                        processorState: "saved",
                        isTrial: false,
                        firstBillingDate: "2017-01-02",
                    },
                    {
                        _id: "two",
                        level: 3,
                        status: "Active",
                        processorState: "saved",
                        isTrial: false,
                        firstBillingDate: "2017-02-10",
                    },
                ],
                plan: {
                    level: 2,
                },
                expected: {
                    firstBillingDate: new Date("2017-02-02"),
                    discount: false,
                },
            },
        ];

        addSubscription.forEach(function(test) {
            it(`Should addSubscription, ${test.name}`, function() {
                this.customer.subscriptions = test.subs.map(sub => {
                    return {
                        _id: sub._id,
                        plan: {
                            processorId: `plan-${sub._id}`,
                            price: 10,
                            billingFrequency: 1,
                            level: sub.level,
                        },
                        isTrial: sub.isTrial,
                        status: sub.status,
                        price: 10,
                        firstBillingDate: sub.firstBillingDate,
                        statusHistory: sub.statusHistory,
                        processor: {
                            id: `sub-${sub._id}`,
                            state: sub.processorState,
                        },
                        paymentMethodId: "three",
                    };
                });

                this.customer.subscriptions = this.customer.subscriptions.map(sub =>
                    initializeSubscriptionDates(sub)
                );

                const newPlan = {
                    processorId: `new-plan-${test.plan.level}`,
                    price: 5,
                    billingFrequency: 1,
                    level: test.plan.level,
                };
                const nowDate = new Date("2017-01-10");

                return this.customer.save().then(customer => {
                    const result = customer.addSubscription(
                        newPlan,
                        customer.defaultPaymentMethod(),
                        nowDate
                    );
                    const resultDiscount = result.discounts[0] ? result.discounts[0].amount : false;

                    assert.deepEqual(result.firstBillingDate, test.expected.firstBillingDate);
                    assert.equal(resultDiscount, test.expected.discount);
                    assert.equal(customer.subscriptions.id(result._id).paymentMethodId, "three");
                    assert.equal(customer.subscriptions.id(result._id), result);
                });
            });
        });
    })
);
