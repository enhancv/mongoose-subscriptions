'use strict';

const mongoose = require('mongoose');
const find = require('lodash/fp/find');
const get = require('lodash/fp/get');

const Schema = mongoose.Schema;

const INITIAL = 'inital';
const CHANGED = 'changed';
const LOCAL = 'local';
const SAVED = 'saved';

const ProcessorItem = new Schema({
    id: String,
    state: {
        type: String,
        enum: [INITIAL, CHANGED, SAVED, LOCAL],
        default: INITIAL,
    },
}, { _id: false });

ProcessorItem.INITIAL = INITIAL;
ProcessorItem.CHANGED = CHANGED;
ProcessorItem.SAVED = SAVED;
ProcessorItem.LOCAL = LOCAL;

ProcessorItem.validateIsSaved = function (item) {
    if (!item || !item.processor || !item.processor.id || item.processor.state !== SAVED) {
        throw new Error('Mongoose item not saved to processor');
    }
}

ProcessorItem.find = function (array, id) {
    return find((item) => item.id === id, array);
}

ProcessorItem.findProcessorId = function (array, id) {
    return get('processor.id', ProcessorItem.find(array, id));
}

module.exports = ProcessorItem;
