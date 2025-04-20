const express = require("express");
const router = express.Router({ mergeParams: true });
const authController = require("../controllers/auth");
const authMiddleware = require("../middlewares/authMiddleware");
router.route("/logIn").post(authController.login);
router.route("/refreshToken").post(authController.refreshToken);
router.route("/validateJWT").post(authController.validateJWT);
router
  .route("/logOut")
  .post(authMiddleware.authenticateToken, authController.logout);
router.route("/isEmailAvailable").get(authController.isEmailAvailable);
router.route("/signUp").post(authController.signUp);
module.exports = router;
