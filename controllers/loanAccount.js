const CheckingAccountDAO = require("../DAO/CheckingAccountDAO");
const LoanAccountDAO = require("../DAO/LoanAccountDAO");
const LoanPaymentDAO = require("../DAO/LoanPaymentDAO");
const LoanTypeDAO = require("../DAO/LoanTypeDAO");
const LoanTypeInterestRatesDAO = require("../DAO/LoanTypeInterestRatesDAO");
const LoanAccount = require("../models/loanAccount");
// const LoanAccount = require("../models/LoanAccount");

module.exports.getAllLoanAccounts = async (req, res, next) => {
  const { customerId } = req.user;
  // const customerId = "68078ecd387dabca60d71443";

  try {
    const foundLoanAccount =
      await LoanAccountDAO.getAllLoanAccountsByCustomerId(customerId);
    if (foundLoanAccount) return res.status(200).json(foundLoanAccount);
    return res.status(404).json({ message: "Không thể tìm thấy khoản vay" });
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports.getAllLoanTypes = async (req, res, next) => {
  try {
    const foundLoanTypes = await LoanTypeDAO.getAllLoanTypes();
    if (foundLoanTypes) return res.status(200).json(foundLoanTypes);
    return res
      .status(404)
      .json({ message: "Không thể tìm thấy loại khoản vay" });
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports.getLoanAccount = async (req, res, next) => {
  const { customerId } = req.user;
  const { loanAccountId } = req.params; // id của LoanAccount truyền qua URL

  try {
    // Fetch the loan account details
    const foundLoanAccount = await LoanAccountDAO.getLoanAccountById(
      loanAccountId
    );
    if (!foundLoanAccount) {
      return res.status(404).json({ message: "Không thể tìm thấy khoản vay" });
    }

    // Kiểm tra quyền truy cập
    if (String(foundLoanAccount.owner) !== String(customerId)) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền xem khoản vay này" });
    }

    // Fetch all payments for this loan account
    const loanPayments = await LoanPaymentDAO.getAllLoanPaymentsByLoanAccountId(
      loanAccountId
    );

    // Return both the loan account and its payments
    return res.status(200).json({
      ...foundLoanAccount.toObject(), // convert Mongoose document to plain object if needed
      loanPayments: loanPayments || [],
    });
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports.getAllLoanInterestRates = async (req, res, next) => {
  try {
    const interestRates =
      await LoanTypeInterestRatesDAO.getAllLoanTypeInterestRates();
    return res.status(200).json(interestRates);
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports.findLoanInterestRates = async (req, res, next) => {
  const { loanType, loanTerm } = req.body;
  console.log("findLoanInterestRates", req.body);
  try {
    const interestRates =
      await LoanTypeInterestRatesDAO.getLoanTypeInterestRatesByloanTypeAndloanTerm(
        loanType,
        loanTerm
      );
    if (interestRates) return res.status(200).json(interestRates);
    return res.status(404).json({ message: "Không thể tìm thấy lãi suất" });
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports.createLoanAccount = async (req, res, next) => {
  const { customerId } = req.user;
  const { loanType, loanTerm, loanAmount, findResult, destAccountNumber } =
    req.body;

  const annualInterestRate = findResult.annualInterestRate;

  const totalInterest = annualInterestRate * parseInt(loanAmount);
  const totalPayment = parseInt(loanAmount) + totalInterest;

  try {
    // Tính toán số tiền trả hàng tháng
    const annualInterestRate = findResult.annualInterestRate; // %/năm, ví dụ: 8.5
    const months = Number(loanTerm); // số tháng vay
    const principal = Number(loanAmount);

    // Tính số tiền trả hàng tháng
    const monthlyPayment = calculateMonthlyPayment(
      principal,
      annualInterestRate,
      months
    );

    // Tạo số tài khoản ngẫu nhiên
    const accountLoanNumber = generateAccountNumber();

    // Tạo instance mới
    const newLoanAccount = new LoanAccount({
      accountNumber: accountLoanNumber,
      owner: customerId,
      balance: totalPayment,
      monthlyPayment: monthlyPayment,
      status: "PENDING",
      loanTypeInterest: findResult._id,
    });

    // Lưu vào database
    const result = await LoanAccountDAO.createLoanAccount(newLoanAccount);
    // console.log("tạo thành công", result);

    return res.status(201).json(result);
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Hàm tính toán số tiền trả hàng tháng
function calculateMonthlyPayment(principal, annualRate, months) {
  const monthlyRate = annualRate / 12 / 100;
  return Math.round(
    (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months))
  );
}

// Hàm sinh số tài khoản ngẫu nhiên 12 số
function generateAccountNumber() {
  return Math.floor(Math.random() * 900000000000 + 100000000000).toString();
}
