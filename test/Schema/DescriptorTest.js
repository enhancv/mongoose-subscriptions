'use strict';

const mongoose = require('mongoose');
const assert = require('assert');
const main = require('../../src');
const DescriptorSchema = main.Schema.Descriptor;

describe('Subscription', function () {

    before(function () {
        this.DescriptorTest = mongoose.model('DescriptorTest', DescriptorSchema);
    });

    const fields = [
        {
            name: '7 Letter company',
            fields: { name: 'Enhancv*Pro Plan', phone: '0888415433', url: 'enhancv.com' },
            isValid: true,
        },
        {
            name: '3 Letter company',
            fields: { name: 'IBM*Pro Plan', phone: '0888415433', url: 'enhancv.com' },
            isValid: true,
        },
        {
            name: '12 Letter company',
            fields: { name: 'BangaloreIBM*Pro Plan', phone: '0888415433', url: 'enhancv.com' },
            isValid: true,
        },
        {
            name: 'Name without product',
            fields: { name: 'Pro Plan', phone: '0888415433', url: 'enhancv.com' },
            isValid: true,
        },
        {
            name: 'Wrong short name',
            fields: { name: 'Some*Pro Plan', phone: '0888415433', url: 'enhancv.com' },
            isValid: false,
        },
        {
            name: 'Too long a name',
            fields: { name: 'IBM*Pro Plan Bangalore BN', phone: '0888415433', url: 'enhancv.com' },
            isValid: false,
        },
        {
            name: 'Wrong phone',
            fields: { name: 'IBM*Pro Plan', phone: '08884154', url: 'enhancv.com' },
            isValid: false,
        },
        {
            name: 'Wrong url',
            fields: { name: 'IBM*Pro Plan', phone: '0888415433', url: 'http://enhancv.com/test' },
            isValid: false,
        },
    ];

    fields.forEach(function (test) {
        it(`Should validate descriptor for ${test.name}`, function () {
            const descriptor = new this.DescriptorTest(test.fields);
            const result = descriptor.validateSync();
            const isValid = !result;

            assert.equal(isValid, test.isValid);
        });
    });
});
