// controllers/TransactionController.js
const TransactionDAO = require("../DAO/TransactionDAO");
const Account = require("../models/account");

module.exports.getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user.customerId;

    // Fetching user accounts and account numbers
    const userAccounts = await Account.find({ owner: userId }).select(
      "accountNumber"
    );
    const accountNumbers = userAccounts.map((acc) => acc.accountNumber);

    // Fetching transaction history
    const history = await TransactionDAO.getHistoryByUserId(userId);

    // Defining transaction types
    const IN_TYPES = ["WITHDRAWAL", "RECEIVELOAN"];
    const OUT_TYPES = ["DEPOSIT", "PAYLOAN"];

    // Mapping and adding 'direction' to transactions
    const formattedHistory = history.map((txDoc) => {
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

      return { ...tx, direction };
    });

    // Respond with the formatted transaction history
    res.status(200).json(formattedHistory);
  } catch (error) {
    console.error("Error when fetching transaction history:", error.message);
    res
      .status(500)
      .json({ error: "Server error while fetching transaction history" });
  }
};
