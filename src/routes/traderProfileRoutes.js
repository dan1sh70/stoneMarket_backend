const express = require('express');
const router = express.Router();
const controller = require('../controllers/traderProfileController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const attachmentUpload = require('../middleware/attachmentUpload');
const {
  updateTraderProfileSchema,
  updateTraderCapabilitiesSchema,
  traderContactSchema,
  traderGalleryPhotoSchema,
  traderGalleryVideoSchema,
  traderPhoneOtpVerifySchema,
  traderEmailVerifySchema,
  traderBusinessVerifySchema,
  traderGstVerifySchema,
  traderBankVerifySchema,
  traderDocumentUploadSchema,
  traderAnalyticsEventSchema
} = require('../validations/trader.validation');

// All trader profile management routes are protected
router.use(protect);

// ==========================================
// 1. DASHBOARD & BUSINESS TYPE SWITCHER
// ==========================================
router.get('/dashboard', controller.getDashboard);
router.get('/business-types', controller.getBusinessTypes);
router.post('/switch-business-type', controller.switchBusinessType);

// ==========================================
// 2. PRODUCT MANAGEMENT DISABLED ENFORCEMENT
// Traders are commercial intermediaries; Product Management is strictly disabled.
// ==========================================
router.all('/products*', controller.productManagementDisabled);
router.all('/products', controller.productManagementDisabled);
router.all('/inventory*', controller.productManagementDisabled);

// ==========================================
// 3. TRADER PROFILE & TRADING CAPABILITIES
// ==========================================
router.get('/profile', controller.getProfile);
router.put('/profile', validate(updateTraderProfileSchema), controller.updateProfile);
router.put('/trading-capabilities', validate(updateTraderCapabilitiesSchema), controller.updateTradingCapabilities);
router.put('/capabilities', validate(updateTraderCapabilitiesSchema), controller.updateTradingCapabilities);
router.put('/specs', validate(updateTraderCapabilitiesSchema), controller.updateTradingCapabilities);

// Contacts & Key Persons Management
router.get('/contacts', controller.getContacts);
router.post('/contacts', attachmentUpload.single('photo'), validate(traderContactSchema), controller.addContact);
router.put('/contacts/:contactId', attachmentUpload.single('photo'), controller.updateContact);
router.delete('/contacts/:contactId', controller.deleteContact);

// ==========================================
// 4. GALLERY MANAGEMENT
// ==========================================
router.get('/gallery', controller.getGallery);
router.post('/gallery/photos', attachmentUpload.single('photo'), validate(traderGalleryPhotoSchema), controller.uploadGalleryPhoto);
router.delete('/gallery/photos/:photoId', controller.deleteGalleryPhoto);
router.post('/gallery/videos', attachmentUpload.single('video'), validate(traderGalleryVideoSchema), controller.addGalleryVideo);
router.delete('/gallery/videos/:videoId', controller.deleteGalleryVideo);
router.get('/gallery/owners', controller.getGalleryOwners);

// ==========================================
// 5. VERIFICATION CENTER
// ==========================================
router.get('/verification', controller.getVerification);
router.post('/verification/phone/send-otp', controller.sendPhoneOTP);
router.post('/verification/phone/verify-otp', validate(traderPhoneOtpVerifySchema), controller.verifyPhoneOTP);
router.post('/verification/email/send', controller.sendEmailVerification);
router.post('/verification/email/verify', validate(traderEmailVerifySchema), controller.verifyEmail);
router.post('/verification/business', attachmentUpload.single('document'), validate(traderBusinessVerifySchema), controller.submitBusinessVerification);
router.post('/verification/gst', attachmentUpload.single('certificate'), validate(traderGstVerifySchema), controller.submitGSTVerification);
router.post('/verification/bank', attachmentUpload.single('cheque_document'), validate(traderBankVerifySchema), controller.submitBankVerification);
router.get('/verification/documents', controller.getVerificationDocuments);
router.post('/verification/documents', attachmentUpload.single('document'), validate(traderDocumentUploadSchema), controller.uploadVerificationDocument);

// ==========================================
// 6. TRADER ANALYTICS ENGINE
// ==========================================
router.get('/analytics/overview', controller.getOverviewAnalytics);
router.get('/analytics/inquiries', controller.getInquiryAnalytics);
router.get('/analytics/leads', controller.getLeadAnalytics);
router.get('/analytics/audience', controller.getAudienceAnalytics);
router.post('/analytics/event', validate(traderAnalyticsEventSchema), controller.recordAnalyticsEvent);

// ==========================================
// 7. INQUIRIES & LEADS SUBMODULES
// ==========================================
router.get('/inquiries', controller.getInquiries);
router.get('/leads', controller.getLeads);

module.exports = router;
