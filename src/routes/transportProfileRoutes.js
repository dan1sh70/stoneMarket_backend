const express = require('express');
const router = express.Router();
const controller = require('../controllers/transportProfileController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const attachmentUpload = require('../middleware/attachmentUpload');
const {
  updateTransportProfileSchema,
  fleetCategorySchema,
  updateOperationalCoverageSchema,
  vehicleSchema,
  updateVehicleAvailabilitySchema,
  transportContactSchema,
  transportGalleryPhotoSchema,
  transportGalleryVideoSchema,
  transportPhoneOtpVerifySchema,
  transportGstVerifySchema,
  transportDocumentUploadSchema,
  transportAnalyticsEventSchema
} = require('../validations/transport.validation');

// All transport routes are protected
router.use(protect);

// ==========================================
// 1. DASHBOARD & BUSINESS TYPE SWITCHER
// ==========================================
router.get('/dashboard', controller.getDashboard);
router.get('/business-types', controller.getBusinessTypes);
router.post('/switch-subtype', controller.switchTransportSubtype);

// ==========================================
// 2. PROFILE & OPERATIONAL CONFIGURATION
// ==========================================
router.get('/profile', controller.getProfile);
router.put('/profile', validate(updateTransportProfileSchema), controller.updateProfile);

// National Fleet Categories
router.get('/fleet-categories', controller.getFleetCategories);
router.post('/fleet-categories', validate(fleetCategorySchema), controller.addFleetCategory);
router.put('/fleet-categories/:categoryId', controller.updateFleetCategory);
router.delete('/fleet-categories/:categoryId', controller.deleteFleetCategory);

// Operational Coverage (States & Districts/Cities)
router.get('/operational-coverage', controller.getOperationalCoverage);
router.put('/operational-coverage', validate(updateOperationalCoverageSchema), controller.updateOperationalCoverage);

// ==========================================
// 3. VEHICLE MANAGEMENT
// ==========================================
router.get('/vehicles', controller.getVehicles);
router.post('/vehicles', attachmentUpload.array('images', 3), validate(vehicleSchema), controller.createVehicle);
router.get('/vehicles/:id', controller.getVehicleById);
router.put('/vehicles/:id', controller.updateVehicle);
router.patch('/vehicles/:id/availability', validate(updateVehicleAvailabilitySchema), controller.updateVehicleAvailability);
router.delete('/vehicles/:id', controller.deleteVehicle);

// ==========================================
// 4. CONTACTS / KEY PERSONS
// ==========================================
router.get('/contacts', controller.getContacts);
router.post('/contacts', attachmentUpload.single('photo'), validate(transportContactSchema), controller.addContact);
router.put('/contacts/:contactId', controller.updateContact);
router.delete('/contacts/:contactId', controller.deleteContact);

// ==========================================
// 5. GALLERY MANAGEMENT
// ==========================================
router.get('/gallery', controller.getGallery);
router.post('/gallery/photos', attachmentUpload.single('photo'), validate(transportGalleryPhotoSchema), controller.uploadGalleryPhoto);
router.delete('/gallery/photos/:photoId', controller.deleteGalleryPhoto);
router.post('/gallery/videos', attachmentUpload.single('video'), validate(transportGalleryVideoSchema), controller.addGalleryVideo);
router.delete('/gallery/videos/:videoId', controller.deleteGalleryVideo);

// ==========================================
// 6. VERIFICATION CENTER
// ==========================================
router.get('/verification', controller.getVerification);
router.post('/verification/phone/send-otp', controller.sendPhoneOTP);
router.post('/verification/phone/verify-otp', validate(transportPhoneOtpVerifySchema), controller.verifyPhoneOTP);
router.post('/verification/gst', validate(transportGstVerifySchema), controller.submitGSTVerification);
router.post('/verification/documents', attachmentUpload.single('document'), validate(transportDocumentUploadSchema), controller.uploadVerificationDocument);

// ==========================================
// 7. ANALYTICS ENGINE
// ==========================================
router.get('/analytics', controller.getAnalytics);
router.post('/analytics/event', validate(transportAnalyticsEventSchema), controller.recordAnalyticsEvent);

// ==========================================
// 8. INQUIRIES & LEAD MANAGEMENT
// ==========================================
router.get('/inquiries', controller.getInquiries);
router.get('/leads', controller.getLeads);

module.exports = router;
