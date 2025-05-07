const SavingAccountDAO = require("../DAO/SavingAccountDAO");
const SavingTypeInterestDAO = require("../DAO/SavingTypeInterestDAO");
const CheckingAccountDAO = require("../DAO/CheckingAccountDAO");
const TransactionDAO = require("../DAO/TransactionDAO");
const Transaction = require("../models/transaction");
const { generateUniqueAccountNumber } = require("../utils/utils");
const { differenceInDays } = require("date-fns");
const SavingAccount = require("../models/savingAccount");
const DepositTypeDAO = require("../DAO/DepositTypeDAO");
const SavingTypeDAO = require("../DAO/SavingTypeDAO");

module.exports.getSavingAccounts = async (req, res) => {
  const { customerId } = req.user;
  try {
    const savingAccounts = await SavingAccountDAO.getAllSavingAccounts(
      customerId
    );
    return res.status(200).json(savingAccounts);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports.getSavingAccountById = async (req, res) => {
  const { id } = req.params;
  const { customerId } = req.user;
  try {
    const foundSavingAccount = await SavingAccountDAO.getSavingAccountById(
      id,
      customerId
    );
    if (
      foundSavingAccount &&
      foundSavingAccount.owner._id.toString() === customerId
    ) {
      return res.status(200).json(foundSavingAccount);
    }
    return res.status(404).json({
      message: "Không tìm thấy tài khoản hoặc không có quyền truy cập",
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports.getAllSavingInterestRates = async (req, res) => {
  try {
    const savingInterestRates =
      await SavingTypeInterestDAO.getAllSavingTypeInterest();
    return res.status(200).json(savingInterestRates);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports.getAllSavingTypes = async (req, res) => {
  try {
    const savingTypes = await SavingTypeDAO.getAllSavingTypes();
    return res.status(200).json(savingTypes);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports.getAllSavingDepositTypes = async (req, res) => {
  try {
    const savingDepositTypes = await DepositTypeDAO.getAllDepositTypes();
    return res.status(200).json(savingDepositTypes);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports.createSavingAccount = async (req, res) => {
  const { savingTypeInterest, balance, accountNumber } = req.body;
  const { customerId } = req.user;
  try {
    const checkingAccount = await CheckingAccountDAO.getByAccountNumber(
      accountNumber
    );
    if (!checkingAccount || checkingAccount.owner.toString() !== customerId) {
      return res
        .status(400)
        .json({ message: "Unauthorized or invalid account" });
    }

    if (!checkingAccount.hasSufficientBalance(balance)) {
      return res.status(400).json({ message: "Insufficient funds" });
    }

    const savingType = await SavingTypeInterestDAO.getSavingTypeInterestById(
      savingTypeInterest
    );
    if (!savingType) {
      return res.status(400).json({ message: "Saving type not found" });
    }
    const newSavingAccount = await SavingAccount.createSavingAccount({
      customerId,
      savingType,
    });

    const transaction = await checkingAccount.depositSavingAccount(
      newSavingAccount,
      balance
    );
    await Promise.all([
      SavingAccountDAO.save(newSavingAccount),
      CheckingAccountDAO.save(checkingAccount),
      TransactionDAO.save(transaction),
    ]);

    return res.status(201).json({
      message: "Saving account created successfully",
      newSavingAccount,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports.withdrawSaving = async (req, res) => {
  const { accountId } = req.params;
  const { customerId } = req.user;

  try {
    const saving = await SavingAccountDAO.getSavingAccountById(accountId);
    if (!saving || saving.status !== "ACTIVE") {
      return res
        .status(400)
        .json({ message: "Sổ tiết kiệm không tồn tại hoặc đã tất toán." });
    }

    const checkingAccount = await CheckingAccountDAO.getCheckingAccount(
      customerId
    );
    if (!checkingAccount) {
      return res
        .status(400)
        .json({ message: "Tài khoản thanh toán không tồn tại." });
    }

    const withdrawalDetails = await saving.withdraw(checkingAccount);
    return res.status(200).json({
      message: "Tất toán thành công",
      ...withdrawalDetails,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
