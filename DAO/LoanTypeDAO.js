const LoanType = require("../models/loanType");

class LoanTypeDAO {
  async getAllLoanTypes() {
    try {
      // Lấy tất cả các document trong collection LoanType
      const loanTypes = await LoanType.find();
      return loanTypes;
    } catch (err) {
      throw err;
    }
  }

  async getLoanTypeById(id) {
    return await LoanType.findById(id);
  }
}

module.exports = new LoanTypeDAO();
