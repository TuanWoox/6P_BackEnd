const TransactionDAO = require("../DAO/TransactionDAO");
const Account = require("../models/account");
module.exports.getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user.customerId;
    const userAccounts = await Account.find({ owner: userId }).select(
      "accountNumber"
    );
    const accountNumbers = userAccounts.map((acc) => acc.accountNumber);

    // 2) Lấy lịch sử giao dịch từ DAO
    const history = await TransactionDAO.getHistoryByUserId(userId);

    // 3) Định nghĩa các loại để xử lý direction cho non-TRANSFER
    const IN_TYPES = ["DEPOSIT", "RECEIVED", "REFUND"];
    const OUT_TYPES = ["WITHDRAWAL"];

    // 4) Map và thêm thuộc tính `direction`
    const formattedHistory = history.map((txDoc) => {
      // Nếu là Document Mongoose, chuyển thành plain object
      const tx = txDoc.toObject ? txDoc.toObject() : txDoc;
      let direction = "unknown";

      if (tx.type === "TRANSFER") {
        if (accountNumbers.includes(tx.destinationAccountID)) {
          direction = "in";
        } else if (accountNumbers.includes(tx.sourceAccountID)) {
          direction = "out";
        }
      } else if (IN_TYPES.includes(tx.type)) {
        direction = "in";
      } else if (OUT_TYPES.includes(tx.type)) {
        direction = "out";
      }

      return {
        ...tx,
        direction,
      };
    });

    res.status(200).json(formattedHistory);
  } catch (error) {
    console.error("Lỗi khi lấy lịch sử giao dịch:", error.message);
    res.status(500).json({ error: "Lỗi server khi lấy lịch sử giao dịch" });
  }
};
