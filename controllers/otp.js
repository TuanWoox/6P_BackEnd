// controllers/OTPController.js
const OTPDAO = require("../DAO/OTPDAO");
const OTP = require("../models/OTP");
const sendMail = require("../nodemailer/sendMail");
const { generateOTPToken } = require("../utils/utils");
const COOKIE_OPTIONS = require("../config/cookieOptions");

module.exports.createOTP = async (req, res, next) => {
  const { email, type } = req.body;

  try {
    // Check for existing valid OTP
    const existingOtp = await OTPDAO.hasValidOTP(email);
    if (existingOtp) {
      return res.status(400).json({
        message:
          "Bạn đã có mã OTP, xin vui lòng kiểm tra email hoặc đợi mã hết hạn.",
      });
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
      expiresAt: new Date(Date.now() + 2 * 60 * 1000), // 2 minutes expiration
    });

    // Save OTP to database
    await OTPDAO.createOTP(otpDocument);

    // Send email with OTP
    await sendMail(email, type, { otp });

    return res.status(200).json({
      message: "OTP đã được gửi thành công!",
    });
  } catch (err) {
    console.error("Error creating OTP:", err);
    return res.status(500).json({
      message: "Lỗi máy chủ, vui lòng thử lại.",
    });
  }
};

module.exports.verifyOTP = async (req, res, next) => {
  const { otp } = req.query;

  try {
    const foundOTP = await OTPDAO.findByOtp(otp);

    if (!foundOTP) {
      return res.status(400).json({ message: "Mã OTP không hợp lệ." });
    }

    if (foundOTP.expiresAt < Date.now()) {
      return res.status(400).json({ message: "Mã OTP đã hết hạn." });
    }

    const newOTPToken = generateOTPToken(foundOTP.email);
    await OTPDAO.deleteById(foundOTP._id);

    // Set OTPToken as a cookie
    res.cookie("OTPToken", newOTPToken, COOKIE_OPTIONS.otp);

    return res.status(200).json({ message: "Xác minh OTP thành công!" });
  } catch (err) {
    console.error("OTP verify error:", err);
    return res.status(500).json({
      message: "Lỗi máy chủ khi xác minh OTP.",
    });
  }
};
