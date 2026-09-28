const express = require('express');
const router = express.Router();
const {
  getMiningCategories,
  getMiningStates,
  searchMiningLocations,
  getMiningBusinesses,
  getMiningGallery
} = require('../controllers/miningController');

router.get('/categories', getMiningCategories);
router.get('/gallery', getMiningGallery);
router.get('/businesses', getMiningBusinesses);
router.get('/:category/states', getMiningStates);
router.get('/:category/locations/search', searchMiningLocations);

module.exports = router;
