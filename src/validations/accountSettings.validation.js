const Joi = require('joi');

const notificationPreferencesSchema = Joi.object({
  new_inquiry: Joi.boolean().optional(),
  lead_messages: Joi.boolean().optional(),
  quote_requests: Joi.boolean().optional(),
  ad_performance: Joi.boolean().optional(),
  subscription_billing: Joi.boolean().optional(),
  marketing_emails: Joi.boolean().optional(),
  channels: Joi.object({
    in_app: Joi.boolean().optional(),
    push: Joi.boolean().optional(),
    email: Joi.boolean().optional(),
    sms: Joi.boolean().optional()
  }).optional()
}).unknown(true);

const quietHoursSchema = Joi.object({
  enabled: Joi.boolean().optional(),
  start_time: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).optional().messages({
    'string.pattern.base': 'start_time must be in 24-hour HH:mm format (e.g. 22:00)'
  }),
  end_time: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).optional().messages({
    'string.pattern.base': 'end_time must be in 24-hour HH:mm format (e.g. 08:00)'
  }),
  timezone: Joi.string().trim().optional()
}).unknown(true);

const userPreferencesSchema = Joi.object({
  language: Joi.string().valid('en', 'hi', 'ur').optional(),
  appearance: Joi.string().valid('light', 'dark', 'system').optional(),
  timezone: Joi.string().trim().optional()
}).unknown(true);

const changePasswordSchema = Joi.object({
  current_password: Joi.string().required().messages({
    'any.required': 'Current password is required'
  }),
  new_password: Joi.string().min(6).required().messages({
    'string.min': 'New password must be at least 6 characters long',
    'any.required': 'New password is required'
  }),
  confirm_password: Joi.string().valid(Joi.ref('new_password')).required().messages({
    'any.only': 'Confirm password must match new password',
    'any.required': 'Confirm password is required'
  })
});

module.exports = {
  notificationPreferencesSchema,
  quietHoursSchema,
  userPreferencesSchema,
  changePasswordSchema
};
