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
const { toggleBusinessFavorite } = require('../controllers/quoteController'); // Using existing favorite controller
const { protect } = require('../middleware/auth');

router.get('/categories', getCategories);
router.get('/types', getTypes);
router.get('/states', getStates);
router.get('/cities', getCities);
router.get('/colours', getColours);
router.get('/', getManufacturers);
router.get('/:id', getManufacturerProfile);

// Favourites (using quoteController logic that already handles BusinessFavorite)
router.post('/:id/favorite', protect, toggleBusinessFavorite);
router.delete('/:id/favorite', protect, toggleBusinessFavorite);

// Inquiries / Quotes can be routed to the general quote endpoint 
// POST /api/quote-requests handles it well from the frontend side

module.exports = router;
