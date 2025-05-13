const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const otpSchema = new Schema({
  otp: {
    type: String,
    required: true,
  },
  email: String,
  type: String,
  expiresAt: {
    type: Date,
    default: function () {
      return new Date(Date.now() + 2 * 60 * 1000); // 2 minutes from now
    },
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure that the OTP expires after 2 minutes
otpSchema.index({ email: 1, expiresAt: 1 }, { expireAfterSeconds: 0 });

otpSchema.methods.isExpired = function () {
  return this.expiresAt < Date.now();
};

otpSchema.statics.generateOTP = async function (email, type) {
  const OTPDAO = require("../DAO/OTPDAO");
  const existingOtp = await OTPDAO.hasValidOTP(email);
  if (existingOtp) {
    throw new Error("EXISTING_VALID_OTP");
  }

  let otp, foundOtp;
  do {
    otp = Math.floor(1000 + Math.random() * 9000).toString();
    foundOtp = await OTPDAO.findByOtp(otp);
  } while (foundOtp && !foundOtp.isExpired());

  const otpDocument = new this({
    otp,
    email,
    type,
  });

  await OTPDAO.createOTP(otpDocument);
  return otp;
};

module.exports = mongoose.model("OTP", otpSchema);
