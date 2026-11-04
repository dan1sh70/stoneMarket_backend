const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const solarController = require('../controllers/solarSolutionsProfileController');
const {
  updateSolarSolutionsProfileSchema,
  createSolarSolutionsProductSchema,
  updateSolarSolutionsProductSchema,
  updateSolarStockSchema,
  solarContactSchema,
  solarGalleryPhotoSchema,
  solarGalleryVideoSchema,
  solarGstVerifySchema,
  solarAnalyticsEventSchema
} = require('../validations/solarSolutions.validation');

// Multer storage configuration for attachments / media
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'solar-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// ==========================================
// 1. DASHBOARD & BUSINESS SWITCHER
// ==========================================
router.get('/dashboard', protect, solarController.getDashboard);
router.get('/business-types', protect, solarController.getBusinessTypes);
router.post('/switch-business-type', protect, solarController.switchBusinessType);

// ==========================================
// 2. PROFILE & OPERATIONAL SPECIFICATIONS
// ==========================================
router.get('/profile', protect, solarController.getProfile);
router.put('/profile', protect, validate(updateSolarSolutionsProfileSchema), solarController.updateProfile);

// ==========================================
// 3. PRODUCT & SPARES MANAGEMENT
// ==========================================
router.get('/products', protect, solarController.getProducts);
router.post('/products', protect, validate(createSolarSolutionsProductSchema), solarController.createProduct);
router.get('/products/:id', protect, solarController.getProductById);
router.put('/products/:id', protect, validate(updateSolarSolutionsProductSchema), solarController.updateProduct);
router.patch('/products/:id/stock', protect, validate(updateSolarStockSchema), solarController.updateStock);
router.post('/products/:id/duplicate', protect, solarController.duplicateProduct);
router.patch('/products/:id/status', protect, solarController.toggleProductStatus);
router.delete('/products/:id', protect, solarController.deleteProduct);

// Spares Aliases for Product & Spares Management
router.get('/spares', protect, solarController.getProducts);
router.post('/spares', protect, validate(createSolarSolutionsProductSchema), solarController.createProduct);
router.get('/spares/:id', protect, solarController.getProductById);
router.put('/spares/:id', protect, validate(updateSolarSolutionsProductSchema), solarController.updateProduct);
router.patch('/spares/:id/stock', protect, validate(updateSolarStockSchema), solarController.updateStock);

// ==========================================
// 4. CONTACTS MANAGEMENT
// ==========================================
router.get('/contacts', protect, solarController.getContacts);
router.post('/contacts', protect, validate(solarContactSchema), solarController.addContact);
router.put('/contacts/:id', protect, validate(solarContactSchema), solarController.updateContact);
router.delete('/contacts/:id', protect, solarController.deleteContact);

// ==========================================
// 5. GALLERY MANAGEMENT
// ==========================================
router.get('/gallery', protect, solarController.getGallery);
router.post('/gallery/photos', protect, upload.single('photo'), validate(solarGalleryPhotoSchema), solarController.uploadGalleryPhoto);
router.post('/gallery/videos', protect, validate(solarGalleryVideoSchema), solarController.addGalleryVideo);
router.delete('/gallery/photos/:id', protect, solarController.deleteGalleryPhoto);
router.delete('/gallery/videos/:id', protect, solarController.deleteGalleryVideo);

// ==========================================
// 6. VERIFICATION CENTER
// ==========================================
router.get('/verification', protect, solarController.getVerificationStatus);
router.post('/verification/gst', protect, validate(solarGstVerifySchema), solarController.verifyGst);

// ==========================================
// 7. ANALYTICS ENGINE
// ==========================================
router.get('/analytics', protect, solarController.getAnalytics);
router.post('/analytics/event', protect, validate(solarAnalyticsEventSchema), solarController.recordAnalyticsEvent);

// ==========================================
// 8. INQUIRIES & LEAD MANAGEMENT
// ==========================================
router.get('/inquiries', protect, solarController.getInquiries);
router.get('/leads', protect, solarController.getLeads);

module.exports = router;

