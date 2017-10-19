const assert = require("assert");
const main = require("../../../src");
const DiscountPreviousSubscription = main.Schema.Discount.DiscountPreviousSubscription;

describe("Schema/Discount/PreviousSubscription", function() {
    beforeEach(function() {
        this.plan = {
            processorId: "test1",
            price: 10.0,
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
            price: 10,
            paymentMethodId: "three",
            processor: { id: "gzsxjb", state: "saved" },
        };
    });

    const buildTest = [
        {
            name: "full refund subscription",
            subscription: {
                firstBillingDate: new Date("2016-09-29"),
            },
            previous: {
                billingPeriodEndDate: new Date("2016-09-29"),
                billingPeriodStartDate: new Date("2016-08-29"),
            },
            expected: 10,
        },
        {
            name: "half expired subscription",
            subscription: {
                firstBillingDate: new Date("2016-09-14"),
            },
            previous: {
                billingPeriodEndDate: new Date("2016-09-29"),
                billingPeriodStartDate: new Date("2016-08-29"),
            },
            expected: 10,
        },
        {
            name: "amoust expired subscription",
            subscription: {
                firstBillingDate: new Date("2016-09-27"),
            },
            previous: {
                billingPeriodEndDate: new Date("2016-09-29"),
                billingPeriodStartDate: new Date("2016-08-29"),
            },
            expected: 10,
        },
        {
            name: "already finished subscription",
            subscription: {
                firstBillingDate: new Date("2016-10-27"),
            },
            previous: {
                billingPeriodEndDate: new Date("2016-09-29"),
                billingPeriodStartDate: new Date("2016-08-29"),
            },
            expected: false,
        },
        {
            name: "not yet started subscription",
            subscription: {
                firstBillingDate: new Date("2016-07-27"),
            },
            previous: {
                billingPeriodEndDate: new Date("2016-09-29"),
                billingPeriodStartDate: new Date("2016-08-29"),
            },
            expected: false,
        },
    ];

    buildTest.forEach(function(test) {
        it(`DiscountPreviousSubscription should calculate amount for ${test.name}`, function() {
            const subscription = Object.assign({}, this.subscription, test.subscription);
            const previous = Object.assign({}, this.subscription, test.previous);
            const result = DiscountPreviousSubscription.build(subscription, previous);

            assert.equal(result ? result.amount : false, test.expected);
        });
    });
});
