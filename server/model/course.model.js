const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
    slug: String,
    title: String,
    description: String,
    image: String,
    level: String,
    duration: String,
    tags: [String],
    isActive: { type: Boolean, default: true },
    order: Number
}, { timestamps: true });

module.exports = mongoose.model("courses", courseSchema);