const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  listCatalogue,
  createCatalogueListing,
  getCatalogueListingById,
  updateCatalogueListing,
  deleteCatalogueListing,
  duplicateCatalogueListing,
  toggleCatalogueListingStatus,
  saveStepBasic,
  saveStepSpecifications,
  saveStepPricing,
  getListingReviewPreview,
  publishCatalogueListing
} = require('../controllers/universalCatalogueController');

// All catalogue management endpoints are protected
router.use(protect);

// 4-Step Publishing Workflow
router.post('/:id/steps/basic', saveStepBasic);
router.post('/:id/steps/specifications', saveStepSpecifications);
router.post('/:id/steps/pricing', saveStepPricing);
router.get('/:id/review', getListingReviewPreview);
router.post('/:id/publish', publishCatalogueListing);
router.post('/:id/duplicate', duplicateCatalogueListing);
router.patch('/:id/status', toggleCatalogueListingStatus);

// CRUD
router.get('/', listCatalogue);
router.post('/', createCatalogueListing);
router.get('/:id', getCatalogueListingById);
router.put('/:id', updateCatalogueListing);
router.delete('/:id', deleteCatalogueListing);

module.exports = router;
