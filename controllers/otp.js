const OTPDAO = require("../DAO/OTPDAO");
const OTP = require("../models/OTP");
const sendMail = require("../nodemailer/sendMail");
const { generateOTPToken } = require("../utils/utils");
const COOKIE_OPTIONS = require("../config/cookieOptions");

module.exports.createOTP = async (req, res) => {
  const { email, type } = req.body;

  try {
    const otp = await OTP.generateOTP(email, type);

    // Send the OTP via email
    await sendMail(email, type, { otp });

    return res.status(200).json({
      message: "OTP đã được gửi thành công!",
    });
  } catch (err) {
    if (err.message === "EXISTING_VALID_OTP") {
      return res.status(400).json({
        message:
          "Bạn đã có mã OTP, xin vui lòng kiểm tra email hoặc đợi mã hết hạn.",
      });
    }

    console.error("Error creating OTP:", err);
    return res.status(500).json({
      message: "Lỗi máy chủ, vui lòng thử lại.",
    });
  }
};

module.exports.verifyOTP = async (req, res) => {
  const { otp } = req.query;

  try {
    const foundOTP = await OTPDAO.findByOtp(otp);

    if (!foundOTP) {
      return res.status(400).json({ message: "Mã OTP không hợp lệ." });
    }

    if (foundOTP.isExpired()) {
      return res.status(400).json({ message: "Mã OTP đã hết hạn." });
    }

    // Generate JWT token tied to the email
    const newOTPToken = generateOTPToken(foundOTP.email);

    // Delete OTP after successful verification
    await OTPDAO.deleteById(foundOTP._id);

    // Set the token in a cookie
    res.cookie("OTPToken", newOTPToken, COOKIE_OPTIONS.otp);

    return res.status(200).json({ message: "Xác minh OTP thành công!" });
  } catch (err) {
    console.error("OTP verify error:", err);
    return res.status(500).json({
      message: "Lỗi máy chủ khi xác minh OTP.",
    });
  }
};
