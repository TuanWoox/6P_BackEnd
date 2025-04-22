const OTPDAO = require("../DAO/OTPDAO"); // path may vary
const OTP = require("../models/OTP");
const sendMail = require("../nodemailer/sendMail");
const { generateOTPToken } = require("../utils/utils");

const createAndSendOtp = async (email, type) => {
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
};

// Controller for signup OTP
module.exports.createOTP = async (req, res, next) => {
  const { email, type } = req.body;

  try {
    await createAndSendOtp(email, type);
    return res.status(200).json({
      message: "OTP đã được gửi thành công!",
    });
  } catch (err) {
    if (err.message === "OTP_EXISTS") {
      return res.status(400).json({
        message:
          "Bạn đã có mã OTP, xin vui lòng kiểm tra email hoặc đợi mã hết hạn.",
      });
    }

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
    res.cookie("OTPToken", newOTPToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 1 * 120 * 1000,
    });
    return res.status(200).json({ message: "Xác minh OTP thành công!" });
  } catch (err) {
    console.error("OTP verify error:", err);
    return res.status(500).json({ message: "Lỗi máy chủ khi xác minh OTP." });
  }
};
