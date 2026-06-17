const express = require('express');
const router = express.Router();
const {
  submitInquiry,
  getSentInquiries,
  getReceivedInquiries,
  getInquiryById,
  updateInquiryStatus,
  respondToInquiry,
  getAllInquiriesAdmin
} = require('../controllers/inquiryController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { inquirySchema } = require('../validations/inquiry.validation');

// Note: Order matters to avoid /:id matching /sent, /received, etc.

router.post('/', protect, validate(inquirySchema), submitInquiry);
router.get('/sent', protect, getSentInquiries);
router.get('/received', protect, authorize('vendor'), getReceivedInquiries);

// Admin
router.get('/admin/all', protect, authorize('admin'), getAllInquiriesAdmin);

// ID-based routes
router.get('/:id', protect, getInquiryById);
router.put('/:id/status', protect, authorize('vendor'), updateInquiryStatus);
router.post('/:id/respond', protect, authorize('vendor'), respondToInquiry);

module.exports = router;
