const express = require('express');
const router = express.Router();
const appInfoController = require('../controllers/appInfoController');
const CustomPage = require('../models/CustomPage');
const AppConfig = require('../models/AppConfig');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// Public App Info Routes
router.get('/about', appInfoController.getAbout);
router.get('/version', appInfoController.getVersion);
router.get('/policies', appInfoController.getPolicies);

/**
 * General Public / Client App Keys Endpoint
 * GET /api/v1/app/keys or /api/app/keys
 * Returns safe public client keys (like Google Maps & AI enabled status)
 */
router.get('/keys', async (req, res) => {
  try {
    const config = await AppConfig.findOne({ key: 'global_config' }).lean();
    const dbKeys = config?.api_keys || {};
    
    // Provide client-safe keys and readiness flags without leaking sensitive server secrets
    const googleMapsKey = dbKeys.google_maps_api_key || process.env.GOOGLE_MAPS_API_KEY || '';
    const hasAI = Boolean(dbKeys.gemini_api_key || process.env.GEMINI_API_KEY || dbKeys.google_vision_api_key);
    const hasAWS = Boolean(dbKeys.aws_access_key || process.env.AWS_ACCESS_KEY_ID);
    const hasTwilio = Boolean(dbKeys.twilio_account_sid || process.env.TWILIO_ACCOUNT_SID);

    return successResponse(res, 'General client keys and service status retrieved', {
      google_maps_api_key: googleMapsKey,
      services: {
        ai_vision_enabled: hasAI,
        cloud_storage_enabled: hasAWS,
        sms_otp_enabled: hasTwilio
      },
      app_name: config?.app_name || 'Stone Market India',
      app_version: config?.app_version || '1.0.0'
    });
  } catch (err) {
    return errorResponse(res, err.message, err, 500);
  }
});

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
