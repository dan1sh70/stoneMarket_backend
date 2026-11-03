const express = require('express');
const router = express.Router();
const inquiryCtrl = require('../controllers/inquiryManagementController');
const { protect } = require('../middleware/auth');

// All inquiry management routes require authentication
router.use(protect);

// 1. Statistics & Search (must be before :id routes)
router.get('/statistics', inquiryCtrl.getInquiryStatistics);
router.get('/search', inquiryCtrl.searchInquiries);

// 2. Specific Sub-Resources for an Inquiry
router.get('/:id/requirements', inquiryCtrl.getInquiryRequirements);
router.get('/:id/attachments', inquiryCtrl.getInquiryAttachments);
router.get('/:id/activity', inquiryCtrl.getInquiryActivity);
router.get('/:id/download', inquiryCtrl.downloadInquiryPdf);

// 3. Quotes Sub-Resources
router.get('/:id/quotes/compare', inquiryCtrl.compareInquiryQuotes);
router.get('/:id/quotes', inquiryCtrl.getInquiryQuotes);
router.post('/:id/quotes', inquiryCtrl.submitQuote);

// 4. Lifecycle Actions
router.post('/:id/review', inquiryCtrl.reviewInquiry);
router.post('/:id/close', inquiryCtrl.closeInquiry);
router.post('/:id/reopen', inquiryCtrl.reopenInquiry);

// 5. Messaging Sub-Resources
router.get('/:id/messages', inquiryCtrl.getInquiryMessages);
router.post('/:id/messages', inquiryCtrl.sendInquiryMessage);
router.post('/:id/messages/read', inquiryCtrl.markInquiryMessagesRead);

// 6. Main Details & Listing
router.get('/:id', inquiryCtrl.getInquiryDetails);
router.get('/', inquiryCtrl.getManufacturerInquiries);

module.exports = router;
