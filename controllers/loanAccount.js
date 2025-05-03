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
  const { loanType, loanTerm, loanAmount, findResult } = req.body;

  try {
    const result = await LoanAccountService.createLoanAccount(
      customerId,
      loanType,
      loanTerm,
      loanAmount,
      findResult
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
    // 1. Kiểm tra tài khoản nguồn
    const sourceAccountData = await CheckingAccountDAO.getByAccountNumber(
      sourceAccount
    );
    if (
      !sourceAccountData ||
      sourceAccountData.owner.toString() !== customerId
    ) {
      return res.status(404).json({ message: "Tài khoản nguồn không hợp lệ" });
    }

    if (sourceAccountData.balance < amount) {
      return res.status(400).json({ message: "Số dư không đủ để thanh toán" });
    }

    // 2. Kiểm tra khoản vay đích
    const loanPayment = await LoanPaymentDAO.findLoanPaymentById(targetPayment);
    if (!loanPayment || loanPayment.length === 0) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy khoản thanh toán" });
    }

    // 3. Cập nhật số dư tài khoản nguồn
    sourceAccountData.balance -= amount;
    await CheckingAccountDAO.save(sourceAccountData);

    // 4. Cập nhật trạng thái thanh toán khoản vay
    if (loanPayment.amount - amount <= 0) {
      loanPayment.status = "PAID";
      loanPayment.paymentDate = new Date();
    }
    await LoanPaymentDAO.save(loanPayment);

    // 5. Tạo transaction instance và lưu
    const newTransaction = new Transaction({
      type: "TRANSFER",
      amount: amount,
      description: `Thanh toán khoản vay ${loanPayment.loan}`,
      sourceAccountID: sourceAccount,
      destinationAccountID: targetPayment,
      status: "Completed",
    });

    await transactionDAO.createTransfer(newTransaction);

    // 6. Cập nhật trạng thái khoản vay nếu đã thanh toán hết
    return res.status(200).json({
      message: "Thanh toán khoản vay thành công",
      remainingAmount: "0",
      paymentStatus: loanPayment.status,
    });
  } catch (error) {
    console.error("Loan Payment Error:", error);
    return res
      .status(500)
      .json({ message: "Lỗi máy chủ khi thanh toán khoản vay" });
  }
};

module.exports.updateAllLoanPayments = async (req, res, next) => {
  const { loan } = req.query; // Get loan ID from query params

  try {
    // Validate loan ID
    if (!loan) {
      return res.status(400).json({ message: "Thiếu mã khoản vay" });
    }

    // Lấy tất cả các khoản thanh toán cho khoản vay này
    const loanPayments = await LoanPaymentDAO.getAllLoanPaymentsByLoanAccountId(
      loan
    );

    if (!loanPayments || loanPayments.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy khoản thanh toán",
      });
    }

    // Cập nhật trạng thái và ngày hết hạn cho từng khoản thanh toán
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

    return res.status(200).json({
      message: "Cập nhật thành công",
      payments: updatedPayments,
    });
  } catch (err) {
    console.error("Update loan payments error:", err);
    return res.status(500).json({
      message: "Lỗi máy chủ khi cập nhật khoản thanh toán",
    });
  }
};
