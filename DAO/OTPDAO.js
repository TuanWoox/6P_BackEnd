const OTP = require("../models/OTP");

class OTPDAO {
  async hasValidOTP(email) {
    const otp = await OTP.findOne({
      email,
      expiresAt: { $gt: Date.now() },
    });
    return !!otp; // returns true if otp exists, false otherwise
  }

  async findByOtp(otp) {
    return OTP.findOne({ otp });
  }

  async createOTP(newOTP) {
    return await newOTP.save();
  }

  async deleteById(id) {
    return OTP.deleteOne({ _id: id });
  }
}

module.exports = new OTPDAO();
