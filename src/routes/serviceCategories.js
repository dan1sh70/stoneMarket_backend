const express = require('express');
const router = express.Router();
const {
  getCategories,
  seedCategories
} = require('../controllers/serviceCategoryController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getCategories);
router.post('/seed', protect, authorize('admin'), seedCategories);

module.exports = router;
