const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const powderController = require('../controllers/powderSupplierProfileController');
const {
  updatePowderSupplierProfileSchema,
  createPowderProductSchema,
  updatePowderProductSchema,
  updatePowderStockSchema,
  powderSupplierContactSchema,
  powderSupplierGalleryPhotoSchema,
  powderSupplierGalleryVideoSchema,
  powderSupplierGstVerifySchema,
  powderSupplierAnalyticsEventSchema
} = require('../validations/powderSupplier.validation');

// Multer storage configuration for attachments / media
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'powder-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// ==========================================
// 1. DASHBOARD & BUSINESS SWITCHER
// ==========================================
router.get('/dashboard', protect, powderController.getDashboard);
router.get('/business-types', protect, powderController.getBusinessTypes);
router.post('/switch-business-type', protect, powderController.switchBusinessType);

// ==========================================
// 2. PROFILE & OPERATIONAL SPECIFICATIONS
// ==========================================
router.get('/profile', protect, powderController.getProfile);
router.put('/profile', protect, validate(updatePowderSupplierProfileSchema), powderController.updateProfile);

// ==========================================
// 3. POWDER CATALOG MANAGEMENT
// ==========================================
// Dedicated /catalog endpoints matching Powder Catalog Management
router.get('/catalog', protect, powderController.getPowders);
router.post('/catalog', protect, validate(createPowderProductSchema), powderController.createPowder);
router.get('/catalog/:id', protect, powderController.getPowderById);
router.put('/catalog/:id', protect, validate(updatePowderProductSchema), powderController.updatePowder);
router.patch('/catalog/:id/stock', protect, validate(updatePowderStockSchema), powderController.updatePowderStock);
router.post('/catalog/:id/duplicate', protect, powderController.duplicatePowder);
router.patch('/catalog/:id/status', protect, powderController.togglePowderStatus);
router.delete('/catalog/:id', protect, powderController.deletePowder);

// Dedicated /powders and /minerals aliases
router.get('/powders', protect, powderController.getPowders);
router.post('/powders', protect, validate(createPowderProductSchema), powderController.createPowder);
router.get('/powders/:id', protect, powderController.getPowderById);
router.put('/powders/:id', protect, validate(updatePowderProductSchema), powderController.updatePowder);
router.patch('/powders/:id/stock', protect, validate(updatePowderStockSchema), powderController.updatePowderStock);
router.post('/powders/:id/duplicate', protect, powderController.duplicatePowder);
router.patch('/powders/:id/status', protect, powderController.togglePowderStatus);
router.delete('/powders/:id', protect, powderController.deletePowder);

router.get('/minerals', protect, powderController.getPowders);
router.post('/minerals', protect, validate(createPowderProductSchema), powderController.createPowder);
router.get('/minerals/:id', protect, powderController.getPowderById);
router.put('/minerals/:id', protect, validate(updatePowderProductSchema), powderController.updatePowder);
router.patch('/minerals/:id/stock', protect, validate(updatePowderStockSchema), powderController.updatePowderStock);
router.post('/minerals/:id/duplicate', protect, powderController.duplicatePowder);
router.patch('/minerals/:id/status', protect, powderController.togglePowderStatus);
router.delete('/minerals/:id', protect, powderController.deletePowder);

// Standard /products aliases for general frontend compatibility
router.get('/products', protect, powderController.getPowders);
router.post('/products', protect, validate(createPowderProductSchema), powderController.createPowder);
router.get('/products/:id', protect, powderController.getPowderById);
router.put('/products/:id', protect, validate(updatePowderProductSchema), powderController.updatePowder);
router.patch('/products/:id/stock', protect, validate(updatePowderStockSchema), powderController.updatePowderStock);
router.post('/products/:id/duplicate', protect, powderController.duplicatePowder);
router.patch('/products/:id/status', protect, powderController.togglePowderStatus);
router.delete('/products/:id', protect, powderController.deletePowder);

// ==========================================
// 4. CONTACTS MANAGEMENT
// ==========================================
router.get('/contacts', protect, powderController.getContacts);
router.post('/contacts', protect, validate(powderSupplierContactSchema), powderController.addContact);
router.put('/contacts/:contactId', protect, validate(powderSupplierContactSchema), powderController.updateContact);
router.delete('/contacts/:contactId', protect, powderController.deleteContact);

// ==========================================
// 5. GALLERY MANAGEMENT
// ==========================================
router.get('/gallery', protect, powderController.getGallery);
router.post('/gallery/photos', protect, upload.single('photo'), validate(powderSupplierGalleryPhotoSchema), powderController.uploadGalleryPhoto);
router.post('/gallery/videos', protect, validate(powderSupplierGalleryVideoSchema), powderController.addGalleryVideo);
router.delete('/gallery/photos/:photoId', protect, powderController.deleteGalleryPhoto);
router.delete('/gallery/videos/:videoId', protect, powderController.deleteGalleryVideo);

// ==========================================
// 6. VERIFICATION CENTER
// ==========================================
router.get('/verification', protect, powderController.getVerificationStatus);
router.post('/verification/gst', protect, validate(powderSupplierGstVerifySchema), powderController.verifyGst);

// ==========================================
// 7. ANALYTICS ENGINE
// ==========================================
router.get('/analytics', protect, powderController.getAnalytics);
router.post('/analytics/event', protect, validate(powderSupplierAnalyticsEventSchema), powderController.recordAnalyticsEvent);

// ==========================================
// 8. INQUIRIES & LEAD MANAGEMENT
// ==========================================
router.get('/inquiries', protect, powderController.getInquiries);
router.get('/leads', protect, powderController.getLeads);

module.exports = router;

