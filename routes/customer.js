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
  .route("/resetPassword")
  .post(
    // authMiddleware.authenticateToken,
    customerController.resetPassword
  );
router
  .route("/getCustomerID")
  .post(
    // authMiddleware.authenticateToken,
    customerController.getCustomerID
  );

router
  .route("/getEmail")
  .post(authMiddleware.authenticateToken, customerController.getEmail);

router
  .route("/changePassword")
  .post(authMiddleware.authenticateToken, customerController.changePassword);

router
  .route("/getPersonalInfor")
  .get(
    authMiddleware.authenticateToken,
    customerController.getCustomerProfile
  );

router
  .route("/updatePersonalInfor") 
  .post(
    authMiddleware.authenticateToken,
    customerController.updateCustomerProfile
  );
module.exports = router;
