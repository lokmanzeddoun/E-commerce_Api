const {
	addAddress,
	removeAddress,
	getLoggedUserData,
} = require("../services/addressService");

const authService = require("../services/authService");

const express = require("express");

const router = express.Router();

router.use(authService.protect, authService.allowedTo("user"));

router.route("/").post(addAddress).get(getLoggedUserData);
router.delete(
	"/:addressId",
	removeAddress
);

module.exports = router;


