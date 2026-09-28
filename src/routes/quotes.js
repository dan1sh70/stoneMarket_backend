const express = require('express');
const router = express.Router();
const { createQuoteRequest } = require('../controllers/quoteController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createQuoteRequest);

module.exports = router;
