import Support from "../model/support.model.js";

export const createSupportRequest = async (req, res) => {
  try {
    const { subject, message } = req.body || {};

    if (!subject || !String(subject).trim()) {
      return res.status(400).json({
        success: false,
        message: "subject is required.",
      });
    }

    if (!message || !String(message).trim()) {
      return res.status(400).json({
        success: false,
        message: "message is required.",
      });
    }

    const result = await Support.create({
      user: req.user.id,
      subject: String(subject).trim(),
      message: String(message).trim(),
    });

    if (!result?._id) {
      return res.status(500).json({
        success: false,
        message: "Unable to submit support request. Please try again.",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Support request submitted successfully.",
    });
  } catch (error) {
    console.log("error from createSupportRequest controller: ", error.message);
    return res.status(500).json({
      success: false,
      message: "some unexpected error occured. Please try again later.",
    });
  }
};

