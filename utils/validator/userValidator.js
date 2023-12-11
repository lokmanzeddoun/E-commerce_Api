const { check, body } = require("express-validator");
const slugify = require("slugify");
const validatorMiddleware = require("../../middlewares/validator");
const userModel = require("../../models/userModel");
const bcrypt = require("bcrypt");
// 1=>rules
exports.getUserValidator = [
	check("id").isMongoId().withMessage("Invalid User Id"),
	validatorMiddleware,
];

exports.createUserValidator = [
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
	check("phone")
		.optional()
		.isMobilePhone(["ar-DZ", "ar-MA", "ar-EG"])
		.withMessage("Invalid Number accept Algeria , Egypt and Morocco Number"),
	check("profileImage").optional(),
	check("role").optional(),
	validatorMiddleware,
];
exports.deleteUserValidator = [
	check("id").isMongoId().withMessage("Invalid User Id Format"),
	validatorMiddleware,
];

exports.updateUserValidator = [
	check("id").isMongoId().withMessage("Invalid User Id Format"),
	body("name").custom((val, { req }) => {
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
	check("phone")
		.optional()
		.isMobilePhone(["ar-DZ", "ar-MA", "ar-EG"])
		.withMessage("Invalid Number accept Algeria , Egypt and Morocco Number"),
	check("profileImage").optional(),
	check("role").optional(),
	validatorMiddleware,
];

exports.changePasswordValidator = [
	check("id").isMongoId().withMessage("Invalid User Id Format"),
	check("currentPassword").notEmpty().withMessage("must be a current password"),
	check("confirmPassword").notEmpty().withMessage("Invalid confirm password"),
	check("password")
		.notEmpty()
		.withMessage("Invalid Password")
		.custom(async (val, { req }) => {
			// 1-verification of the current password
			const user = await userModel.findByIdAndUpdate(req.params.id);
			if (!user) {
				throw new Error("There's is'n a user with this id");
			}
			const isCorrectPassword = await bcrypt.compare(
				req.body.currentPassword,
				user.password
			);
			if (!isCorrectPassword) {
				throw new Error("The current password didn't match the old password");
			}
			// 2-verification of the confirm password
			if (val !== req.body.confirmPassword) {
				throw new Error("The confirm password doesn't match the password ");
			}
			return true;
		}),
	validatorMiddleware,
];


exports.changeMyPasswordValidator = [
	check("currentPassword").notEmpty().withMessage("must be a current password"),
	check("confirmPassword").notEmpty().withMessage("Invalid confirm password"),
	check("password")
		.notEmpty()
		.withMessage("Invalid Password")
		.custom(async (val, { req }) => {
			// 1-verification of the current password
			const user = await userModel.findByIdAndUpdate(req.user._id);
			if (!user) {
				throw new Error("There's is'n a user with this id");
			}
			const isCorrectPassword = await bcrypt.compare(
				req.body.currentPassword,
				user.password
			);
			if (!isCorrectPassword) {
				throw new Error("The current password didn't match the old password");
			}
			// 2-verification of the confirm password
			if (val !== req.body.confirmPassword) {
				throw new Error("The confirm password doesn't match the password ");
			}
			return true;
		}),
	validatorMiddleware,
];



exports.updateMyDataValidator = [
	body("name").custom((val, { req }) => {
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
	check("phone")
		.optional()
		.isMobilePhone(["ar-DZ", "ar-MA", "ar-EG"])
		.withMessage("Invalid Number accept Algeria , Egypt and Morocco Number"),
	validatorMiddleware,
];