const express = require("express");
const {
	getUserValidator,
	createUserValidator,
	deleteUserValidator,
	updateUserValidator,
	changePasswordValidator,
} = require("../utils/validator/userValidator");

const {
	uploadUserImage,
	resizeImage,
	getUsers,
	getUser,
	createUser,
	updateUser,
	deleteUser,
	changeUserPassword,
} = require("../services/userService");

const AuthService = require("../services/authService");

const router = express.Router();

router.put("/changePassword/:id", changePasswordValidator, changeUserPassword);
router
	.route("/")
	.get(AuthService.protect, AuthService.allowedTo("admin"), getUsers)
	.post(
		AuthService.protect,
		AuthService.allowedTo("admin"),
		uploadUserImage,
		resizeImage,
		createUserValidator,
		createUser
	);
router
	.route("/:id")
	.get(
		AuthService.protect,
		AuthService.allowedTo("admin"),
		getUserValidator,
		getUser
	)
	.put(
		AuthService.protect,
		AuthService.allowedTo("admin"),
		uploadUserImage,
		resizeImage,
		updateUserValidator,
		updateUser
	)
	.delete(
		AuthService.protect,
		AuthService.allowedTo("admin"),
		deleteUserValidator,
		deleteUser
	);

module.exports = router;
