// services/TransactionService.js
const TransactionDAO = require("../DAO/TransactionDAO");
const Account = require("../models/account");

class TransactionService {
  static async getTransactionHistory(userId) {
    try {
      // Fetching user accounts and account numbers
      const userAccounts = await Account.find({ owner: userId }).select(
        "accountNumber"
      );
      const accountNumbers = userAccounts.map((acc) => acc.accountNumber);

      // Fetching transaction history
      const history = await TransactionDAO.getHistoryByUserId(userId);

      // Defining transaction types
      const IN_TYPES = ["DEPOSIT", "RECEIVED", "REFUND"];
      const OUT_TYPES = ["WITHDRAWAL"];

      // Mapping and adding 'direction' to transactions
      const formattedHistory = history.map((txDoc) => {
        const tx = txDoc.toObject ? txDoc.toObject() : txDoc;
        let direction = "unknown";

        if (tx.type === "TRANSFER") {
          if (accountNumbers.includes(tx.destinationAccountID)) {
            direction = "in";
          } else if (accountNumbers.includes(tx.sourceAccountID)) {
            direction = "out";
          }
        } else if (IN_TYPES.includes(tx.type)) {
          direction = "in";
        } else if (OUT_TYPES.includes(tx.type)) {
          direction = "out";
        }

        return { ...tx, direction };
      });

      return formattedHistory;
    } catch (error) {
      throw new Error("Error fetching transaction history: " + error.message);
    }
  }
}

module.exports = TransactionService;
