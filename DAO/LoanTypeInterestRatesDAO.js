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
}

module.exports = new LoanTypeInterestRatesDAO();
