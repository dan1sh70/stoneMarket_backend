const Joi = require('joi');

const submitQuoteSchema = Joi.object({
  quoted_quantity: Joi.number().min(0.01).required(),
  quantity_unit: Joi.string().trim().default('Sq.ft'),
  unit_price: Joi.number().min(0).required(),
  subtotal: Joi.number().min(0).optional(),
  tax_rate: Joi.number().min(0).default(18),
  tax_amount: Joi.number().min(0).optional(),
  shipping_charges: Joi.number().min(0).default(0),
  discount: Joi.number().min(0).default(0),
  total_amount: Joi.number().min(0).optional(),
  material: Joi.string().trim().optional().allow(''),
  size: Joi.string().trim().optional().allow(''),
  thickness: Joi.string().trim().optional().allow(''),
  finish: Joi.string().trim().optional().allow(''),
  quality: Joi.string().trim().optional().allow(''),
  delivery_timeline: Joi.string().trim().default('7-10 Business Days'),
  payment_terms: Joi.string().trim().default('50% Advance, 50% on Delivery'),
  advance_payment: Joi.number().min(0).optional(),
  balance_payment: Joi.number().min(0).optional(),
  validity_days: Joi.number().min(1).optional(),
  validity_date: Joi.date().iso().optional().allow(null),
  warranty: Joi.string().trim().optional().allow(''),
  notes: Joi.string().trim().optional().allow(''),
  attachments: Joi.array().items(Joi.object({
    url: Joi.string().required(),
    filename: Joi.string().required(),
    size: Joi.number().optional(),
    mimetype: Joi.string().optional()
  })).default([])
}).unknown(true);

const updateQuoteSchema = Joi.object({
  quoted_quantity: Joi.number().min(0.01).optional(),
  quantity_unit: Joi.string().trim().optional(),
  unit_price: Joi.number().min(0).optional(),
  subtotal: Joi.number().min(0).optional(),
  tax_rate: Joi.number().min(0).optional(),
  tax_amount: Joi.number().min(0).optional(),
  shipping_charges: Joi.number().min(0).optional(),
  discount: Joi.number().min(0).optional(),
  total_amount: Joi.number().min(0).optional(),
  material: Joi.string().trim().optional().allow(''),
  size: Joi.string().trim().optional().allow(''),
  thickness: Joi.string().trim().optional().allow(''),
  finish: Joi.string().trim().optional().allow(''),
  quality: Joi.string().trim().optional().allow(''),
  delivery_timeline: Joi.string().trim().optional(),
  payment_terms: Joi.string().trim().optional(),
  advance_payment: Joi.number().min(0).optional(),
  balance_payment: Joi.number().min(0).optional(),
  validity_days: Joi.number().min(1).optional(),
  validity_date: Joi.date().iso().optional().allow(null),
  warranty: Joi.string().trim().optional().allow(''),
  notes: Joi.string().trim().optional().allow('')
}).unknown(true);

const withdrawQuoteSchema = Joi.object({
  reason: Joi.string().trim().required()
}).unknown(true);

const closeInquirySchema = Joi.object({
  closure_reason: Joi.string().trim().optional(),
  reason: Joi.string().trim().optional(),
  closure_comments: Joi.string().trim().optional().allow(''),
  comments: Joi.string().trim().optional().allow('')
}).or('closure_reason', 'reason').unknown(true);

const inquiryMessageSchema = Joi.object({
  message: Joi.string().trim().required(),
  receiver_id: Joi.string().hex().length(24).optional().allow(null),
  attachments: Joi.array().items(Joi.object({
    url: Joi.string().required(),
    filename: Joi.string().required(),
    size: Joi.number().optional(),
    mimetype: Joi.string().optional()
  })).default([])
}).unknown(true);

module.exports = {
  submitQuoteSchema,
  updateQuoteSchema,
  withdrawQuoteSchema,
  closeInquirySchema,
  inquiryMessageSchema
};
