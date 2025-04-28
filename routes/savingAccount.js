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

module.exports = router;
