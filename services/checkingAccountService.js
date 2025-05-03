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
    currentAccount.transferMoney(destAccount, amount);
    const newTransaction = new Transaction({
      type: "TRANSFER",
      amount,
      description,
      sourceAccountID: currentAccount.accountNumber,
      destinationAccountID: targetAccount,
      status: "Completed",
    });
    await Promise.all([
      CheckingAccountDAO.save(currentAccount),
      CheckingAccountDAO.save(destAccount),
    ]);

    return await transactionDAO.createTransfer(newTransaction);
  }
}

module.exports = CheckingAccountService;
