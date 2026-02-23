// Create order based on productId
export const createOrder = async (req, res) => {
  try {
    const options = {
      amount: 99 * 100, // in paise
      currency: "INR",
      receipt: `receipt_${Math.floor(Math.random() * 10000)}`,
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      order,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Verify payment
export const verifyPayment = (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, fileUrl } = req.body;

  const crypto = require("crypto");
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature === razorpay_signature) {
    // Send back the download link after successful payment
    return res.status(200).json({ success: true, downloadUrl: fileUrl });
  } else {
    return res.status(400).json({ success: false });
  }
};