'use strict';

const assert = require('assert');
const sinon = require('sinon');
const braintree = require('braintree');
const Customer = require('../../src/Customer');
const ProcessorItem = require('../../src/Schema/ProcessorItem');
const braintreePaymentMethod = require('../../src/braintree/paymentMethod');

describe('braintreePaymentMethod', function () {

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
                    kind: 'CreditCard',
                    billingAddressId: 'one',
                    processor: { id: 'gpjt3m', state: 'saved' },
                },
                {
                    _id: 'four',
                    kind: 'PayPalAccount',
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

        const fields = braintreePaymentMethod.processorFields(this.customer, this.customer.paymentMethods[0]);

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
        const fields = braintreePaymentMethod.processorFields(this.customer, this.customer.paymentMethods[0]);

        const expected = {
            billingAddressId: 'test-id',
            options: {
                makeDefault: true,
            },
        };

        assert.deepEqual(fields, expected);
    });

    it('processorFields should map models to braintree data non default', function () {
        const fields = braintreePaymentMethod.processorFields(this.customer, this.customer.paymentMethods[1]);

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

        const fields = braintreePaymentMethod.fields({ creditCard: paymentMethod, paymentMethod: paymentMethod });

        const expected = {
            kind: 'CreditCard',
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

        const fields = braintreePaymentMethod.fields({ payPalAccount: paymentMethod, paymentMethod: paymentMethod });

        const expected = {
            kind: 'PayPalAccount',
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

        const fields = braintreePaymentMethod.fields({ applePayCard: paymentMethod, paymentMethod: paymentMethod });

        const expected = {
            kind: 'ApplePayCard',
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

        const fields = braintreePaymentMethod.fields({ androidPayCard: paymentMethod, paymentMethod: paymentMethod });

        const expected = {
            kind: 'AndroidPayCard',
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

        return braintreePaymentMethod.save(processor, this.customer, this.customer.paymentMethods[0])
            .then(address => {
                assert.ok(gateway.paymentMethod.create.calledOnce);
                assert.ok(gateway.paymentMethod.create.calledWith(sinon.match.has('customerId', '64601260')));
                assert.deepEqual(address.processor.toObject(), { id: 'gpjt3m', state: ProcessorItem.SAVED });
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

        return braintreePaymentMethod.save(processor, this.customer, this.customer.paymentMethods[0])
            .then(paymentMethod => {
                assert.ok(gateway.paymentMethod.update.calledOnce);
                assert.ok(gateway.paymentMethod.update.calledWith('gpjt3m', sinon.match.object));
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

        return braintreePaymentMethod.save(processor, this.customer, this.customer.paymentMethods[0])
            .catch(error => {
                assert.equal(error, apiError);
            });
    });
});
