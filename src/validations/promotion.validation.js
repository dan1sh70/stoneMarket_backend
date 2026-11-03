const Joi = require('joi');

const targetingSchema = Joi.object({
  all_india: Joi.boolean().default(true),
  states: Joi.array().items(Joi.string().trim()).default([]),
  districts: Joi.array().items(Joi.string().trim()).default([]),
  cities: Joi.array().items(Joi.string().trim()).default([])
});

const previewOrderSchema = Joi.object({
  promotion_type: Joi.string().valid('feed', 'listing').required(),
  package_id: Joi.string().hex().length(24).required(),
  product_id: Joi.when('promotion_type', {
    is: 'feed',
    then: Joi.string().hex().length(24).required(),
    otherwise: Joi.string().hex().length(24).optional().allow(null, '')
  }),
  targeting: targetingSchema.optional()
});

const createOrderSchema = Joi.object({
  promotion_type: Joi.string().valid('feed', 'listing').required(),
  package_id: Joi.string().hex().length(24).required(),
  product_id: Joi.when('promotion_type', {
    is: 'feed',
    then: Joi.string().hex().length(24).required(),
    otherwise: Joi.string().hex().length(24).optional().allow(null, '')
  }),
  campaign_name: Joi.string().trim().max(120).optional(),
  targeting: targetingSchema.optional()
});

const verifyPaymentSchema = Joi.object({
  order_id: Joi.string().required(),
  gateway_order_id: Joi.string().required(),
  gateway_payment_id: Joi.string().required(),
  gateway_signature: Joi.string().required()
});

const eventTrackingSchema = Joi.object({
  event_type: Joi.string().valid(
    'impression',
    'click',
    'product_view',
    'profile_view',
    'inquiry',
    'quote_request',
    'whatsapp_click',
    'call_click'
  ).required(),
  product_id: Joi.string().hex().length(24).optional().allow(null),
  source: Joi.string().max(60).optional(),
  location: Joi.object({
    state: Joi.string().trim().optional(),
    district: Joi.string().trim().optional(),
    city: Joi.string().trim().optional()
  }).optional()
});

const campaignActionSchema = Joi.object({
  reason: Joi.string().max(255).optional().allow('')
});

const packageSchema = Joi.object({
  promotion_type: Joi.string().valid('feed', 'listing').required(),
  package_name: Joi.string().trim().required(),
  description: Joi.string().trim().optional().allow(''),
  price: Joi.number().min(0).required(),
  duration_days: Joi.number().integer().min(1).required(),
  benefits: Joi.array().items(Joi.string().trim()).default([]),
  promotional_multiplier: Joi.string().trim().optional().allow(''),
  badge_label: Joi.string().trim().default('Sponsored'),
  theme_color: Joi.string().valid('blue', 'orange', 'purple').default('blue'),
  display_order: Joi.number().integer().default(0),
  status: Joi.string().valid('active', 'inactive').default('active')
});

const packageUpdateSchema = Joi.object({
  promotion_type: Joi.string().valid('feed', 'listing').optional(),
  package_name: Joi.string().trim().optional(),
  description: Joi.string().trim().optional().allow(''),
  price: Joi.number().min(0).optional(),
  duration_days: Joi.number().integer().min(1).optional(),
  benefits: Joi.array().items(Joi.string().trim()).optional(),
  promotional_multiplier: Joi.string().trim().optional().allow(''),
  badge_label: Joi.string().trim().optional(),
  theme_color: Joi.string().valid('blue', 'orange', 'purple').optional(),
  display_order: Joi.number().integer().optional(),
  status: Joi.string().valid('active', 'inactive').optional()
});

module.exports = {
  previewOrderSchema,
  createOrderSchema,
  verifyPaymentSchema,
  eventTrackingSchema,
  campaignActionSchema,
  packageSchema,
  packageUpdateSchema
};
