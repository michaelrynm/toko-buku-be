const express = require("express");
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require("../controllers/cart.controller");
const { authenticate } = require("../middleware/auth.middleware");

// All cart routes require authentication
router.use(authenticate);

// Get user's cart
router.get("/", getCart);

// Add item to cart
router.post("/", addToCart);

// Update cart item quantity
router.put("/:id", updateCartItem);

// Remove item from cart
router.delete("/:id", removeFromCart);

// Clear cart
router.delete("/", clearCart);

module.exports = router;
