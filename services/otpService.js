// services/OTPService.js
const OTPDAO = require("../DAO/OTPDAO");
const OTP = require("../models/OTP");
const sendMail = require("../nodemailer/sendMail");
const { generateOTPToken } = require("../utils/utils");

class OTPService {
  // Function to create and send OTP
  static async createAndSendOtp(email, type) {
    // Check for existing valid OTP
    const existingOtp = await OTPDAO.hasValidOTP(email);
    if (existingOtp) {
      throw new Error("OTP_EXISTS");
    }

    // Generate unique OTP
    let otp, foundOtp;
    do {
      otp = Math.floor(1000 + Math.random() * 9000).toString();
      foundOtp = await OTPDAO.findByOtp(otp);
    } while (foundOtp && foundOtp.expiresAt > Date.now());

    // Create OTP document
    const otpDocument = new OTP({
      otp,
      email,
      type, // Store the type for reference
      expiresAt: new Date(Date.now() + 2 * 60 * 1000),
    });

    // Save OTP to database
    await OTPDAO.createOTP(otpDocument);

    // Send email with OTP
    await sendMail(email, type, { otp });
  }

  // Function to verify OTP
  static async verifyOtp(otp) {
    const foundOTP = await OTPDAO.findByOtp(otp);

    if (!foundOTP) {
      throw new Error("OTP_NOT_FOUND");
    }

    if (foundOTP.expiresAt < Date.now()) {
      throw new Error("OTP_EXPIRED");
    }

    const newOTPToken = generateOTPToken(foundOTP.email);
    await OTPDAO.deleteById(foundOTP._id);

    return newOTPToken;
  }
}

module.exports = OTPService;
