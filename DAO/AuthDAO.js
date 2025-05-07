const User = require("../models/user");
const Customer = require("../models/customer");
const RefreshToken = require("../models/refreshToken");
const bcrypt = require("bcrypt");

class AuthDAO {
  async isEmailAvailable(email) {
    try {
      const foundUser = await User.findOne({ email });
      return foundUser;
    } catch (err) {
      throw err;
    }
  }
  async identityVerification(fullName, nationalID, email) {
    try {
      const foundUser = await Customer.findOne({ fullName, nationalID, email });
      if (foundUser) {
        return foundUser;
      } else {
        return null; // User not found
      }
    } catch (err) {
      throw err; // Re-throw the error for handling upstream
    }
  }
  async getAccount(email) {
    try {
      const foundCustomer = await Customer.findOne({ email });
      if (!foundCustomer) {
        return null; // Customer not found
      }

      return foundCustomer; // Login successful
    } catch (err) {
      throw err; // Re-throw the error for handling upstream
    }
  }

  async changePassword(customerId, oldPassword, newPassword) {
    try {
      const foundCustomer = await Customer.findById(customerId);
      if (!foundCustomer) {
        return { success: false, error: "Không tìm thấy tài khoản" };
      }

      const isMatch = await bcrypt.compare(oldPassword, foundCustomer.password);
      if (!isMatch) {
        return { success: false, error: "Mật khẩu hiện tại không đúng" };
      }

      // The password will be hashed by the pre-save hook in the User model
      foundCustomer.password = newPassword;
      await foundCustomer.save();

      return { success: true };
    } catch (err) {
      throw err;
    }
  }
}

module.exports = new AuthDAO();
