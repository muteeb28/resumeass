import mongoose from "mongoose";

const contactUsSchema = new mongoose.Schema(
  {
        fullName: {
            type: String,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
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

const ContactUs = mongoose.model("contactus", contactUsSchema);

export default ContactUs;
