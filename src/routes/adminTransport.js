const express = require('express');
const router = express.Router();
const {
  getAdminProviders,
  getAdminProviderById,
  updateVerificationStatus,
  updateProviderStatus,
  getTransportAnalytics,
  getVehicleTypes,
  createVehicleType
} = require('../controllers/adminTransportController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin'));

// Transport Providers & Verification
router.get('/transport/providers', getAdminProviders);
router.get('/transport/providers/:provider_id', getAdminProviderById);
router.patch('/transport/providers/:provider_id/verification', updateVerificationStatus);
router.patch('/transport/providers/:provider_id/status', updateProviderStatus);

// Analytics
router.get('/transport/analytics', getTransportAnalytics);

// Vehicle Types Configuration
router.get('/transport/vehicle-types', getVehicleTypes);
router.post('/transport/vehicle-types', createVehicleType);

module.exports = router;
