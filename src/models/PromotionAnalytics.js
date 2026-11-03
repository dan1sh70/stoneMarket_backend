const mongoose = require('mongoose');

const promotionAnalyticsSchema = new mongoose.Schema({
  campaign_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PromotionCampaign',
    required: true,
    index: true
  },
  event_type: {
    type: String,
    enum: [
      'impression',
      'click',
      'product_view',
      'profile_view',
      'inquiry',
      'quote_request',
      'whatsapp_click',
      'call_click'
    ],
    required: true,
    index: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    default: null
  },
  source: {
    type: String,
    default: 'buyer_feed'
  },
  location: {
    state: { type: String, trim: true },
    district: { type: String, trim: true },
    city: { type: String, trim: true }
  },
  ip_address: {
    type: String
  },
  user_agent: {
    type: String
  },
  event_date: {
    type: Date,
    default: Date.now,
    index: true
  },
  is_mock: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

promotionAnalyticsSchema.index({ campaign_id: 1, event_type: 1, event_date: -1 });

module.exports = mongoose.model('PromotionAnalytics', promotionAnalyticsSchema);
