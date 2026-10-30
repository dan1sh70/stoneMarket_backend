const Joi = require('joi');

const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  full_name: Joi.string().min(2).max(100).optional(),
  whatsapp_number: Joi.string().allow('', null).optional(),
  email: Joi.string().email().allow('', null).optional(),
  city: Joi.string().allow('', null).optional(),
  state: Joi.string().allow('', null).optional(),
  date_of_birth: Joi.date().iso().allow(null).optional(),
  bio: Joi.string().max(500).allow('', null).optional()
});

const personalDetailsSchema = Joi.object({
  full_name: Joi.string().min(2).max(100).optional(),
  name: Joi.string().min(2).max(100).optional(),
  whatsapp_number: Joi.string().allow('', null).optional(),
  date_of_birth: Joi.date().iso().allow(null).optional(),
  city: Joi.string().allow('', null).optional(),
  state: Joi.string().allow('', null).optional()
});

const verifyMobileSchema = Joi.object({
  new_mobile: Joi.string()
    .pattern(/^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/)
    .required()
    .messages({
      'string.pattern.base': 'Please provide a valid Indian 10-digit mobile number'
    })
});

const verifyOtpSchema = Joi.object({
  code: Joi.string().min(4).max(6).optional(),
  otp: Joi.string().min(4).max(6).optional()
}).or('code', 'otp');

const quoteRequestSchema = Joi.object({
  product_id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null, '').optional(),
  productId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null, '').optional(),
  supplier_id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null, '').optional(),
  supplierId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).allow(null, '').optional(),
  product_name: Joi.string().allow('', null).optional(),
  product_image: Joi.string().allow('', null).optional(),
  category: Joi.string().allow('', null).optional(),
  quantity: Joi.number().positive().required(),
  unit: Joi.string().default('Sq.Ft'),
  size: Joi.string().allow('', null).optional(),
  thickness: Joi.string().allow('', null).optional(),
  finish: Joi.string().allow('', null).optional(),
  grade: Joi.string().allow('', null).optional(),
  quality: Joi.string().allow('', null).optional(),
  edge_profile: Joi.string().allow('', null).optional(),
  delivery_location: Joi.object({
    city: Joi.string().allow('', null).optional(),
    state: Joi.string().allow('', null).optional(),
    address: Joi.string().allow('', null).optional(),
    pin_code: Joi.string().allow('', null).optional()
  }).optional(),
  additional_specifications: Joi.string().allow('', null).optional(),
  color_requirements: Joi.string().allow('', null).optional(),
  pattern_requirements: Joi.string().allow('', null).optional(),
  packaging_requirements: Joi.string().allow('', null).optional(),
  message: Joi.string().allow('', null).optional(),
  attachments: Joi.array().items(Joi.object({
    url: Joi.string().required(),
    filename: Joi.string().optional(),
    size: Joi.number().optional(),
    mimetype: Joi.string().optional()
  })).optional(),
  budget_range: Joi.string().allow('', null).optional(),
  delivery_timeline: Joi.string().allow('', null).optional(),
  required_delivery_date: Joi.date().iso().optional(),
  referral_source: Joi.string().allow('', null).optional()
});

const compareQuotesSchema = Joi.object({
  quote_ids: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)).min(2).required()
    .messages({
      'array.min': 'Please select at least 2 quotations to compare'
    })
});

const addressSchema = Joi.object({
  state: Joi.string().required(),
  district: Joi.string().required(),
  area: Joi.string().allow('', null).optional(),
  full_address: Joi.string().required(),
  pin_code: Joi.string().pattern(/^\d{6}$/).required()
    .messages({
      'string.pattern.base': 'PIN code must be a valid 6-digit postal code'
    }),
  address_label: Joi.string().valid('Home', 'Office', 'Project Site', 'Warehouse', 'Site', 'Other').default('Home'),
  is_default: Joi.boolean().default(false)
});

const supportTicketSchema = Joi.object({
  subject: Joi.string().min(3).max(200).required(),
  category: Joi.string().valid(
    'Orders & Delivery', 
    'Stone Types & Pricing', 
    'Quotations & Estimates', 
    'Account & Security', 
    'General'
  ).default('General'),
  description: Joi.string().min(5).max(2000).required(),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
  attachments: Joi.array().items(Joi.object({
    url: Joi.string().required(),
    filename: Joi.string().optional(),
    size: Joi.number().optional(),
    mimetype: Joi.string().optional()
  })).optional()
});

const ticketMessageSchema = Joi.object({
  message: Joi.string().min(1).max(2000).required(),
  attachments: Joi.array().items(Joi.object({
    url: Joi.string().required(),
    filename: Joi.string().optional(),
    size: Joi.number().optional(),
    mimetype: Joi.string().optional()
  })).optional()
});

const changePasswordSchema = Joi.object({
  current_password: Joi.string().min(6).required(),
  new_password: Joi.string().min(6).required(),
  confirm_new_password: Joi.string().valid(Joi.ref('new_password')).required()
    .messages({
      'any.only': 'Confirm password must match the new password'
    })
});

const notificationSettingsSchema = Joi.object({
  new_inquiry: Joi.boolean().optional(),
  lead_messages: Joi.boolean().optional(),
  quote_requests: Joi.boolean().optional(),
  ad_performance: Joi.boolean().optional(),
  subscription_billing: Joi.boolean().optional(),
  marketing_emails: Joi.boolean().optional()
});

const quietHoursSchema = Joi.object({
  enabled: Joi.boolean().required(),
  start_time: Joi.string().pattern(/^\d{2}:\d{2}$/).default('22:00'),
  end_time: Joi.string().pattern(/^\d{2}:\d{2}$/).default('08:00'),
  timezone: Joi.string().default('Asia/Kolkata')
});

const preferencesSchema = Joi.object({
  language: Joi.string().valid('en', 'hi', 'gu', 'mr', 'ta', 'te', 'kn', 'bn', 'es', 'fr').default('en'),
  appearance: Joi.string().valid('light', 'dark', 'system').default('system')
});

module.exports = {
  updateProfileSchema,
  personalDetailsSchema,
  verifyMobileSchema,
  verifyOtpSchema,
  quoteRequestSchema,
  compareQuotesSchema,
  addressSchema,
  supportTicketSchema,
  ticketMessageSchema,
  changePasswordSchema,
  notificationSettingsSchema,
  quietHoursSchema,
  preferencesSchema
};
