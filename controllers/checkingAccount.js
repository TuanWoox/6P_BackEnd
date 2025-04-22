const CheckingAccountDAO = require("../DAO/CheckingAccountDAO");

module.exports.getCheckingAccount = async (req, res, next) => {
  const { customerId } = req.user;

  try {
    const foundCheckingAccount = await CheckingAccountDAO.getCheckingAccount(
      customerId
    );
    if (foundCheckingAccount) return res.status(200).json(foundCheckingAccount);
    return res.status(404).json({ message: "Không thể tìm thấy tài khoản" });
  } catch (err) {
    return res.status(200).json({ message: "Internal Server Error" });
  }
};
