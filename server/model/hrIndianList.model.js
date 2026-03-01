import mongoose from "mongoose";

const hrIndianListSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    title: {
      type: String,
      default: "",
      trim: true,
    },
    company: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

const HrIndianList =
  mongoose.models.HrIndianList ||
  mongoose.model("HrIndianList", hrIndianListSchema);

export default HrIndianList;
