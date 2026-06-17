const express = require('express');
const router = express.Router();
const {
  getAds, createAd, updateAd, recordImpression, recordClick, getAdStats
} = require('../controllers/adsController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getAds);
router.post('/:id/impression', recordImpression);
router.post('/:id/click', recordClick);

// Admin only
router.post('/', protect, authorize('admin'), createAd);
router.put('/:id', protect, authorize('admin'), updateAd);
router.get('/stats', protect, authorize('admin'), getAdStats);

module.exports = router;
