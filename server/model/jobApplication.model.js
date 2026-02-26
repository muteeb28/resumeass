import mongoose from "mongoose";

const jobApplicationSchema = new mongoose.Schema(
  {
    company: {
      type: String,
      default: "",
      trim: true,
    },
    title: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    status: {
      type: String,
      default: "",
      trim: true,
    },
    link: {
      type: String,
      default: "",
      trim: true,
    },
    contact: {
      type: String,
      default: "",
      trim: true,
    },
    date: {
      type: String,
      default: "",
      trim: true,
    },
    stage: {
      type: String,
      default: "",
      trim: true,
    },
    custom: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  { timestamps: true }
);

const JobApplication =
  mongoose.models.JobApplication ||
  mongoose.model("JobApplication", jobApplicationSchema);

export default JobApplication;
