const express = require("express");
const router = express.Router({ mergeParams: true });
const authMiddleware = require("../middlewares/authMiddleware");
const savingAccountController = require("../controllers/savingAccount");

router
  .route("/getSavingAccounts")
  .get(
    authMiddleware.authenticateToken,
    savingAccountController.getSavingAccounts
  );

router
  .route("/getSavingAccountById/:id")
  .get(
    authMiddleware.authenticateToken,
    savingAccountController.getSavingAccountById
  );

router.route("/getAllSavingTypes").get(savingAccountController.getAllLoanTypes);
router
  .route("/getAllSavingInterestRates")
  .get(savingAccountController.getAllSavingInterestRates);

router
  .route("/getAllSavingDepositTypes")
  .get(savingAccountController.getAllSavingDepositTypes);

router
  .route("/createSavingAccount")
  .post(
    authMiddleware.authenticateToken,
    savingAccountController.createSavingAccount
  );

module.exports = router;
