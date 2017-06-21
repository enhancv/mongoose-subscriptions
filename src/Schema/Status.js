const mongoose = require("mongoose");

const Status = new mongoose.Schema(
    {
        status: String,
        timestamp: Date,
    },
    { _id: false }
);

module.exports = Status;
