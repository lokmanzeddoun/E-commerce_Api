const factory = require("./handlerFactory");
const subCategoryModel = require("../models/subCategoryModel");

// @desc    create  subCategory
// @route   Post /api/v1/subCategory
// @access  Public
exports.createSubCategory = factory.createOne(subCategoryModel);

// @route GET /api/v1/categories/:idCategory/subcategories
// Nested route

exports.setCategoryIdToBody = (req, res, next) => {
	// Nested Route
	if (!req.body.category) req.body.category = req.params.categoryId;
	next();
};
exports.setFilterObject = (req, res, next) => {
	let filterObject = {};
	if (req.params.categoryId) filterObject = { category: req.params.categoryId };
	req.filterObject = filterObject;
	next();
};
// @desc    Get list of subcategories
// @route   GET /api/v1/subCategory
// @access  Public
exports.getAllSubCategories = factory.getAll(subCategoryModel);

// @desc    get specific subcategory
// @route   GET /api/v1/subcategories/:id
// @access  Private/Admin-Manager
exports.getSubCategory = factory.getOne(subCategoryModel);
// @desc    update specific subcategory
// @route   PUT /api/v1/subcategories/:id
// @access  Private/Admin-Manager
exports.updateSubCategory = factory.updateOne(subCategoryModel);

// @desc    Delete specific subcategory
// @route   DELETE /api/v1/subcategories/:id
// @access  Private/admin
exports.deleteSubCategory = factory.deleteOne(subCategoryModel);
