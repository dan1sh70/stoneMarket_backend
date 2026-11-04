const Joi = require('joi');

const updateBuyerProfileSchema = Joi.object({
  company_name: Joi.string().trim().max(150),
  gst_number: Joi.string().trim().uppercase().allow('', null),
  email: Joi.string().email().allow('', null),
  phone: Joi.string().trim().allow('', null),
  established_year: Joi.number().integer().min(1900).max(new Date().getFullYear()),
  about_business: Joi.string().trim().allow('', null),
  company_details: Joi.string().trim().allow('', null),
  short_description: Joi.string().trim().allow('', null),
  website: Joi.string().uri().allow('', null),
  business_registration_number: Joi.string().trim().allow('', null),
  company_type: Joi.string().trim().allow('', null),
  preferred_communication: Joi.string().valid('phone', 'whatsapp', 'email'),
  buyer_business_types: Joi.array().items(Joi.string().trim()),
  purchasing_specializations: Joi.array().items(Joi.string().trim()),
  preferred_materials: Joi.array().items(Joi.string().trim()),
  preferred_products: Joi.array().items(Joi.string().trim()),
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
  }),
  working_hours: Joi.object()
});

const updateBuyerProjectInfoSchema = Joi.object({
  company_type: Joi.string().trim().allow('', null),
  buyer_business_types: Joi.array().items(Joi.string().trim()),
  purchasing_specializations: Joi.array().items(Joi.string().trim()),
  ongoing_projects_count: Joi.number().integer().min(0),
  annual_purchasing_volume: Joi.number().min(0),
  purchasing_volume_unit: Joi.string().default('Sq.ft'),
  procurement_capacity: Joi.string().trim().allow('', null),
  procurement_regions: Joi.array().items(Joi.string().trim()),
  sourcing_scope: Joi.string().valid('Domestic', 'International', 'Both').default('Domestic')
});

const buyerContactSchema = Joi.object({
  name: Joi.string().trim().required(),
  designation: Joi.string().trim().required(),
  phone: Joi.string().trim().required(),
  whatsapp: Joi.string().trim().allow('', null),
  email: Joi.string().email().allow('', null),
  is_primary: Joi.boolean().default(false),
  birth_date: Joi.date().iso().allow(null),
  anniversary_date: Joi.date().iso().allow(null)
});

const buyerGalleryPhotoSchema = Joi.object({
  title: Joi.string().trim().allow('', null),
  caption: Joi.string().trim().allow('', null),
  category: Joi.string().valid('office', 'project_site', 'completed_project', 'warehouse', 'sample_room', 'other').default('office'),
  is_cover: Joi.boolean().default(false)
});

const buyerGalleryVideoSchema = Joi.object({
  title: Joi.string().trim().required(),
  video_url: Joi.string().uri().allow('', null),
  youtube_url: Joi.string().uri().allow('', null),
  source_type: Joi.string().valid('upload', 'youtube').default('upload'),
  category: Joi.string().valid('walkthrough', 'project_site', 'client_review', 'procurement_facility').default('walkthrough'),
  duration: Joi.string().trim().allow('', null)
});

const createSourcingRequirementSchema = Joi.object({
  title: Joi.string().trim().required(),
  project_name: Joi.string().trim().allow('', null),
  project_type: Joi.string().valid('Commercial', 'Residential', 'Infrastructure', 'Industrial', 'Institutional', 'Hospitality', 'Public / Government', 'Other').default('Commercial'),
  material_category: Joi.string().trim().allow('', null),
  material_name: Joi.string().trim().allow('', null),
  description: Joi.string().trim().allow('', null),
  application_usage: Joi.alternatives().try(Joi.array().items(Joi.string().trim()), Joi.string().trim()),

  material: Joi.string().trim().allow('', null),
  product_type: Joi.string().trim().allow('', null),
  color: Joi.string().trim().allow('', null),
  colour: Joi.string().trim().allow('', null),
  pattern: Joi.string().trim().allow('', null),
  size: Joi.string().trim().allow('', null),
  required_size: Joi.string().trim().allow('', null),
  thickness: Joi.string().trim().allow('', null),
  required_thickness: Joi.string().trim().allow('', null),
  finish: Joi.string().trim().allow('', null),
  quality: Joi.string().valid('Commercial Grade', 'Standard Grade', 'Premium Grade', 'First Choice / Export Quality').default('Standard Grade'),
  edge_profile: Joi.string().trim().allow('', null),
  surface_treatment: Joi.string().trim().allow('', null),
  preferred_origin: Joi.string().trim().allow('', null),

  quantity: Joi.number().min(0.01).required(),
  quantity_unit: Joi.string().valid('sqft', 'sqm', 'tons', 'cbm', 'pieces', 'containers').default('sqft'),
  budget_min: Joi.number().min(0).allow(null),
  budget_max: Joi.number().min(0).allow(null),
  budget_type: Joi.string().valid('Total Budget', 'Rate per Sq.ft', 'Rate per Ton', 'Rate per Unit', 'Negotiable').default('Rate per Sq.ft'),
  target_price: Joi.number().min(0).allow(null),

  delivery_location: Joi.object({
    city: Joi.string().trim().allow('', null),
    state: Joi.string().trim().allow('', null),
    district: Joi.string().trim().allow('', null),
    area: Joi.string().trim().allow('', null),
    address: Joi.string().trim().allow('', null),
    pincode: Joi.string().trim().allow('', null)
  }),
  delivery_address: Joi.string().trim().allow('', null),
  required_delivery_date: Joi.date().iso().allow(null),
  procurement_timeline: Joi.string().valid('Immediate (Within 7 Days)', '15 - 30 Days', '1 - 2 Months', '3 - 6 Months', 'Long-term / Phased Delivery').default('15 - 30 Days'),
  delivery_type: Joi.string().valid('Ex-Factory / Quarry Pickup', 'FOR Project Site', 'CIF / Port Delivery', 'Supplier Managed Transportation').default('FOR Project Site'),
  order_frequency: Joi.string().trim().default('one-time'),

  additional_instructions: Joi.string().trim().allow('', null),
  special_requirements: Joi.object({
    quality_standards: Joi.string().trim().allow('', null),
    inspection_required: Joi.boolean().default(false),
    inspection_details: Joi.string().trim().allow('', null),
    packaging_type: Joi.string().trim().allow('', null),
    transportation_required: Joi.boolean().default(true),
    sample_required: Joi.boolean().default(false),
    test_certificate_required: Joi.boolean().default(false)
  }),

  supplier_targeting: Joi.object({
    all_india: Joi.boolean().default(true),
    target_categories: Joi.array().items(Joi.string().valid('Manufacturer', 'Mining', 'Showroom', 'Trader')),
    target_states: Joi.array().items(Joi.string().trim()),
    target_districts: Joi.array().items(Joi.string().trim()),
    verified_suppliers_only: Joi.boolean().default(false),
    min_supplier_rating: Joi.number().min(0).max(5).default(0)
  }),

  status: Joi.string().valid('draft', 'open', 'quotes_received', 'in_review', 'closed').default('open')
});

const updateSourcingRequirementSchema = createSourcingRequirementSchema.fork(['title', 'quantity'], (schema) => schema.optional());

const acceptQuoteSchema = Joi.object({
  delivery_address: Joi.object({
    site_name: Joi.string().trim().allow('', null),
    full_address: Joi.string().trim().required(),
    city: Joi.string().trim().allow('', null),
    state: Joi.string().trim().allow('', null),
    pincode: Joi.string().trim().allow('', null),
    contact_person: Joi.string().trim().allow('', null),
    contact_phone: Joi.string().trim().allow('', null)
  }).required(),
  expected_delivery_date: Joi.date().iso().allow(null),
  buyer_notes: Joi.string().trim().allow('', null),
  payment_terms: Joi.string().trim().allow('', null)
});

const buyerPhoneOtpVerifySchema = Joi.object({
  phone: Joi.string().trim().required(),
  otp: Joi.string().trim().length(6).required()
});

const buyerEmailVerifySchema = Joi.object({
  email: Joi.string().email().required(),
  token: Joi.string().trim().required()
});

const buyerBusinessVerifySchema = Joi.object({
  registration_type: Joi.string().trim().required(),
  registration_number: Joi.string().trim().required()
});

const buyerGstVerifySchema = Joi.object({
  gstin: Joi.string().trim().uppercase().required()
});

const buyerBankVerifySchema = Joi.object({
  account_holder_name: Joi.string().trim().required(),
  bank_name: Joi.string().trim().required(),
  account_number: Joi.string().trim().required(),
  ifsc_code: Joi.string().trim().uppercase().required()
});

const buyerDocumentUploadSchema = Joi.object({
  document_type: Joi.string().trim().required(),
  document_name: Joi.string().trim().required(),
  document_number: Joi.string().trim().allow('', null)
});

const buyerAnalyticsEventSchema = Joi.object({
  event_type: Joi.string().valid('profile_view', 'requirement_published', 'quote_received', 'quote_accepted', 'order_created', 'order_completed', 'supplier_contacted').required(),
  metadata: Joi.object().unknown(true)
});

module.exports = {
  updateBuyerProfileSchema,
  updateBuyerProjectInfoSchema,
  buyerContactSchema,
  buyerGalleryPhotoSchema,
  buyerGalleryVideoSchema,
  createSourcingRequirementSchema,
  updateSourcingRequirementSchema,
  acceptQuoteSchema,
  buyerPhoneOtpVerifySchema,
  buyerEmailVerifySchema,
  buyerBusinessVerifySchema,
  buyerGstVerifySchema,
  buyerBankVerifySchema,
  buyerDocumentUploadSchema,
  buyerAnalyticsEventSchema
};

