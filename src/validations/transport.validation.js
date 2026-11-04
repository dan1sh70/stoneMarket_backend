const Joi = require('joi');

const updateTransportProfileSchema = Joi.object({
  company_name: Joi.string().trim().max(150),
  gst_number: Joi.string().trim().uppercase().allow('', null),
  email: Joi.string().email().allow('', null),
  phone: Joi.string().trim().allow('', null),
  established_year: Joi.number().integer().min(1900).max(new Date().getFullYear()),
  about_business: Joi.string().trim().allow('', null),
  short_description: Joi.string().trim().allow('', null),
  dispatch_timings: Joi.string().trim().allow('', null),
  transport_category: Joi.string().valid('national', 'local', 'both'),
  has_all_india_permit: Joi.boolean(),
  has_national_coverage: Joi.boolean(),
  fleet_summary: Joi.string().trim().allow('', null),
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
  // Local Transport specific direct fields
  vehicle_name: Joi.string().trim().allow('', null),
  vehicle_number: Joi.string().trim().allow('', null),
  vehicle_type: Joi.string().trim().allow('', null),
  weight_capacity_ton: Joi.number().allow(null),
  driving_experience_years: Joi.number().allow(null),
  driving_license_number: Joi.string().trim().allow('', null)
});

const fleetCategorySchema = Joi.object({
  category_name: Joi.string().trim().required(),
  vehicle_type: Joi.string().trim().allow('', null),
  max_payload_ton: Joi.number().min(0.1).required(),
  quantity: Joi.number().integer().min(1).default(1)
});

const updateOperationalCoverageSchema = Joi.object({
  coverage_states: Joi.array().items(
    Joi.object({
      state_name: Joi.string().trim().required(),
      cities: Joi.array().items(Joi.string().trim()).default([])
    })
  ).required()
});

const vehicleSchema = Joi.object({
  vehicle_name: Joi.string().trim().required(),
  registration_number: Joi.string().trim().uppercase().required(),
  vehicle_category: Joi.string().trim().allow('', null),
  vehicleTypeId: Joi.string().hex().length(24).allow(null, ''),
  payload_capacity: Joi.number().min(0.1).required(),
  weight_capacity_ton: Joi.number().min(0.1).allow(null),
  capacity_unit: Joi.string().default('tons'),
  driving_experience_years: Joi.number().min(0).allow(null),
  driving_license_number: Joi.string().trim().allow('', null),
  driver_name: Joi.string().trim().allow('', null),
  driver_phone: Joi.string().trim().allow('', null),
  availability_status: Joi.string().valid('available_now', 'available_soon', 'in_service', 'unavailable').default('available_now'),
  is_active: Joi.boolean().default(true),
  has_gps_tracking: Joi.boolean().default(false),
  permit_type: Joi.string().valid('all_india', 'state_only', 'local_only', 'regional').default('all_india'),
  city_name: Joi.string().trim().allow('', null),
  state_name: Joi.string().trim().allow('', null),
  images: Joi.array().items(Joi.string().trim()).max(3),
  // Additional credentials
  fitness_certificate_url: Joi.string().trim().allow('', null),
  pollution_certificate_url: Joi.string().trim().allow('', null),
  permit_details: Joi.string().trim().allow('', null)
});

const updateVehicleAvailabilitySchema = Joi.object({
  availability_status: Joi.string().valid('available_now', 'available_soon', 'in_service', 'unavailable').required(),
  is_active: Joi.boolean()
});

const transportContactSchema = Joi.object({
  name: Joi.string().trim().required(),
  designation: Joi.string().trim().required(),
  phone: Joi.string().trim().required(),
  whatsapp: Joi.string().trim().allow('', null),
  email: Joi.string().email().allow('', null),
  is_primary: Joi.boolean().default(false),
  birth_date: Joi.date().iso().allow(null),
  anniversary_date: Joi.date().iso().allow(null)
});

const transportGalleryPhotoSchema = Joi.object({
  title: Joi.string().trim().allow('', null),
  caption: Joi.string().trim().allow('', null),
  category: Joi.string().valid('fleet', 'loading', 'unloading', 'warehouse', 'office', 'delivery', 'other').default('fleet'),
  is_cover: Joi.boolean().default(false)
});

const transportGalleryVideoSchema = Joi.object({
  title: Joi.string().trim().required(),
  video_url: Joi.string().uri().allow('', null),
  youtube_url: Joi.string().uri().allow('', null),
  source_type: Joi.string().valid('upload', 'youtube').default('upload'),
  category: Joi.string().valid('fleet_overview', 'operations', 'client_review', 'walkthrough').default('fleet_overview'),
  duration: Joi.string().trim().allow('', null)
});

const transportPhoneOtpVerifySchema = Joi.object({
  phone: Joi.string().trim().required(),
  otp: Joi.string().trim().length(6).required()
});

const transportGstVerifySchema = Joi.object({
  gstin: Joi.string().trim().uppercase().required()
});

const transportDocumentUploadSchema = Joi.object({
  document_type: Joi.string().trim().required(),
  document_name: Joi.string().trim().required(),
  document_number: Joi.string().trim().allow('', null)
});

const transportAnalyticsEventSchema = Joi.object({
  event_type: Joi.string().valid('profile_view', 'contact_click', 'call_click', 'whatsapp_click', 'vehicle_view').required(),
  metadata: Joi.object().unknown(true)
});

module.exports = {
  updateTransportProfileSchema,
  fleetCategorySchema,
  updateOperationalCoverageSchema,
  vehicleSchema,
  updateVehicleAvailabilitySchema,
  transportContactSchema,
  transportGalleryPhotoSchema,
  transportGalleryVideoSchema,
  transportPhoneOtpVerifySchema,
  transportGstVerifySchema,
  transportDocumentUploadSchema,
  transportAnalyticsEventSchema
};
