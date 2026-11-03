const express = require('express');
const router = express.Router();
const adminPromotionController = require('../controllers/adminPromotionController');
const { protect, authorize } = require('../middleware/auth');

// All admin promotion routes require admin authorization
router.use(protect, authorize('admin'));

// Package Management
router.get('/packages', adminPromotionController.getAllPackages);
router.post('/packages', adminPromotionController.createPackage);
router.put('/packages/:id', adminPromotionController.updatePackage);
router.delete('/packages/:id', adminPromotionController.deletePackage);

// Campaign Oversight
router.get('/campaigns', adminPromotionController.getAllCampaigns);
router.post('/campaigns/:id/pause', adminPromotionController.adminPauseCampaign);
router.post('/campaigns/:id/resume', adminPromotionController.adminResumeCampaign);
router.post('/campaigns/:id/end', adminPromotionController.adminEndCampaign);

// Financial & Reporting
router.get('/orders', adminPromotionController.getAllOrders);
router.get('/invoices', adminPromotionController.getAllInvoices);
router.get('/statistics', adminPromotionController.getAdminPromotionStatistics);

module.exports = router;
