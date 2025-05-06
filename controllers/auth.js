// controllers/authController.js
const Customer = require("../models/customer");
const CustomerDAO = require("../DAO/CustomerDAO");
const AuthDAO = require("../DAO/AuthDAO");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { generateAccessToken, generateRefreshToken } = require("../utils/utils");

module.exports.signUp = async (req, res) => {
  try {
    const newCustomer = new Customer(req.body.customer);
    await CustomerDAO.createCustomer(newCustomer);
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
    const user = await AuthDAO.login(email, password);
    if (!user)
      return res
        .status(401)
        .json({ message: "Thông tin đăng nhập không chính xác" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Thông tin đăng nhập không chính xác" }); // Early return if password does not match
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

    const exists = await AuthDAO.isEmailAvailable(email);
    if (exists)
      return res.status(409).json({ message: "Email đã có người đăng kí" });

    return res.status(200).json({ message: "Email chưa có người đăng kí" });
  } catch {
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

module.exports.checkEmailAvailable = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email)
      return res.status(400).json({ message: "Email không được để trống" });

    const exists = await AuthDAO.isEmailAvailable(email);
    if (!exists)
      return res.status(409).json({ message: "Email chưa có người đăng kí" });

    return res.status(200).json({ message: "Email đã có người đăng kí" });
  } catch {
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

module.exports.identityVerification = async (req, res) => {
  const { fullName, nationalID, email } = req.body;
  if (!fullName || !nationalID || !email)
    return res.status(400).json({ message: "Thiếu thông tin cần thiết" });

  try {
    const user = await AuthDAO.identityVerification(
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
    return res.status(401).json({ message: "Forbidden" });

  try {
    const customer = await AuthDAO.login(email, password);
    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) throw new Error("Thông tin đăng nhập không chính xác");

    const accessToken = generateAccessToken(customer);
    const refreshToken = generateRefreshToken(customer);
    await AuthDAO.storeRefreshToken(customer, refreshToken);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/auth",
    });

    res.clearCookie("OTPToken", { path: "/" });

    return res.status(200).json({ message: "Login Successfully" });
  } catch (err) {
    return res
      .status(500)
      .json({ message: err.message || "Internal Server Error" });
  }
};

module.exports.refreshToken = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token)
    return res.status(401).json({ message: "Bạn không được xác thực" });

  try {
    const found = await AuthDAO.fetchRefreshToken(token);
    if (!found) throw new Error("Invalid refresh token");

    jwt.verify(token, process.env.JWT_REFRESH_SECRET_KEY, (err, user) => {
      if (err) {
        res.clearCookie("refreshToken");
        return res.status(403).json({ message: "Token không hợp lệ" });
      }

      const newAccessToken = generateAccessToken(user);
      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
      });

      return res.status(200).json({ message: "Token refreshed successfully" });
    });
  } catch {
    res.clearCookie("refreshToken");
    return res.status(403).json({ message: "Token không hợp lệ" });
  }
};

module.exports.logout = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) await AuthDAO.deleteRefreshToken(token);

    res.clearCookie("accessToken", { path: "/" });
    res.clearCookie("refreshToken", { path: "/auth" });

    return res.status(200).json({ message: "Đăng xuất thành công" });
  } catch {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports.validateJWT = async (req, res) => {
  const token = req.cookies.accessToken;
  const refreshToken = req.cookies.refreshToken;

  if (!token || !refreshToken) {
    res.clearCookie("accessToken", { path: "/" });
    res.clearCookie("refreshToken", { path: "/auth" });
    return res
      .status(401)
      .json({ message: "Unauthorized - No token provided" });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
      if (err)
        return res
          .status(403)
          .json({ message: "Unauthorized - Invalid or expired token" });

      return res.status(200).json({ message: "Validate Successfully" });
    });
  } catch {
    return res
      .status(403)
      .json({ message: "Unauthorized - Invalid or expired token" });
  }
};
