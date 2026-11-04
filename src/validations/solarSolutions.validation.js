const Joi = require('joi');

const updateSolarSolutionsProfileSchema = Joi.object({
  company_name: Joi.string().trim().max(150),
  gst_number: Joi.string().trim().uppercase().allow('', null),
  email: Joi.string().email().allow('', null),
  phone: Joi.string().trim().allow('', null),
  established_year: Joi.number().integer().min(1900).max(new Date().getFullYear()),
  about_business: Joi.string().trim().allow('', null),
  short_description: Joi.string().trim().allow('', null),
  solar_solution_categories: Joi.array().items(Joi.string().trim()),
  authorized_solar_brands: Joi.array().items(Joi.string().trim()),
  solar_epc_experience: Joi.string().trim().allow('', null),
  grid_approval_support: Joi.string().trim().allow('', null),
  operation_and_maintenance_scope: Joi.string().trim().allow('', null),
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

const createSolarSolutionsProductSchema = Joi.object({
  // STEP 1 – BASIC & MEDIA
  name: Joi.string().trim().required(),
  category: Joi.string().trim().required(),
  description: Joi.string().trim().allow('', null),
  short_description: Joi.string().trim().allow('', null),
  images: Joi.array().items(Joi.string().trim()),
  cover_image: Joi.string().trim().allow('', null),
  technical_drawings: Joi.array().items(Joi.string().trim()),
  equipment_brochures: Joi.array().items(Joi.string().trim()),
  certification_documents: Joi.array().items(Joi.string().trim()),
  system_layout_drawings: Joi.array().items(Joi.string().trim()),
  single_line_diagrams: Joi.array().items(Joi.string().trim()),
  product_datasheets: Joi.array().items(Joi.string().trim()),

  // STEP 2 – TECHNICAL SPECIFICATIONS & SYSTEM DETAILS
  specifications_text: Joi.string().trim().allow('', null),
  brand_name: Joi.string().trim().required(), // Manufacturer / Brand & Technology (Required)
  manufacturer: Joi.string().trim().allow('', null),
  model_number: Joi.string().trim().allow('', null),
  oem_brand_compatibility: Joi.string().trim().allow('', null),
  warranty_guarantee: Joi.string().trim().allow('', null),
  panel_warranty: Joi.string().trim().allow('', null),
  inverter_warranty: Joi.string().trim().allow('', null),
  battery_warranty: Joi.string().trim().allow('', null),
  workmanship_warranty: Joi.string().trim().allow('', null),
  technical_specifications: Joi.object().unknown(true),

  // STEP 3 – PRICING & STOCK
  selling_price: Joi.number().min(0).required(),
  price: Joi.number().min(0),
  pricing_unit: Joi.string().valid(
    'Per Watt',
    'Per kW',
    'Per MW',
    'Per Panel',
    'Per Piece',
    'Per Set',
    'Per Unit',
    'Per Project',
    'Turnkey',
    'Custom'
  ).default('Turnkey'),
  min_order_quantity: Joi.number().min(1).default(1),
  available_stock: Joi.number().min(0).default(1),
  stock: Joi.number().min(0),
  stock_unit: Joi.string().trim().default('Systems'),
  availability_status: Joi.string().valid(
    'In Stock',
    'Out of Stock',
    'Made to Order',
    'Available on Request',
    'Project-Based Availability',
    'Pre-booking Available',
    'in_stock',
    'out_of_stock',
    'available_on_order',
    'made_to_order'
  ).default('In Stock'),
  delivery_available: Joi.boolean().default(true),
  installation_available: Joi.boolean().default(true),
  epc_services_available: Joi.boolean().default(true),
  site_survey_available: Joi.boolean().default(true),
  engineering_design_available: Joi.boolean().default(true),
  grid_connection_support: Joi.boolean().default(true),
  om_support_available: Joi.boolean().default(true),
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

const updateSolarSolutionsProductSchema = createSolarSolutionsProductSchema.fork(
  ['name', 'category', 'brand_name', 'selling_price', 'pricing_unit'],
  (schema) => schema.optional()
);

const updateSolarStockSchema = Joi.object({
  stock: Joi.number().min(0).required(),
  available_stock: Joi.number().min(0),
  stock_unit: Joi.string().trim().allow('', null),
  availability_status: Joi.string().valid(
    'In Stock',
    'Out of Stock',
    'Made to Order',
    'Available on Request',
    'Project-Based Availability',
    'Pre-booking Available',
    'in_stock',
    'out_of_stock',
    'available_on_order',
    'made_to_order'
  ),
  change_type: Joi.string().valid('set', 'add', 'subtract', 'increase', 'decrease').default('set'),
  notes: Joi.string().trim().allow('', null)
});

const solarContactSchema = Joi.object({
  name: Joi.string().trim().required(),
  designation: Joi.string().trim().required(),
  phone: Joi.string().trim().required(),
  whatsapp: Joi.string().trim().allow('', null),
  email: Joi.string().email().allow('', null),
  is_primary: Joi.boolean().default(false)
});

const solarGalleryPhotoSchema = Joi.object({
  title: Joi.string().trim().allow('', null),
  caption: Joi.string().trim().allow('', null),
  category: Joi.string().valid('rooftop', 'ground_mounted', 'panels', 'inverters', 'epc_project', 'other').default('rooftop'),
  is_cover: Joi.boolean().default(false),
  url: Joi.string().uri().allow('', null)
});

const solarGalleryVideoSchema = Joi.object({
  title: Joi.string().trim().required(),
  video_url: Joi.string().uri().allow('', null),
  youtube_url: Joi.string().uri().allow('', null),
  source_type: Joi.string().valid('upload', 'youtube').default('upload'),
  category: Joi.string().valid('project_walkthrough', 'drone_footage', 'installation_demo', 'customer_interview').default('project_walkthrough'),
  duration: Joi.string().trim().allow('', null)
});

const solarGstVerifySchema = Joi.object({
  gstin: Joi.string().trim().uppercase().required()
});

const solarAnalyticsEventSchema = Joi.object({
  event_type: Joi.string().valid('profile_view', 'contact_click', 'call_click', 'whatsapp_click', 'product_view', 'product_inquiry').required(),
  product_id: Joi.string().hex().length(24).allow(null, ''),
  metadata: Joi.object().unknown(true)
});

module.exports = {
  updateSolarSolutionsProfileSchema,
  createSolarSolutionsProductSchema,
  updateSolarSolutionsProductSchema,
  updateSolarStockSchema,
  solarContactSchema,
  solarGalleryPhotoSchema,
  solarGalleryVideoSchema,
  solarGstVerifySchema,
  solarAnalyticsEventSchema
};

