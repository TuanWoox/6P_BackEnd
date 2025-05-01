const savingType = require("../models/savingType");
const SavingTypeInterest = require("../models/savingTypeInterest");
const SavingAccount = require("../models/savingAccount");
const { generateUniqueAccountNumber } = require("../utils/utils");

class SavingAccountDAO {
  async createSavingAccount(savingAccountInstace) {
    try {
      await savingAccountInstace.save();
    } catch (error) {
      throw error;
    }
  }

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
      const accounts = await SavingAccount.find({ owner: customerId }).populate(
        [
          { path: "owner" },
          {
            path: "savingTypeInterest",
            populate: { path: "savingType" },
          },
        ]
      );
      return accounts;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
}

module.exports = new SavingAccountDAO();
