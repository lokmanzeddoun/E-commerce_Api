const userModel = require("../models/userModel");

const asyncHandler = require("express-async-handler");

// @desc Add product to wishlist of user
// @route POST /api/v1/users/wishlist
// @access private/User
exports.addProductToWishlist = asyncHandler(async (req, res, next) => {
	// $addToSet add product to wishlist array if not exist but if already present will ignore it
	const user = await userModel.findByIdAndUpdate(
		req.user._id,
		{
			$addToSet: { wishlist: req.body.productId },
		},
		{ new: true }
	);

	res.status(200).json({
		status: "success",
		message: "Product added successfully  to your wishlist ",
		data: user.wishlist,
	});
});
exports.removeProductFromWishlist = asyncHandler(async (req, res, next) => {
	// $pull remove product from wishlist array if  exist but if not present will ignore it
	const user = await userModel.findByIdAndUpdate(
		req.user._id,
		{
			$pull: { wishlist: req.params.productId },
		},
		{ new: true }
	);

	res.status(200).json({
		status: "success",
		message: "Product removed successfully  from your wishlist ",
		data: user.wishlist,
	});
});

exports.getLoggedUserData = asyncHandler(async (req, res, next) => {
	const user = await userModel.findById(req.user._id).populate("wishlist");

	res.status(200).json({
		status: "success",
		data: user.wishlist,
	});
});
