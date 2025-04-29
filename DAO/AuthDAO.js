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
  async login(email, password) {
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
  async storeRefreshToken(customerId, refreshToken) {
    try {
      // First delete any existing tokens for this user
      await RefreshToken.deleteMany({ customerId });

      // Then create the new token
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
      if (!foundRefreshToken) return null;
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
