// authMiddleware.js
const jwt = require("jsonwebtoken");

const authenticateToken = async (req, res, next) => {
  const jwtSecretKey = process.env.JWT_SECRET_KEY;

  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ error: "Access Denied: No Token Provided" });
    }

    const token = authHeader.split(" ")[1];
    const verified = jwt.verify(token, jwtSecretKey);

    next();
  } catch (error) {
    return res.status(401).json({ error: "Access Denied: " + error.message });
  }
};

module.exports = authenticateToken;
