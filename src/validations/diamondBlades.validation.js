const Joi = require('joi');

const updateDiamondBladesProfileSchema = Joi.object({
  company_name: Joi.string().trim().max(150),
  gst_number: Joi.string().trim().uppercase().allow('', null),
  email: Joi.string().email().allow('', null),
  phone: Joi.string().trim().allow('', null),
  established_year: Joi.number().integer().min(1900).max(new Date().getFullYear()),
  about_business: Joi.string().trim().allow('', null),
  short_description: Joi.string().trim().allow('', null),
  blade_segment_categories: Joi.array().items(Joi.string().trim()),
  authorized_blade_brands: Joi.array().items(Joi.string().trim()),
  daily_segment_production_capacity: Joi.string().trim().allow('', null),
  custom_matrix_formulation: Joi.string().trim().allow('', null),
  laser_welding_facility: Joi.string().trim().allow('', null),
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

const createDiamondBladesProductSchema = Joi.object({
  // STEP 1 – BASIC & MEDIA
  name: Joi.string().trim().required(),
  category: Joi.string().trim().required(),
  description: Joi.string().trim().allow('', null),
  short_description: Joi.string().trim().allow('', null),
  images: Joi.array().items(Joi.string().trim()),
  cover_image: Joi.string().trim().allow('', null),
  technical_drawings: Joi.array().items(Joi.string().trim()),
  equipment_brochures: Joi.array().items(Joi.string().trim()),
  product_datasheets: Joi.array().items(Joi.string().trim()),
  certification_documents: Joi.array().items(Joi.string().trim()),

  // STEP 2 – TECHNICAL SPECIFICATIONS & DIAMOND PROPERTIES
  material_grade: Joi.string().trim().required(), // Material Grade & Specifications (Required)
  brand_name: Joi.string().trim().required(), // Brand / Manufacturer & Model (Required)
  manufacturer: Joi.string().trim().allow('', null),
  model_number: Joi.string().trim().allow('', null),
  part_number: Joi.string().trim().allow('', null),
  oem_number: Joi.string().trim().allow('', null),
  oem_brand_compatibility: Joi.string().trim().allow('', null),
  warranty_guarantee: Joi.string().trim().allow('', null),
  machine_compatibility: Joi.string().trim().allow('', null),
  blade_diameter_mm: Joi.number().allow(null),
  bore_diameter_mm: Joi.number().allow(null),
  segment_height_mm: Joi.number().allow(null),
  segment_thickness_mm: Joi.number().allow(null),
  segment_length_mm: Joi.number().allow(null),
  segment_width_mm: Joi.number().allow(null),
  core_thickness_mm: Joi.number().allow(null),
  number_of_segments: Joi.number().allow(null),
  diamond_grit_size: Joi.string().trim().allow('', null),
  diamond_concentration: Joi.string().trim().allow('', null),
  bond_type: Joi.string().trim().allow('', null),
  bond_hardness: Joi.string().trim().allow('', null),
  cutting_method: Joi.string().valid('Wet', 'Dry', 'Wet / Dry', 'Wet/Dry').default('Wet'),
  compatible_material: Joi.array().items(Joi.string().trim()),
  technical_specifications: Joi.object().unknown(true),

  // STEP 3 – PRICING & STOCK
  selling_price: Joi.number().min(0).required(),
  price: Joi.number().min(0),
  pricing_unit: Joi.string().valid(
    'Per Piece',
    'Per Set',
    'Per Blade',
    'Per Segment',
    'Per Box',
    'Per Pack',
    'Per Meter',
    'Per Kilogram',
    'Per Unit',
    'Custom'
  ).required(),
  min_order_quantity: Joi.number().min(1).default(1),
  available_stock: Joi.number().min(0).default(1),
  stock: Joi.number().min(0),
  stock_unit: Joi.string().trim().default('Pieces'),
  availability_status: Joi.string().valid(
    'In Stock',
    'Out of Stock',
    'Made to Order',
    'Available on Request',
    'in_stock',
    'out_of_stock',
    'available_on_order',
    'made_to_order'
  ).default('In Stock'),
  delivery_available: Joi.boolean().default(true),
  installation_available: Joi.boolean().default(false),
  after_sales_support: Joi.boolean().default(true),
  service_support: Joi.boolean().default(true),

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

const updateDiamondBladesProductSchema = createDiamondBladesProductSchema.fork(
  ['name', 'category', 'material_grade', 'brand_name', 'selling_price', 'pricing_unit'],
  (schema) => schema.optional()
);

const updateDiamondBladesStockSchema = Joi.object({
  stock: Joi.number().min(0).required(),
  available_stock: Joi.number().min(0),
  stock_unit: Joi.string().trim().allow('', null),
  availability_status: Joi.string().valid(
    'In Stock',
    'Out of Stock',
    'Made to Order',
    'Available on Request',
    'in_stock',
    'out_of_stock',
    'available_on_order',
    'made_to_order'
  ),
  change_type: Joi.string().valid('set', 'add', 'subtract', 'increase', 'decrease').default('set'),
  notes: Joi.string().trim().allow('', null)
});

const diamondBladesContactSchema = Joi.object({
  name: Joi.string().trim().required(),
  designation: Joi.string().trim().required(),
  phone: Joi.string().trim().required(),
  whatsapp: Joi.string().trim().allow('', null),
  email: Joi.string().email().allow('', null),
  is_primary: Joi.boolean().default(false)
});

const diamondBladesGalleryPhotoSchema = Joi.object({
  title: Joi.string().trim().allow('', null),
  caption: Joi.string().trim().allow('', null),
  category: Joi.string().valid('blades', 'segments', 'facility', 'testing', 'cutting_demo', 'finished_stone', 'other').default('blades'),
  is_cover: Joi.boolean().default(false),
  url: Joi.string().uri().allow('', null)
});

const diamondBladesGalleryVideoSchema = Joi.object({
  title: Joi.string().trim().required(),
  video_url: Joi.string().uri().allow('', null),
  youtube_url: Joi.string().uri().allow('', null),
  source_type: Joi.string().valid('upload', 'youtube').default('upload'),
  category: Joi.string().valid('blade_cutting_demo', 'segment_brazing', 'factory_tour', 'testing_lab').default('blade_cutting_demo'),
  duration: Joi.string().trim().allow('', null)
});

const diamondBladesGstVerifySchema = Joi.object({
  gstin: Joi.string().trim().uppercase().required()
});

const diamondBladesAnalyticsEventSchema = Joi.object({
  event_type: Joi.string().valid('profile_view', 'contact_click', 'call_click', 'whatsapp_click', 'product_view', 'product_inquiry').required(),
  product_id: Joi.string().hex().length(24).allow(null, ''),
  metadata: Joi.object().unknown(true)
});

module.exports = {
  updateDiamondBladesProfileSchema,
  createDiamondBladesProductSchema,
  updateDiamondBladesProductSchema,
  updateDiamondBladesStockSchema,
  diamondBladesContactSchema,
  diamondBladesGalleryPhotoSchema,
  diamondBladesGalleryVideoSchema,
  diamondBladesGstVerifySchema,
  diamondBladesAnalyticsEventSchema
};

