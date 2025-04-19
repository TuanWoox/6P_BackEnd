const express = require("express");
const router = express.Router({ mergeParams: true });
const authController = require("../controllers/auth");

router.route("/isEmailAvailable").get(authController.isEmailAvailable);
router.route("/signUp").post(authController.signUp);
module.exports = router;
