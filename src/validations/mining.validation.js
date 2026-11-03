const Joi = require('joi');

const updateMiningProfileSchema = Joi.object({
  company_name: Joi.string().trim().max(200).optional(),
  logo: Joi.string().uri().allow('', null).optional(),
  cover_image: Joi.string().uri().allow('', null).optional(),
  property_type: Joi.string().allow('', null).optional(),
  unit_status: Joi.string().valid('export', 'domestic', 'both').optional(),
  is_export_unit: Joi.boolean().optional(),
  gst_number: Joi.string().trim().allow('', null).optional(),
  ec_number: Joi.string().trim().allow('', null).optional(),
  ec_clearance_status: Joi.string().allow('', null).optional(),
  mining_lease_number: Joi.string().trim().allow('', null).optional(),
  mining_permit_number: Joi.string().trim().allow('', null).optional(),
  quarry_specialties: Joi.array().items(Joi.string()).optional(),
  established_year: Joi.number().integer().min(1900).max(new Date().getFullYear()).optional(),
  monthly_capacity: Joi.number().min(0).optional(),
  capacity_unit: Joi.string().default('Ton').optional(),
  about_business: Joi.string().allow('', null).optional(),
  company_details: Joi.string().allow('', null).optional(),
  factory_timings: Joi.string().allow('', null).optional(),
  working_hours: Joi.object().optional(),
  address: Joi.object({
    full_address: Joi.string().allow('', null).optional(),
    area: Joi.string().allow('', null).optional(),
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

const updateMiningOperationalSpecsSchema = Joi.object({
  monthly_capacity: Joi.number().min(0).required(),
  capacity_unit: Joi.string().default('Ton'),
  ec_number: Joi.string().trim().allow('', null).optional(),
  ec_clearance_status: Joi.string().default('Clearance Granted').optional(),
  mining_lease_number: Joi.string().trim().allow('', null).optional(),
  mining_permit_number: Joi.string().trim().allow('', null).optional(),
  quarry_specialties: Joi.array().items(Joi.string()).optional(),
  unit_status: Joi.string().valid('export', 'domestic', 'both').default('both'),
  is_export_unit: Joi.boolean().optional(),
  factory_timings: Joi.string().allow('', null).optional(),
  working_hours: Joi.object().optional()
}).unknown(true);

const miningMachinerySchema = Joi.object({
  machine_name: Joi.string().trim().required(),
  quantity: Joi.number().integer().min(1).default(1),
  description: Joi.string().trim().allow('', null).optional(),
  category: Joi.string().trim().allow('', null).optional(),
  operational_status: Joi.string().valid('Operational', 'Maintenance', 'Standby', 'Decommissioned').default('Operational'),
  image: Joi.string().allow('', null).optional()
});

const miningMachineryUpdateSchema = Joi.object({
  machine_name: Joi.string().trim().optional(),
  quantity: Joi.number().integer().min(1).optional(),
  description: Joi.string().trim().allow('', null).optional(),
  category: Joi.string().trim().allow('', null).optional(),
  operational_status: Joi.string().valid('Operational', 'Maintenance', 'Standby', 'Decommissioned').optional(),
  image: Joi.string().allow('', null).optional()
});

const excavatedStoneVarietySchema = Joi.object({
  name: Joi.string().trim().required(),
  color: Joi.string().trim().allow('', null).optional(),
  stone_type: Joi.string().trim().allow('', null).optional(),
  category: Joi.string().trim().allow('', null).optional(),
  finish: Joi.string().trim().allow('', null).optional(),
  description: Joi.string().trim().allow('', null).optional(),
  available_quantity: Joi.string().trim().allow('', null).optional()
});

const miningContactSchema = Joi.object({
  name: Joi.string().trim().required(),
  designation: Joi.string().trim().default('Mine Operator / Quarry Owner'),
  phone: Joi.string().trim().required(),
  email: Joi.string().email().allow('', null).optional(),
  whatsapp: Joi.string().trim().allow('', null).optional(),
  is_primary: Joi.boolean().default(false),
  birth_date: Joi.date().iso().allow(null).optional(),
  anniversary_date: Joi.date().iso().allow(null).optional(),
  photo: Joi.string().allow('', null).optional()
});

const miningProductWizardSchema = Joi.object({
  // Step 1: Photos
  images: Joi.array().items(Joi.string()).max(5).optional(),
  cover_image: Joi.string().allow('', null).optional(),

  // Step 2: Mining Product / Block Details
  name: Joi.string().trim().required(),
  color_name: Joi.string().trim().allow('', null).optional(),
  material: Joi.string().valid('Granite', 'Marble', 'Sandstone', 'Limestone', 'Slate', 'Quartzite', 'Other').required(),
  description: Joi.string().trim().allow('', null).optional(),
  
  selling_price: Joi.number().min(0).optional(),
  price: Joi.number().min(0).optional(),
  pricing_unit: Joi.string().valid('CU.MTR', 'TON', 'KG', 'BLOCK', 'PIECE', 'Sq.ft', 'Tons').default('CU.MTR'),
  
  block_dimensions: Joi.object({
    length: Joi.number().min(0).optional(),
    width: Joi.number().min(0).optional(),
    height: Joi.number().min(0).optional(),
    dimension_unit: Joi.string().valid('CM', 'MM', 'METER', 'FEET').default('FEET')
  }).optional(),
  
  size: Joi.string().allow('', null).optional(),
  volume_cbm: Joi.number().min(0).optional(),
  additional_sizes: Joi.array().items(Joi.object({
    length: Joi.number().min(0).required(),
    width: Joi.number().min(0).required(),
    height: Joi.number().min(0).required(),
    dimension_unit: Joi.string().valid('CM', 'MM', 'METER', 'FEET').default('FEET'),
    volume_cbm: Joi.number().min(0).optional()
  })).optional(),
  
  finish: Joi.string().valid('Natural Block', 'Rough Cut', 'Sawn', 'Polished', 'Honed', 'Flamed', 'Other').default('Natural Block'),
  quality: Joi.string().valid('Commercial', 'Standard', 'Premium', 'Super Premium', 'Export Grade').default('Standard'),
  pattern: Joi.string().valid('Plain / Solid', 'Veined', 'Spotted', 'Grain', 'Natural Pattern', 'Other').default('Natural Pattern'),
  
  available_stock: Joi.number().min(0).optional(),
  quantity: Joi.number().min(0).optional(),
  quantity_unit: Joi.string().valid('CU.MTR', 'TON', 'KG', 'BLOCK', 'PIECE', 'Sq.ft', 'Tons').default('TON'),
  stock_unit: Joi.string().valid('CU.MTR', 'TON', 'KG', 'BLOCK', 'PIECE', 'Sq.ft', 'Tons').default('TON'),
  availability_status: Joi.string().valid('in_stock', 'out_of_stock', 'made_to_order').default('in_stock'),
  
  weight: Joi.number().min(0).optional(),
  approx_weight: Joi.string().allow('', null).optional(),
  weight_unit: Joi.string().valid('TON', 'KG').default('TON'),
  country_of_origin: Joi.string().default('India'),
  miningLocation: Joi.string().allow('', null).optional(),
  min_order_quantity: Joi.number().min(1).default(1),

  // Step 3: Target Publishing
  target_publishing: Joi.object({
    states: Joi.array().items(Joi.string()).default([]),
    districts: Joi.array().items(Joi.string()).default([]),
    categories: Joi.array().items(Joi.string()).default([])
  }).optional(),

  // Step 4: Categories & Lifecycle
  category: Joi.string().allow('', null).optional(),
  subcategory: Joi.string().allow('', null).optional(),
  categories: Joi.array().items(Joi.string()).optional(),
  publishing_status: Joi.string().valid('draft', 'published', 'archived').default('published'),
  status: Joi.string().valid('active', 'inactive', 'draft').optional()
}).unknown(true);

const miningProductUpdateSchema = Joi.object({
  name: Joi.string().trim().optional(),
  color_name: Joi.string().trim().allow('', null).optional(),
  material: Joi.string().valid('Granite', 'Marble', 'Sandstone', 'Limestone', 'Slate', 'Quartzite', 'Other').optional(),
  description: Joi.string().trim().allow('', null).optional(),
  images: Joi.array().items(Joi.string()).max(5).optional(),
  cover_image: Joi.string().allow('', null).optional(),
  selling_price: Joi.number().min(0).optional(),
  price: Joi.number().min(0).optional(),
  pricing_unit: Joi.string().valid('CU.MTR', 'TON', 'KG', 'BLOCK', 'PIECE', 'Sq.ft', 'Tons').optional(),
  block_dimensions: Joi.object({
    length: Joi.number().min(0).optional(),
    width: Joi.number().min(0).optional(),
    height: Joi.number().min(0).optional(),
    dimension_unit: Joi.string().valid('CM', 'MM', 'METER', 'FEET').optional()
  }).optional(),
  size: Joi.string().allow('', null).optional(),
  volume_cbm: Joi.number().min(0).optional(),
  additional_sizes: Joi.array().items(Joi.object()).optional(),
  finish: Joi.string().valid('Natural Block', 'Rough Cut', 'Sawn', 'Polished', 'Honed', 'Flamed', 'Other').optional(),
  quality: Joi.string().valid('Commercial', 'Standard', 'Premium', 'Super Premium', 'Export Grade').optional(),
  pattern: Joi.string().valid('Plain / Solid', 'Veined', 'Spotted', 'Grain', 'Natural Pattern', 'Other').optional(),
  available_stock: Joi.number().min(0).optional(),
  quantity: Joi.number().min(0).optional(),
  quantity_unit: Joi.string().valid('CU.MTR', 'TON', 'KG', 'BLOCK', 'PIECE', 'Sq.ft', 'Tons').optional(),
  stock_unit: Joi.string().valid('CU.MTR', 'TON', 'KG', 'BLOCK', 'PIECE', 'Sq.ft', 'Tons').optional(),
  availability_status: Joi.string().valid('in_stock', 'out_of_stock', 'made_to_order').optional(),
  weight: Joi.number().min(0).optional(),
  approx_weight: Joi.string().allow('', null).optional(),
  weight_unit: Joi.string().valid('TON', 'KG').optional(),
  min_order_quantity: Joi.number().min(1).optional(),
  target_publishing: Joi.object().optional(),
  publishing_status: Joi.string().valid('draft', 'published', 'archived').optional(),
  status: Joi.string().valid('active', 'inactive', 'draft').optional()
}).unknown(true);

const miningGalleryPhotoSchema = Joi.object({
  url: Joi.string().allow('', null).optional(),
  title: Joi.string().allow('', null).optional(),
  is_cover: Joi.boolean().default(false)
});

const miningGalleryVideoSchema = Joi.object({
  title: Joi.string().trim().required(),
  url: Joi.string().allow('', null).optional(),
  youtube_url: Joi.string().uri().allow('', null).optional(),
  thumbnail: Joi.string().allow('', null).optional(),
  duration: Joi.string().allow('', null).optional(),
  source_type: Joi.string().valid('upload', 'youtube').default('upload')
});

const miningPhoneOtpVerifySchema = Joi.object({
  phone: Joi.string().required(),
  otp: Joi.string().length(6).required()
});

const miningEmailVerifySchema = Joi.object({
  email: Joi.string().email().required(),
  token: Joi.string().required()
});

const miningBusinessVerifySchema = Joi.object({
  registration_type: Joi.string().required(),
  registration_number: Joi.string().required()
}).unknown(true);

const miningGstVerifySchema = Joi.object({
  gstin: Joi.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/).required()
}).unknown(true);

const miningBankVerifySchema = Joi.object({
  account_holder_name: Joi.string().required(),
  bank_name: Joi.string().required(),
  account_number: Joi.string().required(),
  ifsc_code: Joi.string().required()
}).unknown(true);

const miningDocumentUploadSchema = Joi.object({
  title: Joi.string().required(),
  document_type: Joi.string().valid(
    'mining_lease',
    'mining_permit',
    'environment_clearance',
    'pollution_noc',
    'business_registration',
    'other'
  ).default('other')
}).unknown(true);

const miningAnalyticsEventSchema = Joi.object({
  event_type: Joi.string().valid(
    'profile_view',
    'product_view',
    'contact_click',
    'inquiry_started',
    'business_save',
    'gallery_view',
    'video_view',
    'ad_impression',
    'ad_click'
  ).required(),
  entity_type: Joi.string().valid('profile', 'product', 'ad', 'gallery').default('profile'),
  entity_id: Joi.string().optional(),
  metadata: Joi.object().optional()
});

module.exports = {
  updateMiningProfileSchema,
  updateMiningOperationalSpecsSchema,
  miningMachinerySchema,
  miningMachineryUpdateSchema,
  excavatedStoneVarietySchema,
  miningContactSchema,
  miningProductWizardSchema,
  miningProductUpdateSchema,
  miningGalleryPhotoSchema,
  miningGalleryVideoSchema,
  miningPhoneOtpVerifySchema,
  miningEmailVerifySchema,
  miningBusinessVerifySchema,
  miningGstVerifySchema,
  miningBankVerifySchema,
  miningDocumentUploadSchema,
  miningAnalyticsEventSchema
};
