const LoanAccountDAO = require("../DAO/LoanAccountDAO");
const LoanPaymentDAO = require("../DAO/LoanPaymentDAO");
const LoanTypeDAO = require("../DAO/LoanTypeDAO");
const LoanTypeInterestRatesDAO = require("../DAO/LoanTypeInterestRatesDAO");

module.exports.getAllLoanAccounts = async (req, res, next) => {
  const { customerId } = req.user;
  // const customerId = "68078ecd387dabca60d71443";

  try {
    const foundLoanAccount =
      await LoanAccountDAO.getAllLoanAccountsByCustomerId(customerId);
    if (foundLoanAccount) return res.status(200).json(foundLoanAccount);
    return res.status(404).json({ message: "Không thể tìm thấy khoản vay" });
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports.getLoanAccount = async (req, res, next) => {
  const { customerId } = req.user;
  const { loanAccountId } = req.params; // id của LoanAccount truyền qua URL

  try {
    // Fetch the loan account details
    const foundLoanAccount = await LoanAccountDAO.getLoanAccountById(
      loanAccountId
    );
    if (!foundLoanAccount) {
      return res.status(404).json({ message: "Không thể tìm thấy khoản vay" });
    }

    // Kiểm tra quyền truy cập
    if (String(foundLoanAccount.owner) !== String(customerId)) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền xem khoản vay này" });
    }

    // Fetch all payments for this loan account
    const loanPayments = await LoanPaymentDAO.getAllLoanPaymentsByLoanAccountId(
      loanAccountId
    );

    // Return both the loan account and its payments
    return res.status(200).json({
      ...foundLoanAccount.toObject(), // convert Mongoose document to plain object if needed
      loanPayments: loanPayments || [],
    });
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
