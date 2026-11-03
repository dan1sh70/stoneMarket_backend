const Joi = require('joi');

const updateLeadStatusSchema = Joi.object({
  lead_status: Joi.string()
    .valid('new', 'in_discussion', 'quote_sent', 'converted', 'closed', 'expired')
    .required(),
  closure_reason: Joi.string().trim().optional().allow(null, ''),
  closure_comments: Joi.string().trim().optional().allow(null, '')
}).unknown(true);

const createLeadNoteSchema = Joi.object({
  note: Joi.string().trim().min(1).max(2000).required()
});

const updateLeadNoteSchema = Joi.object({
  note: Joi.string().trim().min(1).max(2000).required()
});

const shareLeadSchema = Joi.object({
  channel: Joi.string().valid('copy_link', 'native_share', 'whatsapp', 'email', 'generic').optional().default('copy_link')
}).unknown(true);

module.exports = {
  updateLeadStatusSchema,
  createLeadNoteSchema,
  updateLeadNoteSchema,
  shareLeadSchema
};
