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
    loanAmount,
    selectedLoanInterestRate
  ) {
    // console.log("customerId", customerId);
    // console.log("loanType", loanType);
    // console.log("loanTerm", loanTerm);
    // console.log("loanAmount", loanAmount);
    // console.log("selectedLoanInterestRate", selectedLoanInterestRate);
    console.log("selectedLoanInterestRate", selectedLoanInterestRate);

    const annualInterestRate = selectedLoanInterestRate.annualInterestRate;
    const months = Number(selectedLoanInterestRate.termMonths);

    // Tính tiền phải trả mỗi tháng
    const monthlyPayment = this.calculateMonthlyPayment(
      loanAmount,
      annualInterestRate
    );
    // Tính tổng tiền lãi suất
    const totalInterest = this.calculateTotalInterest(monthlyPayment, months);
    // Tính tổng tiền phải trả
    const totalPayment = this.calculateTotalPayment(loanAmount, totalInterest);

    console.log("monthlyPayment", monthlyPayment);
    console.log("totalInterest", totalInterest);
    console.log("totalPayment", totalPayment);

    const accountLoanNumber = this.generateAccountNumber();

    try {
      const newLoanAccount = new LoanAccount({
        accountNumber: accountLoanNumber,
        owner: customerId,
        balance: totalPayment,
        monthlyPayment: monthlyPayment,
        status: "PENDING",
        loanTypeInterest: selectedLoanInterestRate._id,
      });

      const savedLoanAccount = await LoanAccountDAO.createLoanAccount(
        newLoanAccount
      );

      const result = await LoanAccountDAO.getLoanAccountById(
        savedLoanAccount._id
      );

      return result;
    } catch (err) {
      throw new Error("loanAccountService: " + err.message);
    }
  }

  static calculateMonthlyPayment(loanAmount, annualInterestRate) {
    // Tính tiền lãi phải trả hàng tháng
    return loanAmount * (annualInterestRate / 12);
  }

  static calculateTotalInterest(monthlyPayment, months) {
    // Tính tổng tiền lãi phải trả
    return monthlyPayment * months;
  }

  static calculateTotalPayment(loanAmount, totalInterest) {
    // Tính tổng tiền phải trả
    return Number(loanAmount) + Number(totalInterest);
  }

  static generateAccountNumber() {
    return Math.floor(Math.random() * 900000000000 + 100000000000).toString();
  }
}

module.exports = LoanAccountService;
