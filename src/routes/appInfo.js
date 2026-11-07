const express = require('express');
const router = express.Router();
const appInfoController = require('../controllers/appInfoController');
const CustomPage = require('../models/CustomPage');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// Public App Info Routes
router.get('/about', appInfoController.getAbout);
router.get('/version', appInfoController.getVersion);
router.get('/policies', appInfoController.getPolicies);

// Public Custom Pages & Policies Route
router.get('/pages', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = { status: 'published' };
    if (category) filter.category = category;

    const pages = await CustomPage.find(filter)
      .select('title slug category summary meta_title meta_description published_at')
      .sort({ updatedAt: -1 });

    return successResponse(res, 'Public custom pages retrieved', pages);
  } catch (err) {
    return errorResponse(res, err.message, err, 500);
  }
});

router.get('/pages/:slug', async (req, res) => {
  try {
    const page = await CustomPage.findOne({
      slug: req.params.slug.toLowerCase(),
      status: 'published'
    });

    if (!page) {
      return errorResponse(res, 'Page not found', null, 404);
    }

    return successResponse(res, 'Page retrieved successfully', page);
  } catch (err) {
    return errorResponse(res, err.message, err, 500);
  }
});

module.exports = router;
