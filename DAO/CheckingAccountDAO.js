const CheckingAccount = require("../models/checkingAccount");

class CheckingAccountDAO {
  async save(accountInstance) {
    try {
      return accountInstance.save();
    } catch (err) {
      throw err;
    }
  }

  async getCheckingAccount(customerId) {
    try {
      return await CheckingAccount.findOne({
        owner: customerId,
      });
    } catch (err) {
      throw err;
    }
  }
  async getByAccountNumber(accountNumber) {
    try {
      return CheckingAccount.findOne({ accountNumber: accountNumber });
    } catch (err) {
      throw err;
    }
  }
  async getAllCheckingAccount(customerId) {
    try {
      return await CheckingAccount.find({
        owner: customerId,
      }).populate("owner", "email"); // <-- populate the owner field with fullName
    } catch (err) {
      throw err;
    }
  }
  async checkAvilableTargetAccount(targetAccount) {
    try {
      return await CheckingAccount.findOne(
        { accountNumber: targetAccount, status: "ACTIVE" },
        "owner" // <-- only select the owner field
      )
        .populate("owner", "fullName") // <-- only populate fullName
        .lean(); // <-- returns a plain JS object
    } catch (error) {
      throw error;
    }
  }
}
module.exports = new CheckingAccountDAO();
