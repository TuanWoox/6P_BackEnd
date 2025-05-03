const Customer = require("../models/customer");
const CustomerDAO = require("../DAO/CustomerDAO");
const CheckingAccountDAO = require("../DAO/CheckingAccountDAO");
const bcrypt = require("bcrypt");

class CustomerService {
  static async getInformationForSideBar(customerId) {
    const fullName = await CustomerDAO.getCustomerName(customerId);
    const checkingAccount = await CheckingAccountDAO.getCheckingAccount(
      customerId
    );
    if (!fullName) throw new Error("Customer name not found");
    return { fullName, checkingAccount };
  }

  static async getCustomerID(email, nationalID) {
    if (!email || !nationalID) {
      throw new Error("Missing required information");
    }
    const customerId = await CustomerDAO.getCustomerIdByEmailandNationalID(
      email,
      nationalID
    );
    if (!customerId) throw new Error("Customer not found");
    return customerId;
  }

  static async resetPassword(customerId, newPassword) {
    const customer = await CustomerDAO.getCustomerProfile(customerId);
    if (!customer) throw new Error("Customer not found");
    return CustomerDAO.resetPassword(customer, newPassword);
  }

  static async getEmail(customerId) {
    const email = await CustomerDAO.getCustomerEmail(customerId);
    if (!email) throw new Error("Email not found");
    return email;
  }

  static async changePassword(customerId, oldPassword, newPassword) {
    const result = await CustomerDAO.changePassword(
      customerId,
      oldPassword,
      newPassword
    );
    if (!result.success) throw new Error(result.error);
    return true;
  }

  static async getCustomerProfile(customerId) {
    const customerProfile = await CustomerDAO.getCustomerProfile(customerId);
    const checkingAccount = await CheckingAccountDAO.getCheckingAccount(
      customerId
    );
    if (!customerProfile || !checkingAccount) {
      throw new Error("Profile or checking account not found");
    }
    return { customerProfile, checkingAccount };
  }

  static async updateCustomerProfile(customerId, updatedData) {
    const customer = await CustomerDAO.getCustomerProfile(customerId);
    if (!customer) throw new Error("Customer not found");
    customer.updateCustomerProfile(data);
    const savedCustomer = await CustomerDAO.saveCustomer(customer);
    if (!savedCustomer) throw new Error("Unable to update customer profile");
    return true;
  }
}

module.exports = CustomerService;
