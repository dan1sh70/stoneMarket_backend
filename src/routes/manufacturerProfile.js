const express = require('express');
const router = express.Router();
const controller = require('../controllers/manufacturerProfileController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const attachmentUpload = require('../middleware/attachmentUpload');
const {
  updateProfileSchema,
  updateFactorySpecsSchema,
  machinerySchema,
  machineryUpdateSchema,
  stoneVarietySchema,
  contactSchema,
  productWizardSchema,
  productUpdateSchema,
  galleryPhotoSchema,
  galleryVideoSchema,
  phoneOtpVerifySchema,
  emailVerifySchema,
  businessVerifySchema,
  gstVerifySchema,
  bankVerifySchema,
  documentUploadSchema,
  analyticsEventSchema
} = require('../validations/manufacturer.validation');

// All Manufacturer Profile routes require authentication
router.use(protect);

// ==========================================
// 1. DASHBOARD & BUSINESS SWITCHER
// ==========================================
router.get('/dashboard', controller.getDashboard);
router.get('/business-types', controller.getBusinessTypes);
router.post('/switch-business-type', controller.switchBusinessType);

// ==========================================
// 2. BUSINESS PROFILE MANAGEMENT
// ==========================================
router.get('/profile', controller.getProfile);
router.put('/profile', validate(updateProfileSchema), controller.updateProfile);
router.get('/business-details', controller.getBusinessDetails);
router.put('/business-details', validate(updateProfileSchema), controller.updateBusinessDetails);
router.put('/factory-specs', validate(updateFactorySpecsSchema), controller.updateFactorySpecs);

// Machinery Management
router.get('/machinery', controller.getMachinery);
router.post('/machinery', validate(machinerySchema), controller.addMachinery);
router.put('/machinery/:id', validate(machineryUpdateSchema), controller.updateMachinery);
router.delete('/machinery/:id', controller.deleteMachinery);

// Stone Varieties Management
router.get('/stone-varieties', controller.getStoneVarieties);
router.post('/stone-varieties', validate(stoneVarietySchema), controller.addStoneVariety);
router.delete('/stone-varieties/:id', controller.removeStoneVariety);

// Contacts & Owners Management
router.get('/contacts', controller.getContacts);
router.post('/contacts', attachmentUpload.single('photo'), validate(contactSchema), controller.addContact);
router.put('/contacts/:id', attachmentUpload.single('photo'), controller.updateContact);
router.delete('/contacts/:id', controller.deleteContact);

// ==========================================
// 3. PRODUCT MANAGEMENT & 4-STEP WIZARD
// ==========================================
router.get('/products', controller.getProducts);
router.post('/products', attachmentUpload.array('images', 5), validate(productWizardSchema), controller.createProduct);
router.get('/products/:id', controller.getProductById);
router.put('/products/:id', validate(productUpdateSchema), controller.updateProduct);
router.delete('/products/:id', controller.deleteProduct);
router.post('/products/:id/publish', controller.publishProduct);
router.post('/products/:id/images', attachmentUpload.array('images', 5), controller.uploadProductImages);
router.delete('/products/:id/images/:imageId', controller.deleteProductImage);

// ==========================================
// 4. GALLERY MANAGEMENT
// ==========================================
router.get('/gallery', controller.getGallery);
router.post('/gallery/photos', attachmentUpload.single('photo'), validate(galleryPhotoSchema), controller.uploadGalleryPhoto);
router.put('/gallery/photos/:id', controller.updateGalleryPhoto);
router.delete('/gallery/photos/:id', controller.deleteGalleryPhoto);
router.post('/gallery/videos', attachmentUpload.single('video'), validate(galleryVideoSchema), controller.addGalleryVideo);
router.delete('/gallery/videos/:id', controller.deleteGalleryVideo);
router.get('/gallery/owners', controller.getGalleryOwners);
router.post('/gallery/owners/:id/photo', attachmentUpload.single('photo'), controller.updateOwnerPhoto);

// ==========================================
// 5. VERIFICATION CENTER
// ==========================================
router.get('/verification', controller.getVerification);
router.post('/verification/phone/send-otp', controller.sendPhoneOTP);
router.post('/verification/phone/verify-otp', validate(phoneOtpVerifySchema), controller.verifyPhoneOTP);
router.post('/verification/email/send', controller.sendEmailVerification);
router.post('/verification/email/verify', validate(emailVerifySchema), controller.verifyEmail);
router.post('/verification/business', attachmentUpload.single('document'), validate(businessVerifySchema), controller.submitBusinessVerification);
router.post('/verification/gst', attachmentUpload.single('certificate'), validate(gstVerifySchema), controller.submitGSTVerification);
router.post('/verification/bank', attachmentUpload.single('cheque_document'), validate(bankVerifySchema), controller.submitBankVerification);
router.get('/verification/documents', controller.getVerificationDocuments);
router.post('/verification/documents', attachmentUpload.single('document'), validate(documentUploadSchema), controller.uploadVerificationDocument);

// ==========================================
// 6. ANALYTICS
// ==========================================
router.get('/analytics/overview', controller.getOverviewAnalytics);
router.get('/analytics/leads', controller.getLeadAnalytics);
router.get('/analytics/profile', controller.getProfileAnalytics);
router.get('/analytics/top-products', controller.getTopProducts);
router.get('/analytics/top-services', controller.getTopServices);
router.get('/analytics/sources', controller.getInquirySources);
router.get('/analytics/locations', controller.getAudienceLocations);
router.get('/analytics/engagement', controller.getProfileEngagement);
router.get('/analytics/followers', controller.getFollowerGrowth);
router.post('/analytics/event', validate(analyticsEventSchema), controller.recordAnalyticsEvent);

// ==========================================
// 7. INQUIRIES & LEADS
// ==========================================
router.get('/inquiries', controller.getInquiries);
router.get('/leads', controller.getLeads);

module.exports = router;
