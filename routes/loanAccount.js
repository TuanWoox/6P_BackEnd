const express = require("express");
const router = express.Router({ mergeParams: true });
const authMiddleware = require("../middlewares/authMiddleware");
const loanAccountController = require("../controllers/loanAccount");

router
  .route("/getAllLoanAccount")
  .post(
    authMiddleware.authenticateToken,
    loanAccountController.getAllLoanAccounts
  );

router
  .route("/details/:loanAccountId")
  .get(loanAccountController.getLoanAccount);

module.exports = router;
