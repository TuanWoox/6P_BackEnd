const express = require("express");
const router = express.Router({ mergeParams: true });
const authMiddleware = require("../middlewares/authMiddleware");
const customerController = require("../controllers/customer");
router
  .route("/getCustomerProfile")
  .get(authMiddleware.authenticateToken, customerController.getCustomerProfile);

module.exports = router;
