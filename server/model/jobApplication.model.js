import mongoose from "mongoose";

const jobApplicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // Speeds up queries for specific users
    },
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
    location: {
      type: String,
      trim: true,
    },
    salary: {
      type: String,
      trim: true,
    },
    priority: {
      type: String,
      trim: true,
    }
  },
  { timestamps: true }
);

const JobApplication =
  mongoose.models.JobApplication ||
  mongoose.model("JobApplication", jobApplicationSchema);

export default JobApplication;
