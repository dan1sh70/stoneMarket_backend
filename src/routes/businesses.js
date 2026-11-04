const express = require('express');
const router = express.Router();
const { getBusinessProfile } = require('../controllers/businessController');
const { toggleBusinessFavorite } = require('../controllers/quoteController');
const { protect } = require('../middleware/auth');
const mongoose = require('mongoose');

router.get('/:id', (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next();
  }
  return getBusinessProfile(req, res, next);
});
router.post('/:id/favorite', protect, toggleBusinessFavorite);
router.delete('/:id/favorite', protect, toggleBusinessFavorite);

module.exports = router;
