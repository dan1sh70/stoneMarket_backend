const Joi = require('joi');

const updateShowroomProfileSchema = Joi.object({
  company_name: Joi.string().trim().max(200).optional(),
  logo: Joi.string().uri().allow('', null).optional(),
  cover_image: Joi.string().uri().allow('', null).optional(),
  business_category: Joi.string().default('Godown & Showrooms').optional(),
  business_subcategory: Joi.string().allow('', null).optional(),
  short_description: Joi.string().max(300).allow('', null).optional(),
  about_business: Joi.string().allow('', null).optional(),
  established_year: Joi.number().integer().min(1900).max(new Date().getFullYear()).optional(),
  gst_number: Joi.string().trim().allow('', null).optional(),
  business_registration_number: Joi.string().trim().allow('', null).optional(),
  showroom_type: Joi.string().valid(
    'Retail Showroom',
    'Wholesale Godown',
    'Retail & Wholesale',
    'Stone Warehouse',
    'Distribution Centre'
  ).optional(),
  total_display_area: Joi.number().min(0).optional(),
  display_area_unit: Joi.string().valid('Sq.ft', 'Sq.m').default('Sq.ft').optional(),
  total_storage_capacity: Joi.number().min(0).optional(),
  storage_capacity_unit: Joi.string().valid('Ton', 'Sq.ft', 'Cubic Meter', 'Sq.m').default('Sq.ft').optional(),
  stone_categories_available: Joi.array().items(Joi.string()).optional(),
  factory_timings: Joi.string().allow('', null).optional(),
  working_hours: Joi.object().optional(),
  address: Joi.object({
    full_address: Joi.string().allow('', null).optional(),
    showroom_address: Joi.string().allow('', null).optional(),
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

const updateShowroomSpecsSchema = Joi.object({
  showroom_type: Joi.string().valid(
    'Retail Showroom',
    'Wholesale Godown',
    'Retail & Wholesale',
    'Stone Warehouse',
    'Distribution Centre'
  ).required(),
  total_display_area: Joi.number().min(0).required(),
  display_area_unit: Joi.string().valid('Sq.ft', 'Sq.m').default('Sq.ft'),
  total_storage_capacity: Joi.number().min(0).required(),
  storage_capacity_unit: Joi.string().valid('Ton', 'Sq.ft', 'Cubic Meter', 'Sq.m').default('Sq.ft'),
  stone_categories_available: Joi.array().items(Joi.string()).min(1).required(),
  factory_timings: Joi.string().allow('', null).optional(),
  working_hours: Joi.object().optional()
}).unknown(true);

const showroomContactSchema = Joi.object({
  name: Joi.string().trim().required(),
  designation: Joi.string().trim().default('Showroom Partner / Director'),
  phone: Joi.string().trim().required(),
  email: Joi.string().email().allow('', null).optional(),
  whatsapp: Joi.string().trim().allow('', null).optional(),
  is_primary: Joi.boolean().default(false),
  birth_date: Joi.date().iso().allow(null).optional(),
  anniversary_date: Joi.date().iso().allow(null).optional(),
  photo: Joi.string().allow('', null).optional()
});

const showroomProductWizardSchema = Joi.object({
  // STEP 1: BASIC & MEDIA
  name: Joi.string().trim().required(),
  material: Joi.string().valid(
    'Granite',
    'Marble',
    'Sandstone',
    'Limestone',
    'Quartzite',
    'Slate',
    'Travertine',
    'Onyx',
    'Engineered Stone',
    'Tiles',
    'Other'
  ).required(),
  short_description: Joi.string().trim().max(200).required(),
  description: Joi.string().trim().allow('', null).optional(),
  product_origin: Joi.string().trim().allow('', null).optional(),
  images: Joi.array().items(Joi.string()).max(5).optional(),
  cover_image: Joi.string().allow('', null).optional(),

  // STEP 2: SPECIFICATIONS
  pattern: Joi.string().valid(
    'Plain / Solid',
    'Veined',
    'Galaxy',
    'Bookmatch',
    'Speckled',
    'Grain',
    'Natural Pattern',
    'Other'
  ).default('Plain / Solid'),
  finish: Joi.string().valid(
    'Polished',
    'High Gloss Polished',
    'Mirror Polished',
    'Honed',
    'Leather Finish',
    'Flamed',
    'Brushed',
    'Sandblasted',
    'Natural',
    'Other'
  ).default('Polished'),
  size: Joi.string().required(),
  thickness: Joi.string().required(),
  quality: Joi.string().valid(
    'Commercial',
    'Standard',
    'Premium',
    'Super Premium',
    'Export Quality'
  ).default('Standard'),
  application: Joi.string().trim().allow('', null).optional(),
  approx_weight: Joi.string().allow('', null).optional(),
  weight: Joi.number().min(0).optional(),
  weight_unit: Joi.string().valid('Kg / Sq.ft', 'Kg / Sq.m', 'Kg / Piece', 'TON', 'KG').default('Kg / Sq.ft'),
  country_of_origin: Joi.string().default('India'),

  // STEP 3: PRICING & STOCK
  selling_price: Joi.number().min(0).required(),
  price: Joi.number().min(0).optional(),
  pricing_unit: Joi.string().valid(
    'Per Sq.ft',
    'Per Sq.m',
    'Per Piece',
    'Per Slab',
    'Per Ton',
    'Per Kg',
    'Sq.ft'
  ).default('Per Sq.ft'),
  quantity: Joi.number().min(0).required(),
  quantity_unit: Joi.string().valid(
    'Slabs',
    'Tiles',
    'Pieces',
    'Blocks',
    'Tons',
    'Sq.ft',
    'Sq.m'
  ).default('Sq.ft'),
  available_stock: Joi.number().min(0).required(),
  stock: Joi.number().min(0).optional(),
  stock_unit: Joi.string().valid(
    'Slabs',
    'Tiles',
    'Pieces',
    'Blocks',
    'Tons',
    'Sq.ft',
    'Sq.m'
  ).default('Sq.ft'),
  availability_status: Joi.string().valid(
    'In Stock',
    'Limited Stock',
    'Out of Stock',
    'Available on Order',
    'Discontinued',
    'in_stock',
    'limited_stock',
    'out_of_stock',
    'available_on_order',
    'discontinued'
  ).default('In Stock'),
  low_stock_threshold: Joi.number().min(0).default(10),
  min_order_quantity: Joi.number().min(1).default(1),

  // STEP 4: REVIEW & PUBLISH (Target Area & Categories)
  target_publishing: Joi.object({
    all_india: Joi.boolean().default(false),
    states: Joi.array().items(Joi.string()).default([]),
    districts: Joi.array().items(Joi.string()).default([]),
    categories: Joi.array().items(Joi.string()).default([])
  }).optional(),
  category: Joi.string().allow('', null).optional(),
  subcategory: Joi.string().allow('', null).optional(),
  categories: Joi.array().items(Joi.string()).optional(),
  publishing_status: Joi.string().valid('draft', 'published', 'archived').default('published'),
  status: Joi.string().valid('active', 'inactive', 'draft').default('active')
}).unknown(true);

const showroomProductUpdateSchema = Joi.object({
  name: Joi.string().trim().optional(),
  material: Joi.string().valid(
    'Granite',
    'Marble',
    'Sandstone',
    'Limestone',
    'Quartzite',
    'Slate',
    'Travertine',
    'Onyx',
    'Engineered Stone',
    'Tiles',
    'Other'
  ).optional(),
  short_description: Joi.string().trim().max(200).optional(),
  description: Joi.string().trim().allow('', null).optional(),
  product_origin: Joi.string().trim().allow('', null).optional(),
  images: Joi.array().items(Joi.string()).max(5).optional(),
  cover_image: Joi.string().allow('', null).optional(),
  pattern: Joi.string().optional(),
  finish: Joi.string().optional(),
  size: Joi.string().optional(),
  thickness: Joi.string().optional(),
  quality: Joi.string().optional(),
  application: Joi.string().allow('', null).optional(),
  approx_weight: Joi.string().allow('', null).optional(),
  weight: Joi.number().min(0).optional(),
  weight_unit: Joi.string().optional(),
  country_of_origin: Joi.string().optional(),
  selling_price: Joi.number().min(0).optional(),
  price: Joi.number().min(0).optional(),
  pricing_unit: Joi.string().optional(),
  quantity: Joi.number().min(0).optional(),
  quantity_unit: Joi.string().optional(),
  available_stock: Joi.number().min(0).optional(),
  stock: Joi.number().min(0).optional(),
  stock_unit: Joi.string().optional(),
  availability_status: Joi.string().optional(),
  low_stock_threshold: Joi.number().min(0).optional(),
  min_order_quantity: Joi.number().min(1).optional(),
  target_publishing: Joi.object().optional(),
  categories: Joi.array().items(Joi.string()).optional(),
  status: Joi.string().valid('active', 'inactive', 'draft').optional(),
  publishing_status: Joi.string().valid('draft', 'published', 'archived').optional()
}).unknown(true);

const stockAdjustmentSchema = Joi.object({
  change_type: Joi.string().valid('set', 'increase', 'decrease', 'adjustment').required(),
  stock_value: Joi.number().min(0).required(),
  change_reason: Joi.string().trim().max(300).default('Showroom manual stock update'),
  updated_by: Joi.string().trim().default('Showroom Manager')
});

const showroomGalleryPhotoSchema = Joi.object({
  url: Joi.string().allow('', null).optional(),
  title: Joi.string().allow('', null).optional(),
  category: Joi.string().valid(
    'showroom',
    'godown',
    'product_display',
    'storage_area',
    'interior',
    'exterior',
    'other'
  ).default('showroom'),
  is_cover: Joi.boolean().default(false)
});

const showroomGalleryVideoSchema = Joi.object({
  title: Joi.string().trim().required(),
  url: Joi.string().allow('', null).optional(),
  youtube_url: Joi.string().uri().allow('', null).optional(),
  thumbnail: Joi.string().allow('', null).optional(),
  duration: Joi.string().allow('', null).optional(),
  source_type: Joi.string().valid('upload', 'youtube').default('upload'),
  video_type: Joi.string().valid(
    'walkthrough',
    'product_video',
    'introduction',
    'warehouse'
  ).default('walkthrough')
});

const showroomPhoneOtpVerifySchema = Joi.object({
  phone: Joi.string().required(),
  otp: Joi.string().length(6).required()
});

const showroomEmailVerifySchema = Joi.object({
  email: Joi.string().email().required(),
  token: Joi.string().required()
});

const showroomBusinessVerifySchema = Joi.object({
  registration_type: Joi.string().required(),
  registration_number: Joi.string().required()
}).unknown(true);

const showroomGstVerifySchema = Joi.object({
  gstin: Joi.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/).required()
}).unknown(true);

const showroomBankVerifySchema = Joi.object({
  account_holder_name: Joi.string().required(),
  bank_name: Joi.string().required(),
  account_number: Joi.string().required(),
  ifsc_code: Joi.string().required()
}).unknown(true);

const showroomDocumentUploadSchema = Joi.object({
  title: Joi.string().required(),
  document_type: Joi.string().valid(
    'gst_certificate',
    'business_registration',
    'shop_establishment',
    'trade_license',
    'warehouse_registration',
    'other'
  ).default('other')
}).unknown(true);

const showroomAnalyticsEventSchema = Joi.object({
  event_type: Joi.string().valid(
    'profile_view',
    'product_view',
    'contact_click',
    'inquiry_started',
    'business_save',
    'gallery_view',
    'video_view',
    'ad_impression',
    'ad_click',
    'stock_check'
  ).required(),
  entity_type: Joi.string().valid('profile', 'product', 'ad', 'gallery', 'stock').default('profile'),
  entity_id: Joi.string().optional(),
  metadata: Joi.object().optional()
});

module.exports = {
  updateShowroomProfileSchema,
  updateShowroomSpecsSchema,
  showroomContactSchema,
  showroomProductWizardSchema,
  showroomProductUpdateSchema,
  stockAdjustmentSchema,
  showroomGalleryPhotoSchema,
  showroomGalleryVideoSchema,
  showroomPhoneOtpVerifySchema,
  showroomEmailVerifySchema,
  showroomBusinessVerifySchema,
  showroomGstVerifySchema,
  showroomBankVerifySchema,
  showroomDocumentUploadSchema,
  showroomAnalyticsEventSchema
};
