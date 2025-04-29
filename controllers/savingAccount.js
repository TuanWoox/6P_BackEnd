const SavingAccountDAO = require("../DAO/SavingAccountDAO");

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
