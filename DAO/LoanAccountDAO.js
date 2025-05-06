const LoanAccount = require("../models/loanAccount");

class LoanAccountDAO {
  async getAllLoanAccountsByCustomerId(customerId) {
    try {
      const loanAccounts = await LoanAccount.find({
        owner: customerId,
      });
      return loanAccounts;
    } catch (err) {
      throw err;
    }
  }
  // Hàm lấy một LoanAccount dựa trên id
  async getLoanAccountById(loanAccountId) {
    try {
      const loanAccount = await LoanAccount.findById(loanAccountId).populate({
        path: "loanTypeInterest",
        populate: {
          path: "loanType",
        },
      });

      return loanAccount;
    } catch (err) {
      throw err;
    }
  }

  async createLoanAccount(loanAccountInstance) {
    try {
      return await loanAccountInstance.save();
    } catch (err) {
      console.error("Lỗi trong DAO (createLoanAccount):", error.message);
      throw err;
    }
  }
}

module.exports = new LoanAccountDAO();
