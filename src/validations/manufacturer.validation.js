const Joi = require('joi');

const updateProfileSchema = Joi.object({
  company_name: Joi.string().trim().max(200).optional(),
  logo: Joi.string().uri().allow('', null).optional(),
  cover_image: Joi.string().uri().allow('', null).optional(),
  property_type: Joi.string().allow('', null).optional(),
  factory_type: Joi.string().valid('owned', 'rented').optional(),
  premises_status: Joi.string().valid('owned', 'rented').optional(),
  unit_status: Joi.string().valid('export', 'domestic', 'both').optional(),
  is_export_unit: Joi.boolean().optional(),
  iec_number: Joi.string().trim().allow('', null).optional(),
  gst_number: Joi.string().trim().allow('', null).optional(),
  established_year: Joi.number().integer().min(1900).max(new Date().getFullYear()).optional(),
  monthly_capacity: Joi.number().min(0).optional(),
  capacity_unit: Joi.string().allow('', null).optional(),
  factory_timings: Joi.string().allow('', null).optional(),
  about_business: Joi.string().allow('', null).optional(),
  company_details: Joi.string().allow('', null).optional(),
  export_countries: Joi.array().items(Joi.string()).optional(),
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
});

const updateFactorySpecsSchema = Joi.object({
  monthly_capacity: Joi.number().min(0).required(),
  capacity_unit: Joi.string().default('Sq.Ft'),
  unit_status: Joi.string().valid('export', 'domestic', 'both').required(),
  is_export_unit: Joi.boolean().optional(),
  iec_number: Joi.string().trim().allow('', null).optional(),
  premises_status: Joi.string().valid('owned', 'rented').default('owned'),
  factory_type: Joi.string().valid('owned', 'rented').default('owned'),
  factory_timings: Joi.string().allow('', null).optional(),
  export_countries: Joi.array().items(Joi.string()).optional()
});

const machinerySchema = Joi.object({
  machine_name: Joi.string().trim().required(),
  quantity: Joi.number().integer().min(1).default(1),
  description: Joi.string().trim().allow('', null).optional(),
  category: Joi.string().trim().allow('', null).optional()
});

const machineryUpdateSchema = Joi.object({
  machine_name: Joi.string().trim().optional(),
  quantity: Joi.number().integer().min(1).optional(),
  description: Joi.string().trim().allow('', null).optional(),
  category: Joi.string().trim().allow('', null).optional()
});

const stoneVarietySchema = Joi.object({
  granite_color_id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  name: Joi.string().trim().optional(),
  category: Joi.string().trim().allow('', null).optional(),
  finish: Joi.string().trim().allow('', null).optional()
}).or('granite_color_id', 'name');

const contactSchema = Joi.object({
  name: Joi.string().trim().required(),
  designation: Joi.string().trim().required(),
  phone: Joi.string().pattern(/^[0-9+ -]{7,15}$/).required(),
  whatsapp: Joi.string().pattern(/^[0-9+ -]{7,15}$/).allow('', null).optional(),
  email: Joi.string().email().allow('', null).optional(),
  photo: Joi.string().allow('', null).optional(),
  birth_date: Joi.date().iso().allow(null).optional(),
  anniversary_date: Joi.date().iso().allow(null).optional(),
  is_primary: Joi.boolean().default(false)
});

const productWizardSchema = Joi.object({
  // Step 1: Basic Information & Media
  name: Joi.string().trim().required(),
  material: Joi.string().trim().required(),
  description: Joi.string().trim().required(),
  images: Joi.array().items(Joi.string()).max(5).default([]),
  cover_image: Joi.string().allow('', null).optional(),

  // Step 2: Specifications
  pattern: Joi.string().allow('', null).optional(),
  finish: Joi.string().allow('', null).optional(),
  size: Joi.string().allow('', null).optional(),
  thickness: Joi.string().allow('', null).optional(),
  quality: Joi.string().allow('', null).optional(),
  approx_weight: Joi.string().allow('', null).optional(),
  country_of_origin: Joi.string().default('India'),
  applications: Joi.array().items(Joi.string()).optional(),
  specifications: Joi.array().items(Joi.object({
    key: Joi.string().required(),
    value: Joi.string().required()
  })).optional(),
  graniteColors: Joi.array().items(Joi.string()).optional(),

  // Step 3: Pricing & Stock
  selling_price: Joi.number().min(0).optional(),
  pricing_unit: Joi.string().valid('Sq.ft', 'Sq.m', 'Slabs', 'Pieces', 'Tons').default('Sq.ft'),
  quantity: Joi.number().min(0).optional(),
  quantity_unit: Joi.string().valid('Sq.ft', 'Sq.m', 'Slabs', 'Pieces', 'Tons').default('Sq.ft'),
  available_stock: Joi.number().min(0).optional(),
  stock_unit: Joi.string().valid('Sq.ft', 'Sq.m', 'Slabs', 'Pieces', 'Tons').default('Sq.ft'),
  availability_status: Joi.string().valid('in_stock', 'out_of_stock', 'made_to_order').default('in_stock'),
  stock_status: Joi.string().valid('in_stock', 'out_of_stock', 'on_order').optional(),

  // Step 4: Target Publishing & Lifecycle
  target_publishing: Joi.object({
    states: Joi.array().items(Joi.string()).default([]),
    districts: Joi.array().items(Joi.string()).default([]),
    categories: Joi.array().items(Joi.string()).default([])
  }).optional(),
  publishing_status: Joi.string().valid('draft', 'published', 'archived').default('draft'),
  status: Joi.string().valid('active', 'inactive', 'draft').optional()
});

const productUpdateSchema = Joi.object({
  name: Joi.string().trim().optional(),
  material: Joi.string().trim().optional(),
  description: Joi.string().trim().optional(),
  images: Joi.array().items(Joi.string()).max(5).optional(),
  cover_image: Joi.string().allow('', null).optional(),
  pattern: Joi.string().allow('', null).optional(),
  finish: Joi.string().allow('', null).optional(),
  size: Joi.string().allow('', null).optional(),
  thickness: Joi.string().allow('', null).optional(),
  quality: Joi.string().allow('', null).optional(),
  approx_weight: Joi.string().allow('', null).optional(),
  country_of_origin: Joi.string().optional(),
  applications: Joi.array().items(Joi.string()).optional(),
  specifications: Joi.array().items(Joi.object({
    key: Joi.string().required(),
    value: Joi.string().required()
  })).optional(),
  graniteColors: Joi.array().items(Joi.string()).optional(),
  selling_price: Joi.number().min(0).optional(),
  pricing_unit: Joi.string().valid('Sq.ft', 'Sq.m', 'Slabs', 'Pieces', 'Tons').optional(),
  quantity: Joi.number().min(0).optional(),
  quantity_unit: Joi.string().valid('Sq.ft', 'Sq.m', 'Slabs', 'Pieces', 'Tons').optional(),
  available_stock: Joi.number().min(0).optional(),
  stock_unit: Joi.string().valid('Sq.ft', 'Sq.m', 'Slabs', 'Pieces', 'Tons').optional(),
  availability_status: Joi.string().valid('in_stock', 'out_of_stock', 'made_to_order').optional(),
  target_publishing: Joi.object({
    states: Joi.array().items(Joi.string()).default([]),
    districts: Joi.array().items(Joi.string()).default([]),
    categories: Joi.array().items(Joi.string()).default([])
  }).optional(),
  publishing_status: Joi.string().valid('draft', 'published', 'archived').optional(),
  status: Joi.string().valid('active', 'inactive', 'draft').optional()
});

const galleryPhotoSchema = Joi.object({
  url: Joi.string().allow('', null).optional(),
  is_cover: Joi.boolean().default(false),
  title: Joi.string().allow('', null).optional()
});

const galleryVideoSchema = Joi.object({
  title: Joi.string().trim().required(),
  url: Joi.string().allow('', null).optional(),
  youtube_url: Joi.string().allow('', null).optional(),
  thumbnail: Joi.string().allow('', null).optional(),
  duration: Joi.string().allow('', null).optional(),
  source_type: Joi.string().valid('upload', 'youtube').default('upload')
}).or('url', 'youtube_url');

const phoneOtpVerifySchema = Joi.object({
  phone: Joi.string().optional(),
  otp: Joi.string().trim().length(6).required()
});

const emailVerifySchema = Joi.object({
  email: Joi.string().email().optional(),
  token: Joi.string().trim().required()
});

const businessVerifySchema = Joi.object({
  registration_type: Joi.string().required(),
  registration_number: Joi.string().required(),
  document_url: Joi.string().allow('', null).optional()
});

const gstVerifySchema = Joi.object({
  gstin: Joi.string().pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/).required().messages({
    'string.pattern.base': 'Please provide a valid 15-character GSTIN format'
  }),
  certificate_url: Joi.string().allow('', null).optional()
});

const bankVerifySchema = Joi.object({
  account_holder_name: Joi.string().trim().required(),
  bank_name: Joi.string().trim().required(),
  account_number: Joi.string().trim().min(8).max(20).required(),
  ifsc_code: Joi.string().pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/).required().messages({
    'string.pattern.base': 'Please provide a valid 11-character Indian IFSC code'
  }),
  cheque_document_url: Joi.string().allow('', null).optional()
});

const documentUploadSchema = Joi.object({
  document_type: Joi.string().valid('gst_certificate', 'business_license', 'pan_card', 'cancelled_cheque', 'other').required(),
  title: Joi.string().trim().optional(),
  url: Joi.string().allow('', null).optional()
});

const analyticsEventSchema = Joi.object({
  eventType: Joi.string().valid(
    'profile_view', 'contact_click', 'call_click', 'whatsapp_click', 'email_click',
    'product_view', 'service_view', 'image_view', 'video_view', 'business_save',
    'inquiry_received', 'quote_request', 'profile_scroll', 'time_spent'
  ).required(),
  productId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null, '').optional(),
  serviceId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null, '').optional(),
  source: Joi.string().valid('Marketplace Search', 'Category Pages', 'Service Detail', 'Advertisement', 'Others').default('Marketplace Search'),
  location: Joi.object({
    city: Joi.string().allow('', null).optional(),
    state: Joi.string().allow('', null).optional(),
    country: Joi.string().allow('', null).optional()
  }).optional(),
  metadata: Joi.object({
    duration_seconds: Joi.number().min(0).optional(),
    scroll_depth: Joi.number().min(0).max(100).optional(),
    referrer: Joi.string().allow('', null).optional()
  }).optional()
});

module.exports = {
  updateProfileSchema,
  updateFactorySpecsSchema,
  machinerySchema,
  machineryUpdateSchema,
  stoneVarietySchema,
  contactSchema,
  productWizardSchema,
  productUpdateSchema,
  galleryPhotoSchema,
  galleryVideoSchema,
  phoneOtpVerifySchema,
  emailVerifySchema,
  businessVerifySchema,
  gstVerifySchema,
  bankVerifySchema,
  documentUploadSchema,
  analyticsEventSchema
};
