'use strict';

const assert = require('assert');
const sinon = require('sinon');
const braintree = require('braintree');
const Customer = require('../../src/Customer');
const ProcessorItem = require('../../src/Schema/ProcessorItem');
const paymentMethodProcessor = require('../../src/braintree/paymentMethodProcessor');

describe('paymentMethodProcessor', function () {

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
            ],
            paymentMethods: [
                {
                    _id: 'three',
                    __t: 'CreditCard',
                    billingAddressId: 'one',
                    processor: { id: 'gpjt3m', state: 'saved' },
                },
                {
                    _id: 'four',
                    __t: 'PayPalAccount',
                    billingAddressId: 'one',
                    processor: { id: 'test-token', state: 'saved' },
                },
            ],
        });

        this.paymentMethodResult = {
            success: true,
            paymentMethod: new braintree.CreditCard({
                token: 'gpjt3m',
                cardholderName: 'Pesho Peshev',
                bin: '4111111',
                last4: '1111',
                expirationMonth: '12',
                expirationYear: '2018',
                cardType: 'Visa',
                countryOfIssuance: 'GBR',
                issuingBank: 'HSBC Bank PLC',
                createdAt: '2016-09-29T16:12:26Z',
                updatedAt: '2016-09-30T12:25:18Z',
            }),
        };
    });

    it('processorFields should map models to braintree data', function () {
        this.customer.paymentMethods[0].nonce = braintree.Test.Nonces.Transactable;

        const fields = paymentMethodProcessor.processorFields(this.customer, this.customer.paymentMethods[0]);

        const expected = {
            billingAddressId: 'test-id',
            paymentMethodNonce: 'fake-valid-nonce',
            options: {
                makeDefault: true,
            },
        };

        assert.deepEqual(fields, expected);
    });

    it('processorFields should map models to braintree data without nonce', function () {
        const fields = paymentMethodProcessor.processorFields(this.customer, this.customer.paymentMethods[0]);

        const expected = {
            billingAddressId: 'test-id',
            options: {
                makeDefault: true,
            },
        };

        assert.deepEqual(fields, expected);
    });

    it('processorFields should map models to braintree data non default', function () {
        const fields = paymentMethodProcessor.processorFields(this.customer, this.customer.paymentMethods[1]);

        const expected = {
            billingAddressId: 'test-id',
        };

        assert.deepEqual(fields, expected);
    });

    it('fields should map credit card data into a model', function () {
        const paymentMethod = new braintree.CreditCard({
            token: 'gpjt3m',
            cardholderName: 'Pesho Peshev',
            bin: '4111111',
            last4: '1111',
            expirationMonth: '12',
            expirationYear: '2018',
            cardType: 'Visa',
            countryOfIssuance: 'GBR',
            issuingBank: 'HSBC Bank PLC',
            createdAt: '2016-09-29T16:12:26Z',
            updatedAt: '2016-09-30T12:25:18Z',
        });

        const fields = paymentMethodProcessor.fields(this.customer, paymentMethod);

        const expected = {
            __t: 'CreditCard',
            maskedNumber: '4111111******1111',
            countryOfIssuance: 'GBR',
            issuingBank: 'HSBC Bank PLC',
            cardType: 'Visa',
            cardholderName: 'Pesho Peshev',
            expirationMonth: '12',
            expirationYear: '2018',
            processor: {
                id: 'gpjt3m',
                state: ProcessorItem.SAVED
            },
            createdAt: '2016-09-29T16:12:26Z',
            updatedAt: '2016-09-30T12:25:18Z'
        };

        assert.deepEqual(fields, expected);
    });

    it('fields should map paypal account data into a model', function () {
        const paymentMethod = new braintree.PayPalAccount({
            token: 'gpjt3m',
            email: 'test@example.com',
            payerInfo: {
                firstName: 'Pesho',
                lastName: 'Peshev',
                email: 'test@example.com',
                payerId: 'H80319283012',
            },
            createdAt: '2016-09-29T16:12:26Z',
            updatedAt: '2016-09-30T12:25:18Z',
        });

        const fields = paymentMethodProcessor.fields(this.customer, paymentMethod);

        const expected = {
            __t: 'PayPalAccount',
            email: 'test@example.com',
            name: 'Pesho Peshev',
            payerId: 'H80319283012',
            processor: {
                id: 'gpjt3m',
                state: ProcessorItem.SAVED
            },
            createdAt: '2016-09-29T16:12:26Z',
            updatedAt: '2016-09-30T12:25:18Z'
        };

        assert.deepEqual(fields, expected);
    });

    it('fields should map apple pay data into a model', function () {
        const paymentMethod = new braintree.ApplePayCard({
            token: 'gpjt3m',
            paymentInstrumentName: 'Visa1111',
            bin: '4111111',
            last4: '1111',
            expirationMonth: '12',
            expirationYear: '2018',
            cardType: 'Apple Pay - Visa',
            createdAt: '2016-09-29T16:12:26Z',
            updatedAt: '2016-09-30T12:25:18Z',
        });

        const fields = paymentMethodProcessor.fields(this.customer, paymentMethod);

        const expected = {
            __t: 'ApplePayCard',
            paymentInstrumentName: 'Visa1111',
            cardType: 'Apple Pay - Visa',
            expirationMonth: '12',
            expirationYear: '2018',
            processor: {
                id: 'gpjt3m',
                state: ProcessorItem.SAVED
            },
            createdAt: '2016-09-29T16:12:26Z',
            updatedAt: '2016-09-30T12:25:18Z'
        };
        assert.deepEqual(fields, expected);
    });

    it('fields should map android pay data into a model', function () {
        const paymentMethod = new braintree.AndroidPayCard({
            token: 'gpjt3m',
            bin: '4111111',
            sourceCardLast4: '1111',
            virtualCardLast4: '1111',
            sourceCardType: 'Visa',
            virtualCardType: 'Visa',
            expirationMonth: '12',
            expirationYear: '2018',
            createdAt: '2016-09-29T16:12:26Z',
            updatedAt: '2016-09-30T12:25:18Z',
        });

        const fields = paymentMethodProcessor.fields(this.customer, paymentMethod);

        const expected = {
            __t: 'AndroidPayCard',
            sourceCardLast4: '1111',
            virtualCardLast4: '1111',
            sourceCardType: 'Visa',
            virtualCardType: 'Visa',
            expirationMonth: '12',
            expirationYear: '2018',
            processor: {
                id: 'gpjt3m',
                state: ProcessorItem.SAVED
            },
            createdAt: '2016-09-29T16:12:26Z',
            updatedAt: '2016-09-30T12:25:18Z'
        };
        assert.deepEqual(fields, expected);
    });

    it('save should call create endpoint on new payment method', function () {
        const gateway = {
            paymentMethod: {
                create: sinon.stub().callsArgWith(1, null, this.paymentMethodResult),
            },
        };
        const processor = {
            gateway: gateway,
            emit: sinon.spy(),
        };

        this.customer.paymentMethods[0].processor = { id: null, state: ProcessorItem.INITIAL };

        return paymentMethodProcessor.save(processor, this.customer, this.customer.paymentMethods[0])
            .then(customer => {
                const paymentMethod = this.customer.paymentMethods[0];

                sinon.assert.calledWith(processor.emit, 'event', sinon.match.has('name', 'paymentMethod').and(sinon.match.has('action', 'saved')));
                sinon.assert.calledOnce(gateway.paymentMethod.create);
                sinon.assert.calledWith(gateway.paymentMethod.create, sinon.match.has('customerId', '64601260'));
                assert.deepEqual(paymentMethod.processor.toObject(), { id: 'gpjt3m', state: ProcessorItem.SAVED });
            });
    });

    it('save should call update endpoint on existing address', function () {
        const gateway = {
            paymentMethod: {
                update: sinon.stub().callsArgWith(2, null, this.paymentMethodResult),
            },
        };
        const processor = {
            gateway: gateway,
            emit: sinon.spy(),
        };

        this.customer.paymentMethods[0].processor.state = ProcessorItem.CHANGED;

        return paymentMethodProcessor.save(processor, this.customer, this.customer.paymentMethods[0])
            .then(customer => {
                const paymentMethod = this.customer.paymentMethods[0];

                sinon.assert.calledWith(processor.emit, 'event', sinon.match.has('name', 'paymentMethod').and(sinon.match.has('action', 'saved')));
                sinon.assert.calledOnce(gateway.paymentMethod.update);
                sinon.assert.calledWith(gateway.paymentMethod.update, 'gpjt3m', sinon.match.object);
                assert.deepEqual('Pesho Peshev', paymentMethod.cardholderName);
            });
    });

    it('save should send a rejection on api error', function () {
        const apiError = new Error('error');

        const gateway = {
            paymentMethod: {
                update: sinon.stub().callsArgWith(2, apiError),
            }
        };
        const processor = {
            gateway: gateway,
            emit: sinon.spy(),
        };

        this.customer.paymentMethods[0].processor.state = ProcessorItem.CHANGED;

        return paymentMethodProcessor.save(processor, this.customer, this.customer.paymentMethods[0])
            .catch(error => {
                sinon.assert.neverCalledWith(processor.emit, 'event', sinon.match.has('action', 'saved'));
                assert.equal(error, apiError);
            });
    });

    it('save should send a rejection on api result failure', function () {
        const gateway = {
            paymentMethod: {
                update: sinon.stub().callsArgWith(2, null, { success: false, message: 'some error' }),
            }
        };
        const processor = {
            gateway: gateway,
            emit: sinon.spy(),
        };

        this.customer.paymentMethods[0].processor.state = ProcessorItem.CHANGED;

        return paymentMethodProcessor.save(processor, this.customer, this.customer.paymentMethods[0])
            .catch(error => {
                sinon.assert.neverCalledWith(processor.emit, 'event', sinon.match.has('action', 'saved'));
                assert.equal(error.message, 'some error');
            });
    });
});
