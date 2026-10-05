const express = require('express');
const router = express.Router();
const {
  getCategories,
  getStates,
  getCities,
  getTraders,
  getTraderProfile,
  getTraderProducts
} = require('../controllers/traderController');
const { getProductDetails, submitReview } = require('../controllers/showroomController'); // Reuse products/reviews
const { toggleBusinessFavorite, createQuoteRequest } = require('../controllers/quoteController'); 
const { submitInquiry } = require('../controllers/inquiryController');
const { protect } = require('../middleware/auth');

router.get('/categories', getCategories);
router.get('/states', getStates);
router.get('/cities', getCities);
router.get('/', getTraders);

// Products Global
router.get('/products/:product_id', getProductDetails);

// Profile
router.get('/:id', getTraderProfile);
router.get('/:id/contacts', getTraderProfile); // Covered by profile
router.get('/:id/products', getTraderProducts);
router.get('/:id/products/featured', getTraderProducts);

// Favourites
router.post('/:id/favorite', protect, toggleBusinessFavorite);
router.delete('/:id/favorite', protect, toggleBusinessFavorite);

// Inquiries / Quotes
router.post('/:id/inquiry', protect, (req, res, next) => {
  req.body.vendorId = req.params.id;
  return submitInquiry(req, res, next);
});

router.post('/:id/quote', protect, (req, res, next) => {
  req.body.business_id = req.params.id;
  return createQuoteRequest(req, res, next);
});

// Reviews
router.post('/:id/reviews', protect, submitReview);

module.exports = router;
