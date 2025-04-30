const SavingAccountDAO = require("../DAO/SavingAccountDAO");
const SavingTypeDAO = require("../DAO/SavingTypeDAO");
const SavingTypeInterestDAO = require("../DAO/SavingTypeInterestDAO");
const DepositTypeDAO = require("../DAO/DepositTypeDAO");
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
