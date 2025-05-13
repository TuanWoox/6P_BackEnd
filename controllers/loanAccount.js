const LoanAccountDAO = require("../DAO/LoanAccountDAO");
const LoanPaymentDAO = require("../DAO/LoanPaymentDAO");
const LoanTypeDAO = require("../DAO/LoanTypeDAO");
const LoanTypeInterestRatesDAO = require("../DAO/LoanTypeInterestRatesDAO");
const CheckingAccountDAO = require("../DAO/CheckingAccountDAO");
const TransactionDAO = require("../DAO/TransactionDAO");
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

module.exports.createLoanPayments = async (req, res) => {
  // const { loanId } = req.params;
  const { payments } = req.body; // Array of payments to be created

  try {
    if (!payments || !Array.isArray(payments) || payments.length === 0) {
      return res
        .status(400)
        .json({ message: "Dữ liệu không hợp lệ để tạo thanh toán" });
    }

    const createdPayments = [];

    for (const paymentData of payments) {
      const payment = await LoanPaymentDAO.createPayment({
        loan: paymentData.loan,
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

module.exports.createLoanAccount = async (req, res) => {
  const { customerId } = req.user;
  const { loanAmount, selectedLoanInterestRate: fromReqest } = req.body;

  try {
    // Fetch the interest rate object from DB for security
    const selectedLoanInterestRate =
      await LoanTypeInterestRatesDAO.getLoanTypeInterestRatesById(
        fromReqest._id
      );

    if (!selectedLoanInterestRate) {
      return res
        .status(400)
        .json({ message: "Không tìm thấy loại lãi suất vay" });
    }

    const { newLoanAccount, paymentsData } =
      await LoanAccount.createNewLoanAccount(
        customerId,
        loanAmount,
        selectedLoanInterestRate
      );
    console.log(paymentsData);
    const result = await LoanAccountDAO.save(newLoanAccount);
    const payments = await LoanPaymentDAO.createPayments(paymentsData);

    return res.status(201).json(result);
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: err.message || "Lỗi máy chủ nội bộ" });
  }
};

module.exports.confirmLoanPayment = async (req, res) => {
  const { customerId } = req.user;
  const { sourceAccount, targetPayment, amount } = req.body;
  console.log(req.body);
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
    if (!sourceAccountData.hasSufficientBalance(amount)) {
      return res.status(400).json({ message: "Số dư không đủ để thanh toán" });
    }

    const loanPayment = await LoanPaymentDAO.findLoanPaymentById(targetPayment);
    if (!loanPayment || loanPayment.length === 0) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy khoản thanh toán" });
    }
    const newTransaction = sourceAccountData.payLoanFee(loanPayment, amount);

    await LoanPaymentDAO.save(loanPayment);
    await CheckingAccountDAO.save(sourceAccountData);
    await TransactionDAO.save(newTransaction);

    return res.status(200).json({
      message: "Thanh toán khoản vay thành công",
      remainingAmount: "0",
      paymentStatus: loanPayment.status,
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: err.message || "Internal Server Error" });
  }
};

module.exports.updateAllLoanPayments = async (req, res) => {
  const { loan: loanId } = req.query;

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
      const updated = payment.updatePaymentStatus(currentDate);

      if (updated) {
        await LoanPaymentDAO.save(payment);
        updatedPayments.push(payment);
      }
    }

    return res.status(200).json({
      message: "Cập nhật thành công",
      payments: updatedPayments,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message || "Internal Server Error",
    });
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
