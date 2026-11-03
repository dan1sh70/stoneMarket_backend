const express = require('express');
const router = express.Router();
const controller = require('../controllers/miningProfileController');
const miningDiscoveryController = require('../controllers/miningController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const attachmentUpload = require('../middleware/attachmentUpload');
const {
  updateMiningProfileSchema,
  updateMiningOperationalSpecsSchema,
  miningMachinerySchema,
  miningMachineryUpdateSchema,
  excavatedStoneVarietySchema,
  miningContactSchema,
  miningProductWizardSchema,
  miningProductUpdateSchema,
  miningGalleryPhotoSchema,
  miningGalleryVideoSchema,
  miningPhoneOtpVerifySchema,
  miningEmailVerifySchema,
  miningBusinessVerifySchema,
  miningGstVerifySchema,
  miningBankVerifySchema,
  miningDocumentUploadSchema,
  miningAnalyticsEventSchema
} = require('../validations/mining.validation');

// ==========================================
// PUBLIC DISCOVERY ROUTES (Backward Compatibility)
// ==========================================
router.get('/categories', miningDiscoveryController.getMiningCategories);
router.get('/businesses', miningDiscoveryController.getMiningBusinesses);

// ==========================================
// 1. DASHBOARD & BUSINESS SWITCHER
// ==========================================
router.get('/dashboard', protect, controller.getDashboard);
router.get('/business-types', protect, controller.getBusinessTypes);
router.post('/switch-business-type', protect, controller.switchBusinessType);

// ==========================================
// 2. BUSINESS PROFILE MANAGEMENT
// ==========================================
router.get('/profile', protect, controller.getProfile);
router.put('/profile', protect, validate(updateMiningProfileSchema), controller.updateProfile);
router.get('/business-details', protect, controller.getBusinessDetails);
router.put('/business-details', protect, validate(updateMiningProfileSchema), controller.updateBusinessDetails);
router.put('/operational-specs', protect, validate(updateMiningOperationalSpecsSchema), controller.updateOperationalSpecs);

// Machinery Management
router.get('/machinery', protect, controller.getMachinery);
router.post('/machinery', protect, validate(miningMachinerySchema), controller.addMachinery);
router.put('/machinery/:id', protect, validate(miningMachineryUpdateSchema), controller.updateMachinery);
router.delete('/machinery/:id', protect, controller.deleteMachinery);

// Excavated Stone Varieties Management
router.get('/stone-varieties', protect, controller.getStoneVarieties);
router.post('/stone-varieties', protect, validate(excavatedStoneVarietySchema), controller.addStoneVariety);
router.delete('/stone-varieties/:id', protect, controller.removeStoneVariety);

// Contacts & Owners Management
router.get('/contacts', protect, controller.getContacts);
router.post('/contacts', protect, attachmentUpload.single('photo'), validate(miningContactSchema), controller.addContact);
router.put('/contacts/:id', protect, attachmentUpload.single('photo'), controller.updateContact);
router.delete('/contacts/:id', protect, controller.deleteContact);

// ==========================================
// 3. MINING PRODUCT MANAGEMENT & 4-STEP WIZARD
// ==========================================
router.get('/products', protect, controller.getProducts);
router.post('/products', protect, attachmentUpload.array('images', 5), validate(miningProductWizardSchema), controller.createProduct);
router.get('/products/:id', protect, controller.getProductById);
router.put('/products/:id', protect, validate(miningProductUpdateSchema), controller.updateProduct);
router.delete('/products/:id', protect, controller.deleteProduct);
router.post('/products/:id/publish', protect, controller.publishProduct);
router.post('/products/:id/duplicate', protect, controller.duplicateProduct);
router.put('/products/:id/stock', protect, controller.updateStock);
router.post('/products/:id/images', protect, attachmentUpload.array('images', 5), controller.uploadProductImages);
router.delete('/products/:id/images/:imageId', protect, controller.deleteProductImage);

// ==========================================
// 4. GALLERY MANAGEMENT
// ==========================================
// Handle both public product gallery (no auth) and authenticated mine gallery
router.get('/gallery', (req, res, next) => {
  if (req.headers.authorization) {
    return protect(req, res, () => controller.getGallery(req, res, next));
  }
  return miningDiscoveryController.getMiningGallery(req, res, next);
});
router.post('/gallery/photos', protect, attachmentUpload.single('photo'), validate(miningGalleryPhotoSchema), controller.uploadGalleryPhoto);
router.put('/gallery/photos/:id', protect, controller.updateGalleryPhoto);
router.delete('/gallery/photos/:id', protect, controller.deleteGalleryPhoto);
router.post('/gallery/videos', protect, attachmentUpload.single('video'), validate(miningGalleryVideoSchema), controller.addGalleryVideo);
router.delete('/gallery/videos/:id', protect, controller.deleteGalleryVideo);
router.get('/gallery/owners', protect, controller.getGalleryOwners);
router.post('/gallery/owners/:id/photo', protect, attachmentUpload.single('photo'), controller.updateOwnerPhoto);

// ==========================================
// 5. VERIFICATION CENTER
// ==========================================
router.get('/verification', protect, controller.getVerification);
router.post('/verification/phone/send-otp', protect, controller.sendPhoneOTP);
router.post('/verification/phone/verify-otp', protect, validate(miningPhoneOtpVerifySchema), controller.verifyPhoneOTP);
router.post('/verification/email/send', protect, controller.sendEmailVerification);
router.post('/verification/email/verify', protect, validate(miningEmailVerifySchema), controller.verifyEmail);
router.post('/verification/business', protect, attachmentUpload.single('document'), validate(miningBusinessVerifySchema), controller.submitBusinessVerification);
router.post('/verification/gst', protect, attachmentUpload.single('certificate'), validate(miningGstVerifySchema), controller.submitGSTVerification);
router.post('/verification/bank', protect, attachmentUpload.single('cheque_document'), validate(miningBankVerifySchema), controller.submitBankVerification);
router.get('/verification/documents', protect, controller.getVerificationDocuments);
router.post('/verification/documents', protect, attachmentUpload.single('document'), validate(miningDocumentUploadSchema), controller.uploadVerificationDocument);

// ==========================================
// 6. ANALYTICS
// ==========================================
router.get('/analytics/overview', protect, controller.getOverviewAnalytics);
router.get('/analytics/leads', protect, controller.getLeadAnalytics);
router.get('/analytics/profile', protect, controller.getProfileAnalytics);
router.get('/analytics/top-products', protect, controller.getTopProducts);
router.get('/analytics/top-services', protect, controller.getTopServices);
router.get('/analytics/sources', protect, controller.getInquirySources);
router.get('/analytics/locations', protect, controller.getAudienceLocations);
router.get('/analytics/engagement', protect, controller.getProfileEngagement);
router.get('/analytics/followers', protect, controller.getFollowerGrowth);
router.post('/analytics/event', protect, validate(miningAnalyticsEventSchema), controller.recordAnalyticsEvent);

// ==========================================
// 7. INQUIRIES & LEADS
// ==========================================
router.get('/inquiries', protect, controller.getInquiries);
router.get('/leads', protect, controller.getLeads);

// ==========================================
// PUBLIC DISCOVERY CATEGORY PARAMS (Keep at bottom)
// ==========================================
router.get('/:category/states', miningDiscoveryController.getMiningStates);
router.get('/:category/locations/search', miningDiscoveryController.searchMiningLocations);

module.exports = router;
