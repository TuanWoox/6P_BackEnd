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
      throw (err);
    }
  }

  static async createSavingAccount(
    customerId,
    savingTypeInterestId,
    balance,
    accountNumber
  ) {
    try {
      const checkingAccount = await CheckingAccountDAO.getByAccountNumber(
        accountNumber
      );

      if (!checkingAccount || checkingAccount.owner.toString() !== customerId) {
        throw new Error("Unauthorized or invalid account");
      }

      const availableBalance =
        checkingAccount.balance +
        (checkingAccount.overdraftProtection
          ? checkingAccount.dailyTransactionLimit
          : 0);
      if (availableBalance < balance) {
        throw new Error("Insufficient funds");
      }

      const savingType = await SavingTypeInterestDAO.getSavingTypeInterestById(
        savingTypeInterestId
      );
      if (!savingType) {
        throw new Error("Saving type not found");
      }

      const now = new Date();
      let nextEarningDate;
      let finishEarningDate = null;

      if (savingType.maturityPeriod === 0) {
        nextEarningDate = new Date(now);
        nextEarningDate.setDate(now.getDate() + 1);
      } else {
        nextEarningDate = new Date(now);
        nextEarningDate.setMonth(now.getMonth() + 1);

        finishEarningDate = new Date(now);
        finishEarningDate.setMonth(now.getMonth() + savingType.maturityPeriod);
      }

      const number = await generateUniqueAccountNumber();

      const newSavingAccount = new SavingAccount({
        accountNumber: number,
        owner: customerId,
        balance,
        savingTypeInterest: savingTypeInterestId,
        nextEarningDate,
        finishEarningDate,
      });

      checkingAccount.balance -= balance;

      const transaction = new Transaction({
        type: "DEPOSIT",
        amount: balance,
        description: `Tạo tài khoản tiết kiệm ${newSavingAccount.accountNumber}`,
        sourceAccountID: checkingAccount.accountNumber,
        destinationAccountID: newSavingAccount.accountNumber,
        status: "Completed",
      });

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

      const principalAmount = saving.balance;
      const dateOpened = saving.dateOpened;
      const savingInterest = saving.savingTypeInterest || {};

      const dailyInterestRate = savingInterest.dailyInterestRate ?? 0;
      const monthlyInterestRate = savingInterest.monthlyInterestRate ?? 0;
      const maturityPeriod = savingInterest.maturityPeriod ?? 0;
      const percentMoneyLose0 = savingInterest.percentMoneyLose0 ?? 0;

      const today = new Date();
      const openedDate = new Date(dateOpened);
      const daysDeposited = differenceInDays(today, openedDate);

      const maturityDate = new Date(openedDate);
      maturityDate.setMonth(maturityDate.getMonth() + maturityPeriod);
      const isEarlyWithdrawal = maturityPeriod > 0 && today < maturityDate;

      let interestEarned = 0;
      if (maturityPeriod === 0) {
        interestEarned =
          principalAmount * (dailyInterestRate / 100) * daysDeposited;
      } else {
        interestEarned =
          principalAmount * (monthlyInterestRate / 100) * maturityPeriod;
      }

      let totalAmount = principalAmount + interestEarned;
      let penaltyAmount = 0;

      if (isEarlyWithdrawal) {
        penaltyAmount = interestEarned;
        totalAmount -= penaltyAmount;
      }

      checkingAccount.balance += totalAmount;
      saving.status = "CLOSED";
      saving.updatedAt = today;

      const transaction = new Transaction({
        type: "WITHDRAWAL",
        amount: totalAmount,
        description: isEarlyWithdrawal
          ? "Tất toán trước hạn"
          : "Tất toán đúng hạn",
        sourceAccountID: saving.accountNumber,
        destinationAccountID: checkingAccount.accountNumber,
        status: "Completed",
      });

      await transaction.validate();

      await Promise.all([
        checkingAccount.save(),
        saving.save(),
        transaction.save(),
      ]);

      return {
        totalAmount,
        principalAmount,
        interestEarned,
        penaltyAmount,
        isEarlyWithdrawal,
      };
    } catch (err) {
      throw new Error(err.message || "Lỗi hệ thống khi tất toán.");
    }
  }
}

module.exports = SavingAccountController;
