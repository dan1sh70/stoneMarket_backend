const mongoose = require('mongoose');

const inquiryQuotationSchema = new mongoose.Schema({
  quote_number: {
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
  manufacturer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BusinessProfile',
    required: true,
    index: true
  },
  manufacturer_user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  buyer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    default: null
  },
  quoted_quantity: {
    type: Number,
    required: true,
    min: 0.01
  },
  quantity_unit: {
    type: String,
    default: 'Sq.ft'
  },
  unit_price: {
    type: Number,
    required: true,
    min: 0
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  tax_rate: {
    type: Number,
    default: 18
  },
  tax_amount: {
    type: Number,
    default: 0
  },
  shipping_charges: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  total_amount: {
    type: Number,
    required: true,
    min: 0
  },
  material: {
    type: String,
    trim: true
  },
  size: {
    type: String,
    trim: true
  },
  thickness: {
    type: String,
    trim: true
  },
  finish: {
    type: String,
    trim: true
  },
  quality: {
    type: String,
    trim: true
  },
  delivery_timeline: {
    type: String,
    trim: true,
    default: '7-10 Business Days'
  },
  payment_terms: {
    type: String,
    trim: true,
    default: '50% Advance, 50% on Delivery'
  },
  advance_payment: {
    type: Number,
    default: 0
  },
  balance_payment: {
    type: Number,
    default: 0
  },
  validity_date: {
    type: Date
  },
  warranty: {
    type: String,
    default: 'Standard Manufacturing Quality Guarantee'
  },
  quote_status: {
    type: String,
    enum: [
      'draft',
      'submitted',
      'received',
      'viewed',
      'under_discussion',
      'accepted',
      'rejected',
      'withdrawn',
      'expired'
    ],
    default: 'submitted',
    index: true
  },
  notes: {
    type: String
  },
  attachments: [{
    url: String,
    filename: String,
    size: Number,
    mimetype: String
  }],
  status_history: [{
    status: String,
    updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    remarks: String,
    timestamp: { type: Date, default: Date.now }
  }],
  rejection_reason: {
    type: String
  },
  withdrawal_reason: {
    type: String
  },
  is_mock: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

inquiryQuotationSchema.index({ inquiry_id: 1, manufacturer_id: 1 }, { unique: true });

module.exports = mongoose.model('InquiryQuotation', inquiryQuotationSchema);
