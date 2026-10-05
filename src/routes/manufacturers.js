const express = require('express');
const router = express.Router();
const {
  getCategories,
  getTypes,
  getStates,
  getCities,
  getColours,
  getManufacturers,
  getManufacturerProfile
} = require('../controllers/manufacturerController');
const { toggleBusinessFavorite, createQuoteRequest } = require('../controllers/quoteController'); 
const { submitInquiry } = require('../controllers/inquiryController');
const { protect } = require('../middleware/auth');

router.get('/categories', getCategories);
router.get('/types', getTypes);
router.get('/states', getStates);
router.get('/cities', getCities);
router.get('/colours', getColours);
router.get('/', getManufacturers);
router.get('/:id', getManufacturerProfile);

// Favourites
router.post('/:id/favorite', protect, toggleBusinessFavorite);
router.delete('/:id/favorite', protect, toggleBusinessFavorite);

// Inquiries / Quotes
router.post('/:id/inquiry', protect, (req, res, next) => {
  // Map manufacturer id from URL to vendorId for existing logic
  req.body.vendorId = req.params.id;
  return submitInquiry(req, res, next);
});

router.post('/:id/quote', protect, (req, res, next) => {
  // Map manufacturer id from URL to business_id for existing logic
  req.body.business_id = req.params.id;
  return createQuoteRequest(req, res, next);
});

module.exports = router;
