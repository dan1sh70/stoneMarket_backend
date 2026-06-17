const Joi = require('joi');

const vendorProfileSchema = Joi.object({
  businessName: Joi.string().required(),
  category: Joi.string().valid(
    'Mining', 'Granite Manufacturer', 'Traders & Suppliers',
    'Transporters', 'Machinery', 'Tools & Abrasives', 'Industrial Services'
  ).required(),
  subcategory: Joi.string().optional(),
  description: Joi.string().optional(),
  gstNumber: Joi.string().optional(),
  contact: Joi.object({
    mobile: Joi.string().optional(),
    whatsapp: Joi.string().optional(),
    email: Joi.string().email().optional(),
    website: Joi.string().uri().optional()
  }).optional(),
  address: Joi.object({
    line1: Joi.string().optional(),
    city: Joi.string().optional(),
    state: Joi.string().optional(),
    pincode: Joi.string().optional()
  }).optional(),
  coordinates: Joi.array().items(Joi.number()).length(2).optional()
});

module.exports = {
  vendorProfileSchema
};
