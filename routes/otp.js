const express = require("express");
const router = express.Router({ mergeParams: true });
const otpController = require("../controllers/otp");

router.route("/registerOTP").post(otpController.createSignUpOtp);
router.route("/loginOTP").post(otpController.createLoginOtp);
router.route("/verifyOTP").get(otpController.verifyOTP);
module.exports = router;
