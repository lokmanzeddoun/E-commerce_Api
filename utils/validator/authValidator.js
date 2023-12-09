const { check, body } = require("express-validator");
const slugify = require("slugify");
const validatorMiddleware = require("../../middlewares/validator");
const userModel = require("../../models/userModel");
const bcrypt = require("bcrypt");
// 1=>rules

exports.signupValidator = [
	check("name")
		.notEmpty()
		.withMessage("User name required")
		.isLength({ min: 3 })
		.withMessage("Too short User")
		.custom((val, { req }) => {
			req.body.slug = slugify(val);
			return true;
		}),
	check("email")
		.notEmpty()
		.withMessage("Email Required")
		.isEmail()
		.withMessage("Invalid Email")
		.custom((val) =>
			userModel.findOne({ email: val }).then((user) => {
				if (user) {
					return Promise.reject(new Error(`Email Exist in the DataBase`));
				}
			})
		),
	check("password")
		.notEmpty()
		.withMessage(`Password is required`)
		.isLength({ min: 6 })
		.withMessage(`Too short Password`)
		.custom((val, { req }) => {
			if (val !== req.body.passwordConfirm) {
				throw new Error(`Password Confirmation Error`);
			}
			return true;
		}),
	check("passwordConfirm")
		.notEmpty()
		.withMessage("Password Confirmation required"),

	validatorMiddleware,
];

exports.loginValidator = [
	check("email")
		.notEmpty()
		.withMessage("Email Required")
		.isEmail()
		.withMessage("Invalid Email"),

	check("password")
		.notEmpty()
		.withMessage(`Password is required`)
		.isLength({ min: 6 })
		.withMessage(`Too short Password`),
	validatorMiddleware,
];




