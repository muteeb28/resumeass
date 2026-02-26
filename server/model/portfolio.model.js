import mongoose from "mongoose";

const portfolioSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    theme: {
      type: String,
      default: "default",
      trim: true,
    },
    published: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Portfolio =
  mongoose.models.Portfolio || mongoose.model("Portfolio", portfolioSchema);

export default Portfolio;
