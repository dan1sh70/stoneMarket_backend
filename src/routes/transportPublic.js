const express = require('express');
const router = express.Router();
const {
  getNationalTransports,
  getNationalDestinations,
  getNationalAreaWise,
  getNationalRoutes,
  getNationalRouteById,
  getLocalNearby,
  getLocalVehicleById,
  getProviderProfile,
  getProviderFreightRates,
  getFreightRateById,
  createTransportInquiry,
  getMyTransportInquiries,
  getTransportInquiryById,
  createTransportQuoteRequest,
  getMyTransportQuoteRequests,
  getTransportQuoteRequestById,
  submitTransportQuote,
  getTransportQuotesForRequest,
  acceptTransportQuote,
  rejectTransportQuote,
  getFavoriteTransports,
  addFavoriteTransport,
  removeFavoriteTransport
} = require('../controllers/transportController');
const { protect, optionalAuth } = require('../middleware/auth');

// ==========================================
// 1. NATIONAL TRANSPORT DISCOVERY
// ==========================================
router.get('/transports/national', getNationalTransports);
router.get('/transports/national/destinations', getNationalDestinations);
router.get('/transports/national/area-wise', getNationalAreaWise);
router.get('/transports/national/routes', getNationalRoutes);
router.get('/transports/national/routes/:route_id', getNationalRouteById);

// ==========================================
// 2. LOCAL TRANSPORT DISCOVERY
// ==========================================
router.get('/transports/local/nearby', getLocalNearby);
router.get('/transports/local/vehicles', getLocalNearby); // alias
router.get('/transports/local/vehicles/:vehicle_id', getLocalVehicleById);

// ==========================================
// 3. TRANSPORT PROVIDER PROFILES & RATES
// ==========================================
router.get('/transport-providers/:provider_id', optionalAuth, getProviderProfile);
router.get('/transport-providers/:provider_id/freight-rates', getProviderFreightRates);
router.get('/freight-rates/:rate_id', getFreightRateById);

// ==========================================
// 4. TRANSPORT INQUIRIES
// ==========================================
router.post('/transport-inquiries', optionalAuth, createTransportInquiry);
router.get('/transport-inquiries', protect, getMyTransportInquiries);
router.get('/transport-inquiries/:inquiry_id', protect, getTransportInquiryById);

// ==========================================
// 5. TRANSPORT QUOTE REQUESTS & QUOTATIONS
// ==========================================
router.post('/transport-quote-requests', protect, createTransportQuoteRequest);
router.get('/transport-quote-requests', protect, getMyTransportQuoteRequests);
router.get('/transport-quote-requests/:request_id', protect, getTransportQuoteRequestById);
router.post('/transport-quote-requests/:request_id/quotes', protect, submitTransportQuote);
router.get('/transport-quote-requests/:request_id/quotes', protect, getTransportQuotesForRequest);
router.post('/transport-quotes/:quote_id/accept', protect, acceptTransportQuote);
router.post('/transport-quotes/:quote_id/reject', protect, rejectTransportQuote);

// ==========================================
// 6. FAVORITES
// ==========================================
router.get('/favorites/transports', protect, getFavoriteTransports);
router.post('/favorites/transports/:provider_id', protect, addFavoriteTransport);
router.delete('/favorites/transports/:provider_id', protect, removeFavoriteTransport);

module.exports = router;
