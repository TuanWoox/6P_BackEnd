const SavingAccountDAO = require("../DAO/SavingAccountDAO");
const SavingTypeInterestDAO = require("../DAO/SavingTypeInterestDAO");
const CheckingAccountDAO = require("../DAO/CheckingAccountDAO");
const TransactionDAO = require("../DAO/TransactionDAO");
const Transaction = require("../models/Transaction");
const { generateUniqueAccountNumber } = require("../utils/utils");
const { differenceInDays } = require("date-fns");
const SavingAccount = require("../models/savingAccount");
const DepositTypeDAO = require("../DAO/DepositTypeDAO");
const SavingTypeDAO = require("../DAO/SavingTypeDAO");

class SavingAccountController {
  static async getSavingAccounts(customerId) {
    try {
      return await SavingAccountDAO.getAllSavingAccounts(customerId);
    } catch (err) {
      throw new Error("Internal Server Error");
    }
  }

  static async getSavingAccountById(accountId, customerId) {
    try {
      const foundSavingAccount = await SavingAccountDAO.getSavingAccountById(
        accountId,
        customerId
      );
      if (
        foundSavingAccount &&
        foundSavingAccount.owner._id.toString() === customerId
      ) {
        return foundSavingAccount;
      }
      throw new Error("Không tìm thấy tài khoản hoặc không có quyền truy cập");
    } catch (err) {
      throw new Error("Internal Server Error");
    }
  }

  static async getAllSavingTypes() {
    try {
      return await SavingTypeDAO.getAllSavingTypes();
    } catch (err) {
      throw new Error("Internal Server Error");
    }
  }

  static async getAllSavingDepositTypes() {
    try {
      return await DepositTypeDAO.getAllDepositTypes();
    } catch (err) {
      console.log(err);
      throw new Error("Internal Server Error");
    }
  }
  static async getAllSavingInterestRates() {
    try {
      const savingInterestRates =
        await SavingTypeInterestDAO.getAllSavingTypeInterest();
      return savingInterestRates;
    } catch (err) {
      throw err;
    }
  }

  static async createSavingAccount(
    customerId,
    savingTypeInterestId,
    balance,
    accountNumber
  ) {
    try {
      // Validate checking account ownership
      const checkingAccount = await CheckingAccountDAO.getByAccountNumber(
        accountNumber
      );
      if (!checkingAccount || checkingAccount.owner.toString() !== customerId) {
        throw new Error("Unauthorized or invalid account");
      }

      // Check for sufficient balance
      if (!checkingAccount.hasSufficientBalance(balance)) {
        throw new Error("Insufficient funds");
      }

      // Retrieve and validate saving type
      const savingType = await SavingTypeInterestDAO.getSavingTypeInterestById(
        savingTypeInterestId
      );
      if (!savingType) {
        throw new Error("Saving type not found");
      }

      // Determine interest dates
      const now = new Date();
      let nextEarningDate = new Date(now);
      let finishEarningDate = null;

      if (savingType.maturityPeriod === 0) {
        nextEarningDate.setDate(now.getDate() + 1);
      } else {
        nextEarningDate.setMonth(now.getMonth() + 1);
        finishEarningDate = new Date(now);
        finishEarningDate.setMonth(now.getMonth() + savingType.maturityPeriod);
      }

      // Create saving account
      const newAccountNumber = await generateUniqueAccountNumber();
      const newSavingAccount = new SavingAccount({
        accountNumber: newAccountNumber,
        owner: customerId,
        balance: 0,
        savingTypeInterest: savingTypeInterestId,
        nextEarningDate,
        finishEarningDate,
      });

      // Perform deposit
      checkingAccount.depositSavingAccount(newSavingAccount, balance);

      // Create transaction record
      const transaction = new Transaction({
        type: "DEPOSIT",
        amount: balance,
        description: `Tạo tài khoản tiết kiệm ${newSavingAccount.accountNumber}`,
        sourceAccountID: checkingAccount.accountNumber,
        destinationAccountID: newSavingAccount.accountNumber,
        status: "Completed",
      });

      // Persist changes
      await Promise.all([
        SavingAccountDAO.createSavingAccount(newSavingAccount),
        CheckingAccountDAO.save(checkingAccount),
        TransactionDAO.createTransfer(transaction),
      ]);

      return newSavingAccount;
    } catch (err) {
      throw new Error(err.message || "Internal server error");
    }
  }

  static async withdrawSaving(customerId, accountId) {
    try {
      const saving = await SavingAccountDAO.getSavingAccountById(accountId);
      if (!saving || saving.status !== "ACTIVE") {
        throw new Error("Sổ tiết kiệm không tồn tại hoặc đã tất toán.");
      }

      const checkingAccount = await CheckingAccountDAO.getCheckingAccount(
        customerId
      );
      if (!checkingAccount) {
        throw new Error("Tài khoản thanh toán không tồn tại.");
      }
      const withdrawalDetails = await saving.withdraw(checkingAccount);
      return withdrawalDetails;
    } catch (err) {
      throw new Error(err.message || "Lỗi hệ thống khi tất toán.");
    }
  }
}

module.exports = SavingAccountController;
