const mongoose = require('mongoose');

const promotionOrderSchema = new mongoose.Schema({
  order_number: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  campaign_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PromotionCampaign',
    required: true,
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
  package_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PromotionPackage',
    required: true
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
  order_status: {
    type: String,
    enum: ['created', 'pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'created',
    index: true
  },
  payment_gateway: {
    type: String,
    default: 'razorpay'
  },
  gateway_order_id: {
    type: String,
    index: true
  },
  notes: {
    type: String
  },
  is_mock: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('PromotionOrder', promotionOrderSchema);
