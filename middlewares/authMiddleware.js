const jwt = require("jsonwebtoken");

// Server-side middleware update
module.exports.authenticateToken = (req, res, next) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
    if (err) {
      // Check if refresh token exists before proceeding
      if (!req.cookies.refreshToken) {
        return res.status(401).json({ message: "No refresh token available" });
      }

      return res.status(403).json({ message: "Invalid or expired token" });
    }
    req.user = decoded;
    next();
  });
};

module.exports.antiByPass = (req, res, next) => {
  const OTPToken = req.cookies.OTPToken;
  if (!OTPToken) {
    return res.status(401).json({ message: "Authentication required" });
  }
  jwt.verify(OTPToken, process.env.JWT_OTP_SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    req.antiByPass = decoded;
    next();
  });
};
