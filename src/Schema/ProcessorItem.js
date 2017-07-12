const mongoose = require("mongoose");

const INITIAL = "inital";
const CHANGED = "changed";
const LOCAL = "local";
const SAVED = "saved";

const ProcessorItem = new mongoose.Schema(
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

ProcessorItem.method("isActive", function isActive() {
    return [ProcessorItem.SAVED, ProcessorItem.CHANGED, ProcessorItem.LOCAL].includes(this.state);
});

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

ProcessorItem.getProcessorId = function getId(id, collection) {
    if (!id) {
        return null;
    }

    const foundItem = collection.id(id);

    if (!foundItem) {
        return null;
    }

    return foundItem.processor.id;
};

module.exports = ProcessorItem;
