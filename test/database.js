'use strict';

const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

mongoose.Promise = global.Promise;
dotenv.config({ path: path.resolve(__dirname, '../.env') });
mongoose.connect(process.env.MONGO_URI);

function clearModels(models) {
    const removePromises = models.map(model => model.remove().exec());
    return Promise.all(removePromises);
}

function database (models, test) {

    beforeEach('Clear models', function () {
        return clearModels(models);
    });

    return test;
}

module.exports = database;
