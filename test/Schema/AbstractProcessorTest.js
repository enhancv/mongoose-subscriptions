'use strict';

const assert = require('assert');
const main = require('../../src');
const AbstractProcessor = main.AbstractProcessor;

describe('AbstractProcessor', function () {

    const methods = [
        { method: 'load', error: /Load customer/ },
        { method: 'save', error: /Save customer/ },
        { method: 'cancelSubscription', error: /Cancel subscription/ },
        { method: 'refundTransaction', error: /Refund transaction/ },
    ];

    methods.forEach(function (test) {
        it(`Should throw ${test.error} exception for ${test.method}`, function () {
            const processor = new AbstractProcessor();
            assert.throws(
                function () {
                    processor[test.method]();
                },
                test.error
            );
        });
    });
});
