const express = require('express');
const router = express.Router();
const {
  getProductTypes,
  getStates,
  getCities,
  getShowrooms,
  getShowroomProfile,
  getShowroomProducts,
  getProductDetails,
  submitReview
} = require('../controllers/showroomController');
const { toggleBusinessFavorite, createQuoteRequest } = require('../controllers/quoteController'); 
const { submitInquiry } = require('../controllers/inquiryController');
const { protect } = require('../middleware/auth');

router.get('/product-types', getProductTypes);
router.get('/states', getStates);
router.get('/cities', getCities);
router.get('/', getShowrooms);

// Products Global
router.get('/products/:product_id', getProductDetails);

// Profile
router.get('/:id', getShowroomProfile);
router.get('/:id/products', getShowroomProducts);
router.get('/:id/products/featured', getShowroomProducts);

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
