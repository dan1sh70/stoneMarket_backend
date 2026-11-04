const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const machineController = require('../controllers/machineManufacturerProfileController');
const {
  updateMachineManufacturerProfileSchema,
  createMachineSchema,
  updateMachineSchema,
  updateMachineStockSchema,
  machineManufacturerContactSchema,
  machineManufacturerGalleryPhotoSchema,
  machineManufacturerGalleryVideoSchema,
  machineManufacturerGstVerifySchema,
  machineManufacturerAnalyticsEventSchema
} = require('../validations/machineManufacturer.validation');

// Multer storage configuration for attachments / media
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'machine-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// ==========================================
// 1. DASHBOARD & BUSINESS SWITCHER
// ==========================================
router.get('/dashboard', protect, machineController.getDashboard);
router.get('/business-types', protect, machineController.getBusinessTypes);
router.post('/switch-business-type', protect, machineController.switchBusinessType);

// ==========================================
// 2. PROFILE & OPERATIONAL SPECIFICATIONS
// ==========================================
router.get('/profile', protect, machineController.getProfile);
router.put('/profile', protect, validate(updateMachineManufacturerProfileSchema), machineController.updateProfile);

// ==========================================
// 3. MACHINERY CATALOG MANAGEMENT
// ==========================================
// Catalog endpoints matching Machinery Catalog Management
router.get('/catalog', protect, machineController.getMachines);
router.post('/catalog', protect, validate(createMachineSchema), machineController.createMachine);
router.get('/catalog/:id', protect, machineController.getMachineById);
router.put('/catalog/:id', protect, validate(updateMachineSchema), machineController.updateMachine);
router.patch('/catalog/:id/stock', protect, validate(updateMachineStockSchema), machineController.updateMachineStock);
router.post('/catalog/:id/duplicate', protect, machineController.duplicateMachine);
router.patch('/catalog/:id/status', protect, machineController.toggleMachineStatus);
router.delete('/catalog/:id', protect, machineController.deleteMachine);

// Dedicated /machines aliases
router.get('/machines', protect, machineController.getMachines);
router.post('/machines', protect, validate(createMachineSchema), machineController.createMachine);
router.get('/machines/:id', protect, machineController.getMachineById);
router.put('/machines/:id', protect, validate(updateMachineSchema), machineController.updateMachine);
router.patch('/machines/:id/stock', protect, validate(updateMachineStockSchema), machineController.updateMachineStock);
router.post('/machines/:id/duplicate', protect, machineController.duplicateMachine);
router.patch('/machines/:id/status', protect, machineController.toggleMachineStatus);
router.delete('/machines/:id', protect, machineController.deleteMachine);

// Standard /products aliases for backwards-compatibility
router.get('/products', protect, machineController.getMachines);
router.post('/products', protect, validate(createMachineSchema), machineController.createMachine);
router.get('/products/:id', protect, machineController.getMachineById);
router.put('/products/:id', protect, validate(updateMachineSchema), machineController.updateMachine);
router.patch('/products/:id/stock', protect, validate(updateMachineStockSchema), machineController.updateMachineStock);
router.post('/products/:id/duplicate', protect, machineController.duplicateMachine);
router.patch('/products/:id/status', protect, machineController.toggleMachineStatus);
router.delete('/products/:id', protect, machineController.deleteMachine);

// ==========================================
// 4. CONTACTS MANAGEMENT
// ==========================================
router.get('/contacts', protect, machineController.getContacts);
router.post('/contacts', protect, validate(machineManufacturerContactSchema), machineController.addContact);
router.put('/contacts/:contactId', protect, validate(machineManufacturerContactSchema), machineController.updateContact);
router.delete('/contacts/:contactId', protect, machineController.deleteContact);

// ==========================================
// 5. GALLERY MANAGEMENT
// ==========================================
router.get('/gallery', protect, machineController.getGallery);
router.post('/gallery/photos', protect, upload.single('photo'), validate(machineManufacturerGalleryPhotoSchema), machineController.uploadGalleryPhoto);
router.post('/gallery/videos', protect, validate(machineManufacturerGalleryVideoSchema), machineController.addGalleryVideo);
router.delete('/gallery/photos/:photoId', protect, machineController.deleteGalleryPhoto);
router.delete('/gallery/videos/:videoId', protect, machineController.deleteGalleryVideo);

// ==========================================
// 6. VERIFICATION CENTER
// ==========================================
router.get('/verification', protect, machineController.getVerificationStatus);
router.post('/verification/gst', protect, validate(machineManufacturerGstVerifySchema), machineController.verifyGst);

// ==========================================
// 7. ANALYTICS ENGINE
// ==========================================
router.get('/analytics', protect, machineController.getAnalytics);
router.post('/analytics/event', protect, validate(machineManufacturerAnalyticsEventSchema), machineController.recordAnalyticsEvent);

// ==========================================
// 8. INQUIRIES & LEAD MANAGEMENT
// ==========================================
router.get('/inquiries', protect, machineController.getInquiries);
router.get('/leads', protect, machineController.getLeads);

module.exports = router;

