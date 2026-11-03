const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  payment_reference: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PromotionOrder',
    required: true,
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
  payment_gateway: {
    type: String,
    enum: ['razorpay', 'cashfree', 'paytm', 'sandbox'],
    default: 'razorpay'
  },
  gateway_order_id: {
    type: String,
    index: true
  },
  gateway_payment_id: {
    type: String,
    index: true
  },
  gateway_signature: {
    type: String
  },
  transaction_reference: {
    type: String,
    index: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  payment_status: {
    type: String,
    enum: ['created', 'pending', 'processing', 'successful', 'failed', 'refunded', 'partially_refunded'],
    default: 'created',
    index: true
  },
  payment_method: {
    type: String,
    default: 'upi'
  },
  payment_verified_at: {
    type: Date,
    default: null
  },
  raw_response: {
    type: mongoose.Schema.Types.Mixed
  },
  error_message: {
    type: String
  },
  is_mock: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
