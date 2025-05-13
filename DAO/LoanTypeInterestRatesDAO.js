const LoanTypeInterestRates = require("../models/loanTypeInterestRates");

class LoanTypeInterestRatesDAO {
  async getAllLoanTypeInterestRates() {
    try {
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
      const interestRate = await LoanTypeInterestRates.findOne({
        loanType: loanType,
        termMonths: Number(loanTerm),
      });
      return interestRate;
    } catch (err) {
      throw err;
    }
  }

  async getLoanTypeInterestRatesById(id) {
    try {
      const loanTypeInterest = await LoanTypeInterestRates.findById(
        id
      ).populate("loanType");
      return loanTypeInterest;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = new LoanTypeInterestRatesDAO();
