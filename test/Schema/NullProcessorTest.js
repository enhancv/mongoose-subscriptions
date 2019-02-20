"use strict";

const assert = require("assert");
const main = require("../../src");
const NullProcessor = main.NullProcessor;
const Customer = main.Customer;

describe("NullProcessor", function() {
    const methods = ["load", "save", "cancelSubscription", "refundTransaction", "voidTransaction"];

    methods.forEach(function(method) {
        it(`Should have ${method} method`, function() {
            const processor = new NullProcessor();
            const customer = new Customer();

            return processor[method](customer).then(result => {
                assert.equal(result, customer);
            });
        });
    });
});
