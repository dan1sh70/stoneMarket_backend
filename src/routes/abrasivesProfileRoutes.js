const express = require('express');
const router = express.Router();
const controller = require('../controllers/abrasivesProfileController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const attachmentUpload = require('../middleware/attachmentUpload');
const {
  updateAbrasivesProfileSchema,
  createAbrasivesProductSchema,
  updateAbrasivesProductSchema,
  updateAbrasivesStockSchema,
  abrasivesContactSchema,
  abrasivesGalleryPhotoSchema,
  abrasivesGalleryVideoSchema,
  abrasivesPhoneOtpVerifySchema,
  abrasivesGstVerifySchema,
  abrasivesDocumentUploadSchema,
  abrasivesAnalyticsEventSchema
} = require('../validations/abrasives.validation');

// All abrasives routes are protected
router.use(protect);

// ==========================================
// 1. DASHBOARD & BUSINESS TYPE SWITCHER
// ==========================================
router.get('/dashboard', controller.getDashboard);
router.get('/business-types', controller.getBusinessTypes);
router.post('/switch-type', controller.switchBusinessType);
router.post('/switch-subtype', controller.switchBusinessType);
router.post('/switch-business-type', controller.switchBusinessType);

// ==========================================
// 2. PROFILE & OPERATIONAL SPECIFICATIONS
// ==========================================
router.get('/profile', controller.getProfile);
router.put('/profile', validate(updateAbrasivesProfileSchema), controller.updateProfile);

// ==========================================
// 3. PRODUCT & SPARES MANAGEMENT (CRUD & WIZARD)
// ==========================================
router.get('/products', controller.getProducts);
router.post('/products', validate(createAbrasivesProductSchema), controller.createProduct);
router.get('/products/:id', controller.getProductById);
router.put('/products/:id', validate(updateAbrasivesProductSchema), controller.updateProduct);
router.patch('/products/:id/stock', validate(updateAbrasivesStockSchema), controller.updateStock);
router.put('/products/:id/stock', validate(updateAbrasivesStockSchema), controller.updateStock);
router.post('/products/:id/duplicate', controller.duplicateProduct);
router.patch('/products/:id/status', controller.toggleProductStatus);
router.delete('/products/:id', controller.deleteProduct);

// Spares aliases
router.get('/spares', controller.getProducts);
router.post('/spares', validate(createAbrasivesProductSchema), controller.createProduct);
router.get('/spares/:id', controller.getProductById);

// ==========================================
// 4. CONTACTS / KEY PERSONS
// ==========================================
router.get('/contacts', controller.getContacts);
router.post('/contacts', attachmentUpload.single('photo'), validate(abrasivesContactSchema), controller.addContact);
router.put('/contacts/:contactId', controller.updateContact);
router.delete('/contacts/:contactId', controller.deleteContact);

// ==========================================
// 5. GALLERY MANAGEMENT
// ==========================================
router.get('/gallery', controller.getGallery);
router.post('/gallery/photos', attachmentUpload.single('photo'), validate(abrasivesGalleryPhotoSchema), controller.uploadGalleryPhoto);
router.delete('/gallery/photos/:photoId', controller.deleteGalleryPhoto);
router.post('/gallery/videos', attachmentUpload.single('video'), validate(abrasivesGalleryVideoSchema), controller.addGalleryVideo);
router.delete('/gallery/videos/:videoId', controller.deleteGalleryVideo);

// ==========================================
// 6. VERIFICATION CENTER
// ==========================================
router.get('/verification', controller.getVerification);
router.post('/verification/phone/send-otp', controller.sendPhoneOTP);
router.post('/verification/phone/verify-otp', validate(abrasivesPhoneOtpVerifySchema), controller.verifyPhoneOTP);
router.post('/verification/gst', validate(abrasivesGstVerifySchema), controller.submitGSTVerification);
router.post('/verification/documents', attachmentUpload.single('document'), validate(abrasivesDocumentUploadSchema), controller.uploadVerificationDocument);

// ==========================================
// 7. ANALYTICS ENGINE
// ==========================================
router.get('/analytics', controller.getAnalytics);
router.post('/analytics/event', validate(abrasivesAnalyticsEventSchema), controller.recordAnalyticsEvent);

// ==========================================
// 8. INQUIRIES & LEAD MANAGEMENT
// ==========================================
router.get('/inquiries', controller.getInquiries);
router.get('/leads', controller.getLeads);

module.exports = router;

