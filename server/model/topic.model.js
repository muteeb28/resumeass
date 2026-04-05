const mongoose = require("mongoose");

const topicSchema = new mongoose.Schema({
    moduleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "modules"
    }
});

module.exports = mongoose.model("topics", topicSchema);