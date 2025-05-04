const LoanAccountDAO = require("../DAO/LoanAccountDAO");
const LoanPaymentDAO = require("../DAO/LoanPaymentDAO");
const LoanTypeDAO = require("../DAO/LoanTypeDAO");
const LoanTypeInterestRatesDAO = require("../DAO/LoanTypeInterestRatesDAO");
const LoanAccount = require("../models/loanAccount");

module.exports.getAllLoanAccounts = async (req, res) => {
  const { customerId } = req.user;

  try {
    const loanAccounts = await LoanAccountDAO.getAllLoanAccountsByCustomerId(
      customerId
    );
    if (!loanAccounts) {
      return res.status(404).json({ message: "Không thể tìm thấy khoản vay" });
    }
    return res.status(200).json(loanAccounts);
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports.getAllLoanTypes = async (req, res) => {
  try {
    const loanTypes = await LoanTypeDAO.getAllLoanTypes();
    if (!loanTypes) {
      return res
        .status(404)
        .json({ message: "Không thể tìm thấy loại khoản vay" });
    }
    return res.status(200).json(loanTypes);
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports.getLoanAccount = async (req, res) => {
  const { customerId } = req.user;
  const { loanAccountId } = req.params;

  try {
    const foundLoanAccount = await LoanAccountDAO.getLoanAccountById(
      loanAccountId
    );
    if (!foundLoanAccount) {
      return res.status(404).json({ message: "Không thể tìm thấy khoản vay" });
    }
    if (String(foundLoanAccount.owner) !== String(customerId)) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền xem khoản vay này" });
    }

    const loanPayments = await LoanPaymentDAO.getAllLoanPaymentsByLoanAccountId(
      loanAccountId
    );
    return res.status(200).json({
      ...foundLoanAccount.toObject(),
      loanPayments: loanPayments || [],
    });
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports.getAllLoanInterestRates = async (req, res) => {
  try {
    const interestRates =
      await LoanTypeInterestRatesDAO.getAllLoanTypeInterestRates();
    return res.status(200).json(interestRates);
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports.findLoanInterestRates = async (req, res) => {
  const { loanType, loanTerm } = req.body;

  try {
    const interestRates =
      await LoanTypeInterestRatesDAO.getLoanTypeInterestRatesByloanTypeAndloanTerm(
        loanType,
        loanTerm
      );
    if (!interestRates) {
      return res.status(404).json({ message: "Không thể tìm thấy lãi suất" });
    }
    return res.status(200).json(interestRates);
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports.createLoanAccount = async (req, res) => {
  const { customerId } = req.user;
  const { loanType, loanTerm, loanAmount, findResult } = req.body;

  const annualInterestRate = findResult.annualInterestRate;
  const totalInterest = annualInterestRate * parseInt(loanAmount);
  const totalPayment = parseInt(loanAmount) + totalInterest;

  const monthlyPayment = calculateMonthlyPayment(
    loanAmount,
    annualInterestRate,
    loanTerm
  );
  const accountLoanNumber = generateAccountNumber();

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
    return res.status(201).json(result);
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

function calculateMonthlyPayment(principal, annualRate, months) {
  const monthlyRate = annualRate / 12 / 100;
  return Math.round(
    (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months))
  );
}

function generateAccountNumber() {
  return Math.floor(Math.random() * 900000000000 + 100000000000).toString();
}
