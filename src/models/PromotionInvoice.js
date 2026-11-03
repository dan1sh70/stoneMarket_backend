const mongoose = require('mongoose');

const promotionInvoiceSchema = new mongoose.Schema({
  invoice_number: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  invoice_date: {
    type: Date,
    default: Date.now,
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
  campaign_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PromotionCampaign',
    required: true,
    index: true
  },
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PromotionOrder',
    required: true
  },
  payment_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
    required: true
  },
  seller_details: {
    company_name: { type: String, default: 'Stone Market India Pvt. Ltd.' },
    legal_name: { type: String, default: 'Stone Market India Private Limited' },
    address: { type: String, default: 'RIICO Industrial Area, Kishangarh, Ajmer, Rajasthan - 305801' },
    state: { type: String, default: 'Rajasthan' },
    state_code: { type: String, default: '08' },
    gstin: { type: String, default: '08AAAAA0000A1Z5' },
    pan: { type: String, default: 'AAAAA0000A' },
    phone: { type: String, default: '+91 98765 43210' },
    email: { type: String, default: 'billing@stonemarketindia.com' },
    cin: { type: String, default: 'U14100RJ2025PTC081234' }
  },
  buyer_details: {
    company_name: { type: String, required: true },
    billing_address: { type: String, default: 'India' },
    state: { type: String, default: 'Rajasthan' },
    state_code: { type: String, default: '08' },
    gstin: { type: String, default: '' },
    phone: { type: String },
    email: { type: String },
    contact_person: { type: String }
  },
  promotion_type: {
    type: String,
    enum: ['feed', 'listing'],
    required: true
  },
  package_name: {
    type: String,
    required: true
  },
  duration_days: {
    type: Number,
    required: true
  },
  taxable_amount: {
    type: Number,
    required: true
  },
  gst_rate: {
    type: Number,
    default: 18
  },
  cgst_rate: {
    type: Number,
    default: 9
  },
  cgst_amount: {
    type: Number,
    default: 0
  },
  sgst_rate: {
    type: Number,
    default: 9
  },
  sgst_amount: {
    type: Number,
    default: 0
  },
  igst_rate: {
    type: Number,
    default: 0
  },
  igst_amount: {
    type: Number,
    default: 0
  },
  gst_amount: {
    type: Number,
    required: true
  },
  total_amount: {
    type: Number,
    required: true
  },
  payment_status: {
    type: String,
    default: 'paid'
  },
  transaction_reference: {
    type: String,
    required: true
  },
  invoice_file: {
    type: String
  },
  is_mock: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('PromotionInvoice', promotionInvoiceSchema);
