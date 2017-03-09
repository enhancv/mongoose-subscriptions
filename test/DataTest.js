'use strict';

const assert = require('assert');
const database = require('./database');
const Customer = require('../src/Customer');

describe('Customer', database([Customer], function () {
    it('Should be able to instantiate a Customer', function () {
        const customer = new Customer({
            name: 'Pesho',
            addresses: [
                { firstName: 'Pesho', lastName: 'Stanchev' },
                { firstName: 'Stancho', lastName: 'Stanchev' },
            ],
            paymentMethods: [{ kind: 'CreditCard' }],
        });

        customer.save();
    });
}));
