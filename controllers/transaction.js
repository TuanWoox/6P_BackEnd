const TransactionDAO = require("../DAO/TransactionDAO");

module.exports.getTransactionHistory = async (req, res) => {
    try {
      const userId = req.userId;
      const history = await TransactionDAO.getHistoryByUserId(userId);
      res.status(200).json(history);
    } catch (error) {
      console.error("Lỗi khi lấy lịch sử giao dịch:", error.message);
      res.status(500).json({ error: "Lỗi server khi lấy lịch sử giao dịch" });
    }
};