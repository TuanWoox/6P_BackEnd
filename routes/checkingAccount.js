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

module.exports = router;
