const AppConfig = require('../models/AppConfig');
const { successResponse } = require('../utils/apiResponse');

// Default Application Information
const DEFAULT_CONFIG = {
  app_name: 'Stone Market India',
  app_version: '1.0.0',
  min_supported_version: '1.0.0',
  force_update: false,
  update_url: 'https://play.google.com/store/apps/details?id=com.stonemarketindia.app',
  privacy_policy_url: 'https://stonemarketindia.com/privacy-policy',
  terms_and_conditions_url: 'https://stonemarketindia.com/terms-and-conditions',
  refund_policy_url: 'https://stonemarketindia.com/refund-policy',
  support_email: 'support@stonemarketindia.com',
  support_phone: '+91 9999999999',
  description: 'India\'s premier digital stone marketplace connecting customers with verified stone manufacturers, mining businesses, showrooms, and logistics providers.',
  policies: [
    {
      slug: 'privacy-policy',
      title: 'Privacy Policy',
      url: 'https://stonemarketindia.com/privacy-policy',
      updated_at: new Date('2026-01-01')
    },
    {
      slug: 'terms-and-conditions',
      title: 'Terms & Conditions',
      url: 'https://stonemarketindia.com/terms-and-conditions',
      updated_at: new Date('2026-01-01')
    },
    {
      slug: 'refund-policy',
      title: 'Refund & Cancellation Policy',
      url: 'https://stonemarketindia.com/refund-policy',
      updated_at: new Date('2026-01-01')
    }
  ]
};

async function getOrInitConfig() {
  let config = await AppConfig.findOne({ key: 'global_config' }).lean();
  if (!config) {
    config = await AppConfig.create(DEFAULT_CONFIG);
  }
  return config;
}

// @desc    Get About Stone Market information
// @route   GET /api/app/about
// @access  Public
exports.getAbout = async (req, res, next) => {
  try {
    const config = await getOrInitConfig();
    const data = {
      app_name: config.app_name || DEFAULT_CONFIG.app_name,
      version: config.app_version || DEFAULT_CONFIG.app_version,
      description: config.description || DEFAULT_CONFIG.description,
      company: 'Stone Market India Pvt. Ltd.',
      website: 'https://stonemarketindia.com',
      contact_email: config.support_email || DEFAULT_CONFIG.support_email,
      contact_phone: config.support_phone || DEFAULT_CONFIG.support_phone,
      supported_categories: [
        'Granite',
        'Marble',
        'Italian Marble',
        'Sandstone',
        'Limestone',
        'Quartz',
        'Onyx',
        'Travertine'
      ]
    };
    return successResponse(res, 'About information retrieved successfully', data);
  } catch (err) {
    next(err);
  }
};

// @desc    Get application version information
// @route   GET /api/app/version
// @access  Public
exports.getVersion = async (req, res, next) => {
  try {
    const config = await getOrInitConfig();
    const data = {
      app_name: config.app_name || DEFAULT_CONFIG.app_name,
      current_version: config.app_version || DEFAULT_CONFIG.app_version,
      min_supported_version: config.min_supported_version || DEFAULT_CONFIG.min_supported_version,
      force_update: Boolean(config.force_update),
      update_url: config.update_url || DEFAULT_CONFIG.update_url
    };
    return successResponse(res, 'Version information retrieved successfully', data);
  } catch (err) {
    next(err);
  }
};

// @desc    Get application legal policies
// @route   GET /api/app/policies
// @access  Public
exports.getPolicies = async (req, res, next) => {
  try {
    const config = await getOrInitConfig();
    const data = {
      privacy_policy_url: config.privacy_policy_url || DEFAULT_CONFIG.privacy_policy_url,
      terms_and_conditions_url: config.terms_and_conditions_url || DEFAULT_CONFIG.terms_and_conditions_url,
      refund_policy_url: config.refund_policy_url || DEFAULT_CONFIG.refund_policy_url,
      policies: config.policies && config.policies.length ? config.policies : DEFAULT_CONFIG.policies
    };
    return successResponse(res, 'Policies retrieved successfully', data);
  } catch (err) {
    next(err);
  }
};
