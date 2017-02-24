'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const INITIAL = 'inital';
const SAVING = 'saving';
const SAVED = 'saved';

const ProcessorItemSchema = new Schema({
    id: String,
    state: {
        type: String,
        enum: [INITIAL, SAVING, SAVED],
    },
});

ProcessorItemSchema.INITIAL = INITIAL;
ProcessorItemSchema.SAVING = SAVING;
ProcessorItemSchema.SAVED = SAVED;

module.exports = ProcessorItemSchema;
