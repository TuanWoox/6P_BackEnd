// controllers/OTPController.js
const OTPService = require("../services/otpService");

module.exports.createOTP = async (req, res, next) => {
  const { email, type } = req.body;

  try {
    await OTPService.createAndSendOtp(email, type);
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
    const newOTPToken = await OTPService.verifyOtp(otp);

    res.cookie("OTPToken", newOTPToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 1 * 120 * 1000,
    });

    return res.status(200).json({ message: "Xác minh OTP thành công!" });
  } catch (err) {
    if (err.message === "OTP_NOT_FOUND") {
      return res.status(400).json({ message: "Mã OTP không hợp lệ." });
    }

    if (err.message === "OTP_EXPIRED") {
      return res.status(400).json({ message: "Mã OTP đã hết hạn." });
    }

    console.error("OTP verify error:", err);
    return res.status(500).json({ message: "Lỗi máy chủ khi xác minh OTP." });
  }
};
