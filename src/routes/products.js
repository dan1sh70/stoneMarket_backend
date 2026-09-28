const express = require('express');
const router = express.Router();
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  uploadImages,
  getProductDetail,
  createProductInquiry,
  toggleProductInterest,
  getProductInterest
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const validate = require('../middleware/validate');
const { productSchema } = require('../validations/product.validation');

router.get('/', getProducts);
router.get('/:id/detail', getProductDetail);
router.get('/:id', getProductById); // Legacy

router.get('/:id/interest', protect, getProductInterest);
router.post('/:id/interest', protect, toggleProductInterest);
router.delete('/:id/interest', protect, toggleProductInterest);
router.post('/:id/inquiry', protect, createProductInquiry);

router.post('/', protect, authorize('manufacturer', 'mining', 'showroom', 'trader'), validate(productSchema), createProduct);
router.put('/:id', protect, authorize('manufacturer', 'mining', 'showroom', 'trader'), validate(productSchema), updateProduct);
router.delete('/:id', protect, authorize('manufacturer', 'mining', 'showroom', 'trader'), deleteProduct);
router.post('/:id/images', protect, authorize('manufacturer', 'mining', 'showroom', 'trader'), upload.array('images', 10), uploadImages);

module.exports = router;
