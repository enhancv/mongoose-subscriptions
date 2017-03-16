'use strict';

const assert = require('assert');
const sinon = require('sinon');
const braintree = require('braintree');
const Customer = require('../../src/Customer');
const ProcessorItem = require('../../src/Schema/ProcessorItem');
const braintreeAddress = require('../../src/braintree/address');

describe('braintreeAddress', function () {

    beforeEach(function () {
        this.customer = new Customer({
            name: 'Pesho',
            email: 'seer@example.com',
            ipAddress: '10.0.0.2',
            processor: { id: '64601260', state: 'saved' },
            defaultPaymentMethodId: 'three',
            addresses: [
                {
                    _id: 'one',
                    processor: { id: 'test-id', state: 'saved' },
                    firstName: 'Pesho',
                    lastName: 'Stanchev',
                },
            ]
        });

        this.addressResult =  {
            success: true,
            address: {
                id: 'test-id',
                company: 'Example company',
                firstName: 'Pesho',
                lastName: 'Peshev Stoevski',
                countryCodeAlpha2: 'BG',
                locality: 'Sofia',
                streetAddress: 'Tsarigradsko Shose 4',
                extendedAddress: 'floor 3',
                postalCode: '1000',
                createdAt: '2016-09-29T16:12:26Z',
                updatedAt: '2016-09-30T12:25:18Z',
            }
        };
    });


    it('processorFields should map models to braintree data', function () {
        const address = {
            processor: {
                id: 'test',
                state: ProcessorItem.SAVED,
            },
            company: 'Example company',
            name: 'Pesho Peshev Stoevski',
            country: 'BG',
            locality: 'Sofia',
            streetAddress: 'Tsarigradsko Shose 4',
            extendedAddress: 'floor 3',
            postalCode: '1000',
        };

        const fields = braintreeAddress.processorFields(address);

        const expected = {
            company: 'Example company',
            firstName: 'Pesho',
            lastName: 'Peshev Stoevski',
            countryCodeAlpha2: 'BG',
            locality: 'Sofia',
            streetAddress: 'Tsarigradsko Shose 4',
            extendedAddress: 'floor 3',
            postalCode: '1000',
        };

        assert.deepEqual(fields, expected);
    });

    it('fields should map result data into a model', function () {
        const fields = braintreeAddress.fields(this.addressResult);

        const expected = {
            processor: {
                id: 'test-id',
                state: ProcessorItem.SAVED,
            },
            company: 'Example company',
            name: 'Pesho Peshev Stoevski',
            country: 'BG',
            locality: 'Sofia',
            streetAddress: 'Tsarigradsko Shose 4',
            extendedAddress: 'floor 3',
            postalCode: '1000',
            createdAt: '2016-09-29T16:12:26Z',
            updatedAt: '2016-09-30T12:25:18Z',
        };

        assert.deepEqual(fields, expected);
    });

    it('save should call create endpoint on new address', function () {
        const gateway = {
            address: {
                create: sinon.stub().callsArgWith(1, null, this.addressResult),
            },
        };
        const processor = {
            gateway: gateway,
            emit: sinon.spy(),
        };

        this.customer.addresses[0].processor = { id: null, state: ProcessorItem.INITIAL };

        return braintreeAddress.save(processor, this.customer, this.customer.addresses[0])
            .then(address => {
                assert.ok(gateway.address.create.calledOnce);
                assert.ok(gateway.address.create.calledWith(sinon.match.has('customerId', '64601260')));
                assert.deepEqual(address.processor.toObject(), { id: 'test-id', state: ProcessorItem.SAVED });
            });
    });

    it('save should call update endpoint on existing address', function () {
        const gateway = {
            address: {
                update: sinon.stub().callsArgWith(3, null, this.addressResult),
            },
        };
        const processor = {
            gateway: gateway,
            emit: sinon.spy(),
        };

        this.customer.addresses[0].processor.state = ProcessorItem.CHANGED;

        return braintreeAddress.save(processor, this.customer, this.customer.addresses[0])
            .then(address => {
                assert.ok(gateway.address.update.calledOnce);
                assert.ok(gateway.address.update.calledWith('64601260', 'test-id', sinon.match.object));
                assert.deepEqual('Example company', address.company);
            });
    });

    it('save should send a rejection on api error', function () {
        const apiError = new Error('error');

        const gateway = {
            address: {
                update: sinon.stub().callsArgWith(3, apiError),
            }
        };
        const processor = {
            gateway: gateway,
            emit: sinon.spy(),
        };

        this.customer.addresses[0].processor.state = ProcessorItem.CHANGED;

        return braintreeAddress.save(processor, this.customer, this.customer.addresses[0])
            .catch(error => {
                assert.equal(error, apiError);
            });
    });
});
