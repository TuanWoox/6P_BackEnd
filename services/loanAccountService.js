const LoanAccountDAO = require("../DAO/LoanAccountDAO");
const LoanPaymentDAO = require("../DAO/LoanPaymentDAO");
const LoanTypeDAO = require("../DAO/LoanTypeDAO");
const LoanTypeInterestRatesDAO = require("../DAO/LoanTypeInterestRatesDAO");
const LoanAccount = require("../models/loanAccount");

class LoanAccountService {
  static async getAllLoanAccounts(customerId) {
    try {
      const foundLoanAccount =
        await LoanAccountDAO.getAllLoanAccountsByCustomerId(customerId);
      if (!foundLoanAccount) {
        throw new Error("Không thể tìm thấy khoản vay");
      }
      return foundLoanAccount;
    } catch (err) {
      throw new Error("Internal Server Error");
    }
  }

  static async getAllLoanTypes() {
    try {
      const foundLoanTypes = await LoanTypeDAO.getAllLoanTypes();
      if (!foundLoanTypes) {
        throw new Error("Không thể tìm thấy loại khoản vay");
      }
      return foundLoanTypes;
    } catch (err) {
      throw new Error("Internal Server Error");
    }
  }

  static async getLoanAccountById(customerId, loanAccountId) {
    try {
      const foundLoanAccount = await LoanAccountDAO.getLoanAccountById(
        loanAccountId
      );
      if (!foundLoanAccount) {
        throw new Error("Không thể tìm thấy khoản vay");
      }
      if (String(foundLoanAccount.owner) !== String(customerId)) {
        throw new Error("Bạn không có quyền xem khoản vay này");
      }
      const loanPayments =
        await LoanPaymentDAO.getAllLoanPaymentsByLoanAccountId(loanAccountId);
      return {
        ...foundLoanAccount.toObject(),
        loanPayments: loanPayments || [],
      };
    } catch (err) {
      throw new Error("Internal Server Error");
    }
  }

  static async getAllLoanInterestRates() {
    try {
      const interestRates =
        await LoanTypeInterestRatesDAO.getAllLoanTypeInterestRates();
      return interestRates;
    } catch (err) {
      throw new Error("Internal Server Error");
    }
  }

  static async findLoanInterestRates(loanType, loanTerm) {
    try {
      const interestRates =
        await LoanTypeInterestRatesDAO.getLoanTypeInterestRatesByloanTypeAndloanTerm(
          loanType,
          loanTerm
        );
      if (!interestRates) {
        throw new Error("Không thể tìm thấy lãi suất");
      }
      return interestRates;
    } catch (err) {
      throw new Error("Internal Server Error");
    }
  }

  static async createLoanAccount(
    customerId,
    loanType,
    loanTerm,
    loanAmount,
    findResult
  ) {
    const annualInterestRate = findResult.annualInterestRate;
    const totalInterest = annualInterestRate * parseInt(loanAmount);
    const totalPayment = parseInt(loanAmount) + totalInterest;

    const monthlyPayment = this.calculateMonthlyPayment(
      loanAmount,
      annualInterestRate,
      loanTerm
    );
    const accountLoanNumber = this.generateAccountNumber();

    try {
      const newLoanAccount = new LoanAccount({
        accountNumber: accountLoanNumber,
        owner: customerId,
        balance: totalPayment,
        monthlyPayment: monthlyPayment,
        status: "PENDING",
        loanTypeInterest: findResult._id,
      });

      const result = await LoanAccountDAO.createLoanAccount(newLoanAccount);
      return result;
    } catch (err) {
      throw new Error("Internal Server Error");
    }
  }

  static calculateMonthlyPayment(principal, annualRate, months) {
    const monthlyRate = annualRate / 12 / 100;
    return Math.round(
      (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months))
    );
  }

  static generateAccountNumber() {
    return Math.floor(Math.random() * 900000000000 + 100000000000).toString();
  }
}

module.exports = LoanAccountService;
