const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect, optionalAuth } = require('../middleware/auth');

// Webhook endpoint (gateway calls this with signature)
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.handleWebhook);

// Protected Payment Endpoints
router.post('/create-order', protect, paymentController.createPaymentOrder);
router.post('/verify', protect, paymentController.verifyPayment);
router.get('/:id/status', protect, paymentController.getPaymentStatus);

module.exports = router;
