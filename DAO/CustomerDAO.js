const Customer = require("../models/customer");
const bcrypt = require("bcrypt");

class CustomerDAO {
  async createCustomer(newCustomer) {
    try {
      await newCustomer.save();
    } catch (error) {
      throw error;
    }
  }
  async getCustomerProfile(customerId) {
    try {
      const foundUser = await Customer.findById(customerId);
      if (!foundUser) {
        return null;
      }
      return foundUser;
    } catch (err) {
      throw err;
    }
  }
  async getCustomerName(customerId) {
    try {
      const { fullName } = await Customer.findById(customerId);
      if (!fullName) {
        return null;
      }
      return fullName;
    } catch (err) {
      throw err;
    }
  }
  async getCustomerIdByEmailandNationalID(email, nationalID) {
    try {
      const foundUser = await Customer.findOne({
        email: email,
        nationalID: nationalID,
      });
      if (!foundUser) {
        return null;
      }
      return foundUser._id;
    } catch (err) {
      throw err;
    }
  }
  async resetPassword(customer, newPassword) {
    try {
      customer.password = newPassword;
      await customer.save();
    } catch (err) {
      throw err;
    }
  }
  async getCustomerEmail(customerId) {
    try {
      const { email } = await Customer.findById(customerId);
      if (!email) {
        return null;
      }
      return email;
    } catch (err) {
      throw err;
    }
  }
  async changePassword(customerId, oldPassword, newPassword) {
    try {
      const customer = await this.getCustomerProfile(customerId);
      if (!customer) {
        return { success: false, error: "Không tìm thấy tài khoản" };
      }

      const isMatch = await bcrypt.compare(oldPassword, customer.password);
      if (!isMatch) {
        return { success: false, error: "Mật khẩu hiện tại không đúng" };
      }

      customer.changePassword(newPassword);
      await customer.save();

      return { success: true };
    } catch (err) {
      throw err;
    }
  }
  async saveCustomer(customer) {
    try {
      const savedCustomer = await customer.save();
      return savedCustomer;
    } catch (err) {
      throw new Error(`Failed to save customer: ${err.message}`);
    }
  }
}
module.exports = new CustomerDAO();
