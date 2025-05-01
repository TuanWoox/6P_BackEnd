const SavingAccountDAO = require("../DAO/SavingAccountDAO");
const SavingTypeDAO = require("../DAO/SavingTypeDAO");
const SavingTypeInterestDAO = require("../DAO/SavingTypeInterestDAO");
const DepositTypeDAO = require("../DAO/DepositTypeDAO");
const SavingAccount = require("../models/savingAccount");
const CheckingAccountDAO = require("../DAO/CheckingAccountDAO");
const Transaction = require("../models/Transaction");
const TransactionDAO = require("../DAO/TransactionDAO");
const { generateUniqueAccountNumber } = require("../utils/utils");

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
