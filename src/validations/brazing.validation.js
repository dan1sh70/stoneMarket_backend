const Joi = require('joi');

const updateBrazingProfileSchema = Joi.object({
  company_name: Joi.string().trim().max(150),
  gst_number: Joi.string().trim().uppercase().allow('', null),
  email: Joi.string().email().allow('', null),
  phone: Joi.string().trim().allow('', null),
  established_year: Joi.number().integer().min(1900).max(new Date().getFullYear()),
  about_business: Joi.string().trim().allow('', null),
  short_description: Joi.string().trim().allow('', null),
  daily_brazing_capacity: Joi.string().trim().allow('', null),
  blade_size_coverage: Joi.string().trim().allow('', null),
  brazing_technology: Joi.string().trim().allow('', null),
  service_pricing_range: Joi.string().trim().allow('', null),
  silver_solder_alloy_grade: Joi.string().trim().allow('', null),
  brazing_machine_model: Joi.string().trim().allow('', null),
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

const createBrazingServiceSchema = Joi.object({
  service_name: Joi.string().trim().required(),
  brazing_service_type: Joi.string().valid(
    'Circular Blade Brazing',
    'Gangsaw Blade Brazing',
    'Diamond Tip Brazing',
    'Blade Retipping',
    'Wire Saw Connector Brazing',
    'Core Drill Bit Re-tipping',
    'Multi-Blade Brazing',
    'Other'
  ).required(),
  description: Joi.string().trim().allow('', null),
  images: Joi.array().items(Joi.string().trim()),
  cover_image: Joi.string().trim().allow('', null),

  blade_size_supported: Joi.string().trim().required(),
  blade_size_min: Joi.number().allow(null),
  blade_size_max: Joi.number().allow(null),
  blade_size_unit: Joi.string().default('inch'),
  daily_brazing_capacity: Joi.string().trim().required(),
  capacity_numeric: Joi.number().allow(null),
  capacity_unit: Joi.string().default('Blades / Day'),
  silver_solder_grade: Joi.string().trim().allow('', null),
  brazing_machine_model: Joi.string().trim().allow('', null),
  brazing_technology: Joi.string().trim().allow('', null),
  heating_method: Joi.string().trim().allow('', null),
  segment_type: Joi.string().trim().allow('', null),
  diamond_segment_compatibility: Joi.string().trim().allow('', null),
  supported_blade_materials: Joi.array().items(Joi.string().trim()),
  quality_standards: Joi.string().trim().allow('', null),

  service_price: Joi.number().min(0).required(),
  pricing_unit: Joi.string().valid(
    'Per Blade',
    'Per Inch',
    'Per Millimetre',
    'Per Segment',
    'Per Set',
    'Per Job',
    'Per Hour',
    'Per Kilogram',
    'Custom'
  ).required(),
  turnaround_time: Joi.string().trim().default('Same Day Dispatch'),
  minimum_order_quantity: Joi.number().min(1).default(1),
  bulk_order_pricing: Joi.string().trim().allow('', null),
  advance_payment_requirement: Joi.string().trim().allow('', null),
  pickup_delivery_availability: Joi.boolean().default(true),
  service_warranty: Joi.string().trim().allow('', null),
  terms_and_conditions: Joi.string().trim().allow('', null),

  target_areas: Joi.array().items(
    Joi.object({
      state_name: Joi.string().trim().required(),
      districts: Joi.array().items(Joi.string().trim())
    })
  ),
  target_categories: Joi.array().items(
    Joi.string().valid(
      'Manufacturer',
      'Mining',
      'Showroom',
      'Trader',
      'Brazing Services',
      'Blades & Segments',
      'Machine Manufacturer',
      'Customer',
      'Other'
    )
  ),
  status: Joi.string().valid('active', 'inactive', 'draft').default('active')
});

const updateBrazingServiceSchema = createBrazingServiceSchema.fork(
  ['service_name', 'brazing_service_type', 'blade_size_supported', 'daily_brazing_capacity', 'service_price', 'pricing_unit'],
  (schema) => schema.optional()
);

const brazingContactSchema = Joi.object({
  name: Joi.string().trim().required(),
  designation: Joi.string().trim().required(),
  phone: Joi.string().trim().required(),
  whatsapp: Joi.string().trim().allow('', null),
  email: Joi.string().email().allow('', null),
  is_primary: Joi.boolean().default(false),
  birth_date: Joi.date().iso().allow(null),
  anniversary_date: Joi.date().iso().allow(null)
});

const brazingGalleryPhotoSchema = Joi.object({
  title: Joi.string().trim().allow('', null),
  caption: Joi.string().trim().allow('', null),
  category: Joi.string().valid('workshop', 'machine', 'blades', 'segments', 'facility', 'other').default('workshop'),
  is_cover: Joi.boolean().default(false)
});

const brazingGalleryVideoSchema = Joi.object({
  title: Joi.string().trim().required(),
  video_url: Joi.string().uri().allow('', null),
  youtube_url: Joi.string().uri().allow('', null),
  source_type: Joi.string().valid('upload', 'youtube').default('upload'),
  category: Joi.string().valid('brazing_demo', 'workshop_tour', 'retipping', 'walkthrough').default('brazing_demo'),
  duration: Joi.string().trim().allow('', null)
});

const brazingPhoneOtpVerifySchema = Joi.object({
  phone: Joi.string().trim().required(),
  otp: Joi.string().trim().length(6).required()
});

const brazingGstVerifySchema = Joi.object({
  gstin: Joi.string().trim().uppercase().required()
});

const brazingDocumentUploadSchema = Joi.object({
  document_type: Joi.string().trim().required(),
  document_name: Joi.string().trim().required(),
  document_number: Joi.string().trim().allow('', null)
});

const brazingAnalyticsEventSchema = Joi.object({
  event_type: Joi.string().valid('profile_view', 'contact_click', 'call_click', 'whatsapp_click', 'service_view', 'service_inquiry').required(),
  service_id: Joi.string().hex().length(24).allow(null, ''),
  metadata: Joi.object().unknown(true)
});

module.exports = {
  updateBrazingProfileSchema,
  createBrazingServiceSchema,
  updateBrazingServiceSchema,
  brazingContactSchema,
  brazingGalleryPhotoSchema,
  brazingGalleryVideoSchema,
  brazingPhoneOtpVerifySchema,
  brazingGstVerifySchema,
  brazingDocumentUploadSchema,
  brazingAnalyticsEventSchema
};

