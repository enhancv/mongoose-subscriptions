'use strict';

const assert = require('assert');
const database = require('./database');
const gateway = require('./gateway');
const Customer = require('../src/Customer');
const Plan = require('../src/Plan');
const processor = require('../src/braintree/processor');
const plan = require('../src/braintree/plan');

describe('Customer', database([Customer, Plan], function () {
    it('Should be able to instantiate a Customer', function () {
        this.timeout(160000);

        return plan.sync(gateway).then(plans => {
            const customer = new Customer({
                name: 'Pesho',
                email: 'seer@example.com',
                ipAddress: '10.0.0.2',
                processor: { id: '64601260', state: 'saved' },
                defaultPaymentMethodId: 'three',
                addresses: [
                    {
                        id: 'one',
                        processor: { id: 'fc', state: 'saved' },
                        firstName: 'Pesho', lastName: 'Stanchev',
                    },
                ],
                paymentMethods: [
                    {
                        id: 'three',
                        kind: 'CreditCard',
                        billingAddressId: 'one',
                        processor: { id: 'gpjt3m', state: 'saved' },
                    },
                ],
                subscriptions: [
                    {
                        id: 'four',
                        plan: plans[1],
                        status: 'Active',
                        paymentMethodId: 'three',
                        processor: { id: 'gzsxjb', state: 'saved' },
                    },
                ]
            });

            return customer.save()
                .then(customer => processor.sync(gateway, customer))
                .then(result => {
                    console.log(customer.toObject());
                });
        });
    });
}));
