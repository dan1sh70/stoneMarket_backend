const express = require('express');
const router = express.Router();
const {
  getHome,
  getBanners,
  getCategories,
  getStoneGallery,
  getSupportServices,
  getNearbyBusinesses
} = require('../controllers/homeController');

router.get('/', getHome);
router.get('/banners', getBanners);
router.get('/categories', getCategories);
router.get('/stone-gallery', getStoneGallery);
router.get('/support-services', getSupportServices);
router.get('/nearby-businesses', getNearbyBusinesses);

module.exports = router;
