// controllers/authController.js
const Customer = require("../models/customer");
const CustomerDAO = require("../DAO/CustomerDAO");
const jwt = require("jsonwebtoken");
const UserDAO = require("../DAO/UserDAO");
const { generateAccessToken, generateRefreshToken } = require("../utils/utils");
const COOKIE_OPTIONS = require("../config/cookieOptions");
const RefreshTokenDAO = require("../DAO/RefreshTokenDAO");

module.exports.signUp = async (req, res) => {
  try {
    const newCustomer = new Customer(req.body.customer);
    await CustomerDAO.save(newCustomer);
    return res.status(201).json({ message: "Tạo tài khoản thành công" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

module.exports.checkAccount = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Email và mật khẩu là bắt buộc" });

  try {
    const user = await UserDAO.findUserByEmail(email);

    // Kiểm tra nếu user không tồn tại
    if (!user) {
      return res
        .status(401)
        .json({ message: "Thông tin đăng nhập không chính xác" });
    }
    // Kiểm tra mật khẩu
    const isMatch = user.login(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Thông tin đăng nhập không chính xác" });
    }
    return res.status(200).json({ message: "Email và mật khẩu hợp lệ" });
  } catch (err) {
    return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};

module.exports.isEmailAvailable = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email)
      return res.status(400).json({ message: "Email không được để trống" });

    const exists = await UserDAO.findUserByEmail(email);
    if (exists)
      return res.status(409).json({ message: "Email đã có người đăng kí" });

    return res.status(200).json({ message: "Email chưa có người đăng kí" });
  } catch {
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

module.exports.identityVerification = async (req, res) => {
  const { fullName, nationalID, email } = req.body;
  if (!fullName || !nationalID || !email)
    return res.status(400).json({ message: "Thiếu thông tin cần thiết" });

  try {
    const user = await UserDAO.getUserByNameNationalIdAndEmail(
      fullName,
      nationalID,
      email
    );
    if (user) return res.status(200).json({ message: "Xác thực thành công" });
    return res.status(404).json({ message: "Không tìm thấy người dùng" });
  } catch {
    return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};

module.exports.login = async (req, res) => {
  const { email: antiByPassEmail } = req.antiByPass || {};
  const { email, password } = req.body;

  if (!antiByPassEmail || email !== antiByPassEmail)
    return res.status(401).json({ message: "Truy cập bị từ chối" });

  try {
    const user = await UserDAO.findUserByEmail(email);
    const isMatch = user.login(password);
    if (!isMatch) throw new Error("Thông tin đăng nhập không chính xác");

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    await RefreshTokenDAO.storeRefreshToken(user._id, refreshToken);

    res.cookie("accessToken", accessToken, COOKIE_OPTIONS.normal);

    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS.normal);

    res.clearCookie("OTPToken", COOKIE_OPTIONS.otp);

    return res.status(200).json({ message: "Đăng nhập thành công" });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: err.message || "Lỗi máy chủ nội bộ" });
  }
};

module.exports.refreshToken = async (req, res) => {
  const token = req.cookies.refreshToken;

  if (!token)
    return res.status(401).json({ message: "Bạn không được xác thực" });

  try {
    const found = await RefreshTokenDAO.fetchRefreshToken(token);
    if (!found) throw new Error("Token làm mới không hợp lệ");

    jwt.verify(token, process.env.JWT_REFRESH_SECRET_KEY, (err, user) => {
      if (err) {
        res.clearCookie("refreshToken");
        return res.status(403).json({ message: "Token không hợp lệ" });
      }

      const newAccessToken = generateAccessToken(user);
      res.cookie("accessToken", newAccessToken, COOKIE_OPTIONS.normal);
      return res.status(200).json({ message: "Làm mới token thành công" });
    });
  } catch {
    res.clearCookie("refreshToken");
    return res.status(403).json({ message: "Token không hợp lệ" });
  }
};

module.exports.logout = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) await RefreshTokenDAO.deleteRefreshToken(token);

    res.clearCookie("accessToken", COOKIE_OPTIONS.normal);
    res.clearCookie("refreshToken", COOKIE_OPTIONS.normal);

    return res.status(200).json({ message: "Đăng xuất thành công" });
  } catch {
    return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};

module.exports.validateJWT = async (req, res) => {
  const token = req.cookies.accessToken;

  if (!token) {
    res.clearCookie("accessToken", COOKIE_OPTIONS.normal);
    return res
      .status(401)
      .json({ message: "Không được phép - Không có token" });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
      if (err)
        return res.status(403).json({
          message: "Không được phép - Token không hợp lệ hoặc đã hết hạn",
        });

      return res.status(200).json({ message: "Xác thực thành công" });
    });
  } catch {
    return res.status(403).json({
      message: "Không được phép - Token không hợp lệ hoặc đã hết hạn",
    });
  }
};
