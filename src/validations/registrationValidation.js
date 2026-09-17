const Joi = require('joi');

const commonStep1 = {
  company_name: Joi.string().required(),
  gst_number: Joi.string().pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/).optional(),
  established_year: Joi.number().min(1800).max(new Date().getFullYear()).required(),
  company_details: Joi.string().allow('', null)
};

const commonOwnerSchema = Joi.object({
  name: Joi.string().required(),
  phone: Joi.string().pattern(/^[6-9]\d{9}$/).required(),
  whatsapp: Joi.string().pattern(/^[6-9]\d{9}$/).optional(),
  birth_date: Joi.date().max('now').optional(),
  anniversary_date: Joi.date().max('now').optional(),
  photo: Joi.string().optional()
});

const commonStep3 = {
  state: Joi.string().required(),
  district: Joi.string().required(),
  area: Joi.string().required(),
  google_map_location: Joi.string().optional(),
  terms_accepted: Joi.boolean().valid(true).required(),
  privacy_policy_accepted: Joi.boolean().valid(true).required()
};

// Mining validation
exports.miningStep1 = Joi.object({
  ...commonStep1,
  ec_number: Joi.string().required(),
  granite_colors: Joi.array().items(Joi.string()).min(1).required(),
  monthly_capacity_ton: Joi.number().min(0).required(),
  machines: Joi.array().items(Joi.object({
    machine_name: Joi.string().required(),
    quantity: Joi.number().min(1).required()
  })).optional(),
  working_times: Joi.string().optional()
});

// Manufacturer Validation
exports.manufacturerStep1 = Joi.object({
  ...commonStep1,
  iec_number: Joi.string().optional(),
  granite_colors: Joi.array().items(Joi.string()).min(1).required(),
  is_export_unit: Joi.boolean().required(),
  monthly_capacity_sqf: Joi.number().min(0).required(),
  machines: Joi.array().items(Joi.object({
    machine_name: Joi.string().required(),
    quantity: Joi.number().min(1).required()
  })).optional(),
  working_times: Joi.string().optional()
});

// Showroom Validation
exports.showroomStep1 = Joi.object({
  showroom_name: Joi.string().required(),
  gst_number: commonStep1.gst_number,
  established_year: commonStep1.established_year,
  company_details: commonStep1.company_details,
  granite_colors: Joi.array().items(Joi.string()).min(1).required(),
});

exports.showroomStep3 = Joi.object({
  ...commonStep3,
  premises_status: Joi.string().valid('owned', 'rented').required(),
  showroom_address: Joi.string().required()
});

// Service Provider Validation
exports.serviceProviderStep1 = Joi.object({
  ...commonStep1,
  service_category_id: Joi.string().required(), // MongoDB ObjectId
});

// Generic Step 2 (Owners)
exports.step2Schema = Joi.object({
  owner_1: commonOwnerSchema.keys({
    whatsapp: Joi.string().pattern(/^[6-9]\d{9}$/).required() // Specific requirement for Owner 1
  }).required(),
  owner_2: commonOwnerSchema.optional()
});

// Generic Step 3
exports.step3Schema = Joi.object({
  ...commonStep3,
  address: Joi.string().required() // Maps to office_business_address or mine_address or delivery_home_address
});

// Determine schema based on type and step
exports.getSchema = (type, step) => {
  if (step === 2) return exports.step2Schema;
  
  if (step === 1) {
    if (type === 'mining') return exports.miningStep1;
    if (type === 'manufacturer') return exports.manufacturerStep1;
    if (type === 'showroom') return exports.showroomStep1;
    if (type === 'service_provider') return exports.serviceProviderStep1;
    // For trader, buyer, transport we could add specifics, falling back to a generic for now:
    return Joi.object({ ...commonStep1 }).unknown(true); 
  }

  if (step === 3) {
    if (type === 'showroom') return exports.showroomStep3;
    return exports.step3Schema;
  }
  
  return Joi.object({});
};
