const CheckingAccountDAO = require("../DAO/CheckingAccountDAO");
const transactionDAO = require("../DAO/TransactionDAO");
const Transaction = require("../models/Transaction");

class CheckingAccountService {
  static async getCheckingAccount(customerId) {
    return await CheckingAccountDAO.getCheckingAccount(customerId);
  }

  static async getAllCheckingAccounts(customerId) {
    return await CheckingAccountDAO.getAllCheckingAccount(customerId);
  }

  static async checkAvailableTargetAccount(accountNumber) {
    return await CheckingAccountDAO.checkAvilableTargetAccount(accountNumber);
  }

  static async transferMoney(userId, { targetAccount, amount, description }) {
    const currentAccount = await CheckingAccountDAO.getCheckingAccount(userId);
    if (!currentAccount || currentAccount.status !== "ACTIVE") {
      throw new Error("Invalid or inactive source account");
    }

    const destAccount = await CheckingAccountDAO.getByAccountNumber(
      targetAccount
    );
    if (!destAccount || destAccount.status !== "ACTIVE") {
      throw new Error("Invalid or inactive destination account");
    }

    const availableBalance =
      currentAccount.balance +
      (currentAccount.overdraftProtection
        ? currentAccount.dailyTransactionLimit
        : 0);

    if (availableBalance < amount) {
      throw new Error("Insufficient funds");
    }

    currentAccount.balance -= amount;
    destAccount.balance += amount;

    await CheckingAccountDAO.save(currentAccount);
    await CheckingAccountDAO.save(destAccount);

    const newTransaction = new Transaction({
      type: "TRANSFER",
      amount,
      description,
      sourceAccountID: currentAccount.accountNumber,
      destinationAccountID: targetAccount,
      status: "Completed",
    });

    return await transactionDAO.createTransfer(newTransaction);
  }
}

module.exports = CheckingAccountService;
