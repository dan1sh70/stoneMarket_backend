const Joi = require('joi');

const updateMachineryProfileSchema = Joi.object({
  company_name: Joi.string().trim().max(150),
  gst_number: Joi.string().trim().uppercase().allow('', null),
  email: Joi.string().email().allow('', null),
  phone: Joi.string().trim().allow('', null),
  established_year: Joi.number().integer().min(1900).max(new Date().getFullYear()),
  about_business: Joi.string().trim().allow('', null),
  short_description: Joi.string().trim().allow('', null),
  machinery_categories: Joi.array().items(Joi.string().trim()),
  oem_brands_supported: Joi.array().items(Joi.string().trim()),
  parts_manufacturing_capability: Joi.string().trim().allow('', null),
  industrial_supply_capability: Joi.string().trim().allow('', null),
  service_replacement_support: Joi.string().trim().allow('', null),
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

const createMachineryProductSchema = Joi.object({
  // Step 1: Basic & Media
  name: Joi.string().trim().required(),
  category: Joi.string().trim().required(),
  description: Joi.string().trim().allow('', null),
  short_description: Joi.string().trim().allow('', null),
  images: Joi.array().items(Joi.string().trim()),
  cover_image: Joi.string().trim().allow('', null),
  technical_drawings: Joi.array().items(Joi.string().trim()),

  // Step 2: Technical Specifications & Compatibility
  material_grade: Joi.string().trim().required(),
  oem_brand_compatibility: Joi.string().trim().required(),
  brand_name: Joi.string().trim().allow('', null),
  warranty_guarantee: Joi.string().trim().allow('', null),
  model_number: Joi.string().trim().allow('', null),
  part_number: Joi.string().trim().allow('', null),
  oem_number: Joi.string().trim().allow('', null),
  machine_compatibility: Joi.string().trim().allow('', null),
  technical_specifications: Joi.object().unknown(true),

  // Step 3: Pricing & Stock Quantity
  selling_price: Joi.number().min(0).required(),
  price: Joi.number().min(0),
  pricing_unit: Joi.string().valid(
    'Per Piece',
    'Per Unit',
    'Per Set',
    'Per Pair',
    'Per Box',
    'Per Kit',
    'Per Assembly',
    'Per Kg',
    'Per Meter',
    'Per Lot',
    'Custom'
  ).required(),
  min_order_quantity: Joi.number().min(1).default(1),
  available_stock: Joi.number().min(0).default(0),
  stock: Joi.number().min(0),
  stock_unit: Joi.string().trim().default('Units'),
  availability_status: Joi.string().valid(
    'In Stock',
    'Limited Stock',
    'Out of Stock',
    'Available on Order',
    'Made to Order',
    'Discontinued',
    'in_stock',
    'limited_stock',
    'out_of_stock',
    'available_on_order',
    'made_to_order',
    'discontinued'
  ).default('In Stock'),

  // Step 4: Target Area & Target Categories
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

const updateMachineryProductSchema = createMachineryProductSchema.fork(
  ['name', 'category', 'material_grade', 'oem_brand_compatibility', 'selling_price', 'pricing_unit'],
  (schema) => schema.optional()
);

const updateMachineryStockSchema = Joi.object({
  stock: Joi.number().min(0).required(),
  available_stock: Joi.number().min(0),
  stock_unit: Joi.string().trim().allow('', null),
  availability_status: Joi.string().valid(
    'In Stock',
    'Limited Stock',
    'Out of Stock',
    'Available on Order',
    'Made to Order',
    'Discontinued',
    'in_stock',
    'limited_stock',
    'out_of_stock',
    'available_on_order',
    'made_to_order',
    'discontinued'
  ),
  change_type: Joi.string().valid('set', 'add', 'subtract').default('set'),
  notes: Joi.string().trim().allow('', null)
});

const machineryContactSchema = Joi.object({
  name: Joi.string().trim().required(),
  designation: Joi.string().trim().required(),
  phone: Joi.string().trim().required(),
  whatsapp: Joi.string().trim().allow('', null),
  email: Joi.string().email().allow('', null),
  is_primary: Joi.boolean().default(false),
  birth_date: Joi.date().iso().allow(null),
  anniversary_date: Joi.date().iso().allow(null)
});

const machineryGalleryPhotoSchema = Joi.object({
  title: Joi.string().trim().allow('', null),
  caption: Joi.string().trim().allow('', null),
  category: Joi.string().valid('machinery', 'parts', 'workshop', 'facility', 'drawings', 'packaging', 'other').default('parts'),
  is_cover: Joi.boolean().default(false),
  url: Joi.string().uri().allow('', null)
});

const machineryGalleryVideoSchema = Joi.object({
  title: Joi.string().trim().required(),
  video_url: Joi.string().uri().allow('', null),
  youtube_url: Joi.string().uri().allow('', null),
  source_type: Joi.string().valid('upload', 'youtube').default('upload'),
  category: Joi.string().valid('product_demo', 'workshop_tour', 'installation_guide', 'walkthrough').default('product_demo'),
  duration: Joi.string().trim().allow('', null)
});

const machineryPhoneOtpVerifySchema = Joi.object({
  phone: Joi.string().trim().required(),
  otp: Joi.string().trim().length(6).required()
});

const machineryGstVerifySchema = Joi.object({
  gstin: Joi.string().trim().uppercase().required()
});

const machineryDocumentUploadSchema = Joi.object({
  document_type: Joi.string().trim().required(),
  document_name: Joi.string().trim().required(),
  document_number: Joi.string().trim().allow('', null)
});

const machineryAnalyticsEventSchema = Joi.object({
  event_type: Joi.string().valid('profile_view', 'contact_click', 'call_click', 'whatsapp_click', 'product_view', 'product_inquiry').required(),
  product_id: Joi.string().hex().length(24).allow(null, ''),
  metadata: Joi.object().unknown(true)
});

module.exports = {
  updateMachineryProfileSchema,
  createMachineryProductSchema,
  updateMachineryProductSchema,
  updateMachineryStockSchema,
  machineryContactSchema,
  machineryGalleryPhotoSchema,
  machineryGalleryVideoSchema,
  machineryPhoneOtpVerifySchema,
  machineryGstVerifySchema,
  machineryDocumentUploadSchema,
  machineryAnalyticsEventSchema
};

