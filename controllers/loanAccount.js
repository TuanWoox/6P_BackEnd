const CheckingAccountDAO = require("../DAO/CheckingAccountDAO");
const LoanAccountDAO = require("../DAO/LoanAccountDAO");
const LoanPaymentDAO = require("../DAO/LoanPaymentDAO");
const LoanTypeDAO = require("../DAO/LoanTypeDAO");
const LoanTypeInterestRatesDAO = require("../DAO/LoanTypeInterestRatesDAO");
const LoanAccount = require("../models/loanAccount");
const Transaction = require("../models/Transaction");
const transactionDAO = require("../DAO/TransactionDAO");
// const LoanAccount = require("../models/LoanAccount");
const LoanAccountService = require("../services/loanAccountService");

module.exports.getAllLoanAccounts = async (req, res) => {
  const { customerId } = req.user;

  try {
    const loanAccounts = await LoanAccountService.getAllLoanAccounts(
      customerId
    );
    return res.status(200).json(loanAccounts);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports.getAllLoanTypes = async (req, res) => {
  try {
    const loanTypes = await LoanAccountService.getAllLoanTypes();
    return res.status(200).json(loanTypes);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports.getLoanAccount = async (req, res) => {
  const { customerId } = req.user;
  const { loanAccountId } = req.params;

  try {
    const loanAccountDetails = await LoanAccountService.getLoanAccountById(
      customerId,
      loanAccountId
    );
    return res.status(200).json(loanAccountDetails);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports.getAllLoanInterestRates = async (req, res) => {
  try {
    const interestRates = await LoanAccountService.getAllLoanInterestRates();
    return res.status(200).json(interestRates);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports.findLoanInterestRates = async (req, res) => {
  const { loanType, loanTerm } = req.body;

  try {
    const interestRates = await LoanAccountService.findLoanInterestRates(
      loanType,
      loanTerm
    );
    return res.status(200).json(interestRates);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports.createLoanAccount = async (req, res) => {
  const { customerId } = req.user;
  const { loanType, loanTerm, loanAmount, selectedLoanInterestRate } = req.body;

  if (
    !selectedLoanInterestRate ||
    !selectedLoanInterestRate.annualInterestRate
  ) {
    return res.status(400).json({ message: "Invalid loan interest rate data" });
  }

  try {
    const result = await LoanAccountService.createLoanAccount(
      customerId,
      loanType,
      loanTerm,
      loanAmount,
      selectedLoanInterestRate
    );
    return res.status(201).json(result);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports.confirmLoanPayment = async (req, res, next) => {
  const { sourceAccount, targetPayment, amount } = req.body;
  const { customerId } = req.user;

  try {
    const result = await LoanAccountService.confirmLoanPayment(
      customerId,
      sourceAccount,
      targetPayment,
      amount
    );
    return res.status(200).json(result);
  } catch (error) {
    console.error("Loan Payment Error:", error);
    return res.status(500).json({
      message: error.message || "Lỗi máy chủ khi thanh toán khoản vay",
    });
  }
};

module.exports.updateAllLoanPayments = async (req, res, next) => {
  const { loan } = req.query;

  try {
    const result = await LoanAccountService.updateAllLoanPayments(loan);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Update loan payments error:", error);
    return res.status(500).json({
      message: error.message || "Lỗi máy chủ khi cập nhật khoản thanh toán",
    });
  }
};

module.exports.createLoanPayments = async (req, res) => {
  const { payments } = req.body;

  if (!payments || !Array.isArray(payments) || payments.length === 0) {
    return res.status(400).json({ message: "Danh sách payments không hợp lệ" });
  }

  try {
    const createdPayments = await Promise.all(
      payments.map((payment) => LoanPaymentDAO.createPayment(payment))
    );

    return res.status(201).json({
      message: "Tạo lịch thanh toán thành công",
      payments: createdPayments,
    });
  } catch (error) {
    console.error("Error creating payments:", error);
    return res.status(500).json({
      message: "Lỗi máy chủ khi tạo lịch thanh toán",
    });
  }
};

module.exports.getLoanTypeInterestById = async (req, res) => {
  const { id } = req.params;

  try {
    const loanTypeInterest = await LoanAccountService.getLoanTypeInterestById(
      id
    );
    return res.status(200).json(loanTypeInterest);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
