const LoanTypeInterestRates = require("../models/LoanTypeInterestRates");

class LoanTypeInterestRatesDAO {
  async getAllLoanTypeInterestRates() {
    try {
      // Lấy tất cả các document trong collection LoanTypeInterestRates
      const interestRates = await LoanTypeInterestRates.find();
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
      console.log(interestRate);
      return interestRate;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = new LoanTypeInterestRatesDAO();
