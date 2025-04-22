const Transaction = require('../models/transaction');
const Account = require('../models/account')

class TransactionDAO {  
  async getHistoryByUserId (userId) {
    try {
        const accounts = await Account.find({ owner: userId });
        const accountNumbers = accounts.map(acc => acc.accountNumber);
    
        if (accountNumbers.length === 0) {
          return []; 
        }
    
        const transactions = await Transaction.find({
          $or: [
            { sourceAccountID: { $in: accountNumbers } },
            { destinationAccountID: { $in: accountNumbers } }
          ]
        }).sort({ timestamp: -1 });
    
        return transactions;
      } catch (error) {
        console.error("Lỗi trong DAO (getHistoryByUserId):", error.message);
        throw error; 
      }
    
  }
}
module.exports = new TransactionDAO();
