
import mongoose from "mongoose";

const supportSchema = new mongoose.Schema(
  {
        user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        },
        subject: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        }
    },
  { timestamps: true }
);

const Support = mongoose.model("support", supportSchema);

export default Support;
