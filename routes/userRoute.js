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

const router = express.Router();

router.put("/changePassword/:id", changePasswordValidator, changeUserPassword);
router
	.route("/")
	.get(getUsers)
	.post(uploadUserImage, resizeImage, createUserValidator, createUser);
router
	.route("/:id")
	.get(getUserValidator, getUser)
	.put(uploadUserImage, resizeImage, updateUserValidator, updateUser)
	.delete(deleteUserValidator, deleteUser);

module.exports = router;
