const mongoose = require('mongoose');

const promotionPackageSchema = new mongoose.Schema({
  promotion_type: {
    type: String,
    enum: ['feed', 'listing'],
    required: true,
    index: true
  },
  package_name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  duration_days: {
    type: Number,
    required: true,
    min: 1
  },
  benefits: [{
    type: String
  }],
  promotional_multiplier: {
    type: String // e.g. "2.5x Inquiries", "Top 3 Placement", "10x Reach"
  },
  badge_label: {
    type: String,
    default: 'Sponsored'
  },
  display_order: {
    type: Number,
    default: 0
  },
  theme_color: {
    type: String,
    enum: ['blue', 'orange', 'purple'],
    default: 'blue'
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
    index: true
  },
  is_mock: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

promotionPackageSchema.index({ promotion_type: 1, status: 1, display_order: 1 });

module.exports = mongoose.model('PromotionPackage', promotionPackageSchema);
