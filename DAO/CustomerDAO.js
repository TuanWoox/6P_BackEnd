const Customer = require("../models/customer");

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
}
module.exports = new CustomerDAO();
