const express = require('express');
const router = express.Router();
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  uploadImages
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const validate = require('../middleware/validate');
const { productSchema } = require('../validations/product.validation');

router.get('/', getProducts);
router.get('/:id', getProductById);

router.post('/', protect, authorize('vendor'), validate(productSchema), createProduct);
router.put('/:id', protect, authorize('vendor'), validate(productSchema), updateProduct);
router.delete('/:id', protect, authorize('vendor'), deleteProduct);
router.post('/:id/images', protect, authorize('vendor'), upload.array('images', 10), uploadImages);

module.exports = router;
