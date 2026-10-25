const express = require('express');
const router = express.Router();
const {
  getStates,
  getCities,
  getBuyers,
  getBuyerTypes,
  getBuyerProfile,
  getBuyerRequirements,
  getBuyerReviews,
  submitBuyerReview,
  getBuyerFavorites
} = require('../controllers/buyerController');
const { getFormOptions } = require('../controllers/marketplaceController');
const { toggleBusinessFavorite, createQuoteRequest } = require('../controllers/quoteController');
const { submitInquiry } = require('../controllers/inquiryController');
const { protect, optionalAuth } = require('../middleware/auth');

// Dropdowns & Discovery
router.get('/states', getStates);
router.get('/cities', getCities);
router.get('/types', getBuyerTypes);
router.get('/form-options', getFormOptions);
router.get('/favorites', protect, getBuyerFavorites);

// Listing
router.get('/', getBuyers);

// Single Buyer Profile
router.get('/:id', optionalAuth, getBuyerProfile);
router.get('/:id/requirements', optionalAuth, getBuyerRequirements);
router.get('/:id/reviews', getBuyerReviews);

// Protected actions on buyer profile
router.post('/:id/reviews', protect, submitBuyerReview);
router.post('/:id/favorite', protect, toggleBusinessFavorite);
router.delete('/:id/favorite', protect, toggleBusinessFavorite);

// Inquiries & Quotes on Buyer Profile
router.post('/:id/inquiry', protect, (req, res, next) => {
  req.body.businessId = req.params.id;
  return submitInquiry(req, res, next);
});

router.post('/:id/quote', protect, (req, res, next) => {
  req.body.business_id = req.params.id;
  return createQuoteRequest(req, res, next);
});

module.exports = router;
