const express = require('express');
const router = express.Router();
const controller = require('../controllers/buyerProfileController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const attachmentUpload = require('../middleware/attachmentUpload');
const {
  updateBuyerProfileSchema,
  updateBuyerProjectInfoSchema,
  buyerContactSchema,
  buyerGalleryPhotoSchema,
  buyerGalleryVideoSchema,
  createSourcingRequirementSchema,
  updateSourcingRequirementSchema,
  acceptQuoteSchema,
  buyerPhoneOtpVerifySchema,
  buyerEmailVerifySchema,
  buyerBusinessVerifySchema,
  buyerGstVerifySchema,
  buyerBankVerifySchema,
  buyerDocumentUploadSchema,
  buyerAnalyticsEventSchema
} = require('../validations/buyer.validation');

// All buyer profile routes are protected
router.use(protect);

// ==========================================
// 1. DASHBOARD & BUSINESS TYPE SWITCHER
// ==========================================
router.get('/dashboard', controller.getDashboard);
router.get('/business-types', controller.getBusinessTypes);
router.post('/switch-business-type', controller.switchBusinessType);

// ==========================================
// 2. PRODUCT MANAGEMENT DISABLED ENFORCEMENT
// ==========================================
router.all('/products*', controller.productManagementDisabled);
router.all('/products', controller.productManagementDisabled);
router.all('/inventory*', controller.productManagementDisabled);

// ==========================================
// 3. BUYER PROFILE & PROJECT INFO
// ==========================================
router.get('/profile', controller.getProfile);
router.put('/profile', validate(updateBuyerProfileSchema), controller.updateProfile);
router.put('/project-info', validate(updateBuyerProjectInfoSchema), controller.updateProjectInfo);
router.put('/specs', validate(updateBuyerProjectInfoSchema), controller.updateProjectInfo);

// Contacts & Key Persons Management
router.get('/contacts', controller.getContacts);
router.post('/contacts', attachmentUpload.single('photo'), validate(buyerContactSchema), controller.addContact);
router.put('/contacts/:contactId', attachmentUpload.single('photo'), controller.updateContact);
router.delete('/contacts/:contactId', controller.deleteContact);

// ==========================================
// 4. GALLERY MANAGEMENT
// ==========================================
router.get('/gallery', controller.getGallery);
router.post('/gallery/photos', attachmentUpload.single('photo'), validate(buyerGalleryPhotoSchema), controller.uploadGalleryPhoto);
router.delete('/gallery/photos/:photoId', controller.deleteGalleryPhoto);
router.post('/gallery/videos', attachmentUpload.single('video'), validate(buyerGalleryVideoSchema), controller.addGalleryVideo);
router.delete('/gallery/videos/:videoId', controller.deleteGalleryVideo);
router.get('/gallery/owners', controller.getGalleryOwners);

// ==========================================
// 5. SOURCING REQUIREMENTS ENGINE
// ==========================================
router.get('/requirements', controller.getRequirements);
router.post('/requirements', validate(createSourcingRequirementSchema), controller.createRequirement);
router.get('/requirements/:id', controller.getRequirementById);
router.put('/requirements/:id', validate(updateSourcingRequirementSchema), controller.updateRequirement);
router.post('/requirements/:id/duplicate', controller.duplicateRequirement);
router.put('/requirements/:id/close', controller.closeRequirement);
router.delete('/requirements/:id', controller.deleteRequirement);

// ==========================================
// 6. MY PURCHASE INQUIRIES & QUOTE COMPARISON
// ==========================================
router.get('/inquiries', controller.getMyInquiries);
router.get('/inquiries/:id', controller.getInquiryDetails);
router.post('/quotes/compare', controller.compareQuotes);
router.post('/quotes/:quote_id/accept', validate(acceptQuoteSchema), controller.acceptQuoteAndCreateOrder);

// ==========================================
// 7. ORDER HISTORY ENGINE
// ==========================================
router.get('/orders', controller.getOrders);
router.get('/orders/:id', controller.getOrderDetails);
router.put('/orders/:id/confirm-delivery', controller.confirmOrderDelivery);
router.put('/orders/:id/cancel', controller.cancelOrder);

// ==========================================
// 8. VERIFICATION CENTER
// ==========================================
router.get('/verification', controller.getVerification);
router.post('/verification/phone/send-otp', controller.sendPhoneOTP);
router.post('/verification/phone/verify-otp', validate(buyerPhoneOtpVerifySchema), controller.verifyPhoneOTP);
router.post('/verification/email/send', controller.sendEmailVerification);
router.post('/verification/email/verify', validate(buyerEmailVerifySchema), controller.verifyEmail);
router.post('/verification/business', attachmentUpload.single('document'), validate(buyerBusinessVerifySchema), controller.submitBusinessVerification);
router.post('/verification/gst', attachmentUpload.single('certificate'), validate(buyerGstVerifySchema), controller.submitGSTVerification);
router.post('/verification/bank', attachmentUpload.single('cheque_document'), validate(buyerBankVerifySchema), controller.submitBankVerification);
router.get('/verification/documents', controller.getVerificationDocuments);
router.post('/verification/documents', attachmentUpload.single('document'), validate(buyerDocumentUploadSchema), controller.uploadVerificationDocument);

// ==========================================
// 9. BUYER ANALYTICS ENGINE
// ==========================================
router.get('/analytics/overview', controller.getOverviewAnalytics);
router.get('/analytics/sourcing', controller.getSourcingAnalytics);
router.get('/analytics/procurement', controller.getProcurementAnalytics);
router.post('/analytics/event', validate(buyerAnalyticsEventSchema), controller.recordAnalyticsEvent);

module.exports = router;

