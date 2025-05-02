const LoanTypeInterestRates = require("../models/LoanTypeInterestRates");

class LoanTypeInterestRatesDAO {
  async getAllLoanTypeInterestRates() {
    try {
      // Lấy tất cả các document trong collection LoanTypeInterestRates
      const interestRates = await LoanTypeInterestRates.find().populate(
        "loanType"
      );
      return interestRates;
    } catch (err) {
      throw err;
    }
  }

  async getLoanTypeInterestRatesByloanTypeAndloanTerm(loanType, loanTerm) {
    try {
      // Tìm kiếm theo loanType và termMonths (loanTerm)
      const interestRate = await LoanTypeInterestRates.findOne({
        loanType: loanType,
        termMonths: Number(loanTerm),
      });
      return interestRate;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = new LoanTypeInterestRatesDAO();
