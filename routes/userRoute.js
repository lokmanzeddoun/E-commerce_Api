const express = require("express");
const {
	getUserValidator,
	createUserValidator,
	deleteUserValidator,
	updateUserValidator,
	changePasswordValidator,
	changeMyPasswordValidator,
	updateMyDataValidator,
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
	getLoggedUserData,
	updateMyPassword,
	updateMyData,
	deactivate,
} = require("../services/userService");

const AuthService = require("../services/authService");

const router = express.Router();

router.use(AuthService.protect);

router.get("/getMe", getLoggedUserData, getUser);

router.put("/changeMyPassword", changeMyPasswordValidator, updateMyPassword);

router.put("/changeMyData", updateMyDataValidator, updateMyData);
router.delete("/deactivate", deactivate);
router.use(AuthService.allowedTo("admin"));

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
