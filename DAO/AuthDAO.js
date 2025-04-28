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
  async identityVerification(fullName, nationalID, email){
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

      const isMatch = await bcrypt.compare(password, foundCustomer.password);
      if (!isMatch) {
        return null; // Password does not match
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
}

module.exports = new AuthDAO();
