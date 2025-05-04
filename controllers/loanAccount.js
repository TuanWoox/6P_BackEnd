const LoanAccountDAO = require("../DAO/LoanAccountDAO");
const LoanPaymentDAO = require("../DAO/LoanPaymentDAO");
const LoanTypeDAO = require("../DAO/LoanTypeDAO");
const LoanTypeInterestRatesDAO = require("../DAO/LoanTypeInterestRatesDAO");
const CheckingAccountDAO = require("../DAO/CheckingAccountDAO");
const Transaction = require("../models/Transaction");
const transactionDAO = require("../DAO/TransactionDAO");
const LoanAccount = require("../models/loanAccount");

// Helper Functions
function calculateMonthlyPayment(loanAmount, annualInterestRate) {
  return loanAmount * (annualInterestRate / 12);
}

function calculateTotalInterest(monthlyPayment, months) {
  return monthlyPayment * months;
}

function calculateTotalPayment(loanAmount, totalInterest) {
  return Number(loanAmount) + Number(totalInterest);
}

function generateAccountNumber() {
  return Math.floor(Math.random() * 900000000000 + 100000000000).toString();
}

// CONTROLLERS

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
    return res
      .status(500)
      .json({ message: err.message || "Internal Server Error" });
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
    return res
      .status(500)
      .json({ message: err.message || "Internal Server Error" });
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
    return res
      .status(500)
      .json({ message: err.message || "Internal Server Error" });
  }
};

module.exports.getAllLoanInterestRates = async (req, res) => {
  try {
    const interestRates =
      await LoanTypeInterestRatesDAO.getAllLoanTypeInterestRates();
    return res.status(200).json(interestRates);
  } catch (err) {
    return res
      .status(500)
      .json({ message: err.message || "Internal Server Error" });
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
    return res
      .status(500)
      .json({ message: err.message || "Internal Server Error" });
  }
};

module.exports.createLoanAccount = async (req, res) => {
  const { customerId } = req.user;
  const { loanType, loanAmount, selectedLoanInterestRate } = req.body;

  try {
    const annualInterestRate = selectedLoanInterestRate.annualInterestRate;
    const months = Number(selectedLoanInterestRate.termMonths);
    const monthlyPayment = calculateMonthlyPayment(
      loanAmount,
      annualInterestRate
    );
    const totalInterest = calculateTotalInterest(monthlyPayment, months);
    const totalPayment = calculateTotalPayment(loanAmount, totalInterest);
    const accountLoanNumber = generateAccountNumber();

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

    return res.status(201).json(result);
  } catch (err) {
    return res
      .status(500)
      .json({ message: err.message || "Internal Server Error" });
  }
};

module.exports.confirmLoanPayment = async (req, res) => {
  const { customerId } = req.user;
  const { sourceAccount, targetPayment, amount } = req.body;

  try {
    const sourceAccountData = await CheckingAccountDAO.getByAccountNumber(
      sourceAccount
    );
    if (
      !sourceAccountData ||
      sourceAccountData.owner.toString() !== customerId
    ) {
      return res.status(400).json({ message: "Tài khoản nguồn không hợp lệ" });
    }
    if (sourceAccountData.balance < amount) {
      return res.status(400).json({ message: "Số dư không đủ để thanh toán" });
    }

    const loanPayment = await LoanPaymentDAO.findLoanPaymentById(targetPayment);
    if (!loanPayment || loanPayment.length === 0) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy khoản thanh toán" });
    }

    sourceAccountData.balance -= amount;
    await CheckingAccountDAO.save(sourceAccountData);

    if (loanPayment.amount - amount <= 0) {
      loanPayment.status = "PAID";
      loanPayment.paymentDate = new Date();
    }
    await LoanPaymentDAO.save(loanPayment);

    const newTransaction = new Transaction({
      type: "TRANSFER",
      amount: amount,
      description: `Thanh toán khoản vay ${loanPayment.loan}`,
      sourceAccountID: sourceAccount,
      destinationAccountID: targetPayment,
      status: "Completed",
    });

    await transactionDAO.createTransfer(newTransaction);

    return res.status(200).json({
      message: "Thanh toán khoản vay thành công",
      remainingAmount: "0",
      paymentStatus: loanPayment.status,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: err.message || "Internal Server Error" });
  }
};

module.exports.updateAllLoanPayments = async (req, res) => {
  const { loanId } = req.params;

  try {
    if (!loanId) {
      return res.status(400).json({ message: "Thiếu mã khoản vay" });
    }

    const loanPayments = await LoanPaymentDAO.getAllLoanPaymentsByLoanAccountId(
      loanId
    );
    if (!loanPayments || loanPayments.length === 0) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy khoản thanh toán" });
    }

    const currentDate = new Date();
    const updatedPayments = [];

    for (const payment of loanPayments) {
      if (payment.status !== "PAID") {
        if (payment.dueDate < currentDate) {
          payment.status = "OVERDUE";
          payment.overdueDays = Math.floor(
            (currentDate - payment.dueDate) / (1000 * 60 * 60 * 24)
          );
        } else {
          payment.status = "PENDING";
          payment.overdueDays = Math.floor(
            (payment.dueDate - currentDate) / (1000 * 60 * 60 * 24)
          );
        }
        await LoanPaymentDAO.save(payment);
        updatedPayments.push(payment);
      }
    }

    return res
      .status(200)
      .json({ message: "Cập nhật thành công", payments: updatedPayments });
  } catch (err) {
    return res
      .status(500)
      .json({ message: err.message || "Internal Server Error" });
  }
};

module.exports.getLoanTypeInterestById = async (req, res) => {
  const { id } = req.params;

  try {
    const interest =
      await LoanTypeInterestRatesDAO.getLoanTypeInterestRatesById(id);
    if (!interest) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy thông tin loại lãi suất khoản vay" });
    }
    return res.status(200).json(interest);
  } catch (err) {
    return res
      .status(500)
      .json({ message: err.message || "Internal Server Error" });
  }
};
module.exports.createLoanPayments = async (req, res) => {
  const { loanId } = req.params;
  const { payments } = req.body; // Array of payments to be created

  try {
    if (
      !loanId ||
      !payments ||
      !Array.isArray(payments) ||
      payments.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "Dữ liệu không hợp lệ để tạo thanh toán" });
    }

    const createdPayments = [];

    for (const paymentData of payments) {
      const payment = await LoanPaymentDAO.createLoanPayment({
        loan: loanId,
        dueDate: paymentData.dueDate,
        amount: paymentData.amount,
        status: "PENDING",
      });
      createdPayments.push(payment);
    }

    return res.status(201).json({
      message: "Tạo các khoản thanh toán thành công",
      payments: createdPayments,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: err.message || "Internal Server Error" });
  }
};
