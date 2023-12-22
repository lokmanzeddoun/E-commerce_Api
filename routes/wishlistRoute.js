const {
	addProductToWishlist,
	removeProductFromWishlist,
	getLoggedUserData,
} = require("../services/wishlistService");
const authService = require("../services/authService");

const express = require("express");

const router = express.Router();

router.use(authService.protect, authService.allowedTo("user"));

router.route("/").post(addProductToWishlist).get(getLoggedUserData);
router.delete(
	"/:productId",

	removeProductFromWishlist
);

module.exports = router;
