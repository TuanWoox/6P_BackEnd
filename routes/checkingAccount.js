const express = require("express");
const router = express.Router({ mergeParams: true });
const authMiddleware = require("../middlewares/authMiddleware");
const checkingAccountController = require("../controllers/checkingAccount");

router
  .route("/getCheckingAccount")
  .post(
    authMiddleware.authenticateToken,
    checkingAccountController.getCheckingAccount
  );
router
  .route("/getAllCheckingAccount")
  .get(
    authMiddleware.authenticateToken,
    checkingAccountController.getAllCheckingAccount
  );

router 
  .route("/checkAvilableTargetAccount/:targetAccount")
  .get(
    checkingAccountController.checkAvilableTargetAccount
  );

router
  .route("/transferMoney")
  .post(
    authMiddleware.authenticateToken,
    checkingAccountController.transferMoney
  );
module.exports = router;
