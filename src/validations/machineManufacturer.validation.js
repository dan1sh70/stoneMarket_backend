const Joi = require('joi');

const updateMachineManufacturerProfileSchema = Joi.object({
  company_name: Joi.string().trim().max(150),
  gst_number: Joi.string().trim().uppercase().allow('', null),
  email: Joi.string().email().allow('', null),
  phone: Joi.string().trim().allow('', null),
  established_year: Joi.number().integer().min(1900).max(new Date().getFullYear()),
  about_business: Joi.string().trim().allow('', null),
  short_description: Joi.string().trim().allow('', null),
  machine_categories: Joi.array().items(Joi.string().trim()),
  manufacturing_plant_capacity: Joi.string().trim().allow('', null),
  in_house_fabrication_setup: Joi.string().trim().allow('', null),
  annual_production_volume: Joi.string().trim().allow('', null),
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

const createMachineSchema = Joi.object({
  // STEP 1 – BASIC & MEDIA
  name: Joi.string().trim().required(),
  category: Joi.string().trim().required(),
  description: Joi.string().trim().allow('', null),
  short_description: Joi.string().trim().allow('', null),
  images: Joi.array().items(Joi.string().trim()),
  cover_image: Joi.string().trim().allow('', null),
  videos: Joi.array().items(Joi.string().trim()),
  technical_drawings: Joi.array().items(Joi.string().trim()),
  equipment_brochures: Joi.array().items(Joi.string().trim()),
  product_datasheets: Joi.array().items(Joi.string().trim()),
  certification_documents: Joi.array().items(Joi.string().trim()),

  // STEP 2 – TECHNICAL SPECIFICATIONS
  model_number: Joi.string().trim().required(), // Model / Series Number (Required)
  production_capacity: Joi.string().trim().required(), // Cutting / Production Capacity (Required)
  connected_power_hp: Joi.number().min(0).allow(null),
  connected_power_kw: Joi.number().min(0).allow(null),
  connected_power: Joi.string().trim().allow('', null), // Total Connected Power string or object
  total_power_requirement: Joi.string().trim().allow('', null),
  warranty_guarantee: Joi.string().trim().allow('', null), // Warranty & Maintenance Support
  working_dimensions: Joi.string().trim().allow('', null),
  working_size: Joi.string().trim().allow('', null),
  brand_name: Joi.string().trim().default('Rajendra Machine Tools'),
  manufacturer: Joi.string().trim().allow('', null),
  machine_compatibility: Joi.string().trim().allow('', null),
  technical_specifications: Joi.object().unknown(true),

  // STEP 3 – PRICING & DELIVERY
  selling_price: Joi.number().min(0).required(), // Machine Price / Rate (Required)
  price: Joi.number().min(0),
  pricing_unit: Joi.string().valid(
    'Per Complete Machine',
    'Per Unit',
    'Per Set',
    'Per Machine Line',
    'Per Project',
    'Custom'
  ).default('Per Complete Machine'),
  lead_time: Joi.string().trim().default('3–4 Weeks Fabrication & Dispatch'),
  manufacturing_lead_time: Joi.string().trim().allow('', null),
  min_order_quantity: Joi.number().min(1).default(1),
  available_stock: Joi.number().min(0).default(1),
  stock: Joi.number().min(0),
  stock_unit: Joi.string().trim().default('Units'),
  availability_status: Joi.string().valid(
    'Ready Stock',
    'Made to Order',
    'Under Manufacturing',
    'Available on Request',
    'Discontinued',
    'In Stock',
    'Out of Stock',
    'in_stock',
    'out_of_stock',
    'made_to_order'
  ).default('Ready Stock'),
  manufacturing_status: Joi.string().valid(
    'Ready Stock',
    'Made to Order',
    'Under Manufacturing',
    'Available on Request',
    'Discontinued'
  ).default('Ready Stock'),
  installation_type: Joi.string().valid(
    'Installation Included',
    'Installation Available at Extra Cost',
    'Self Installation',
    'On-Site Commissioning Available',
    'Installation Available'
  ).default('On-Site Commissioning Available'),
  installation_available: Joi.boolean().default(true),
  delivery_available: Joi.boolean().default(true),
  transportation_terms: Joi.string().valid(
    'Transportation Included',
    'Transportation Extra',
    'Ex-Factory'
  ).default('Transportation Extra'),
  dispatch_location: Joi.string().trim().allow('', null),
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

const updateMachineSchema = createMachineSchema.fork(
  ['name', 'category', 'model_number', 'production_capacity', 'selling_price'],
  (schema) => schema.optional()
);

const updateMachineStockSchema = Joi.object({
  stock: Joi.number().min(0).required(),
  available_stock: Joi.number().min(0),
  stock_unit: Joi.string().trim().allow('', null),
  availability_status: Joi.string().valid(
    'Ready Stock',
    'Made to Order',
    'Under Manufacturing',
    'Available on Request',
    'Discontinued',
    'In Stock',
    'Out of Stock',
    'in_stock',
    'out_of_stock',
    'made_to_order'
  ),
  manufacturing_status: Joi.string().valid(
    'Ready Stock',
    'Made to Order',
    'Under Manufacturing',
    'Available on Request',
    'Discontinued'
  ),
  change_type: Joi.string().valid('set', 'add', 'subtract', 'increase', 'decrease').default('set'),
  notes: Joi.string().trim().allow('', null)
});

const machineManufacturerContactSchema = Joi.object({
  name: Joi.string().trim().required(),
  designation: Joi.string().trim().required(),
  phone: Joi.string().trim().required(),
  whatsapp: Joi.string().trim().allow('', null),
  email: Joi.string().email().allow('', null),
  is_primary: Joi.boolean().default(false)
});

const machineManufacturerGalleryPhotoSchema = Joi.object({
  title: Joi.string().trim().allow('', null),
  caption: Joi.string().trim().allow('', null),
  category: Joi.string().valid('facility', 'production', 'installation', 'demonstration', 'completed_projects', 'other').default('facility'),
  is_cover: Joi.boolean().default(false),
  url: Joi.string().uri().allow('', null)
});

const machineManufacturerGalleryVideoSchema = Joi.object({
  title: Joi.string().trim().required(),
  video_url: Joi.string().uri().allow('', null),
  youtube_url: Joi.string().uri().allow('', null),
  source_type: Joi.string().valid('upload', 'youtube').default('upload'),
  category: Joi.string().valid('demonstration', 'installation', 'factory_tour', 'testing').default('demonstration'),
  duration: Joi.string().trim().allow('', null)
});

const machineManufacturerGstVerifySchema = Joi.object({
  gstin: Joi.string().trim().uppercase().required()
});

const machineManufacturerAnalyticsEventSchema = Joi.object({
  event_type: Joi.string().valid('profile_view', 'contact_click', 'call_click', 'whatsapp_click', 'product_view', 'machine_view', 'product_inquiry', 'machine_inquiry').required(),
  machine_id: Joi.string().hex().length(24).allow(null, ''),
  product_id: Joi.string().hex().length(24).allow(null, ''),
  metadata: Joi.object().unknown(true)
});

module.exports = {
  updateMachineManufacturerProfileSchema,
  createMachineSchema,
  updateMachineSchema,
  updateMachineStockSchema,
  machineManufacturerContactSchema,
  machineManufacturerGalleryPhotoSchema,
  machineManufacturerGalleryVideoSchema,
  machineManufacturerGstVerifySchema,
  machineManufacturerAnalyticsEventSchema
};

