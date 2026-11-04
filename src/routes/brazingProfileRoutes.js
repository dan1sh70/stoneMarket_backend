const express = require('express');
const router = express.Router();
const controller = require('../controllers/brazingProfileController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const attachmentUpload = require('../middleware/attachmentUpload');
const {
  updateBrazingProfileSchema,
  createBrazingServiceSchema,
  updateBrazingServiceSchema,
  brazingContactSchema,
  brazingGalleryPhotoSchema,
  brazingGalleryVideoSchema,
  brazingPhoneOtpVerifySchema,
  brazingGstVerifySchema,
  brazingDocumentUploadSchema,
  brazingAnalyticsEventSchema
} = require('../validations/brazing.validation');

// All brazing routes are protected
router.use(protect);

// ==========================================
// 1. PRODUCT & INVENTORY MANAGEMENT DISABLED (403 FORBIDDEN)
// ==========================================
router.all('/products*', controller.productManagementDisabled);
router.all('/inventory*', controller.productManagementDisabled);

// ==========================================
// 2. DASHBOARD & BUSINESS TYPE SWITCHER
// ==========================================
router.get('/dashboard', controller.getDashboard);
router.get('/business-types', controller.getBusinessTypes);
router.post('/switch-type', controller.switchBusinessType);
router.post('/switch-subtype', controller.switchBusinessType);
router.post('/switch-business-type', controller.switchBusinessType);

// ==========================================
// 3. PROFILE & OPERATIONAL SPECIFICATIONS
// ==========================================
router.get('/profile', controller.getProfile);
router.put('/profile', validate(updateBrazingProfileSchema), controller.updateProfile);

// ==========================================
// 4. BRAZING SERVICES MANAGEMENT (CRUD)
// ==========================================
router.get('/services', controller.getServices);
router.post('/services', validate(createBrazingServiceSchema), controller.createService);
router.get('/services/:id', controller.getServiceById);
router.put('/services/:id', validate(updateBrazingServiceSchema), controller.updateService);
router.post('/services/:id/duplicate', controller.duplicateService);
router.patch('/services/:id/status', controller.toggleServiceStatus);
router.delete('/services/:id', controller.deleteService);

// ==========================================
// 5. CONTACTS / KEY PERSONS
// ==========================================
router.get('/contacts', controller.getContacts);
router.post('/contacts', attachmentUpload.single('photo'), validate(brazingContactSchema), controller.addContact);
router.put('/contacts/:contactId', controller.updateContact);
router.delete('/contacts/:contactId', controller.deleteContact);

// ==========================================
// 6. GALLERY MANAGEMENT
// ==========================================
router.get('/gallery', controller.getGallery);
router.post('/gallery/photos', attachmentUpload.single('photo'), validate(brazingGalleryPhotoSchema), controller.uploadGalleryPhoto);
router.delete('/gallery/photos/:photoId', controller.deleteGalleryPhoto);
router.post('/gallery/videos', attachmentUpload.single('video'), validate(brazingGalleryVideoSchema), controller.addGalleryVideo);
router.delete('/gallery/videos/:videoId', controller.deleteGalleryVideo);

// ==========================================
// 7. VERIFICATION CENTER
// ==========================================
router.get('/verification', controller.getVerification);
router.post('/verification/phone/send-otp', controller.sendPhoneOTP);
router.post('/verification/phone/verify-otp', validate(brazingPhoneOtpVerifySchema), controller.verifyPhoneOTP);
router.post('/verification/gst', validate(brazingGstVerifySchema), controller.submitGSTVerification);
router.post('/verification/documents', attachmentUpload.single('document'), validate(brazingDocumentUploadSchema), controller.uploadVerificationDocument);

// ==========================================
// 8. ANALYTICS ENGINE
// ==========================================
router.get('/analytics', controller.getAnalytics);
router.post('/analytics/event', validate(brazingAnalyticsEventSchema), controller.recordAnalyticsEvent);

// ==========================================
// 9. INQUIRIES & LEAD MANAGEMENT
// ==========================================
router.get('/inquiries', controller.getInquiries);
router.get('/leads', controller.getLeads);

module.exports = router;

