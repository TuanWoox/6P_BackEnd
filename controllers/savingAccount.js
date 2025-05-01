const SavingAccountDAO = require("../DAO/SavingAccountDAO");
const SavingTypeDAO = require("../DAO/SavingTypeDAO");
const SavingTypeInterestDAO = require("../DAO/SavingTypeInterestDAO");
const DepositTypeDAO = require("../DAO/DepositTypeDAO");
const SavingAccount = require("../models/savingAccount");
const CheckingAccountDAO = require("../DAO/CheckingAccountDAO");
const Transaction = require("../models/Transaction");
const TransactionDAO = require("../DAO/TransactionDAO");
const { generateUniqueAccountNumber } = require("../utils/utils");
const { differenceInDays } = require("date-fns");
const mongoose = require("mongoose");


module.exports.getSavingAccounts = async (req, res, next) => {
  const { customerId } = req.user;

  try {
    const foundSavingAccounts = await SavingAccountDAO.getAllSavingAccounts(
      customerId
    );
    if (foundSavingAccounts) return res.status(200).json(foundSavingAccounts);
    return res
      .status(404)
      .json({ message: "Không tìm thấy tài khoản tiết kiệm nào" });
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports.getSavingAccountById = async (req, res, next) => {
  const { id } = req.params;
  const { customerId } = req.user;

  try {
    const foundSavingAccount = await SavingAccountDAO.getSavingAccountById(
      id,
      customerId
    );
    if (foundSavingAccount.owner._id.toString() === customerId) {
      return res.status(200).json(foundSavingAccount);
    }
    return res.status(404).json({
      message: "Không tìm thấy tài khoản hoặc không có quyền truy cập",
    });
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
module.exports.getAllLoanTypes = async (req, res, next) => {
  try {
    const foundSavingTypes = await SavingTypeDAO.getAllSavingTypes();
    if (foundSavingTypes) return res.status(200).json(foundSavingTypes);
    return res
      .status(404)
      .json({ message: "Không thể tìm thấy loại tiết kiệm" });
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports.getAllSavingInterestRates = async (req, res, next) => {
  try {
    const interestRates =
      await SavingTypeInterestDAO.getAllSavingTypeInterest();
    return res.status(200).json(interestRates);
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
module.exports.getAllSavingDepositTypes = async (req, res, next) => {
  try {
    const deposit = await DepositTypeDAO.getAllDepositTypes();
    return res.status(200).json(deposit);
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
module.exports.createSavingAccount = async (req, res, next) => {
  try {
    const { savingTypeInterest, balance, accountNumber } = req.body;
    const { customerId } = req.user;

    const checkingAccount = await CheckingAccountDAO.getByAccountNumber(
      accountNumber
    );

    if (!checkingAccount || checkingAccount.owner.toString() !== customerId) {
      return res
        .status(403)
        .json({ message: "Unauthorized or invalid account" });
    }

    const availableBalance =
      checkingAccount.balance +
      (checkingAccount.overdraftProtection
        ? checkingAccount.dailyTransactionLimit
        : 0);
    if (availableBalance < balance) {
      return res.status(400).json({ message: "Insufficient funds" });
    }

    const savingType = await SavingTypeInterestDAO.getSavingTypeInterestById(
      savingTypeInterest
    );
    if (!savingType) {
      return res.status(404).json({ message: "Saving type not found" });
    }

    const now = new Date();
    let nextEarningDate;
    let finishEarningDate = null;

    if (savingType.maturityPeriod === 0) {
      // Non-term savings (daily interest)
      nextEarningDate = new Date(now);
      nextEarningDate.setDate(now.getDate() + 1);
    } else {
      // Term savings (monthly interest)
      nextEarningDate = new Date(now);
      nextEarningDate.setMonth(now.getMonth() + 1);

      finishEarningDate = new Date(now);
      finishEarningDate.setMonth(now.getMonth() + savingType.maturityPeriod);
    }

    const number = await generateUniqueAccountNumber();

    const newSavingAccount = await SavingAccount.create({
      accountNumber: number,
      owner: customerId,
      balance,
      savingTypeInterest,
      nextEarningDate,
      finishEarningDate,
    });

    checkingAccount.balance -= balance;

    const transaction = new Transaction({
      type: "DEPOSIT",
      amount: balance,
      description: `Tạo tài khoản tiết kiệm ${newSavingAccount.accountNumber}`,
      sourceAccountID: checkingAccount.accountNumber,
      destinationAccountID: newSavingAccount.accountNumber,
      status: "Completed",
    });

    await Promise.all([
      SavingAccountDAO.createSavingAccount(newSavingAccount),
      CheckingAccountDAO.save(checkingAccount),
      TransactionDAO.createTransfer(transaction),
    ]);

    res.status(201).json({
      message: "Saving account created successfully",
      newSavingAccount,
    });
  } catch (err) {
    console.error("Error creating saving account:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.withdrawSaving = async (req, res) => {
  const customerId = "680de05268dff8e8645e93e7"; // Tạm hard-code cho test
  try {
    const { accountId } = req.params;

    const saving = await SavingAccountDAO.getSavingAccountById(accountId);
    if (!saving || saving.status !== "ACTIVE") {
      return res.status(404).json({ message: "Sổ tiết kiệm không tồn tại hoặc đã tất toán." });
    }

    const checkingAccount = await CheckingAccountDAO.getCheckingAccount(customerId);
    if (!checkingAccount) {
      return res.status(404).json({ message: "Tài khoản thanh toán không tồn tại." });
    }

    const principalAmount = saving.balance;
    const dateOpened = saving.dateOpened;
    const savingInterest = saving.savingTypeInterest || {};

    const dailyInterestRate = savingInterest.dailyInterestRate ?? 0;
    const monthlyInterestRate = savingInterest.monthlyInterestRate ?? 0;
    const maturityPeriod = savingInterest.maturityPeriod ?? 0;
    const percentMoneyLose0 = savingInterest.percentMoneyLose0 ?? 0;

    console.log("Saving", saving);

    console.log("Monthly Interest Rate:", monthlyInterestRate);
    console.log("Daily Interest Rate:", dailyInterestRate);

    const today = new Date();
    const openedDate = new Date(dateOpened);
    const daysDeposited = differenceInDays(today, openedDate);

    const maturityDate = new Date(openedDate);
    maturityDate.setMonth(maturityDate.getMonth() + maturityPeriod);
    const isEarlyWithdrawal = maturityPeriod > 0 && today < maturityDate;

    let interestEarned = 0;
    if (maturityPeriod === 0) {
      // Không kỳ hạn → dùng dailyInterestRate
      interestEarned = principalAmount * (dailyInterestRate / 100) * daysDeposited;
    } else {
      // Có kỳ hạn → dùng monthlyInterestRate
      interestEarned = principalAmount * (monthlyInterestRate / 100) * maturityPeriod;
    }

    let totalAmount = principalAmount + interestEarned;
    let penaltyAmount = 0;

    // Nếu tất toán trước hạn, tính phí phạt
    if (isEarlyWithdrawal) {
      penaltyAmount = totalAmount * (percentMoneyLose0 / 100);
      totalAmount -= penaltyAmount;
    }

    console.log("Total Amount:", totalAmount);

    // ➤ CHUẨN BỊ dữ liệu, chưa save
    checkingAccount.balance += totalAmount;
    saving.status = "CLOSED";
    saving.updatedAt = today;

    const transaction = new Transaction({
      type: "WITHDRAWAL",
      amount: totalAmount,
      description: isEarlyWithdrawal ? "Tất toán trước hạn" : "Tất toán đúng hạn",
      sourceAccountID: saving.accountNumber,
      destinationAccountID: checkingAccount.accountNumber,
      status: "Completed",
    });

    // Validate thủ công trước khi save bất kỳ cái gì
    await transaction.validate();

    // Nếu không lỗi, mới tiếp tục lưu cả 3
    await Promise.all([
      checkingAccount.save(),
      saving.save(),
      transaction.save()
    ]);

    return res.status(200).json({
      message: "Tất toán thành công",
      totalReceived: totalAmount,
      principalAmount,
      interestEarned,
      penaltyAmount,
      isEarlyWithdrawal
    });

  } catch (error) {
    console.error("Withdraw Error:", error);
    return res.status(500).json({ message: "Lỗi hệ thống khi tất toán." });
  }
};