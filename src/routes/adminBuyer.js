const express = require('express');
const router = express.Router();
const {
  getBuyers,
  getBuyerDetail,
  updateBuyer,
  verifyBuyer,
  getAllRequirements,
  updateRequirementStatus,
  getAllReviews,
  updateReviewStatus,
  createBuyerType,
  updateBuyerType,
  deleteBuyerType
} = require('../controllers/adminBuyerController');
const { protect, authorize } = require('../middleware/auth');

// All admin buyer routes require admin authorization
router.use(protect);
router.use(authorize('admin'));

// Requirements & Reviews & Types must come before /:id
router.get('/requirements', getAllRequirements);
router.put('/requirements/:id/status', updateRequirementStatus);

router.get('/reviews', getAllReviews);
router.put('/reviews/:id/status', updateReviewStatus);

router.post('/types', createBuyerType);
router.put('/types/:id', updateBuyerType);
router.delete('/types/:id', deleteBuyerType);

// Buyer Profiles
router.get('/', getBuyers);
router.get('/:id', getBuyerDetail);
router.put('/:id', updateBuyer);
router.put('/:id/verify', verifyBuyer);

module.exports = router;
