const express = require('express');
const router = express.Router();
const { updateProfile, getProducts, addProduct } = require('../../controllers/cms/showroomCmsController');
const { protect } = require('../../middleware/auth');

router.use(protect);

router.route('/profile')
  .put(updateProfile)
  .post(updateProfile);

router.route('/products')
  .get(getProducts)
  .post(addProduct);

module.exports = router;
