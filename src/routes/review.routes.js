const express = require("express");
const router = express.Router();
const {
  getBookReviews,
  createReview,
  updateReview,
  deleteReview,
} = require("../controllers/review.controller");
const { authenticate } = require("../middleware/auth.middleware");

// Get reviews for a book
router.get("/book/:bookId", getBookReviews);

// Create a review for a book
router.post("/book/:bookId", authenticate, createReview);

// Update a review
router.put("/:id", authenticate, updateReview);

// Delete a review
router.delete("/:id", authenticate, deleteReview);

module.exports = router;
