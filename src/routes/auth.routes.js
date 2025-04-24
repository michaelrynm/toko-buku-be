const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getCurrentUser,
} = require("../controllers/auth.controller");
const { authenticate } = require("../middleware/auth.middleware");

// Register route
router.post("/register", register);

// Login route
router.post("/login", login);

// Get current user route
router.get("/me", authenticate, getCurrentUser);

module.exports = router;
