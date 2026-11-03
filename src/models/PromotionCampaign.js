const mongoose = require('mongoose');

const promotionCampaignSchema = new mongoose.Schema({
  campaign_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  manufacturer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BusinessProfile',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    default: null
  },
  package_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PromotionPackage',
    required: true
  },
  campaign_type: {
    type: String,
    enum: ['feed', 'listing'],
    required: true,
    index: true
  },
  campaign_name: {
    type: String,
    required: true,
    trim: true
  },
  campaign_status: {
    type: String,
    enum: [
      'draft',
      'pending_payment',
      'payment_processing',
      'scheduled',
      'active',
      'paused',
      'completed',
      'rejected',
      'cancelled',
      'expired'
    ],
    default: 'pending_payment',
    index: true
  },
  start_date: {
    type: Date,
    default: null
  },
  end_date: {
    type: Date,
    default: null
  },
  duration_days: {
    type: Number,
    required: true,
    min: 1
  },
  target_type: {
    type: String,
    enum: ['all_india', 'states', 'districts', 'cities'],
    default: 'all_india'
  },
  targeting_configuration: {
    all_india: { type: Boolean, default: true },
    states: [{ type: String, trim: true }],
    districts: [{ type: String, trim: true }],
    cities: [{ type: String, trim: true }]
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  gst_rate: {
    type: Number,
    default: 18
  },
  gst_amount: {
    type: Number,
    required: true,
    min: 0
  },
  total_amount: {
    type: Number,
    required: true,
    min: 0
  },
  daily_budget: {
    type: Number,
    default: 0
  },
  priority_score: {
    type: Number,
    default: 10,
    index: true
  },
  // Performance metric counters
  impressions_count: {
    type: Number,
    default: 0
  },
  clicks_count: {
    type: Number,
    default: 0
  },
  inquiries_count: {
    type: Number,
    default: 0
  },
  quote_requests_count: {
    type: Number,
    default: 0
  },
  whatsapp_clicks_count: {
    type: Number,
    default: 0
  },
  call_clicks_count: {
    type: Number,
    default: 0
  },
  paused_at: {
    type: Date,
    default: null
  },
  resumed_at: {
    type: Date,
    default: null
  },
  ended_at: {
    type: Date,
    default: null
  },
  is_mock: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

promotionCampaignSchema.index({ campaign_type: 1, campaign_status: 1, priority_score: -1 });
promotionCampaignSchema.index({ start_date: 1, end_date: 1, campaign_status: 1 });

module.exports = mongoose.model('PromotionCampaign', promotionCampaignSchema);
