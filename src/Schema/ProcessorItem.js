const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const INITIAL = "inital";
const CHANGED = "changed";
const LOCAL = "local";
const SAVED = "saved";

const ProcessorItem = new Schema(
    {
        id: String,
        state: {
            type: String,
            enum: [INITIAL, CHANGED, SAVED, LOCAL],
            default: INITIAL,
        },
    },
    { _id: false }
);

ProcessorItem.INITIAL = INITIAL;
ProcessorItem.CHANGED = CHANGED;
ProcessorItem.SAVED = SAVED;
ProcessorItem.LOCAL = LOCAL;

ProcessorItem.validateIsSaved = function validateIsSaved(item, name) {
    if (!item || !item.processor || !item.processor.id || item.processor.state !== SAVED) {
        throw new Error(`${name || "Mongoose item"} not saved to processor`);
    }
    return item;
};

ProcessorItem.getId = function getId(processorId, collection) {
    if (!processorId) {
        return null;
    }

    const foundItem = collection.find(item => item.processor.id === processorId);

    if (!foundItem) {
        return null;
    }

    return foundItem._id;
};

module.exports = ProcessorItem;
