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
      const foundCheckingAccount = await CheckingAccount.findOne({
        owner: customerId,
      });
      return foundCheckingAccount;
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
      const foundCheckingAccount = await CheckingAccount.find({
        owner: customerId,
      }).populate("owner", "email"); // <-- populate the owner field with fullName
      return foundCheckingAccount;
    } catch (err) {
      throw err;
    }
  }
  async checkAvilableTargetAccount(targetAccount) {
    try {
      const found = await CheckingAccount.findOne(
        { accountNumber: targetAccount, status: "ACTIVE" },
        "owner" // <-- only select the owner field
      )
        .populate("owner", "fullName") // <-- only populate fullName
        .lean(); // <-- returns a plain JS object
      if (found) return found;
      return null;
    } catch (error) {
      console.error("Error:", error.message);
      throw error;
    }
  }
}
module.exports = new CheckingAccountDAO();
