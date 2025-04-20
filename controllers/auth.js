const jwt = require("jsonwebtoken");
const Customer = require("../models/customer");
const CustomerDAO = require("../DAO/CustomerDAO");
const AuthDAO = require("../DAO/AuthDAO");
module.exports.signUp = async (req, res, next) => {
  const newCustomer = new Customer({
    ...req.body.customer,
  });

  try {
    await CustomerDAO.createCustomer(newCustomer);
    return res.status(201).json({
      message: "Tạo tài khoản thành công",
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Thất bại trong việc tạo tài khoản",
    });
  }
};
module.exports.isEmailAvailable = async (req, res, next) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ message: "Email không được để trống" });
    }
    const foundUser = await AuthDAO.isEmailAvailable(email);

    if (foundUser) {
      return res.status(409).json({ message: "Email đã có người đăng kí" });
    }
    return res.status(200).json({ message: "Email chưa có người đăng kí" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Lỗi hệ thống, vui lòng thử lại sau" });
  }
};

module.exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const foundCustomer = await AuthDAO.login(email, password);
    if (foundCustomer) {
      const accessToken = generateAccessToken(foundCustomer);
      const refreshToken = generateRefreshToken(foundCustomer);
      await AuthDAO.storeRefreshToken(foundCustomer, refreshToken);
      // Set tokens as HTTP-only cookies
      res.cookie("accessToken", accessToken, {
        httpOnly: true, // Prevents JavaScript access
        secure: process.env.NODE_ENV === "production", // HTTPS only in production
        sameSite: "strict", // Prevents CSRF attacks
        maxAge: 15 * 60 * 1000, // 15 minutes (matches token expiry)
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/api/auth/refresh", // Only sent to refresh endpoint
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return res.status(200).json({
        message: "Login Successfully",
      });
    }
    return res.status(400).json({ message: "Sai tài khoản hoặc mật khẩu" });
  } catch (e) {
    return res.status(500).json({ message: "Internal Server Errors" });
  }
};

module.exports.refreshToken = async (req, res, next) => {
  // Get token from cookie instead of request body
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: "Bạn không được xác thực" });
  }

  try {
    const foundRefreshToken = await AuthDAO.fetchRefreshToken(refreshToken);
    if (!foundRefreshToken) {
      // Clear the invalid cookie
      res.clearCookie("refreshToken");
      return res.status(403).json({ message: "Token không hợp lệ!" });
    }

    jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET_KEY,
      async (err, user) => {
        if (err) {
          // Clear the invalid cookie
          res.clearCookie("refreshToken");
          return res.status(403).json({ message: "Xác thực token thất bại" });
        }

        // Delete the old refresh token
        await AuthDAO.deleteRefreshToken(refreshToken);

        // Generate new tokens
        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);

        // Store new refresh token
        await AuthDAO.storeRefreshToken(user.customerId, newRefreshToken);

        // Set new cookies
        res.cookie("accessToken", newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 15 * 60 * 1000,
        });

        res.cookie("refreshToken", newRefreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          path: "/api/auth/refresh",
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
          message: "Token refreshed successfully",
        });
      }
    );
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports.logout = async (req, res, next) => {
  // Get refresh token from cookie
  const refreshToken = req.cookies.refreshToken;

  try {
    if (refreshToken) {
      await AuthDAO.deleteRefreshToken(refreshToken);
    }

    // Clear cookies
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    return res.status(200).json({ message: "Đăng xuất thành công" });
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports.validateJWT = async (req, res) => {
  const accessToken = req.cookies.accessToken;
  if (!accessToken) {
    return res
      .status(401)
      .json({ message: "Unauthorized - No token provided" });
  }

  jwt.verify(accessToken, process.env.JWT_SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(401).json({
        message: "Unauthorized - Invalid or expired token",
      });
    }

    return res.status(200).json({
      message: "Validate Successfully",
    });
  });
};

const generateAccessToken = (foundCustomer) => {
  const accessToken = jwt.sign(
    {
      customerId: foundCustomer._id,
      email: foundCustomer.email,
      fullName: foundCustomer.fullName,
    },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: "15m",
    }
  );
  return accessToken;
};
const generateRefreshToken = (foundCustomer) => {
  const refreshToken = jwt.sign(
    {
      customerId: foundCustomer._id,
      email: foundCustomer.email,
      fullName: foundCustomer.fullName,
    },
    process.env.JWT_REFRESH_SECRET_KEY
  );
  return refreshToken;
};
