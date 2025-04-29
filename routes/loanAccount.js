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

router.route("/getAllLoanTypes").get(loanAccountController.getAllLoanTypes);

router
  .route("/details/:loanAccountId")
  .get(authMiddleware.authenticateToken, loanAccountController.getLoanAccount);

router
  .route("/getAllLoanInterestRates")
  .get(loanAccountController.getAllLoanInterestRates);

router
  .route("/findLoanInterestRates")
  .post(loanAccountController.findLoanInterestRates);

router
  .route("/createNewLoan")
  .post(
    authMiddleware.authenticateToken,
    loanAccountController.createLoanAccount
  );

module.exports = router;
