const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const miningEquipmentController = require('../controllers/miningEquipmentProfileController');
const {
  updateHeavyMiningEquipmentProfileSchema,
  createHeavyMiningEquipmentProductSchema,
  updateHeavyMiningEquipmentProductSchema,
  updateMiningEquipmentStockSchema,
  miningEquipmentContactSchema,
  miningEquipmentGalleryPhotoSchema,
  miningEquipmentGalleryVideoSchema,
  miningEquipmentGstVerifySchema,
  miningEquipmentAnalyticsEventSchema
} = require('../validations/miningEquipment.validation');

// Multer storage configuration for attachments / media
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'mining-equipment-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// ==========================================
// 1. DASHBOARD & BUSINESS SWITCHER
// ==========================================
router.get('/dashboard', protect, miningEquipmentController.getDashboard);
router.get('/business-types', protect, miningEquipmentController.getBusinessTypes);
router.post('/switch-business-type', protect, miningEquipmentController.switchBusinessType);

// ==========================================
// 2. PROFILE & OPERATIONAL SPECIFICATIONS
// ==========================================
router.get('/profile', protect, miningEquipmentController.getProfile);
router.put('/profile', protect, validate(updateHeavyMiningEquipmentProfileSchema), miningEquipmentController.updateProfile);

// ==========================================
// 3. PRODUCT & SPARES MANAGEMENT
// ==========================================
router.get('/products', protect, miningEquipmentController.getProducts);
router.post('/products', protect, validate(createHeavyMiningEquipmentProductSchema), miningEquipmentController.createProduct);
router.get('/products/:id', protect, miningEquipmentController.getProductById);
router.put('/products/:id', protect, validate(updateHeavyMiningEquipmentProductSchema), miningEquipmentController.updateProduct);
router.patch('/products/:id/stock', protect, validate(updateMiningEquipmentStockSchema), miningEquipmentController.updateStock);
router.post('/products/:id/duplicate', protect, miningEquipmentController.duplicateProduct);
router.patch('/products/:id/status', protect, miningEquipmentController.toggleProductStatus);
router.delete('/products/:id', protect, miningEquipmentController.deleteProduct);

// Spares Aliases for Product & Spares Management
router.get('/spares', protect, miningEquipmentController.getProducts);
router.post('/spares', protect, validate(createHeavyMiningEquipmentProductSchema), miningEquipmentController.createProduct);
router.get('/spares/:id', protect, miningEquipmentController.getProductById);
router.put('/spares/:id', protect, validate(updateHeavyMiningEquipmentProductSchema), miningEquipmentController.updateProduct);
router.patch('/spares/:id/stock', protect, validate(updateMiningEquipmentStockSchema), miningEquipmentController.updateStock);

// ==========================================
// 4. CONTACTS MANAGEMENT
// ==========================================
router.get('/contacts', protect, miningEquipmentController.getContacts);
router.post('/contacts', protect, validate(miningEquipmentContactSchema), miningEquipmentController.addContact);
router.put('/contacts/:id', protect, validate(miningEquipmentContactSchema), miningEquipmentController.updateContact);
router.delete('/contacts/:id', protect, miningEquipmentController.deleteContact);

// ==========================================
// 5. GALLERY MANAGEMENT
// ==========================================
router.get('/gallery', protect, miningEquipmentController.getGallery);
router.post('/gallery/photos', protect, upload.single('photo'), validate(miningEquipmentGalleryPhotoSchema), miningEquipmentController.uploadGalleryPhoto);
router.post('/gallery/videos', protect, validate(miningEquipmentGalleryVideoSchema), miningEquipmentController.addGalleryVideo);
router.delete('/gallery/photos/:id', protect, miningEquipmentController.deleteGalleryPhoto);
router.delete('/gallery/videos/:id', protect, miningEquipmentController.deleteGalleryVideo);

// ==========================================
// 6. VERIFICATION CENTER
// ==========================================
router.get('/verification', protect, miningEquipmentController.getVerificationStatus);
router.post('/verification/gst', protect, validate(miningEquipmentGstVerifySchema), miningEquipmentController.verifyGst);

// ==========================================
// 7. ANALYTICS ENGINE
// ==========================================
router.get('/analytics', protect, miningEquipmentController.getAnalytics);
router.post('/analytics/event', protect, validate(miningEquipmentAnalyticsEventSchema), miningEquipmentController.recordAnalyticsEvent);

// ==========================================
// 8. INQUIRIES & LEAD MANAGEMENT
// ==========================================
router.get('/inquiries', protect, miningEquipmentController.getInquiries);
router.get('/leads', protect, miningEquipmentController.getLeads);

module.exports = router;

