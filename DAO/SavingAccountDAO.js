const SavingAccount = require("../models/savingAccount");

class SavingAccountDAO {
  async getSavingAccountById(accountId) {
    try {
      const foundAccount = await SavingAccount.findById(accountId).populate([
        { path: "owner" },
        {
          path: "savingTypeInterest",
          populate: { path: "savingType" },
        },
      ]);
      if (!foundAccount) {
        return null;
      }
      return foundAccount;
    } catch (err) {
      throw err;
    }
  }

  async getAllSavingAccounts(customerId) {
    try {
      const accounts = await SavingAccount.find({
        owner: customerId,
        status: "ACTIVE",
      }).populate([
        { path: "owner" },
        {
          path: "savingTypeInterest",
          populate: { path: "savingType" },
        },
      ]);
      return accounts;
    } catch (err) {
      throw err;
    }
  }
  async save(savingAccount) {
    try {
      return await savingAccount.save();
    } catch (err) {
      throw err;
    }
  }
}

module.exports = new SavingAccountDAO();
