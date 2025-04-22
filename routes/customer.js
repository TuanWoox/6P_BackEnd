const express = require("express");
const router = express.Router({ mergeParams: true });
const authMiddleware = require("../middlewares/authMiddleware");
const customerController = require("../controllers/customer");

router
  .route("/getName")
  .post(authMiddleware.authenticateToken, customerController.getName);

module.exports = router;
