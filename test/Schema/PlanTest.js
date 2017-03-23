'use strict';

const sinon = require('sinon');
const database = require('../database');
const main = require('../../src');
const NullProcessor = main.NullProcessor;
const Plan = main.Plan;

describe('Plans', database([Plan], function () {
    it('Should be able to load plans, update old and create new ones', function () {
        const processor = new NullProcessor();

        const newPlan = {
            name: 'New Test',
            processor: {
                id: 'new-plan-id',
                state: 'saved',
            },
            price: 4,
            currency: 'USD',
            description: 'Test Descr',
            createdAt: new Date('2017-02-02'),
            updatedAt: new Date('2017-03-02'),
            billingFrequency: 3,
            level: 2,
        };

        const existingPlan = {
            name: 'Existing Test',
            processor: {
                id: 'existing-plan-id',
                state: 'saved',
            },
            price: 2,
            currency: 'USD',
            description: 'Test Descr',
            createdAt: new Date('2016-02-02'),
            updatedAt: new Date('2016-03-02'),
            billingFrequency: 1,
            level: 1,
        };

        const newExistingPlan = Object.assign(
            {},
            existingPlan,
            { price: 3, name: 'Changed Test' }
        );

        sinon.stub(processor, 'plans').resolves([newPlan, newExistingPlan])

        return new Plan(existingPlan).save()
            .then((plan) => {
                sinon.assert.match(plan, existingPlan);
                return Plan.loadProcessor(processor);
            })
            .then(plans => {
                sinon.assert.match(plans.length, 2, 'Should create 2 plans');
                sinon.assert.match(plans[0], sinon.match.instanceOf(Plan));
                sinon.assert.match(plans[1], sinon.match.instanceOf(Plan));
                sinon.assert.match(plans[0], newPlan);
                sinon.assert.match(plans[1], newExistingPlan);
            });
    });
}));
