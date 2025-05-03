// services/AuthService.js
const Customer = require("../models/customer");
const CustomerDAO = require("../DAO/CustomerDAO");
const AuthDAO = require("../DAO/AuthDAO");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { generateAccessToken, generateRefreshToken } = require("../utils/utils");

class AuthService {
  static async signUp(customerData) {
    const newCustomer = new Customer(customerData);
    return await CustomerDAO.createCustomer(newCustomer);
  }

  static async checkAccount(email, password) {
    return await AuthDAO.login(email, password);
  }

  static async isEmailAvailable(email) {
    return await AuthDAO.isEmailAvailable(email);
  }

  static async checkEmailExists(email) {
    return await AuthDAO.isEmailAvailable(email);
  }

  static async identityVerification(fullName, nationalID, email) {
    return await AuthDAO.identityVerification(fullName, nationalID, email);
  }

  static async login(email, password) {
    const customer = await AuthDAO.login(email, password);
    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) throw new Error("Invalid credentials");

    const accessToken = generateAccessToken(customer);
    const refreshToken = generateRefreshToken(customer);
    await AuthDAO.storeRefreshToken(customer, refreshToken);

    return { accessToken, refreshToken };
  }

  static async refreshToken(token) {
    const found = await AuthDAO.fetchRefreshToken(token);
    if (!found) throw new Error("Invalid refresh token");

    return new Promise((resolve, reject) => {
      jwt.verify(token, process.env.JWT_REFRESH_SECRET_KEY, (err, user) => {
        if (err) return reject(err);
        const newAccessToken = generateAccessToken(user);
        resolve(newAccessToken);
      });
    });
  }

  static async logout(token) {
    return await AuthDAO.deleteRefreshToken(token);
  }

  static async validateJWT(token) {
    return new Promise((resolve, reject) => {
      jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
        if (err) return reject(err);
        resolve(user);
      });
    });
  }
}

module.exports = AuthService;
