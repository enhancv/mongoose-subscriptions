'use strict';

const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

mongoose.Promise = global.Promise;
dotenv.config({ path: path.resolve(__dirname, '../.env') });

function clearModels(models) {
    const removePromises = models.map(model => model.remove({}));
    return Promise.all(removePromises);
}

function database (models, test) {
    before('Connect mongoose with mongodb', function () {
        mongoose.connect(process.env.MONGO_URI, done);
    });

    beforeEach('Clear models', function () {
        return clearModels(models);
    });

    after('Disconnect mongoose from mongodb', function (done) {
        clearModels(models).then(() => mongoose.connection.close(done));
    });

    return test;
}

module.exports = database;
