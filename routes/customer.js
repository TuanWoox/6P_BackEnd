const express = require("express");
const router = express.Router({ mergeParams: true });
const authMiddleware = require("../middlewares/authMiddleware");
const customerController = require("../controllers/customer");

router
  .route("/getSideBarInformation")
  .get(
    authMiddleware.authenticateToken,
    customerController.getInformationForSideBar
  );

router
  .route("/getEmail")
  .post(authMiddleware.authenticateToken, customerController.getEmail);

router
  .route("/changePassword")
  .post(authMiddleware.authenticateToken, customerController.changePassword);

module.exports = router;
