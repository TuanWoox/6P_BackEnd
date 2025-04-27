const mongoose = require("mongoose");
const LoanPayment = require("../models/loanPayment");

class LoanPaymentDAO {
  async getAllLoanPaymentsByLoanAccountId(loanAccountId) {
    try {
      const loanPayments = await LoanPayment.find({
        loan: loanAccountId,
      });
      return loanPayments;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = new LoanPaymentDAO();
