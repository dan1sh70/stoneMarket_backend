const express = require('express');
const router = express.Router();
const {
  globalSearch,
  nearbySearch
} = require('../controllers/searchController');

router.get('/', globalSearch);
router.get('/nearby', nearbySearch);

module.exports = router;
