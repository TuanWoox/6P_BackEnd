const authService = require("../services/authService");

module.exports.signUp = async (req, res) => {
  try {
    await authService.signUp(req.body.customer);
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
    const user = await authService.checkAccount(email, password);
    if (!user)
      return res
        .status(401)
        .json({ message: "Thông tin đăng nhập không chính xác" });
    return res.status(200).json({ message: "Email và mật khẩu hợp lệ" });
  } catch {
    return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};

module.exports.isEmailAvailable = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email)
      return res.status(400).json({ message: "Email không được để trống" });

    const exists = await authService.isEmailAvailable(email);
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

    const exists = await authService.checkEmailExists(email);
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
    const user = await authService.identityVerification(
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
    const { accessToken, refreshToken } = await authService.login(
      email,
      password
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
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
    const newAccessToken = await authService.refreshToken(token);
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(200).json({ message: "Token refreshed successfully" });
  } catch {
    res.clearCookie("refreshToken");
    return res.status(403).json({ message: "Token không hợp lệ" });
  }
};

module.exports.logout = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) await authService.logout(token);

    res.clearCookie("accessToken", { path: "/" });
    res.clearCookie("refreshToken", { path: "/auth" });

    return res.status(200).json({ message: "Đăng xuất thành công" });
  } catch {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports.validateJWT = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token)
    return res
      .status(401)
      .json({ message: "Unauthorized - No token provided" });

  try {
    await authService.validateJWT(token);
    return res.status(200).json({ message: "Validate Successfully" });
  } catch {
    return res
      .status(403)
      .json({ message: "Unauthorized - Invalid or expired token" });
  }
};
