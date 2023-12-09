const express = require("express");
const {
	signUp,
	login,
	forgetPassword,verifyResetCode,
} = require("../services/authService");
const {
	signupValidator,
	loginValidator,
	
} = require("../utils/validator/authValidator");

const router = express.Router();


router.post('/signup',signupValidator, signUp);
router.post("/login", loginValidator, login);
router.post("/forgotPassword", forgetPassword);
router.post("/verifyResetCode", verifyResetCode);



module.exports = router;
