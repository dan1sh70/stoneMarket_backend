const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  lead_number: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  inquiry_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inquiry',
    required: true,
    index: true
  },
  buyer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  buyer_business_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BusinessProfile'
  },
  manufacturer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BusinessProfile',
    required: true,
    index: true
  },
  lead_status: {
    type: String,
    enum: ['new', 'in_discussion', 'quote_sent', 'converted', 'closed', 'expired'],
    default: 'new',
    index: true
  },
  priority: {
    type: String,
    enum: ['normal', 'high', 'urgent'],
    default: 'normal'
  },
  urgency: {
    type: String,
    enum: ['immediate', 'within_15_days', 'within_30_days', 'flexible'],
    default: 'within_15_days'
  },
  usage_application: {
    type: String,
    default: 'Flooring'
  },
  budget_min: {
    type: Number,
    default: null
  },
  budget_max: {
    type: Number,
    default: null
  },
  currency: {
    type: String,
    default: 'INR'
  },
  budget_type: {
    type: String,
    default: 'estimated'
  },
  assigned_at: {
    type: Date,
    default: Date.now
  },
  first_viewed_at: {
    type: Date,
    default: null
  },
  last_activity_at: {
    type: Date,
    default: Date.now
  },
  converted_at: {
    type: Date,
    default: null
  },
  closed_at: {
    type: Date,
    default: null
  },
  closure_reason: {
    type: String,
    default: null
  },
  closure_comments: {
    type: String,
    default: null
  },
  share_token: {
    type: String,
    index: true,
    default: null
  },
  is_mock: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

leadSchema.index({ manufacturer_id: 1, lead_status: 1, createdAt: -1 });

module.exports = mongoose.model('Lead', leadSchema);
