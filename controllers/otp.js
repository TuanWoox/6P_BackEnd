const OTPDAO = require("../DAO/OTPDAO"); // path may vary
const OTP = require("../models/OTP");
const registerSendMail = require("../nodemailer/register");

module.exports.createSignUpOtp = async (req, res, next) => {
  const { phoneNumber, email } = req.body;
  try {
    const existingOtp = await OTPDAO.hasValidOTP(phoneNumber, email);
    if (existingOtp) {
      return res.status(400).json({
        message:
          "Bạn đã có mã OTP, xin vui lòng kiểm tra email hoặc đợi mã hết hạn.",
      });
    }

    let otp, foundOtp;
    do {
      otp = Math.floor(1000 + Math.random() * 9000).toString();
      foundOtp = await OTPDAO.findByOtp(otp);
    } while (foundOtp && foundOtp.expiresAt > Date.now());

    const otpDocument = new OTP({
      otp,
      phoneNumber,
      email,
      expiresAt: new Date(Date.now() + 2 * 60 * 1000),
    });

    await OTPDAO.createOTP(otpDocument);

    try {
      await registerSendMail(email, otpDocument.otp);
    } catch (mailErr) {
      console.error("Email send error:", mailErr);
      return res.status(500).json({
        message: "Không thể gửi email, vui lòng thử lại sau.",
      });
    }

    return res.status(200).json({
      message: "OTP đã được gửi thành công!",
    });
  } catch (err) {
    console.error("OTP creation error:", err);
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

    await OTPDAO.deleteById(foundOTP._id);

    return res.status(200).json({ message: "Xác minh OTP thành công!" });
  } catch (err) {
    console.error("OTP verify error:", err);
    return res.status(500).json({ message: "Lỗi máy chủ khi xác minh OTP." });
  }
};
