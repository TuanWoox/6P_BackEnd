const CheckingAccountDAO = require("../DAO/CheckingAccountDAO");
const transactionDAO = require("../DAO/TransactionDAO");
const Transaction = require("../models/transaction");

module.exports.getCheckingAccount = async (req, res) => {
  try {
    const result = await CheckingAccountDAO.getCheckingAccount(
      req.user.customerId
    );
    if (result) return res.status(200).json(result);
    return res.status(404).json({ message: "Không thể tìm thấy tài khoản" });
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports.getAllCheckingAccount = async (req, res) => {
  try {
    const result = await CheckingAccountDAO.getAllCheckingAccount(
      req.user.customerId
    );
    if (result) return res.status(200).json(result);
    return res.status(404).json({ message: "Không thể tìm thấy tài khoản" });
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports.checkAvilableTargetAccount = async (req, res) => {
  try {
    const acct = await CheckingAccountDAO.checkAvilableTargetAccount(
      req.params.targetAccount
    );
    if (acct) return res.status(200).json({ fullName: acct.owner.fullName });
    return res.status(404).json({ message: "Không thể tìm thấy tài khoản" });
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports.getLimitTransaction = async (req, res) => {
  try {
    const checkingAccount = await CheckingAccountDAO.getCheckingAccount(
      req.user.customerId
    );
    if (!checkingAccount)
      return res.status(404).json({ message: "Không thể tìm thấy tài khoản" });

    return res.status(200).json(checkingAccount.dailyTransactionLimit);
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports.updateLimit = async (req, res) => {
  try {
    const checkingAccount = await CheckingAccountDAO.getCheckingAccount(
      req.user.customerId
    );
    if (!checkingAccount)
      return res.status(404).json({ message: "Không thể tìm thấy tài khoản" });
    checkingAccount.updateDailyTransactionLimit(req.body.newLimit);
    const saved = await CheckingAccountDAO.save(checkingAccount);
    return res.status(200).json(saved);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports.transferMoney = async (req, res) => {
  const { targetAccount, amount, description } = req.body;

  try {
    const currentAccount = await CheckingAccountDAO.getCheckingAccount(
      req.user.customerId
    );
    if (!currentAccount || currentAccount.status !== "ACTIVE") {
      return res
        .status(400)
        .json({ message: "Invalid or inactive source account" });
    }

    const destAccount = await CheckingAccountDAO.getByAccountNumber(
      targetAccount
    );
    if (!destAccount || destAccount.status !== "ACTIVE") {
      return res
        .status(400)
        .json({ message: "Invalid or inactive destination account" });
    }

    if (!currentAccount.hasSufficientBalance(amount)) {
      return res.status(400).json({ message: "Insufficient funds" });
    }

    // Perform the transfer
    const newTransaction = currentAccount.transferMoney(
      destAccount,
      amount,
      description
    );

    // Save both account changes and transaction
    await Promise.all([
      CheckingAccountDAO.save(currentAccount),
      CheckingAccountDAO.save(destAccount),
    ]);

    const savedTransaction = await transactionDAO.createTransfer(
      newTransaction
    );
    return res.status(201).json(savedTransaction);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};
