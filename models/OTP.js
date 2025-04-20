const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const otpSchema = new Schema({
  otp: {
    type: String,
    required: true,
  },
  email: String,
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }, // TTL index: delete when expiresAt is reached
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Optional: to ensure one valid OTP per user
otpSchema.index({ phoneNumber: 1, email: 1, expiresAt: 1 });

module.exports = mongoose.model("OTP", otpSchema);
