const User = require("../models/user");

class UserDao {
  async findUserByEmail(email) {
    try {
      const foundUser = await User.findOne({ email: email });
      return foundUser;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = new UserDao();
