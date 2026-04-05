const mongoose = require("mongoose");

const moduleSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "courses",
    }
});

module.exports = mongoose.model("modules", moduleSchema);