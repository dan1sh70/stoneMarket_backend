const mongoose = require('mongoose');

const policySchema = new mongoose.Schema({
  slug: { type: String, required: true },
  title: { type: String, required: true },
  content: { type: String, default: '' },
  url: { type: String, default: '' },
  updated_at: { type: Date, default: Date.now }
}, { _id: false });

const appConfigSchema = new mongoose.Schema({
  key: { 
    type: String, 
    required: true, 
    unique: true, 
    default: 'global_config' 
  },
  app_name: { 
    type: String, 
    default: 'Stone Market India' 
  },
  app_version: { 
    type: String, 
    default: '1.0.0' 
  },
  min_supported_version: { 
    type: String, 
    default: '1.0.0' 
  },
  force_update: { 
    type: Boolean, 
    default: false 
  },
  update_url: { 
    type: String, 
    default: 'https://play.google.com/store/apps/details?id=com.stonemarketindia.app' 
  },
  privacy_policy_url: { 
    type: String, 
    default: 'https://stonemarketindia.com/privacy-policy' 
  },
  terms_and_conditions_url: { 
    type: String, 
    default: 'https://stonemarketindia.com/terms-and-conditions' 
  },
  refund_policy_url: { 
    type: String, 
    default: 'https://stonemarketindia.com/refund-policy' 
  },
  support_email: { 
    type: String, 
    default: 'support@stonemarketindia.com' 
  },
  support_phone: { 
    type: String, 
    default: '+91 9999999999' 
  },
  // API Keys Section
  api_keys: {
    gemini_api_key: { type: String, default: '' },
    google_vision_api_key: { type: String, default: '' },
    google_maps_api_key: { type: String, default: '' },
    aws_access_key: { type: String, default: '' },
    aws_secret_key: { type: String, default: '' },
    aws_s3_bucket: { type: String, default: '' },
    aws_region: { type: String, default: 'ap-south-1' },
    twilio_account_sid: { type: String, default: '' },
    twilio_auth_token: { type: String, default: '' },
    twilio_phone_number: { type: String, default: '' }
  },
  policies: [policySchema],
  is_mock: { 
    type: Boolean, 
    default: false 
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('AppConfig', appConfigSchema);
