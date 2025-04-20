const OTPDAO = require("../DAO/OTPDAO"); // path may vary
const OTP = require("../models/OTP");
const sendMail = require("../nodemailer/sendMail");

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
module.exports.createSignUpOtp = async (req, res, next) => {
  const { email } = req.body;

  try {
    await createAndSendOtp(email, "register");
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

// Controller for login OTP
module.exports.createLoginOtp = async (req, res, next) => {
  const { email } = req.body;

  try {
    await createAndSendOtp(email, "login");
    return res.status(200).json({
      message: "OTP xác thực đăng nhập đã được gửi thành công!",
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

    await OTPDAO.deleteById(foundOTP._id);

    return res.status(200).json({ message: "Xác minh OTP thành công!" });
  } catch (err) {
    console.error("OTP verify error:", err);
    return res.status(500).json({ message: "Lỗi máy chủ khi xác minh OTP." });
  }
};
