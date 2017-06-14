"use strict";

const mongoose = require("mongoose");
const assert = require("assert");
const database = require("../../database");
const main = require("../../../src");
const Coupon = main.Coupon;
const Customer = main.Customer;
const DiscountCoupon = main.Schema.Discount.DiscountCoupon;
const SubscriptionSchema = main.Schema.Subscription;

describe(
    "Schema/Discount/Coupon",
    database([Customer, Coupon], function() {
        before(function() {
            this.SubscriptionTest = mongoose.model("SubscriptionTest", SubscriptionSchema);
        });

        beforeEach(function() {
            this.plan = {
                processorId: "test1",
                price: 19.9,
                billingFrequency: 1,
            };

            this.subscription = {
                _id: "four",
                plan: this.plan,
                status: "Active",
                descriptor: {
                    name: "Tst*Mytest",
                    phone: 8899039032,
                    url: "example.com",
                },
                price: 19.9,
                paymentMethodId: "three",
                processor: { id: "gzsxjb", state: "saved" },
            };
        });

        it("DiscountCoupon should not build anything without a coupon", function() {
            const result = DiscountCoupon.build(this.subscription, null);

            assert.equal(result, null);
        });

        it("DiscountCoupon should not build anything without a coupon even with date", function() {
            const result = DiscountCoupon.build(
                this.subscription,
                null,
                new Date("2016-10-29T16:12:26Z")
            );

            assert.equal(result, null);
        });

        const fields = [
            {
                name: "is used more than the max",
                fields: {
                    name: "Coupon test",
                    amount: 10,
                    usedCount: 3,
                    usedCountMax: 2,
                    startAt: "2016-09-29T16:12:26Z",
                    expireAt: "2016-12-29T16:12:26Z",
                },
                isValid: false,
            },
            {
                name: "starts in the future",
                fields: {
                    name: "Coupon test",
                    amount: 10,
                    usedCount: 3,
                    usedCountMax: 5,
                    startAt: "2016-11-29T16:12:26Z",
                    expireAt: "2016-12-29T16:12:26Z",
                },
                isValid: false,
            },
            {
                name: "expires in the past",
                fields: {
                    name: "Coupon test",
                    amount: 10,
                    usedCount: 3,
                    usedCountMax: 5,
                    startAt: "2016-07-29T16:12:26Z",
                    expireAt: "2016-09-29T16:12:26Z",
                },
                isValid: false,
            },
            {
                name: "is in the range and is not used more than the max",
                fields: {
                    name: "Coupon test",
                    amount: 10,
                    usedCount: 3,
                    usedCountMax: 5,
                    startAt: "2016-09-29T16:12:26Z",
                    expireAt: "2016-12-29T16:12:26Z",
                },
                isValid: true,
            },
            {
                name: "is with amount 0",
                fields: {
                    name: "Coupon test",
                    amount: 0,
                    usedCount: 3,
                    usedCountMax: 5,
                    startAt: "2016-09-29T16:12:26Z",
                    expireAt: "2016-12-29T16:12:26Z",
                },
                isValid: false,
            },
        ];

        fields.forEach(function(test) {
            it(`DiscountCoupon should be valid when it ${test.name}`, function() {
                const coupon = new Coupon.CouponAmount(test.fields);
                const result = DiscountCoupon.build(
                    this.subscription,
                    coupon,
                    new Date("2016-10-29T16:12:26Z")
                );
                const isValid = !!result;

                assert.equal(isValid, test.isValid);
            });
        });

        it("DiscountCoupon should increment coupon upon use", function() {
            const coupon = new Coupon.CouponAmount({ amount: 10, usedCount: 1, usedCountMax: 4 });

            return coupon
                .save()
                .then(() => {
                    const customer = new Customer({
                        name: "Pesho Peshev",
                        phone: "+35988911111",
                        email: "seer@example.com",
                        ipAddress: "10.0.0.2",
                        defaultPaymentMethodId: "three",
                        processor: { id: "id-customer", state: "saved" },
                        addresses: [
                            {
                                _id: "one",
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
                                price: 30,
                                descriptor: {
                                    name: "Enhancv*Pro Plan",
                                    phone: "0888415433",
                                    url: "enhancv.com",
                                },
                                paidThroughDate: "2017-03-03",
                                paymentMethodId: "three",
                            },
                        ],
                    });

                    customer.subscriptions.id("four").addDiscounts(subscription => {
                        return [DiscountCoupon.build(subscription, coupon)];
                    });

                    return customer.save();
                })
                .then(customer => {
                    customer.subscriptions.id("four").discounts[0].processor.state = "saved";
                    return customer.save();
                })
                .then(() => {
                    return Coupon.CouponAmount.findOne({ _id: coupon._id });
                })
                .then(updatedCoupon => {
                    assert.equal(updatedCoupon.usedCount, 2);
                });
        });
    })
);
