const express = require("express");
const router = express.Router();
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} = require("../controllers/wishlist.controller");
const { authenticate } = require("../middleware/auth.middleware");

// All wishlist routes require authentication
router.use(authenticate);

// Get user's wishlist
router.get("/", getWishlist);

// Add book to wishlist
router.post("/", addToWishlist);

// Remove book from wishlist
router.delete("/:id", removeFromWishlist);

module.exports = router;
