const categoryRoute = require("./CategoryRoute");
const subCategoryRoute = require("./subCategoryRoute");
const BrandRoute = require("./brandRoute");
const productRoute = require("./productRoute");
const userRoute = require("./userRoute");
const authRoute = require("./authroute");
const reviewRoute = require("./reviewRoute");
const wishlistRoute = require("./wishlistRoute");
const addressRoute = require("./addressRoute");
const couponRoute = require("./couponRoute");
const cartRoute = require("./cartRoute");
const orderRoute = require("./orderRoute")

const mountRoutes = (app) => {
	app.use("/api/v1/categories", categoryRoute);
	app.use("/api/v1/subcategories", subCategoryRoute);
	app.use("/api/v1/brand", BrandRoute);
	app.use("/api/v1/product", productRoute);
	app.use("/api/v1/user", userRoute);
	app.use("/api/v1/auth", authRoute);
	app.use("/api/v1/review", reviewRoute);
	app.use("/api/v1/wishlist", wishlistRoute);
	app.use("/api/v1/addresses", addressRoute);
	app.use("/api/v1/coupons", couponRoute);
	app.use("/api/v1/cart", cartRoute);
	app.use("/api/v1/order", orderRoute);
};

module.exports = mountRoutes;
