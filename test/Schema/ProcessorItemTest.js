"use strict";

const mongoose = require("mongoose");
const assert = require("assert");
const main = require("../../src");
const SubscriptionSchema = main.Schema.Subscription;
const Customer = main.Customer;
const ProcessorItem = main.Schema.ProcessorItem;

describe("ProcessorItem", function() {
    before(function() {
        this.SubscriptionTest = mongoose.model("SubscriptionTest", SubscriptionSchema);
        this.plan = {
            processorId: "test1",
            name: "Test",
            price: 19.9,
            billingFrequency: 1,
        };

        const processorIds = ["dasdsa", "axcxas", "acgers", "potirt"];
        const subscriptions = [];

        processorIds.forEach((processorId, index) => {
            subscriptions.push(
                new this.SubscriptionTest({
                    _id: "four" + index,
                    plan: this.plan,
                    status: "Active",
                    descriptor: {
                        name: "Tst*Mytest",
                        phone: 8899039032,
                        url: "example.com",
                    },
                    price: 19.9,
                    paymentMethodId: "three",
                    processor: { id: processorId, state: "saved" },
                })
            );
        });

        this.subscriptions = subscriptions;
        this.customer = new Customer({ subscriptions: subscriptions });
    });

    const errorTests = [
        {
            name: "item processor is not present",
            fields: {
                _id: "four",
                status: "Active",
                descriptor: {
                    name: "Tst*Mytest",
                    phone: 8899039032,
                    url: "example.com",
                },
                price: 19.9,
                paymentMethodId: "three",
            },
            isValid: false,
        },
        {
            name: "item processor id is not present",
            fields: {
                _id: "four",
                status: "Active",
                descriptor: {
                    name: "Tst*Mytest",
                    phone: 8899039032,
                    url: "example.com",
                },
                price: 19.9,
                paymentMethodId: "three",
                processor: { state: "saved" },
            },
            isValid: false,
        },
        {
            name: "item processor state is not saved",
            fields: {
                _id: "four",
                status: "Active",
                descriptor: {
                    name: "Tst*Mytest",
                    phone: 8899039032,
                    url: "example.com",
                },
                price: 19.9,
                paymentMethodId: "three",
                processor: { id: "gzsxjb", state: "initial" },
            },
            isValid: false,
        },
    ];

    errorTests.forEach(function(test) {
        it(`ProcessorItem validate should throw error when ${test.name}`, function() {
            const subscription = new this.SubscriptionTest(test.fields);
            subscription.plan = this.plan;

            assert.throws(function() {
                ProcessorItem.validateIsSaved(subscription, "Subscription Item test");
            }, Error);
        });
    });

    it("ProcessorItem validate should return the item when it is valid", function() {
        const subscription = this.subscriptions[0];

        assert.deepEqual(
            ProcessorItem.validateIsSaved(subscription, "Subscription Item test"),
            subscription
        );
    });

    it("ProcessorItem getId should return item id when there is such item", function() {
        const searchedProcessorId = "dasdsa";

        assert.deepEqual(
            ProcessorItem.getId(searchedProcessorId, this.subscriptions),
            this.subscriptions[0]._id
        );
    });

    it("ProcessorItem getId should return null when there is no processorId provided", function() {
        assert.deepEqual(ProcessorItem.getId(undefined, this.subscriptions), null);
    });

    it("ProcessorItem getId should return null when there is no item with such processor", function() {
        const searchedProcessorId = "no-such-id";

        assert.deepEqual(ProcessorItem.getId(searchedProcessorId, this.subscriptions), null);
    });

    it("ProcessorItem getProcessorId should return item processor id when there is such item", function() {
        const searchedProcessorId = "four0";

        assert.deepEqual(
            ProcessorItem.getProcessorId(searchedProcessorId, this.customer.subscriptions),
            this.customer.subscriptions[0].processor.id
        );
    });

    it("ProcessorItem getProcessorId should return null when there is no processorId provided", function() {
        assert.deepEqual(
            ProcessorItem.getProcessorId(undefined, this.customer.subscriptions),
            null
        );
    });

    it("ProcessorItem getProcessorId should return null when there is no item with such processor", function() {
        const searchedProcessorId = "no-such-id";

        assert.deepEqual(
            ProcessorItem.getProcessorId(searchedProcessorId, this.customer.subscriptions),
            null
        );
    });
});
