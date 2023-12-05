const { check, body } = require("express-validator");
const slugify = require("slugify");
const validatorMiddleware = require("../../middlewares/validator");
const Category = require("../../models/CategoryModel");
const subCategory = require("../../models/subCategoryModel");

exports.createProductValidator = [
	check("title")
		.notEmpty()
		.withMessage("The title must required")
		.isLength({ max: 100 })
		.withMessage("Too long Title")
		.isLength({ min: 3 })
		.optional()
		.withMessage("Too short title")
		.custom((val, { req }) => {
			req.body.slug = slugify(val);
			return true;
		}),
	check("description")
		.notEmpty()
		.withMessage("must be description")
		.isLength({
			max: 2000,
		})
		.withMessage("Too long Description"),
	check("quantity")
		.notEmpty()
		.withMessage("must Be a quantity")
		.isNumeric()
		.withMessage("Quantity must be Number"),
	check("sold")
		.optional()
		.isNumeric()
		.withMessage("Product Sold must be number"),
	check("price")
		.notEmpty()
		.withMessage("must be a price")
		.isNumeric()
		.withMessage("Price should be a number")
		.isLength({ max: 32 })
		.withMessage("Too long price"),
	check("priceAfterDiscount")
		.optional()
		.isNumeric()
		.withMessage("The price should be number")
		.toFloat()
		.custom((value, { req }) => {
			if (req.body.price <= value) {
				throw new Error(`Price AfterDiscount must be lower than the price`);
			}
			return true;
		}),

	check("color")
		.optional()
		.isArray()
		.withMessage("The Available color should be an array of string"),
	check("imageCover")
		.notEmpty()
		.withMessage("The product should contains a image cover at least"),
	check("image")
		.optional()
		.isArray()
		.withMessage("The image should be an array of String"),
	check("category")
		.notEmpty()
		.withMessage("The Product must belong to category")
		.isMongoId()
		.withMessage("Invalid Id")
		.custom((categoryId) =>
			Category.findById(categoryId).then((category) => {
				if (!category) {
					return Promise.reject(
						new Error(`No Category Found For This Id ${categoryId}`)
					);
				}
			})
		),
	check("subCategory")
		.optional()
		.isMongoId()
		.withMessage("Invalid MongoId")
		.custom((subCategoryId) =>
			subCategory
				.find({ _id: { $exists: true, $in: subCategoryId } })
				.then((subcategory) => {
					if (
						subcategory.length < 1 ||
						subcategory.length !== subCategoryId.length
					) {
						return Promise.reject(new Error(`Invalid SubCategory Ids`));
					}
				})
		)
		// Check if the subcategories belong to the category
		.custom((value, { req }) =>
			subCategory
				.find({ category: req.body.category })
				.then((subcategories) => {
					const subcategoryArr = [];
					subcategories.forEach((val) => {
						subcategoryArr.push(val._id.toString());
					});

					if (!value.every((v) => subcategoryArr.includes(v))) {
						return Promise.reject(
							new Error(`Error there isn't subcategory under this category`)
						);
					}
				})
		),
	check("Brand").optional().isMongoId().withMessage("Invalid Mongo Id"),
	check("ratingsAverage")
		.optional()
		.isNumeric()
		.withMessage("Ratings should be a number")
		.isLength({ max: 5 })
		.withMessage("Rating must be below or equal 5.0")
		.isLength({ min: 1 })
		.withMessage("Rating must be above or equal 1.0"),
	check("ratingsQuantity")
		.optional()
		.isNumeric()
		.withMessage("The Quantity should be a number"),

	validatorMiddleware,
];

exports.getProductValidator = [
	check("id").isMongoId().withMessage("Invalid Product Id"),
	validatorMiddleware,
];

exports.deleteProductValidator = [
	check("id").isMongoId().withMessage("Invalid Product Id Format"),
	validatorMiddleware,
];

exports.updateProductValidator = [
	check("id").isMongoId().withMessage("Invalid Product Id Format"),
	body("title")
		.optional()
		.custom((val, { req }) => {
			req.body.slug = slugify(val);
			return true;
		}),

	validatorMiddleware,
];
