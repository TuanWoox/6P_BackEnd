// controllers/TransactionController.js
const TransactionService = require("../services/transactionService");

module.exports.getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user.customerId;

    // Call the service to get transaction history
    const formattedHistory = await TransactionService.getTransactionHistory(
      userId
    );

    // Respond with the formatted transaction history
    res.status(200).json(formattedHistory);
  } catch (error) {
    console.error("Error when fetching transaction history:", error.message);
    res
      .status(500)
      .json({ error: "Server error while fetching transaction history" });
  }
};
