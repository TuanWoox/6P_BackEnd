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
  async createPayments(paymentsDataArray) {
    try {
      return await LoanPayment.insertMany(paymentsDataArray);
    } catch (err) {
      throw err;
    }
  }

  async findLoanPaymentById(loanPaymentId) {
    try {
      const loanPayment = await LoanPayment.findById(loanPaymentId);
      return loanPayment;
    } catch (err) {
      throw err;
    }
  }

  async save(loanPaymentInstance) {
    try {
      return await loanPaymentInstance.save();
    } catch (err) {
      throw err;
    }
  }
}

module.exports = new LoanPaymentDAO();
