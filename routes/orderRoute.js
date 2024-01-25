const express = require("express");

const {
	createCashHandler,
	filterOrderedForLoggedUser,
	getAllOrders,
	getSpecificOrder,
	updateOrderToDelivered,
	updateOrderToPaid,
	checkOutSession,
} = require("../services/orderService");

const router = express.Router();

const authService = require("../services/authService");

router.use(authService.protect);

router.route("/:cartId").post(authService.allowedTo("user"), createCashHandler);
router.get(
	"/",
	authService.allowedTo("user", "admin", "manager"),
	filterOrderedForLoggedUser,
	getAllOrders
);
router.get("/:id", getSpecificOrder);
router.put(
	"/:id/pay",
	authService.allowedTo("admin", "manager"),
	updateOrderToPaid
);
router.put(
	"/:id/deliver",
	authService.allowedTo("admin", "manager"),
	updateOrderToDelivered
);

router.get(
	"/session-checkout/:cartId",
	authService.allowedTo("user"),
	checkOutSession
);

module.exports = router;
