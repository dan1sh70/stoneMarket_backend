const express = require('express');
const router = express.Router();
const inquiryCtrl = require('../controllers/inquiryManagementController');
const { protect } = require('../middleware/auth');

// All quotation management routes require authentication
router.use(protect);

router.get('/:id', inquiryCtrl.getQuoteDetails);
router.put('/:id', inquiryCtrl.updateQuote);
router.post('/:id/withdraw', inquiryCtrl.withdrawQuote);

module.exports = router;
