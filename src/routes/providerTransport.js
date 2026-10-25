const express = require('express');
const router = express.Router();
const {
  getProviderProfile,
  updateProviderProfile,
  getProviderContacts,
  addProviderContact,
  getProviderVehicles,
  createProviderVehicle,
  updateProviderVehicle,
  updateVehicleAvailability,
  deleteProviderVehicle,
  getProviderRoutes,
  createProviderRoute,
  deleteProviderRoute,
  createFreightRate,
  updateFreightRate,
  deleteFreightRate,
  getProviderInquiries,
  updateProviderInquiryStatus,
  getProviderQuoteRequests
} = require('../controllers/providerTransportController');
const { protect } = require('../middleware/auth');

router.use(protect);

// Profile & Contacts
router.get('/transport/profile', getProviderProfile);
router.put('/transport/profile', updateProviderProfile);
router.get('/transport/contacts', getProviderContacts);
router.post('/transport/contacts', addProviderContact);

// Fleet
router.get('/transport/vehicles', getProviderVehicles);
router.post('/transport/vehicles', createProviderVehicle);
router.put('/transport/vehicles/:vehicle_id', updateProviderVehicle);
router.patch('/transport/vehicles/:vehicle_id/availability', updateVehicleAvailability);
router.delete('/transport/vehicles/:vehicle_id', deleteProviderVehicle);

// Routes
router.get('/transport/routes', getProviderRoutes);
router.post('/transport/routes', createProviderRoute);
router.delete('/transport/routes/:route_id', deleteProviderRoute);

// Freight Rates
router.post('/freight-rates', createFreightRate);
router.put('/freight-rates/:rate_id', updateFreightRate);
router.delete('/freight-rates/:rate_id', deleteFreightRate);

// Inquiries & Quote Requests
router.get('/transport/inquiries', getProviderInquiries);
router.patch('/transport/inquiries/:inquiry_id/status', updateProviderInquiryStatus);
router.get('/transport/quote-requests', getProviderQuoteRequests);

module.exports = router;
