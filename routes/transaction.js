const express = require("express");
const router = express.Router({ mergeParams: true });
const authMiddleware = require("../middlewares/authMiddleware");
const transactionController = require("../controllers/transaction");
router
  .route("/history")
  .get(authMiddleware.authenticateToken, transactionController.getTransactionHistory);

module.exports = router;
