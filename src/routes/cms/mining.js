const express = require('express');
const router = express.Router();
const { updateProfile, getProducts, addProduct } = require('../../controllers/cms/miningCmsController');
const { protect } = require('../../middleware/auth');

router.use(protect);

router.route('/profile')
  .put(updateProfile)
  .post(updateProfile); // Support both PUT and POST for updates

router.route('/products')
  .get(getProducts)
  .post(addProduct);

module.exports = router;
