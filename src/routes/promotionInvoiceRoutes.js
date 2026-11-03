const express = require('express');
const router = express.Router();
const promotionInvoiceController = require('../controllers/promotionInvoiceController');
const { protect } = require('../middleware/auth');

router.get('/', protect, promotionInvoiceController.getManufacturerInvoices);
router.get('/:id/download', protect, promotionInvoiceController.downloadInvoicePdf);
router.get('/:id', protect, promotionInvoiceController.getInvoiceById);

module.exports = router;
