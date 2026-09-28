const express = require('express');
const router = express.Router();
const { getBusinessProfile } = require('../controllers/businessController');
const { toggleBusinessFavorite } = require('../controllers/quoteController');
const { protect } = require('../middleware/auth');

router.get('/:id', getBusinessProfile);
router.post('/:id/favorite', protect, toggleBusinessFavorite);
router.delete('/:id/favorite', protect, toggleBusinessFavorite);

module.exports = router;
