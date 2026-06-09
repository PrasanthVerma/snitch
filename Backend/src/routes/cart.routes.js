import { Router } from "express";
import { authenticateUser } from "../middlewares/auth.middleware.js";
import cartController from "../controllers/cart.controller.js";

const router = Router()

/**
 * @route POST /api/cart/add/:productId/:variantId
 * @desc add a new product to the cart
 * @access private
 */
router.post("/add/:productId/:variantId", authenticateUser, cartController.addToCart)

/**
 * @route GET /api/cart/get
 * @desc get Cart of a user
 * @access private
 */
router.get("/get", authenticateUser, cartController.getCart)

/**
 * @route DELETE /api/cart/remove/:productId/:variantId
 * @desc remove a product from the cart
 * @access private
 */
router.delete("/remove/:productId/:variantId", authenticateUser, cartController.removeFromCart)

/**
 * @route PUT /api/cart/update/:productId/:variantId
 * @desc update quantity of an item in the cart
 * @access private
 */
router.put("/update/:productId/:variantId", authenticateUser, cartController.updateCartQuantity)

/**
 * @route POST /api/cart/payment/create/order
 */
router.post("/payment/create/order",authenticateUser,cartController.createOrderController)

/**
 * @route POST /api/cart/payment/verify/order
 */
router.post("/payment/verify/order",authenticateUser,cartController.verifyOrderController)

export default router