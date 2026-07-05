const express = require('express');
const router = express.Router();
const { getFavorites } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.get('/favorites', protect, getFavorites);

module.exports = router;
