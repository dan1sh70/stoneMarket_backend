const express = require('express');
const router = express.Router();
const controller = require('../controllers/showroomProfileController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const attachmentUpload = require('../middleware/attachmentUpload');
const {
  updateShowroomProfileSchema,
  updateShowroomSpecsSchema,
  showroomContactSchema,
  showroomProductWizardSchema,
  showroomProductUpdateSchema,
  stockAdjustmentSchema,
  showroomGalleryPhotoSchema,
  showroomGalleryVideoSchema,
  showroomPhoneOtpVerifySchema,
  showroomEmailVerifySchema,
  showroomBusinessVerifySchema,
  showroomGstVerifySchema,
  showroomBankVerifySchema,
  showroomDocumentUploadSchema,
  showroomAnalyticsEventSchema
} = require('../validations/showroom.validation');

// All showroom profile management routes are protected
router.use(protect);

// ==========================================
// 1. DASHBOARD & BUSINESS TYPE SWITCHER
// ==========================================
router.get('/dashboard', controller.getDashboard);
router.get('/business-types', controller.getBusinessTypes);
router.post('/switch-business-type', controller.switchBusinessType);

// ==========================================
// 2. SHOWROOM PROFILE & SPECIFICATIONS
// ==========================================
router.get('/profile', controller.getProfile);
router.put('/profile', validate(updateShowroomProfileSchema), controller.updateProfile);
router.put('/specs', validate(updateShowroomSpecsSchema), controller.updateShowroomSpecs);
router.put('/operational-specs', validate(updateShowroomSpecsSchema), controller.updateShowroomSpecs);

// Contacts & Owners Management
router.get('/contacts', controller.getContacts);
router.post('/contacts', attachmentUpload.single('photo'), validate(showroomContactSchema), controller.addContact);
router.put('/contacts/:contactId', attachmentUpload.single('photo'), controller.updateContact);
router.delete('/contacts/:contactId', controller.deleteContact);

// ==========================================
// 3. SHOWROOM PRODUCT MANAGEMENT (4-STEP WIZARD)
// ==========================================
router.get('/products', controller.getProducts);
router.post('/products', attachmentUpload.array('images', 5), validate(showroomProductWizardSchema), controller.createProduct);
router.get('/products/:id', controller.getProductById);
router.put('/products/:id', validate(showroomProductUpdateSchema), controller.updateProduct);
router.delete('/products/:id', controller.deleteProduct);
router.post('/products/:id/publish', controller.publishProduct);
router.post('/products/:id/duplicate', controller.duplicateProduct);
router.put('/products/:id/stock', validate(stockAdjustmentSchema), controller.updateStock);
router.post('/products/:id/images', attachmentUpload.array('images', 5), controller.uploadProductImages);
router.delete('/products/:id/images', controller.deleteProductImage);
router.delete('/products/:id/images/:imageId', controller.deleteProductImage);

// ==========================================
// 4. INVENTORY MANAGEMENT ENGINE
// ==========================================
router.get('/inventory/overview', controller.getInventoryOverview);
router.get('/inventory/history', controller.getStockHistory);
router.get('/products/:id/stock-history', controller.getStockHistory);

// ==========================================
// 5. GALLERY MANAGEMENT
// ==========================================
router.get('/gallery', controller.getGallery);
router.post('/gallery/photos', attachmentUpload.single('photo'), validate(showroomGalleryPhotoSchema), controller.uploadGalleryPhoto);
router.delete('/gallery/photos/:photoId', controller.deleteGalleryPhoto);
router.post('/gallery/videos', attachmentUpload.single('video'), validate(showroomGalleryVideoSchema), controller.addGalleryVideo);
router.delete('/gallery/videos/:videoId', controller.deleteGalleryVideo);
router.get('/gallery/owners', controller.getGalleryOwners);

// ==========================================
// 6. VERIFICATION CENTER
// ==========================================
router.get('/verification', controller.getVerification);
router.post('/verification/phone/send-otp', controller.sendPhoneOTP);
router.post('/verification/phone/verify-otp', validate(showroomPhoneOtpVerifySchema), controller.verifyPhoneOTP);
router.post('/verification/email/send', controller.sendEmailVerification);
router.post('/verification/email/verify', validate(showroomEmailVerifySchema), controller.verifyEmail);
router.post('/verification/business', attachmentUpload.single('document'), validate(showroomBusinessVerifySchema), controller.submitBusinessVerification);
router.post('/verification/gst', attachmentUpload.single('certificate'), validate(showroomGstVerifySchema), controller.submitGSTVerification);
router.post('/verification/bank', attachmentUpload.single('cheque_document'), validate(showroomBankVerifySchema), controller.submitBankVerification);
router.get('/verification/documents', controller.getVerificationDocuments);
router.post('/verification/documents', attachmentUpload.single('document'), validate(showroomDocumentUploadSchema), controller.uploadVerificationDocument);

// ==========================================
// 7. SHOWROOM ANALYTICS ENGINE
// ==========================================
router.get('/analytics/overview', controller.getOverviewAnalytics);
router.get('/analytics/products', controller.getProductAnalytics);
router.get('/analytics/inventory', controller.getInventoryAnalytics);
router.get('/analytics/audience', controller.getAudienceAnalytics);
router.post('/analytics/event', validate(showroomAnalyticsEventSchema), controller.recordAnalyticsEvent);

// ==========================================
// 8. INQUIRIES & LEADS SUBMODULES
// ==========================================
router.get('/inquiries', controller.getInquiries);
router.get('/leads', controller.getLeads);

module.exports = router;
