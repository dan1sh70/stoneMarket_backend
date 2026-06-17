const Joi = require('joi');

const productSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().optional(),
  category: Joi.string().optional(),
  subcategory: Joi.string().optional(),
  specifications: Joi.array().items(Joi.object({
    key: Joi.string(),
    value: Joi.string()
  })).optional(),
  priceRange: Joi.object({
    min: Joi.number().optional(),
    max: Joi.number().optional(),
    unit: Joi.string().optional(),
    visible: Joi.boolean().optional()
  }).optional(),
  graniteColors: Joi.array().items(Joi.string()).optional(),
  miningLocation: Joi.string().optional()
});

module.exports = {
  productSchema
};
