const CheckingAccountDAO = require("../DAO/CheckingAccountDAO");
const CheckingAccount = require("../models/checkingAccount");
const transactionDAO = require("../DAO/TransactionDAO");
const Transaction = require("../models/Transaction");

module.exports.getCheckingAccount = async (req, res, next) => {
  const { customerId } = req.user;

  try {
    const foundCheckingAccount = await CheckingAccountDAO.getCheckingAccount(
      customerId
    );
    if (foundCheckingAccount) return res.status(200).json(foundCheckingAccount);
    return res.status(404).json({ message: "Không thể tìm thấy tài khoản" });
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports.getAllCheckingAccount = async (req, res, next) => {
  const { customerId } = req.user;

  try {
    const foundCheckingAccount = await CheckingAccountDAO.getAllCheckingAccount(
      customerId
    );
    if (foundCheckingAccount) return res.status(200).json(foundCheckingAccount);
    return res.status(404).json({ message: "Không thể tìm thấy tài khoản" });
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports.checkAvilableTargetAccount = async (req, res, next) => {
  const { targetAccount } = req.params;
  try {
    const acct = await CheckingAccountDAO.checkAvilableTargetAccount(
      targetAccount
    );
    if (acct) return res.status(200).json({ fullName: acct.owner.fullName });
    return res.status(404).json({ message: "Không thể tìm thấy tài khoản" });
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports.transferMoney = async (req, res) => {
  try {
    const { targetAccount, amount, description } = req.body;
    const userId = req.user.customerId;

    // 1. Lấy account hiện tại (source account)
    const currentAccount = await CheckingAccountDAO.getCheckingAccount(userId);

    if (!currentAccount) {
      return res.status(404).json({ message: "Source account not found" });
    }

    if (currentAccount.status !== "ACTIVE") {
      return res.status(400).json({ message: "Source account is not active" });
    }

    // 2. Tìm destination account
    const destAccount = await CheckingAccountDAO.getByAccountNumber(
      targetAccount
    );

    if (!destAccount || destAccount.status !== "ACTIVE") {
      return res
        .status(404)
        .json({ message: "Destination account not found or inactive" });
    }

    // 3. Check số dư
    const availableBalance =
      currentAccount.balance +
      (currentAccount.overdraftProtection
        ? currentAccount.dailyTransactionLimit
        : 0);

    if (availableBalance < amount) {
      return res.status(400).json({ message: "Insufficient funds" });
    }

    // 4. Update balances
    currentAccount.balance -= amount;
    destAccount.balance += amount;
    await CheckingAccountDAO.save(currentAccount);
    await CheckingAccountDAO.save(destAccount);

    // 5. Tạo transaction instance và lưu
    const newTransaction = new Transaction({
      type: "TRANSFER",
      amount,
      description,
      sourceAccountID: currentAccount.accountNumber,
      destinationAccountID: targetAccount,
      status: "Completed",
    });

    const savedTransaction = await transactionDAO.createTransfer(
      newTransaction
    );
    console.log("Transaction saved:", savedTransaction);
    console.log("currentAccount:", currentAccount);
    console.log("destAccount:", destAccount);

    // 6. Trả kết quả về
    res.status(201).json(savedTransaction);
  } catch (error) {
    console.error("Transfer Money Error:", error);
    res.status(500).json({ message: error.message });
  }
};
