const Transaction = require("../models/transaction");
const Account = require("../models/account");

class TransactionDAO {
  async getHistoryByUserId(userId) {
    try {
      const accounts = await Account.find({ owner: userId });

      const accountNumbers = accounts.map((acc) => acc.accountNumber);
      if (accountNumbers.length === 0) {
        return [];
      }
      const transactions = await Transaction.find({
        $or: [
          { sourceAccountID: { $in: accountNumbers } },
          { destinationAccountID: { $in: accountNumbers } },
        ],
      }).sort({ createdAt: -1 });

      return transactions;
    } catch (error) {
      console.error("Lỗi trong DAO (getHistoryByUserId):", error.message);
      throw error;
    }
  }

  async createTransfer(transactionInstance) {
    try {
      return transactionInstance.save();
    } catch (error) {
      console.error("Lỗi trong DAO (createTransfer):", error.message);
      throw error;
    }
  }
  async save(transaction) {
    try {
      return await transaction.save();
    } catch (err) {
      throw err;
    }
  }
  async sumTodayTransfers(accountNumber) {
    // Build start-of-day timestamp in server’s timezone
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const result = await Transaction.aggregate([
      {
        $match: {
          sourceAccountID: accountNumber,
          type: "TRANSFER",
          status: "Completed",
          createdAt: { $gte: startOfDay },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    // If there were no matches, return 0
    return result.length > 0 ? result[0].total : 0;
  }
}
module.exports = new TransactionDAO();
