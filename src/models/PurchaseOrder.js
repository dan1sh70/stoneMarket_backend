const mongoose = require('mongoose');

const purchaseOrderItemSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  material_name: { type: String, required: true },
  material_category: { type: String },
  size: { type: String },
  thickness: { type: String },
  finish: { type: String },
  quality: { type: String },
  quantity: { type: Number, required: true, min: 0.01 },
  quantity_unit: { type: String, default: 'Sq.ft' },
  unit_price: { type: Number, required: true, min: 0 },
  total_amount: { type: Number, required: true, min: 0 }
});

const purchaseOrderSchema = new mongoose.Schema({
  order_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  buyer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BusinessProfile',
    required: true,
    index: true
  },
  buyer_user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  supplier_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BusinessProfile',
    required: true,
    index: true
  },
  supplier_business_type: {
    type: String,
    enum: ['manufacturer', 'mining', 'showroom', 'trader'],
    default: 'manufacturer'
  },
  supplier_name: { type: String },
  
  requirement_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BuyerRequirement',
    index: true
  },
  inquiry_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inquiry',
    index: true
  },
  quote_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InquiryQuotation',
    index: true
  },
  quote_number: { type: String },

  items: [purchaseOrderItemSchema],

  pricing: {
    subtotal: { type: Number, required: true, min: 0 },
    tax_rate: { type: Number, default: 18 },
    tax_amount: { type: Number, default: 0 },
    shipping_charges: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total_amount: { type: Number, required: true, min: 0 },
    advance_paid: { type: Number, default: 0 },
    balance_amount: { type: Number, default: 0 }
  },

  delivery_address: {
    site_name: { type: String },
    full_address: { type: String, required: true },
    city: { type: String },
    state: { type: String },
    pincode: { type: String },
    contact_person: { type: String },
    contact_phone: { type: String }
  },
  
  expected_delivery_date: { type: Date },
  actual_delivery_date: { type: Date },

  payment_terms: { type: String, default: '50% Advance, 50% on Delivery' },
  payment_status: {
    type: String,
    enum: ['pending', 'advance_paid', 'fully_paid', 'refunded'],
    default: 'pending'
  },

  order_status: {
    type: String,
    enum: [
      'pending',
      'confirmed',
      'processing',
      'in_production',
      'ready_for_dispatch',
      'dispatched',
      'in_transit',
      'delivered',
      'completed',
      'cancelled'
    ],
    default: 'confirmed',
    index: true
  },

  status_timeline: [{
    status: { type: String, required: true },
    title: { type: String },
    description: { type: String },
    timestamp: { type: Date, default: Date.now },
    updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],

  dispatch_details: {
    transporter_name: { type: String },
    vehicle_number: { type: String },
    driver_name: { type: String },
    driver_phone: { type: String },
    lr_number: { type: String }, // Lorry Receipt
    dispatch_date: { type: Date },
    tracking_url: { type: String }
  },

  documents: [{
    doc_type: { type: String }, // Invoice, E-Way Bill, Delivery Challan, Test Report, Warranty
    title: { type: String },
    url: { type: String },
    uploaded_at: { type: Date, default: Date.now }
  }],

  buyer_notes: { type: String },
  cancellation_reason: { type: String },
  rating: { type: Number, min: 1, max: 5 },
  review: { type: String },
  is_mock: { type: Boolean, default: false }
}, { timestamps: true });

purchaseOrderSchema.index({ order_id: 1, buyer_id: 1 });

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema);

