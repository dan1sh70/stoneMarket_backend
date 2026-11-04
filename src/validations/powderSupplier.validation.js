const Joi = require('joi');

const updatePowderSupplierProfileSchema = Joi.object({
  company_name: Joi.string().trim().max(150),
  gst_number: Joi.string().trim().uppercase().allow('', null),
  email: Joi.string().email().allow('', null),
  phone: Joi.string().trim().allow('', null),
  established_year: Joi.number().integer().min(1900).max(new Date().getFullYear()),
  about_business: Joi.string().trim().allow('', null),
  short_description: Joi.string().trim().allow('', null),
  mineral_categories: Joi.array().items(Joi.string().trim()),
  monthly_grinding_capacity: Joi.string().trim().allow('', null),
  micronizing_facility: Joi.string().trim().allow('', null),
  annual_mineral_supply_volume: Joi.string().trim().allow('', null),
  address: Joi.object({
    state: Joi.string().trim().allow('', null),
    district: Joi.string().trim().allow('', null),
    area: Joi.string().trim().allow('', null),
    industrial_area: Joi.string().trim().allow('', null),
    commercial_area: Joi.string().trim().allow('', null),
    office_address: Joi.string().trim().allow('', null),
    full_address: Joi.string().trim().allow('', null),
    postal_code: Joi.string().trim().allow('', null),
    country: Joi.string().trim().default('India'),
    google_map_location: Joi.string().trim().allow('', null),
    latitude: Joi.number().allow(null),
    longitude: Joi.number().allow(null)
  })
});

const createPowderProductSchema = Joi.object({
  // STEP 1 – BASIC & MEDIA
  name: Joi.string().trim().required(), // Product / Mineral Title (Required)
  product_name: Joi.string().trim().allow('', null),
  mineral_type: Joi.string().trim().allow('', null),
  application_type: Joi.string().trim().allow('', null),
  category: Joi.string().trim().required(), // Mineral Category (Required)
  description: Joi.string().trim().allow('', null),
  short_description: Joi.string().trim().allow('', null),
  chemical_name: Joi.string().trim().allow('', null),
  chemical_formula: Joi.string().trim().allow('', null),
  images: Joi.array().items(Joi.string().trim()),
  cover_image: Joi.string().trim().allow('', null),
  videos: Joi.array().items(Joi.string().trim()),
  product_datasheets: Joi.array().items(Joi.string().trim()),
  laboratory_test_reports: Joi.array().items(Joi.string().trim()),
  msds_documents: Joi.array().items(Joi.string().trim()),
  certification_documents: Joi.array().items(Joi.string().trim()),

  // STEP 2 – SPECIFICATIONS
  mesh_size: Joi.string().trim().required(), // Mesh Size / Micron Particle Rating (Required)
  micron_rating: Joi.string().trim().allow('', null),
  whiteness_purity: Joi.string().trim().allow('', null), // Whiteness & Chemical Purity (Required string helper)
  chemical_purity: Joi.string().trim().required(), // Whiteness & Chemical Purity (Required)
  whiteness_percentage: Joi.number().min(0).max(100).allow(null),
  brightness_percentage: Joi.number().min(0).max(100).allow(null),
  moisture_percentage: Joi.number().min(0).max(100).allow(null),
  calcium_carbonate_purity: Joi.alternatives().try(Joi.string().trim(), Joi.number()).allow('', null),
  packaging_standard: Joi.string().trim().default('50 Kg HDPE Bags / 1 Ton Jumbo Bags'),
  coating_type: Joi.string().trim().allow('', null),
  industrial_application: Joi.string().trim().allow('', null),
  material_grade: Joi.string().trim().allow('', null),
  brand_name: Joi.string().trim().default('Shree Krishna Micron Minerals'),
  manufacturer: Joi.string().trim().allow('', null),
  technical_specifications: Joi.object().unknown(true),

  // STEP 3 – PRICING & SUPPLY
  selling_price: Joi.number().min(0).required(), // Price / Rate (Required)
  price: Joi.number().min(0),
  pricing_unit: Joi.string().valid(
    'Per Metric Ton (MT)',
    'Per Metric Ton',
    'Per Kilogram (KG)',
    'Per KG',
    'Per 50 KG Bag',
    'Per 25 KG Bag',
    'Per Bag',
    'Per Quintal',
    'Per Container',
    'Per Lot',
    'Custom'
  ).default('Per Metric Ton (MT)'),
  monthly_supply_capacity: Joi.string().trim().default('5,000 MT / Month'),
  min_order_quantity: Joi.number().min(1).default(10), // e.g., 10 MT
  available_stock: Joi.number().min(0).default(50),
  stock: Joi.number().min(0),
  stock_unit: Joi.string().trim().default('MT'),
  availability_status: Joi.string().valid(
    'Ready Stock',
    'Made to Order',
    'Regular Monthly Supply',
    'Available on Request',
    'Limited Stock',
    'In Stock',
    'Out of Stock',
    'in_stock',
    'out_of_stock',
    'made_to_order'
  ).default('Ready Stock'),
  packaging_type: Joi.string().trim().default('50 KG HDPE Bags'),
  dispatch_location: Joi.string().trim().default('Alwar / Rajsamand, Rajasthan'),
  transportation_available: Joi.boolean().default(true),
  sample_available: Joi.boolean().default(true),
  delivery_available: Joi.boolean().default(true),
  after_sales_support: Joi.boolean().default(true),

  // STEP 4 – REVIEW & PUBLISH
  target_areas: Joi.array().items(
    Joi.object({
      state_name: Joi.string().trim().required(),
      districts: Joi.array().items(Joi.string().trim())
    })
  ),
  target_categories: Joi.array().items(Joi.string().trim()),
  status: Joi.string().valid('active', 'inactive', 'draft').default('active'),
  publishing_status: Joi.string().valid('draft', 'published', 'archived').default('published'),
  sku: Joi.string().trim().allow('', null)
});

const updatePowderProductSchema = createPowderProductSchema.fork(
  ['name', 'category', 'mesh_size', 'chemical_purity', 'selling_price'],
  (schema) => schema.optional()
);

const updatePowderStockSchema = Joi.object({
  stock: Joi.number().min(0).required(),
  available_stock: Joi.number().min(0),
  stock_unit: Joi.string().trim().allow('', null),
  availability_status: Joi.string().valid(
    'Ready Stock',
    'Made to Order',
    'Regular Monthly Supply',
    'Available on Request',
    'Limited Stock',
    'In Stock',
    'Out of Stock',
    'in_stock',
    'out_of_stock',
    'made_to_order'
  ),
  monthly_supply_capacity: Joi.string().trim().allow('', null),
  change_type: Joi.string().valid('set', 'add', 'subtract', 'increase', 'decrease').default('set'),
  notes: Joi.string().trim().allow('', null)
});

const powderSupplierContactSchema = Joi.object({
  name: Joi.string().trim().required(),
  designation: Joi.string().trim().required(),
  phone: Joi.string().trim().required(),
  whatsapp: Joi.string().trim().allow('', null),
  email: Joi.string().email().allow('', null),
  is_primary: Joi.boolean().default(false)
});

const powderSupplierGalleryPhotoSchema = Joi.object({
  title: Joi.string().trim().allow('', null),
  caption: Joi.string().trim().allow('', null),
  category: Joi.string().trim().default('processing_plant'),
  is_cover: Joi.boolean().default(false),
  url: Joi.string().uri().allow('', null)
});

const powderSupplierGalleryVideoSchema = Joi.object({
  title: Joi.string().trim().required(),
  video_url: Joi.string().uri().allow('', null),
  youtube_url: Joi.string().uri().allow('', null),
  source_type: Joi.string().valid('upload', 'youtube').default('upload'),
  category: Joi.string().trim().default('grinding_demo'),
  duration: Joi.string().trim().allow('', null)
});

const powderSupplierGstVerifySchema = Joi.object({
  gstin: Joi.string().trim().uppercase().required()
});

const powderSupplierAnalyticsEventSchema = Joi.object({
  event_type: Joi.string().valid('profile_view', 'contact_click', 'call_click', 'whatsapp_click', 'product_view', 'powder_view', 'product_inquiry', 'powder_inquiry').required(),
  product_id: Joi.string().hex().length(24).allow(null, ''),
  powder_id: Joi.string().hex().length(24).allow(null, ''),
  metadata: Joi.object().unknown(true)
});

module.exports = {
  updatePowderSupplierProfileSchema,
  createPowderProductSchema,
  updatePowderProductSchema,
  updatePowderStockSchema,
  powderSupplierContactSchema,
  powderSupplierGalleryPhotoSchema,
  powderSupplierGalleryVideoSchema,
  powderSupplierGstVerifySchema,
  powderSupplierAnalyticsEventSchema
};

