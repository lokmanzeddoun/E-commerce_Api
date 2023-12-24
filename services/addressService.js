const userModel = require("../models/userModel");

const asyncHandler = require("express-async-handler");

// @desc Add Address to addresses of user
// @route POST /api/v1/addresses
// @access private/User
exports.addAddress = asyncHandler(async (req, res, next) => {
	// $addToSet add address object to addresses array if not exist but if already present will ignore it
	const user = await userModel.findByIdAndUpdate(
		req.user._id,
		{
			$addToSet: { addresses: req.body },
		},
		{ new: true }
	);

	res.status(200).json({
		status: "success",
		message: "Address added successfully ",
		data: user.addresses,
	});
});
exports.removeAddress = asyncHandler(async (req, res, next) => {
	// $pull remove address from addresses array if  exist but if not present will ignore it
	const user = await userModel.findByIdAndUpdate(
		req.user._id,
		{
			$pull: { addresses: { _id: req.params.addressId } },
		},
		{ new: true }
	);

	res.status(200).json({
		status: "success",
		message: "Address removed successfully",
		data: user.addresses,
	});
});

exports.getLoggedUserData = asyncHandler(async (req, res, next) => {
	const user = await userModel.findById(req.user._id).populate("addresses");

	res.status(200).json({
		status: "success",
		data: user.addresses,
	});
});
