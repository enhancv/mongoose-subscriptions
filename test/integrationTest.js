"use strict";

const assert = require("assert");
const sinon = require("sinon");
const database = require("./database");
const mongoose = require("mongoose");
const main = require("../src");
const NullProcessor = main.NullProcessor;
const User = mongoose.model("User", new mongoose.Schema({ phone: String }));
const VisitorSchema = new mongoose.Schema({ name: String, email: String });
const Visitor = User.discriminator("UserVisitor", VisitorSchema);
const Customer = User.discriminator("UserCustomer", main.Schema.Customer);

describe(
    "Extending User model",
    database([User], function() {
        it("Should be able to change User object to Customer object", function() {
            const user = new Visitor({
                name: "New Test",
                email: "test@example.com",
            });

            return user
                .save()
                .then(user => {
                    assert.ok(user instanceof User, "user should be User");
                    assert.ok(user instanceof Visitor, "user should be Visitor");
                    assert.ok(!(user instanceof Customer), "user should not be a Customer");

                    return Customer.hydrate(user.toObject()).increment().save();
                })
                .then(customer => {
                    assert.ok(customer instanceof User, "customer should be User");
                    assert.ok(!(customer instanceof Visitor), "customer should not be Visitor");
                    assert.ok(customer instanceof Customer, "customer should be Customer");
                });
        });

        it("Should be able to change User Subscription correctly", function() {
            const processor = new NullProcessor();
            const user = new Customer({
                name: "Jacinta Tester",
                email: "jacinta.tester@example.com",
                createdAt: new Date("2016-09-06T22:21:50.681Z"),
                deleted: false,
                addresses: [
                    {
                        name: "Jacinta Tester",
                        country: "AU",
                        locality: "Melborne",
                        phone: "123123123",
                        postalCode: "3016",
                        streetAddress: "5/2 Techno Park Drive",
                        extendedAddress: "",
                        processor: {
                            id: "s4",
                            state: "saved",
                        },
                        _id: "rkeegG2dBW",
                        company: null,
                        createdAt: new Date("2017-07-16T09:29:12.000Z"),
                        updatedAt: new Date("2017-07-16T09:29:12.000Z"),
                    },
                ],
                paymentMethods: [
                    {
                        billingAddressId: "rkeegG2dBW",
                        _id: "Skgefh_HW",
                        email: "jacinta.tester@example.com",
                        createdAt: new Date("2017-07-16T09:29:13.000Z"),
                        updatedAt: new Date("2017-07-16T09:29:13.000Z"),
                        __t: "PayPalAccount",
                        nonce: null,
                        processor: {
                            id: "hxdgjrr",
                            state: "saved",
                        },
                    },
                ],
                subscriptions: [
                    {
                        paymentMethodId: "Skgefh_HW",
                        plan: {
                            name: "Basic",
                            price: 4.99,
                            processorId: "basic",
                            level: 1,
                            billingFrequency: 1,
                        },
                        firstBillingDate: new Date("2017-07-16T00:00:00.000Z"),
                        price: 4.99,
                        _id: "rkZglz2drb",
                        billingDayOfMonth: 16,
                        currentBillingCycle: 2,
                        billingPeriodEndDate: new Date("2017-08-15T00:00:00.000Z"),
                        billingPeriodStartDate: new Date("2017-07-16T00:00:00.000Z"),
                        descriptor: {
                            name: null,
                            phone: null,
                            url: null,
                        },
                        nextBillingDate: new Date("2017-08-16T00:00:00.000Z"),
                        paidThroughDate: new Date("2017-08-15T00:00:00.000Z"),
                        status: "Canceled",
                        updatedAt: new Date("2017-07-16T09:34:16.000Z"),
                        createdAt: new Date("2017-07-16T09:29:17.000Z"),
                        isTrial: false,
                        statusHistory: [
                            {
                                timestamp: new Date("2017-07-16T09:34:16.000Z"),
                                status: "Canceled",
                            },
                            {
                                timestamp: new Date("2017-07-16T09:29:17.000Z"),
                                status: "Active",
                            },
                        ],
                        discounts: [],
                        processor: {
                            id: "6hdhrb",
                            state: "saved",
                        },
                    },
                    {
                        updatedAt: new Date("2017-07-16T09:34:21.000Z"),
                        paidThroughDate: new Date("2018-01-15T00:00:00.000Z"),
                        descriptor: {
                            name: null,
                            phone: null,
                            url: null,
                        },
                        status: "Active",
                        price: 65.94,
                        currentBillingCycle: 1,
                        firstBillingDate: new Date("2017-07-16T00:00:00.000Z"),
                        paymentMethodId: "Skgefh_HW",
                        nextBillingDate: new Date("2018-01-16T00:00:00.000Z"),
                        billingPeriodEndDate: new Date("2018-01-15T00:00:00.000Z"),
                        billingPeriodStartDate: new Date("2017-07-16T00:00:00.000Z"),
                        billingDayOfMonth: 16,
                        plan: {
                            name: "Pro - Semiannual",
                            price: 65.94,
                            processorId: "pro-semiannual",
                            level: 2,
                            billingFrequency: 6,
                        },
                        createdAt: new Date("2017-07-16T09:34:21.000Z"),
                        isTrial: false,
                        statusHistory: [
                            {
                                timestamp: new Date("2017-07-16T09:34:21.000Z"),
                                status: "Active",
                            },
                        ],
                        discounts: [
                            {
                                amount: 4.92,
                                __t: "DiscountAmount",
                                group: "General",
                                currentBillingCycle: 1,
                                numberOfBillingCycles: 1,
                                processor: {
                                    id: "DiscountPreviousSubscription",
                                    state: "saved",
                                },
                            },
                        ],
                        processor: {
                            id: "3bpnbw",
                            state: "saved",
                        },
                        _id: "BJxuVQnOBZ",
                    },
                ],
                transactions: [
                    {
                        _id: "5ptwpcq4",
                        amount: 4.99,
                        billing: {
                            name: "",
                            company: null,
                            country: null,
                            locality: null,
                            streetAddress: null,
                            extendedAddress: null,
                            postalCode: null,
                        },
                        customer: {
                            name: "Jacinta Tester",
                            phone: "123123123",
                            company: null,
                            email: "jacinta.tester@example.com",
                        },
                        currency: "USD",
                        status: "settling",
                        descriptor: {
                            name: null,
                            phone: null,
                            url: null,
                        },
                        createdAt: new Date("2017-07-16T09:29:13.000Z"),
                        updatedAt: new Date("2017-07-16T09:29:17.000Z"),
                        name: "Jacinta Tester",
                        payerId: "2XQSVLLA3AAAA",
                        email: "jacinta.tester@example.com",
                        __t: "TransactionPayPalAccount",
                        statusHistory: [
                            {
                                timestamp: new Date("2017-07-16T09:29:17.000Z"),
                                status: "authorized",
                            },
                            {
                                timestamp: new Date("2017-07-16T09:29:17.000Z"),
                                status: "submitted_for_settlement",
                            },
                            {
                                timestamp: new Date("2017-07-16T09:29:17.000Z"),
                                status: "settling",
                            },
                        ],
                        discounts: [],
                        refundedTransactionId: null,
                        planProcessorId: "basic",
                        subscriptionId: "rkZglz2drb",
                        processor: {
                            id: "5ptwpcq4",
                            state: "saved",
                        },
                    },
                    {
                        _id: "3n4jce44",
                        amount: 61.02,
                        billing: {
                            name: "",
                            company: null,
                            country: null,
                            locality: null,
                            streetAddress: null,
                            extendedAddress: null,
                            postalCode: null,
                        },
                        customer: {
                            name: "Jacinta Tester",
                            phone: "123123123",
                            company: null,
                            email: "jacinta.tester@example.com",
                        },
                        currency: "USD",
                        status: "settling",
                        descriptor: {
                            name: null,
                            phone: null,
                            url: null,
                        },
                        createdAt: new Date("2017-07-16T09:34:16.000Z"),
                        updatedAt: new Date("2017-07-16T09:34:21.000Z"),
                        name: "Jacinta Tester",
                        payerId: "2XQSVLLA3AAAA",
                        email: "jacinta.tester@example.com",
                        __t: "TransactionPayPalAccount",
                        statusHistory: [
                            {
                                timestamp: new Date("2017-07-16T09:34:21.000Z"),
                                status: "authorized",
                            },
                            {
                                timestamp: new Date("2017-07-16T09:34:21.000Z"),
                                status: "submitted_for_settlement",
                            },
                            {
                                timestamp: new Date("2017-07-16T09:34:21.000Z"),
                                status: "settling",
                            },
                        ],
                        discounts: [
                            {
                                amount: 4.92,
                                name: "DiscountPreviousSubscription",
                            },
                        ],
                        refundedTransactionId: null,
                        planProcessorId: "pro-semiannual",
                        subscriptionId: "BJxuVQnOBZ",
                        processor: {
                            id: "3n4jce44",
                            state: "saved",
                        },
                    },
                ],
                defaultPaymentMethodId: "Skgefh_HW",
                processor: {
                    id: "5373987346",
                    state: "saved",
                },
                ipAddress: "124.184.112.204",
                userAgent:
                    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36",
                phone: "0481140481",
            });

            return user
                .save()
                .then(user => {
                    const plan = {
                        name: "Pro - Monthly",
                        price: 19.99,
                        billingFrequency: 1,
                        processorId: "pro-monthly",
                        level: 2,
                    };
                    const now = new Date("2017-07-16T09:34:37.000Z");

                    user.resetProcessor();
                    user.cancelSubscriptions();
                    user.addSubscription(plan, user.defaultPaymentMethod(), now);

                    return user.saveProcessor(processor);
                })
                .then(user => {
                    assert.equal(user.subscriptions[1].status, "Canceled");
                    assert.equal(user.subscriptions[1].processor.state, "changed");
                    assert.deepEqual(user.subscriptions[2].toObject(), {
                        _id: user.subscriptions[2]._id,
                        processor: { state: "inital" },
                        discounts: [],
                        statusHistory: [],
                        isTrial: false,
                        createdAt: user.subscriptions[2].createdAt,
                        price: 19.99,
                        firstBillingDate: new Date("2018-01-15"),
                        plan: {
                            billingFrequency: 1,
                            level: 2,
                            processorId: "pro-monthly",
                            price: 19.99,
                            name: "Pro - Monthly",
                        },
                        paymentMethodId: "Skgefh_HW",
                    });
                });
        });
    })
);
