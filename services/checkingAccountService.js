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
    try {
      // Get source account
      const currentAccount = await CheckingAccountDAO.getCheckingAccount(
        userId
      );
      if (!currentAccount || currentAccount.status !== "ACTIVE") {
        throw new Error("Invalid or inactive source account");
      }

      // Get destination account
      const destAccount = await CheckingAccountDAO.getByAccountNumber(
        targetAccount
      );
      if (!destAccount || destAccount.status !== "ACTIVE") {
        throw new Error("Invalid or inactive destination account");
      }

      // Check balance
      if (!currentAccount.hasSufficientBalance(amount)) {
        throw new Error("Insufficient funds");
      }

      // Perform transfer
      currentAccount.transferMoney(destAccount, amount);

      // Create transaction record
      const newTransaction = new Transaction({
        type: "TRANSFER",
        amount,
        description,
        sourceAccountID: currentAccount.accountNumber,
        destinationAccountID: destAccount.accountNumber,
        status: "Completed",
      });

      // Save updates
      await Promise.all([
        CheckingAccountDAO.save(currentAccount),
        CheckingAccountDAO.save(destAccount),
      ]);

      // Persist transaction
      return await transactionDAO.createTransfer(newTransaction);
    } catch (err) {
      throw new Error(err.message || "Internal server error");
    }
  }
}

module.exports = CheckingAccountService;
