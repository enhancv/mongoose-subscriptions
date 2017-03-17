'use strict';

const assert = require('assert');
const sinon = require('sinon');
const braintree = require('braintree');
const Customer = require('../../src/Customer');
const ProcessorItem = require('../../src/Schema/ProcessorItem');
const braintreeCustomer = require('../../src/braintree/customer');

describe('braintreeCustomer', function () {

    beforeEach(function () {
        this.customer = new Customer({
            name: 'Pesho',
            email: 'seer@example.com',
            ipAddress: '10.0.0.2',
            processor: {
                id: '64601260',
                state: 'saved',
            },
            defaultPaymentMethodId: 'three',
        });

        this.customerResult = {
            success: true,
            customer: {
                id: '64601260',
                firstName: 'Pesho',
                lastName: 'Peshev',
                email: 'seer@example.com',
                phone: '+3593809324',
                customFields: {
                    ipAddress: '10.0.0.2',
                }
            }
        }
    });

    it('processorFields should map models to braintree data', function () {
        const customer = {
            name: 'Pesho Peshev',
            email: 'seer@example.com',
            phone: '+3593809324',
            ipAddress: '10.0.0.2',
            defaultPaymentMethodId: 'three',
        };

        const fields = braintreeCustomer.processorFields(customer);

        const expected = {
            firstName: 'Pesho',
            lastName: 'Peshev',
            email: 'seer@example.com',
            phone: '+3593809324',
            customFields: {
                ipAddress: '10.0.0.2',
            }
        };

        assert.deepEqual(fields, expected);
    });

    it('fields should map result data into a model', function () {
        const fields = braintreeCustomer.fields(this.customerResult);

        const expected = {
            processor: {
                id: '64601260',
                state: 'saved',
            },
            name: 'Pesho Peshev',
            email: 'seer@example.com',
            phone: '+3593809324',
            ipAddress: '10.0.0.2',
        };

        assert.deepEqual(fields, expected);
    });

    it('save should call create endpoint on new address', function () {
        const gateway = {
            customer: {
                create: sinon.stub().callsArgWith(1, null, this.customerResult),
            },
        };
        const processor = {
            gateway: gateway,
            emit: sinon.spy(),
        };

        this.customer.processor = { id: null, state: ProcessorItem.INITIAL };

        return braintreeCustomer.save(processor, this.customer)
            .then(customer => {
                sinon.assert.calledWith(processor.emit, 'event', sinon.match.has('objectName', 'customer').and(sinon.match.has('action', 'saved')));
                sinon.assert.calledOnce(gateway.customer.create);
                sinon.assert.calledWith(gateway.customer.create, sinon.match.object);
                assert.deepEqual(customer.processor.toObject(), { id: '64601260', state: ProcessorItem.SAVED });
            });
    });

    it('save should call update endpoint on existing address', function () {
        const gateway = {
            customer: {
                update: sinon.stub().callsArgWith(2, null, this.customerResult),
            },
        };
        const processor = {
            gateway: gateway,
            emit: sinon.spy(),
        };

        this.customer.processor.state = ProcessorItem.CHANGED;

        return braintreeCustomer.save(processor, this.customer)
            .then(customer => {
                sinon.assert.calledWith(processor.emit, 'event', sinon.match.has('objectName', 'customer').and(sinon.match.has('action', 'saved')));
                sinon.assert.calledOnce(gateway.customer.update);
                sinon.assert.calledWith(gateway.customer.update, '64601260', sinon.match.object);
                assert.deepEqual('Pesho Peshev', customer.name);
            });
    });

    it('save should send a rejection on api error', function () {
        const apiError = new Error('error');

        const gateway = {
            customer: {
                update: sinon.stub().callsArgWith(2, apiError),
            }
        };
        const processor = {
            gateway: gateway,
            emit: sinon.spy(),
        };

        this.customer.processor.state = ProcessorItem.CHANGED;

        return braintreeCustomer.save(processor, this.customer)
            .catch(error => {
                sinon.assert.neverCalledWith(processor.emit, 'event', sinon.match.has('action', 'saved'));
                assert.equal(error, apiError);
            });
    });

    it('save should send a rejection on api result failure', function () {
        const gateway = {
            customer: {
                update: sinon.stub().callsArgWith(2, null, { success: false, message: 'some error'}),
            }
        };
        const processor = {
            gateway: gateway,
            emit: sinon.spy(),
        };

        this.customer.processor.state = ProcessorItem.CHANGED;

        return braintreeCustomer.save(processor, this.customer)
            .catch(error => {
                sinon.assert.neverCalledWith(processor.emit, 'event', sinon.match.has('action', 'saved'));
                sinon.assert.match(error, { message: 'some error' });
            });
    });
});
