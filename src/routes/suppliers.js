const express = require('express');
const router = express.Router();
const { getSupplierQuoteRequests } = require('../controllers/quoteController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/quote-requests', getSupplierQuoteRequests);

module.exports = router;
