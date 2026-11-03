const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotionController');
const { protect, optionalAuth } = require('../middleware/auth');

// Public package listing
router.get('/packages', promotionController.getPromotionPackages);
router.get('/packages/:id', promotionController.getPromotionPackageById);

// Public / client analytics event tracking
router.post('/:id/event', optionalAuth, promotionController.recordCampaignEvent);

// Protected Manufacturer Promotion Routes
router.get('/dashboard', protect, promotionController.getPromotionDashboard);
router.get('/statistics', protect, promotionController.getCampaignStatistics);
router.get('/performance', protect, promotionController.getCampaignPerformanceGrowth);
router.get('/eligible-products', protect, promotionController.getEligibleProducts);

// Feed Promotion
router.post('/feed/preview', protect, promotionController.previewFeedPromotion);
router.post('/feed/create', protect, promotionController.createFeedPromotion);

// Listing Promotion
router.post('/listing/preview', protect, promotionController.previewListingPromotion);
router.post('/listing/create', protect, promotionController.createListingPromotion);

// Campaign Management
router.get('/:id/preview', protect, promotionController.getCampaignPreview);
router.post('/:id/pause', protect, promotionController.pauseCampaign);
router.post('/:id/resume', protect, promotionController.resumeCampaign);
router.post('/:id/end', protect, promotionController.endCampaign);
router.get('/:id', protect, promotionController.getCampaignDetails);
router.get('/', protect, promotionController.getManufacturerCampaigns);

module.exports = router;
