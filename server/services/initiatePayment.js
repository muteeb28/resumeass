import axios from "axios";
import crypto from "crypto";
import qs from "qs";

// Configuration  replace with your values
const MERCHANT_KEY = process.env.EASEBUZZ_KEY;
const SALT = process.env.EASEBUZZ_SALT;
const ENV = process.env.EASEBUZZ_ENV; // "prod" or "test"

// Base URL
const BASE_URL = ENV === "prod"
  ? "https://pay.easebuzz.in/"
  : "https://testpay.easebuzz.in/";

/**
 * Initiates a payment via Easebuzz
 * @param {Object} data - Payment data from client
 * @returns {Object} { success, paymentUrl, txnid }
 */
export async function initiatePayment(data) {
  // Required fields
  const requiredFields = [
    "amount",
    "firstname",
    "email",
    "phone",
    "productinfo",
    "surl",
    "furl"
  ];
  console.log('this sis a data: ', data);
  // Check for missing fields
  for (const field of requiredFields) {
    if (!data[field]) throw new Error(`Missing required field: ${field}`);
  }

  // Generate unique transaction ID
  const txnid = "Txn" + Date.now();

  // Prepare fields
  const payload = {
    key: MERCHANT_KEY,
    txnid,
    amount: parseFloat(data.amount).toFixed(2),
    productinfo: data.productinfo.trim(),
    firstname: data.firstname.trim(),
    phone: data.phone.trim(),
    email: data.email.trim(),
    surl: data.surl.trim(),
    furl: data.furl.trim(),

    // Optional user-defined fields (UDF1UDF7)
    udf1: data.udf1 || "",
    udf2: data.udf2 || "",
    udf3: data.udf3 || "",
    udf4: data.udf4 || "",
    udf5: data.udf5 || "",
    udf6: "",
    udf7: "",

    // DO NOT send udf8udf10 (Easebuzz doesnt allow)
  };

  // Construct hash string
  const hashString = [
    payload.key,
    payload.txnid,
    payload.amount,
    payload.productinfo,
    payload.firstname,
    payload.email,
    payload.udf1,
    payload.udf2,
    payload.udf3,
    payload.udf4,
    payload.udf5,
    payload.udf6,
    payload.udf7,
    "", "", "", // udf810 must be blank
    SALT
  ].join("|");

  // Generate SHA-512 hash
  const hash = crypto.createHash("sha512").update(hashString).digest("hex");
  payload.hash = hash;

  // Log final payload
  console.log(" Sending Payload to Easebuzz:", payload);

  // Send API request
  try {
    const response = await axios.post(
      `${BASE_URL}payment/initiateLink`,
      qs.stringify(payload),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    );

    const resp = response.data;

    if (resp.status === 1 && resp.data?.payment_link) {
      return {
        success: true,
        paymentUrl: resp.data.payment_link,
        txnid,
        amount: payload.amount
      };
    } else {
      throw new Error(resp.error_desc || "Easebuzz payment initiation failed.");
    }
  } catch (error) {
    console.error(" Error initiating payment:", error.response?.data || error.message);
    throw new Error("Easebuzz error: " + (error.response?.data?.error_desc || error.message));
  }
}
