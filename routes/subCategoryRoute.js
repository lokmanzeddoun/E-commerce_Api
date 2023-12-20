const express = require("express");
const {
	createSubCategory,
	getSubCategory,
	getAllSubCategories,
	updateSubCategory,
	deleteSubCategory,
} = require("../services/subCategoryService");
const {
	getSubCategoryValidator,
	createSubCategoryValidator,
	deleteSubCategoryValidator,
	updateSubCategoryValidator,
} = require("../utils/validator/subCategoryValidator");
const {
	setCategoryIdToBody,
	setFilterObject,
} = require("../services/subCategoryService");

const AuthService = require("../services/authService");

// merge Params : allow us to access parameters on other route
const router = express.Router({ mergeParams: true });

router
	.route("/")
	.get(setFilterObject, getAllSubCategories)
	.post(
		AuthService.protect,
		AuthService.allowedTo("admin", "manager"),
		setCategoryIdToBody,
		createSubCategoryValidator,
		createSubCategory
	);

router
	.route("/:id")
	.get(getSubCategoryValidator, getSubCategory)
	.put(
		AuthService.protect,
		AuthService.allowedTo("admin", "manager"),
		updateSubCategoryValidator,
		updateSubCategory
	)
	.delete(
		AuthService.protect,
		AuthService.allowedTo("admin"),
		deleteSubCategoryValidator,
		deleteSubCategory
	);

module.exports = router;
