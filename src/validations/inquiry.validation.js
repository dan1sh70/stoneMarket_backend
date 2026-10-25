const Joi = require('joi');

const inquirySchema = Joi.object({
  vendorId: Joi.string().hex().length(24).optional(),
  businessId: Joi.string().hex().length(24).optional(),
  buyerId: Joi.string().hex().length(24).optional(),
  productId: Joi.string().hex().length(24).optional(),
  category: Joi.string().optional(),
  supplierType: Joi.string().optional(),
  subject: Joi.string().optional(),
  message: Joi.string().optional(),
  requirements: Joi.string().max(2000).optional(),
  quantity: Joi.number().positive().optional(),
  unit: Joi.string().optional(),
  size: Joi.string().optional(),
  thickness: Joi.string().optional(),
  finish: Joi.string().optional(),
  grade: Joi.string().optional(),
  deliveryLocation: Joi.object({
    city: Joi.string().optional(),
    state: Joi.string().optional(),
    address: Joi.string().optional()
  }).optional(),
  attachments: Joi.array().items(Joi.object({
    url: Joi.string().required(),
    filename: Joi.string().optional(),
    size: Joi.number().max(10 * 1024 * 1024).optional(),
    mimetype: Joi.string().optional()
  })).max(10).optional(),
  referralSource: Joi.string().optional(),
  contactInfo: Joi.object({
    name: Joi.string().optional(),
    mobile: Joi.string().optional(),
    email: Joi.string().email().optional(),
    city: Joi.string().optional()
  }).optional()
}).or('vendorId', 'businessId');

module.exports = {
  inquirySchema
};
