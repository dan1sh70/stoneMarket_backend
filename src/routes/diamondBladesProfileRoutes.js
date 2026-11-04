const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const diamondBladesController = require('../controllers/diamondBladesProfileController');
const {
  updateDiamondBladesProfileSchema,
  createDiamondBladesProductSchema,
  updateDiamondBladesProductSchema,
  updateDiamondBladesStockSchema,
  diamondBladesContactSchema,
  diamondBladesGalleryPhotoSchema,
  diamondBladesGalleryVideoSchema,
  diamondBladesGstVerifySchema,
  diamondBladesAnalyticsEventSchema
} = require('../validations/diamondBlades.validation');

// Multer storage configuration for attachments / media
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'diamond-blades-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// ==========================================
// 1. DASHBOARD & BUSINESS SWITCHER
// ==========================================
router.get('/dashboard', protect, diamondBladesController.getDashboard);
router.get('/business-types', protect, diamondBladesController.getBusinessTypes);
router.post('/switch-business-type', protect, diamondBladesController.switchBusinessType);

// ==========================================
// 2. PROFILE & OPERATIONAL SPECIFICATIONS
// ==========================================
router.get('/profile', protect, diamondBladesController.getProfile);
router.put('/profile', protect, validate(updateDiamondBladesProfileSchema), diamondBladesController.updateProfile);

// ==========================================
// 3. PRODUCT & SPARES MANAGEMENT
// ==========================================
router.get('/products', protect, diamondBladesController.getProducts);
router.post('/products', protect, validate(createDiamondBladesProductSchema), diamondBladesController.createProduct);
router.get('/products/:id', protect, diamondBladesController.getProductById);
router.put('/products/:id', protect, validate(updateDiamondBladesProductSchema), diamondBladesController.updateProduct);
router.patch('/products/:id/stock', protect, validate(updateDiamondBladesStockSchema), diamondBladesController.updateStock);
router.post('/products/:id/duplicate', protect, diamondBladesController.duplicateProduct);
router.patch('/products/:id/status', protect, diamondBladesController.toggleProductStatus);
router.delete('/products/:id', protect, diamondBladesController.deleteProduct);

// Spares Aliases for Product & Spares Management
router.get('/spares', protect, diamondBladesController.getProducts);
router.post('/spares', protect, validate(createDiamondBladesProductSchema), diamondBladesController.createProduct);
router.get('/spares/:id', protect, diamondBladesController.getProductById);
router.put('/spares/:id', protect, validate(updateDiamondBladesProductSchema), diamondBladesController.updateProduct);
router.patch('/spares/:id/stock', protect, validate(updateDiamondBladesStockSchema), diamondBladesController.updateStock);

// ==========================================
// 4. CONTACTS MANAGEMENT
// ==========================================
router.get('/contacts', protect, diamondBladesController.getContacts);
router.post('/contacts', protect, validate(diamondBladesContactSchema), diamondBladesController.addContact);
router.put('/contacts/:contactId', protect, validate(diamondBladesContactSchema), diamondBladesController.updateContact);
router.delete('/contacts/:contactId', protect, diamondBladesController.deleteContact);

// ==========================================
// 5. GALLERY MANAGEMENT
// ==========================================
router.get('/gallery', protect, diamondBladesController.getGallery);
router.post('/gallery/photos', protect, upload.single('photo'), validate(diamondBladesGalleryPhotoSchema), diamondBladesController.uploadGalleryPhoto);
router.post('/gallery/videos', protect, validate(diamondBladesGalleryVideoSchema), diamondBladesController.addGalleryVideo);
router.delete('/gallery/photos/:photoId', protect, diamondBladesController.deleteGalleryPhoto);
router.delete('/gallery/videos/:videoId', protect, diamondBladesController.deleteGalleryVideo);

// ==========================================
// 6. VERIFICATION CENTER
// ==========================================
router.get('/verification', protect, diamondBladesController.getVerificationStatus);
router.post('/verification/gst', protect, validate(diamondBladesGstVerifySchema), diamondBladesController.verifyGst);

// ==========================================
// 7. ANALYTICS ENGINE
// ==========================================
router.get('/analytics', protect, diamondBladesController.getAnalytics);
router.post('/analytics/event', protect, validate(diamondBladesAnalyticsEventSchema), diamondBladesController.recordAnalyticsEvent);

// ==========================================
// 8. INQUIRIES & LEAD MANAGEMENT
// ==========================================
router.get('/inquiries', protect, diamondBladesController.getInquiries);
router.get('/leads', protect, diamondBladesController.getLeads);

module.exports = router;

