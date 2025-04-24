const CheckingAccountDAO = require("../DAO/CheckingAccountDAO");
const CheckingAccount = require("../models/checkingAccount");
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
}

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
}

module.exports.transferMoney = async (req, res) => {
  try {
      const transactionDetails = req.body;
      console.log(transactionDetails);
      const currentAccount = await CheckingAccountDAO.getCheckingAccount(req.user.customerId);
      currentAccount.transferMoney(transactionDetails);
  } catch (error) {
      console.error("Lỗi khi chuyển tiền:", error.message);
      res.status(500).json({ error: "Lỗi server khi chuyển tiền" });
  }
}