const RefreshToken = require("../models/refreshToken");
class RefreshTokenDAO {
  async storeRefreshToken(customerId, refreshToken) {
    try {
      await RefreshToken.deleteMany({ customerId });

      const refresh = new RefreshToken({
        customerId,
        value: refreshToken,
      });
      await refresh.save();
    } catch (err) {
      throw err;
    }
  }
  async fetchRefreshToken(refreshToken) {
    try {
      const foundRefreshToken = await RefreshToken.findOne({
        value: refreshToken,
      });

      return foundRefreshToken;
    } catch (err) {
      throw err;
    }
  }
  async deleteRefreshToken(refreshToken) {
    try {
      await RefreshToken.deleteOne({ value: refreshToken });
    } catch (err) {
      throw err;
    }
  }
}

module.exports = new RefreshTokenDAO();
