const CheckingAccountService = require("../services/checkingAccountService");

module.exports.getCheckingAccount = async (req, res) => {
  try {
    const result = await CheckingAccountService.getCheckingAccount(
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
    const result = await CheckingAccountService.getAllCheckingAccounts(
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
    const acct = await CheckingAccountService.checkAvailableTargetAccount(
      req.params.targetAccount
    );
    if (acct) return res.status(200).json({ fullName: acct.owner.fullName });
    return res.status(404).json({ message: "Không thể tìm thấy tài khoản" });
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports.transferMoney = async (req, res) => {
  try {
    const savedTransaction = await CheckingAccountService.transferMoney(
      req.user.customerId,
      req.body
    );
    res.status(201).json(savedTransaction);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports.getLimitTransaction = async (req, res) => {
  try {
    const result = await CheckingAccountService.getLimitTransaction(
      req.user.customerId
    );
    if (result) return res.status(200).json(result);
    return res.status(404).json({ message: "Không thể tìm thấy tài khoản" });
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports.updateLimit = async (req, res) => {
  try {
    const result = await CheckingAccountService.updateLimit(
      req.user.customerId,
      req.body
    );
    if (result) return res.status(200).json(result);
    return res.status(404).json({ message: "Không thể tìm thấy tài khoản" });
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
