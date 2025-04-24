const express = require('express');
const router = express.Router();
const { getAllBooks, getNewReleaseBooks, getBookById, searchBooks } = require('../controllers/book.controller');

// Get all books
router.get('/', getAllBooks);

// Get new release books
router.get('/new-releases', getNewReleaseBooks);

// Search books
router.get('/search', searchBooks);

// Get book by ID
router.get('/:id', getBookById);

module.exports = router;