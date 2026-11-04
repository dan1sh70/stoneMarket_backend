const Joi = require('joi');

const updateAbrasivesProfileSchema = Joi.object({
  company_name: Joi.string().trim().max(150),
  gst_number: Joi.string().trim().uppercase().allow('', null),
  email: Joi.string().email().allow('', null),
  phone: Joi.string().trim().allow('', null),
  established_year: Joi.number().integer().min(1900).max(new Date().getFullYear()),
  about_business: Joi.string().trim().allow('', null),
  short_description: Joi.string().trim().allow('', null),
  abrasive_product_categories: Joi.array().items(Joi.string().trim()),
  brands_available: Joi.array().items(Joi.string().trim()),
  product_range: Joi.string().trim().allow('', null),
  distribution_capability: Joi.string().trim().allow('', null),
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

const createAbrasivesProductSchema = Joi.object({
  // Step 1: Basic & Media
  name: Joi.string().trim().required(),
  category: Joi.string().trim().required(),
  description: Joi.string().trim().allow('', null),
  short_description: Joi.string().trim().allow('', null),
  images: Joi.array().items(Joi.string().trim()),
  cover_image: Joi.string().trim().allow('', null),

  // Step 2: Technical Specifications & Grade
  grit_grade: Joi.string().trim().required(),
  brand_name: Joi.string().trim().required(),
  packaging_standard: Joi.string().trim().allow('', null),
  technical_specifications: Joi.object().unknown(true),

  // Step 3: Pricing & Stock
  selling_price: Joi.number().min(0).required(),
  price: Joi.number().min(0),
  pricing_unit: Joi.string().valid(
    'Per Piece',
    'Per Box',
    'Per Set',
    'Per Kg',
    'Per Gram',
    'Per Litre',
    'Per Drum',
    'Per Tin',
    'Per Bucket',
    'Per Carton',
    'Per Pack',
    'Custom'
  ).required(),
  min_order_quantity: Joi.number().min(1).default(1),
  available_stock: Joi.number().min(0).default(0),
  stock: Joi.number().min(0),
  stock_unit: Joi.string().trim().default('Pieces'),
  availability_status: Joi.string().valid(
    'in_stock',
    'limited_stock',
    'out_of_stock',
    'available_on_order',
    'discontinued',
    'made_to_order',
    'In Stock',
    'Limited Stock',
    'Out of Stock',
    'Available on Order',
    'Discontinued'
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

const updateAbrasivesProductSchema = createAbrasivesProductSchema.fork(
  ['name', 'category', 'grit_grade', 'brand_name', 'selling_price', 'pricing_unit'],
  (schema) => schema.optional()
);

const updateAbrasivesStockSchema = Joi.object({
  stock: Joi.number().min(0).required(),
  available_stock: Joi.number().min(0),
  stock_unit: Joi.string().trim().allow('', null),
  availability_status: Joi.string().valid(
    'in_stock',
    'limited_stock',
    'out_of_stock',
    'available_on_order',
    'discontinued',
    'made_to_order',
    'In Stock',
    'Limited Stock',
    'Out of Stock',
    'Available on Order',
    'Discontinued'
  ),
  change_type: Joi.string().valid('set', 'add', 'subtract').default('set'),
  notes: Joi.string().trim().allow('', null)
});

const abrasivesContactSchema = Joi.object({
  name: Joi.string().trim().required(),
  designation: Joi.string().trim().required(),
  phone: Joi.string().trim().required(),
  whatsapp: Joi.string().trim().allow('', null),
  email: Joi.string().email().allow('', null),
  is_primary: Joi.boolean().default(false),
  birth_date: Joi.date().iso().allow(null),
  anniversary_date: Joi.date().iso().allow(null)
});

const abrasivesGalleryPhotoSchema = Joi.object({
  title: Joi.string().trim().allow('', null),
  caption: Joi.string().trim().allow('', null),
  category: Joi.string().valid('abrasives', 'epoxy', 'adhesives', 'packaging', 'warehouse', 'application', 'other').default('abrasives'),
  is_cover: Joi.boolean().default(false),
  url: Joi.string().uri().allow('', null)
});

const abrasivesGalleryVideoSchema = Joi.object({
  title: Joi.string().trim().required(),
  video_url: Joi.string().uri().allow('', null),
  youtube_url: Joi.string().uri().allow('', null),
  source_type: Joi.string().valid('upload', 'youtube').default('upload'),
  category: Joi.string().valid('product_demo', 'warehouse_tour', 'application_guide', 'walkthrough').default('product_demo'),
  duration: Joi.string().trim().allow('', null)
});

const abrasivesPhoneOtpVerifySchema = Joi.object({
  phone: Joi.string().trim().required(),
  otp: Joi.string().trim().length(6).required()
});

const abrasivesGstVerifySchema = Joi.object({
  gstin: Joi.string().trim().uppercase().required()
});

const abrasivesDocumentUploadSchema = Joi.object({
  document_type: Joi.string().trim().required(),
  document_name: Joi.string().trim().required(),
  document_number: Joi.string().trim().allow('', null)
});

const abrasivesAnalyticsEventSchema = Joi.object({
  event_type: Joi.string().valid('profile_view', 'contact_click', 'call_click', 'whatsapp_click', 'product_view', 'product_inquiry').required(),
  product_id: Joi.string().hex().length(24).allow(null, ''),
  metadata: Joi.object().unknown(true)
});

module.exports = {
  updateAbrasivesProfileSchema,
  createAbrasivesProductSchema,
  updateAbrasivesProductSchema,
  updateAbrasivesStockSchema,
  abrasivesContactSchema,
  abrasivesGalleryPhotoSchema,
  abrasivesGalleryVideoSchema,
  abrasivesPhoneOtpVerifySchema,
  abrasivesGstVerifySchema,
  abrasivesDocumentUploadSchema,
  abrasivesAnalyticsEventSchema
};

