import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      default: "user",
      trim: true,
    },
    address: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    currentDesignation: {
      type: String,
    },
    currentCompany: {
      type: String,
    },
    experience: {
      type: String,
    },
    desiredDesignation: {
      type: String,
    },
    companyType: {
      type: String,
    },
    goals: {
      type: [String],
      enum: ["perfect_resume", "find_jobs", "hr_emails", "others"],
      default: []
    },
    otherGoal: {
      type: String,
    },
    linkedinUrl: {
      type: String,
    }
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
