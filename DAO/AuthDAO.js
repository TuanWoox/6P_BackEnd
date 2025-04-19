const User = require("../models/user");

class AuthDAO {
  async isEmailAvailable(email) {
    try {
      const foundUser = await User.findOne({ email });
      return foundUser;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new AuthDAO();
