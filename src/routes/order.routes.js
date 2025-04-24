// src/routes/order.routes.js
const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");
const { authenticate } = require("../middleware/auth.middleware.js");

// Middleware to protect routes - requires authentication
router.use(authenticate);

// Get all orders for the logged-in user
router.get("/", orderController.getUserOrders);

// Get a specific order by ID
router.get("/:id", orderController.getOrderById);

// Create a new order
router.post("/", orderController.createOrder);

// Cancel an order
router.put("/:id/cancel", orderController.cancelOrder);

// Update order status (admin only - would typically have admin middleware)
router.put("/:id/status", orderController.updateOrderStatus);

module.exports = router;
