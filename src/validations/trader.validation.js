const Joi = require('joi');

const updateTraderProfileSchema = Joi.object({
  company_name: Joi.string().trim().max(200).optional(),
  logo: Joi.string().uri().allow('', null).optional(),
  cover_image: Joi.string().uri().allow('', null).optional(),
  business_category: Joi.string().default('Stone Trader').optional(),
  business_subcategory: Joi.string().allow('', null).optional(),
  short_description: Joi.string().max(300).allow('', null).optional(),
  about_business: Joi.string().allow('', null).optional(),
  established_year: Joi.number().integer().min(1900).max(new Date().getFullYear()).optional(),
  gst_number: Joi.string().trim().allow('', null).optional(),
  iec_number: Joi.string().trim().allow('', null).optional(),
  business_registration_number: Joi.string().trim().allow('', null).optional(),
  trade_license_number: Joi.string().trim().allow('', null).optional(),
  trading_business_types: Joi.array().items(Joi.string()).optional(),
  trading_specializations: Joi.array().items(Joi.string()).optional(),
  trading_capabilities: Joi.array().items(Joi.string()).optional(),
  monthly_trading_volume: Joi.number().min(0).optional(),
  trading_volume_unit: Joi.string().valid(
    'Tons',
    'Metric Tons',
    'Sq.ft',
    'Sq.m',
    'Slabs',
    'Pieces',
    'Cubic Meters'
  ).default('Tons').optional(),
  min_order_quantity: Joi.number().min(0).optional(),
  max_order_capacity: Joi.number().min(0).optional(),
  preferred_order_type: Joi.string().allow('', null).optional(),
  supply_network_coverage: Joi.string().allow('', null).optional(),
  operating_markets: Joi.array().items(Joi.string()).optional(),
  factory_timings: Joi.string().allow('', null).optional(),
  working_hours: Joi.object().optional(),
  address: Joi.object({
    full_address: Joi.string().allow('', null).optional(),
    office_address: Joi.string().allow('', null).optional(),
    commercial_area: Joi.string().allow('', null).optional(),
    industrial_area: Joi.string().allow('', null).optional(),
    district: Joi.string().allow('', null).optional(),
    state: Joi.string().allow('', null).optional(),
    country: Joi.string().allow('', null).optional(),
    postal_code: Joi.string().allow('', null).optional(),
    google_map_location: Joi.string().allow('', null).optional(),
    latitude: Joi.number().allow(null).optional(),
    longitude: Joi.number().allow(null).optional()
  }).optional()
}).unknown(true);

const updateTraderCapabilitiesSchema = Joi.object({
  trading_business_types: Joi.array().items(Joi.string()).min(1).required(),
  trading_specializations: Joi.array().items(Joi.string()).min(1).required(),
  trading_capabilities: Joi.array().items(Joi.string()).min(1).required(),
  monthly_trading_volume: Joi.number().min(0).required(),
  trading_volume_unit: Joi.string().valid(
    'Tons',
    'Metric Tons',
    'Sq.ft',
    'Sq.m',
    'Slabs',
    'Pieces',
    'Cubic Meters'
  ).default('Tons'),
  min_order_quantity: Joi.number().min(0).optional(),
  max_order_capacity: Joi.number().min(0).optional(),
  preferred_order_type: Joi.string().allow('', null).optional(),
  supply_network_coverage: Joi.string().allow('', null).optional(),
  operating_markets: Joi.array().items(Joi.string()).optional()
}).unknown(true);

const traderContactSchema = Joi.object({
  name: Joi.string().trim().required(),
  designation: Joi.string().trim().default('Managing Partner / Director'),
  phone: Joi.string().trim().required(),
  email: Joi.string().email().allow('', null).optional(),
  whatsapp: Joi.string().trim().allow('', null).optional(),
  is_primary: Joi.boolean().default(false),
  birth_date: Joi.date().iso().allow(null).optional(),
  anniversary_date: Joi.date().iso().allow(null).optional(),
  photo: Joi.string().allow('', null).optional()
});

const traderGalleryPhotoSchema = Joi.object({
  url: Joi.string().allow('', null).optional(),
  image_url: Joi.string().allow('', null).optional(),
  title: Joi.string().allow('', null).optional(),
  caption: Joi.string().allow('', null).optional(),
  category: Joi.string().valid(
    'office',
    'warehouse',
    'godown',
    'material',
    'operations',
    'team',
    'exhibition',
    'other'
  ).default('office'),
  is_cover: Joi.boolean().default(false)
}).unknown(true);

const traderGalleryVideoSchema = Joi.object({
  title: Joi.string().trim().required(),
  url: Joi.string().allow('', null).optional(),
  video_url: Joi.string().allow('', null).optional(),
  youtube_url: Joi.string().uri().allow('', null).optional(),
  thumbnail: Joi.string().allow('', null).optional(),
  duration: Joi.string().allow('', null).optional(),
  source_type: Joi.string().valid('upload', 'youtube').default('upload'),
  category: Joi.string().allow('', null).optional(),
  video_type: Joi.string().valid(
    'introduction',
    'operations',
    'walkthrough',
    'inspection',
    'promotional'
  ).default('introduction')
}).unknown(true);

const traderPhoneOtpVerifySchema = Joi.object({
  phone: Joi.string().required(),
  otp: Joi.string().length(6).required()
}).unknown(true);

const traderEmailVerifySchema = Joi.object({
  email: Joi.string().email().required(),
  token: Joi.string().optional()
}).unknown(true);

const traderBusinessVerifySchema = Joi.object({
  registration_type: Joi.string().required(),
  registration_number: Joi.string().required()
}).unknown(true);

const traderGstVerifySchema = Joi.object({
  gstin: Joi.string().optional(),
  gst_number: Joi.string().optional(),
  legal_business_name: Joi.string().optional()
}).unknown(true);

const traderBankVerifySchema = Joi.object({
  account_holder_name: Joi.string().required(),
  bank_name: Joi.string().required(),
  account_number: Joi.string().required(),
  ifsc_code: Joi.string().required()
}).unknown(true);

const traderDocumentUploadSchema = Joi.object({
  title: Joi.string().allow('', null).optional(),
  document_name: Joi.string().allow('', null).optional(),
  document_number: Joi.string().allow('', null).optional(),
  document_type: Joi.string().valid(
    'gst_certificate',
    'business_registration',
    'iec_code',
    'iec_certificate',
    'trade_license',
    'bank_statement',
    'other'
  ).default('other')
}).unknown(true);

const traderAnalyticsEventSchema = Joi.object({
  event_type: Joi.string().valid(
    'profile_view',
    'contact_click',
    'inquiry_started',
    'business_save',
    'gallery_view',
    'video_view',
    'ad_impression',
    'ad_click',
    'partner_click'
  ).required(),
  entity_type: Joi.string().valid('profile', 'gallery', 'ad', 'service').default('profile'),
  entity_id: Joi.string().optional(),
  city: Joi.string().optional(),
  state: Joi.string().optional(),
  metadata: Joi.object().optional()
}).unknown(true);

module.exports = {
  updateTraderProfileSchema,
  updateTraderCapabilitiesSchema,
  traderContactSchema,
  traderGalleryPhotoSchema,
  traderGalleryVideoSchema,
  traderPhoneOtpVerifySchema,
  traderEmailVerifySchema,
  traderBusinessVerifySchema,
  traderGstVerifySchema,
  traderBankVerifySchema,
  traderDocumentUploadSchema,
  traderAnalyticsEventSchema
};
