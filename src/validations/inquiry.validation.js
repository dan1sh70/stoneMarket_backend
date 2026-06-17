const Joi = require('joi');

const inquirySchema = Joi.object({
  vendorId: Joi.string().hex().length(24).required(),
  productId: Joi.string().hex().length(24).optional(),
  category: Joi.string().required(),
  subject: Joi.string().optional(),
  message: Joi.string().optional(),
  requirements: Joi.string().optional(),
  contactInfo: Joi.object({
    name: Joi.string().optional(),
    mobile: Joi.string().optional(),
    email: Joi.string().email().optional()
  }).optional()
});

module.exports = {
  inquirySchema
};
