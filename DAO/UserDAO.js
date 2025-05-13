const User = require("../models/user");

class UserDao {
  async findUserByEmail(email) {
    try {
      return await User.findOne({ email });
    } catch (err) {
      throw err;
    }
  }
  async getUserByNameNationalIdAndEmail(fullName, nationalID, email) {
    try {
      return await Customer.findOne({ fullName, nationalID, email });
    } catch (err) {
      throw err; // Re-throw the error for handling upstream
    }
  }
}

module.exports = new UserDao();
