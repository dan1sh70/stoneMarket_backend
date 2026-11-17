const express = require('express');
const router = express.Router();
const appInfoController = require('../controllers/appInfoController');
const CustomPage = require('../models/CustomPage');
const AppConfig = require('../models/AppConfig');
const Activity = require('../models/Activity');
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

/**
 * --------------------------------------------------------------------------
 * PUBLIC STONE MARKET ACTIVITIES & BLOGS ENDPOINTS (Mobile & Web)
 * --------------------------------------------------------------------------
 */

// GET /api/v1/app/activities or /api/app/activities
router.get('/activities', async (req, res) => {
  try {
    const { type, category, is_featured, limit = 20, page = 1 } = req.query;
    const filter = { status: 'published' };

    if (type && type !== 'all') filter.type = type;
    if (category) filter.category = category;
    if (is_featured === 'true') filter.is_featured = true;

    const skip = (Number(page) - 1) * Number(limit);
    const [total, activities] = await Promise.all([
      Activity.countDocuments(filter),
      Activity.find(filter)
        .select('title slug description image type category tags author_name is_featured views_count published_at url createdAt')
        .sort({ published_at: -1, createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
    ]);

    return successResponse(res, 'Published activities and blogs retrieved', {
      activities,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (err) {
    return errorResponse(res, err.message, err, 500);
  }
});

// GET /api/v1/app/activities/:idOrSlug
router.get('/activities/:idOrSlug', async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const isObjectId = idOrSlug.match(/^[0-9a-fA-F]{24}$/);
    const query = isObjectId
      ? { _id: idOrSlug, status: 'published' }
      : { slug: idOrSlug.toLowerCase(), status: 'published' };

    const activity = await Activity.findOneAndUpdate(
      query,
      { $inc: { views_count: 1 } },
      { new: true }
    );

    if (!activity) {
      return errorResponse(res, 'Activity or blog post not found', null, 404);
    }

    return successResponse(res, 'Activity details retrieved successfully', activity);
  } catch (err) {
    return errorResponse(res, err.message, err, 500);
  }
});

/**
 * --------------------------------------------------------------------------
 * GOOGLE PLAY STORE MANDATORY ACCOUNT DELETION ENDPOINTS
 * --------------------------------------------------------------------------
 */
const AccountDeletionRequest = require('../models/AccountDeletionRequest');
const User = require('../models/User');

// POST /api/v1/app/delete-account-request (Public URL for Play Store listing)
router.post('/delete-account-request', async (req, res) => {
  try {
    const { identifier, reason, confirmUnderstand } = req.body;

    if (!identifier || !identifier.trim()) {
      return errorResponse(res, 'Please provide the registered mobile number or email address of the account.', null, 400);
    }

    if (!confirmUnderstand) {
      return errorResponse(res, 'Please confirm that you understand account deletion will permanently remove your business profile and catalogue data.', null, 400);
    }

    const cleanIdentifier = identifier.trim();
    // Check if user exists in database
    const user = await User.findOne({
      $or: [
        { mobile: cleanIdentifier },
        { email: cleanIdentifier.toLowerCase() }
      ]
    });

    const requestIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';

    // Create deletion ticket
    const deletionRecord = await AccountDeletionRequest.create({
      identifier: cleanIdentifier,
      userId: user ? user._id : null,
      reason: reason || 'Requested via Play Store public web page',
      request_ip: String(requestIp),
      status: 'pending',
      data_types_to_delete: [
        'User Personal Profile & Credentials',
        'Business Profile & Factory Information',
        'Stone Product Listings & Machinery Catalogues',
        'Chat Messages, Inquiries & Lead Demands',
        'Device FCM Push Tokens & Active Sessions'
      ]
    });

    // If user found, mark status to pending_deletion
    if (user) {
      user.status = 'suspended';
      await user.save();
    }

    return successResponse(res, 'Account deletion request submitted successfully. In accordance with Google Play Store guidelines, your account and associated data will be purged within the 7-day grace period.', {
      request_id: deletionRecord._id,
      identifier: deletionRecord.identifier,
      scheduled_deletion_date: deletionRecord.scheduled_deletion_date,
      status: 'pending'
    }, 201);
  } catch (err) {
    return errorResponse(res, err.message, err, 500);
  }
});

// GET /api/v1/app/delete-account-request/:idOrMobile (Check deletion status)
router.get('/delete-account-request/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    const isObjectId = identifier.match(/^[0-9a-fA-F]{24}$/);
    const query = isObjectId ? { _id: identifier } : { identifier: identifier.trim() };

    const record = await AccountDeletionRequest.findOne(query).sort({ createdAt: -1 });
    if (!record) {
      return errorResponse(res, 'No active account deletion request found for this identifier.', null, 404);
    }

    return successResponse(res, 'Account deletion request status retrieved', record);
  } catch (err) {
    return errorResponse(res, err.message, err, 500);
  }
});

module.exports = router;
