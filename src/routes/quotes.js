const express = require('express');
const router = express.Router();
const {
  createQuoteRequest,
  getQuoteById,
  respondToQuote,
  getQuoteResponses
} = require('../controllers/quoteController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createQuoteRequest);
router.get('/:id', protect, getQuoteById);
router.post('/:id/responses', protect, respondToQuote);
router.get('/:id/responses', protect, getQuoteResponses);

module.exports = router;
