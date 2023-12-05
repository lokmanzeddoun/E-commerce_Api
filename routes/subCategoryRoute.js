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
// merge Params : allow us to access parameters on other route
const router = express.Router({ mergeParams: true });

router
	.route("/")
	.get(setFilterObject, getAllSubCategories)
	.post(setCategoryIdToBody, createSubCategoryValidator, createSubCategory);

router
	.route("/:id")
	.get(getSubCategoryValidator, getSubCategory)
	.put(updateSubCategoryValidator, updateSubCategory)
	.delete(deleteSubCategoryValidator, deleteSubCategory);

module.exports = router;
