'use strict';

const assert = require('assert');
const sinon = require('sinon');
const ProcessorItem = require('../../src/Schema/ProcessorItem');
const planProcessor = require('../../src/braintree/planProcessor');

describe('planProcessor', function () {

    beforeEach(function () {
        this.planResult = {
            id: 'basic-plan',
            name: 'Basic',
            price: 12.22,
            currencyIsoCode: 'USD',
            description: 'Basic Plan',
            createdAt: '2016-09-29T16:12:26Z',
            updatedAt: '2016-09-30T12:25:18Z',
            billingFrequency: 1,
        };

        this.planModel = {
            processor: {
                id: 'basic-plan',
                state: ProcessorItem.SAVED,
            },
            name: 'Basic',
            price: 12.22,
            currency: 'USD',
            description: 'Basic Plan',
            createdAt: '2016-09-29T16:12:26Z',
            updatedAt: '2016-09-30T12:25:18Z',
            billingFrequency: 1,
        };
    });

    it('fields should map result data into a model', function () {
        const fields = planProcessor.fields(this.planResult);

        assert.deepEqual(fields, this.planModel);
    });


    it('Should call plan endpoint to load and convert plans', function () {
        const gateway = {
            plan: {
                all: sinon.stub().callsArgWith(0, null, { success: true, plans: [this.planResult] }),
            },
        };
        const processor = {
            gateway: gateway,
            emit: sinon.spy(),
        };

        return planProcessor.all(processor)
            .then(plans => {
                assert.ok(gateway.plan.all.calledOnce);
                assert.deepEqual(plans, [this.planModel]);;
            });
    });

    it('plan load should send a rejection on api error', function () {
        const apiError = new Error('error');

        const gateway = {
            plan: {
                all: sinon.stub().callsArgWith(0, apiError),
            }
        };
        const processor = {
            gateway: gateway,
            emit: sinon.spy(),
        };

        return planProcessor.all(processor)
            .catch(error => {
                assert.equal(error, apiError);
            });
    });
});
