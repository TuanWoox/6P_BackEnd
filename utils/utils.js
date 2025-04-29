const CheckingAccount = require("../models/checkingAccount");
const jwt = require("jsonwebtoken");

module.exports.generateUniqueAccountNumber = async () => {
  let accountNumber;
  let exists = true;

  while (exists) {
    const timestampPart = Date.now().toString().slice(-8);
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    accountNumber = `${timestampPart}${randomPart}`;

    exists = await CheckingAccount.exists({ accountNumber });
  }

  return accountNumber;
};
module.exports.generateAccessToken = (foundCustomer) => {
  const accessToken = jwt.sign(
    {
      customerId: foundCustomer._id || foundCustomer.customerId,
      email: foundCustomer.email,
      fullName: foundCustomer.fullName,
    },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: "30s",
    }
  );
  return accessToken;
};
module.exports.generateRefreshToken = (foundCustomer) => {
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
module.exports.generateOTPToken = (email) => {
  const OTPToken = jwt.sign(
    {
      email: email,
    },
    process.env.JWT_OTP_SECRET_KEY,
    {
      expiresIn: "1m",
    }
  );
  return OTPToken;
};
