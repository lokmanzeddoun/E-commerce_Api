const express = require("express");
const {uploadCategoryImage, resizeImage} = require("../services/CategoryService")
const {
	getCategoryValidator,
	createCategoryValidator,
	deleteCategoryValidator,
	updateCategoryValidator,
} = require("../utils/validator/categoryValidator");
const subCategoryRoute = require("./subCategoryRoute");
const {
	getCategories,
	getCategory,
	createCategory,
	updateCategory,
	deleteCategory,
} = require("../services/CategoryService");

const AuthService = require('../services/authService')

const router = express.Router();
router.use("/:categoryId/subcategories", subCategoryRoute);
router
	.route("/")
	.get(getCategories)
	.post(
		AuthService.protect,
		uploadCategoryImage,
		resizeImage,
		createCategoryValidator,
		createCategory
	);
router
	.route("/:id")
	.get(getCategoryValidator, getCategory)
	.put(uploadCategoryImage,
		resizeImage,updateCategoryValidator, updateCategory)
	.delete(deleteCategoryValidator, deleteCategory);

module.exports = router;
