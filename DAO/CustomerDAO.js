const Customer = require("../models/customer");

class CustomerDAO {
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

  async save(customer) {
    try {
      return await customer.save();
    } catch (err) {
      throw new Error(`Failed to save customer: ${err.message}`);
    }
  }
}
module.exports = new CustomerDAO();
