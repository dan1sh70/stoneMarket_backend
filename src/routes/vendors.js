const express = require('express');
const router = express.Router();
const {
  upsertProfile,
  getVendors,
  getVendorBySlug,
  getVendorProducts,
  uploadDocs,
  getStats,
  saveVendor,
  removeSavedVendor
} = require('../controllers/vendorController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const validate = require('../middleware/validate');
const { vendorProfileSchema } = require('../validations/vendor.validation');

// Public routes
router.get('/', getVendors);
router.get('/:slug', getVendorBySlug);
router.get('/:id/products', getVendorProducts);

// Protected routes (Vendor)
router.post('/profile', protect, authorize('manufacturer', 'mining', 'showroom', 'trader'), validate(vendorProfileSchema), upsertProfile);
router.put('/profile', protect, authorize('manufacturer', 'mining', 'showroom', 'trader'), validate(vendorProfileSchema), upsertProfile);
router.post('/upload-docs', protect, authorize('manufacturer', 'mining', 'showroom', 'trader'), upload.array('documents', 5), uploadDocs);
router.get('/dashboard/stats', protect, authorize('manufacturer', 'mining', 'showroom', 'trader'), getStats);

// Protected routes (User)
router.post('/:id/save', protect, saveVendor);
router.delete('/:id/save', protect, removeSavedVendor);

module.exports = router;
