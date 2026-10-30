const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'BusinessProfile' },
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'BusinessProfile' },
  supplierType: { type: String },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, // Optional
  category: { type: String, required: true }, // Must match vendor category for routing logic
  subject: String,
  message: String,
  requirements: String, // Detailed requirement text
  quantity: Number, // Requested quantity
  unit: String,
  size: String,
  thickness: String,
  finish: String,
  grade: String,
  deliveryLocation: {
    city: String,
    state: String,
    address: String
  },
  pickupLocation: {
    city: String,
    state: String,
    address: String
  },
  transport_type: { type: String, enum: ['national', 'local', null] },
  vehicle_type: String,
  vehicle_quantity: { type: Number, default: 1 },
  cargo_type: String,
  pickup_date: Date,
  expected_delivery_date: Date,
  special_handling: String,
  reference_number: String,
  attachments: [{
    url: String,
    filename: String,
    size: Number,
    mimetype: String
  }],
  referralSource: String,
  contactInfo: {
    name: String,
    mobile: String,
    email: String,
    city: String
  },
  edge_profile: String,
  quality: String,
  delivery_timeline: String,
  additional_specifications: String,
  color_requirements: String,
  pattern_requirements: String,
  packaging_requirements: String,
  budget_range: String,
  closed_reason: String,
  closed_at: Date,
  status: { 
    type: String, 
    enum: [
      'new', 
      'submitted', 
      'pending', 
      'in_review', 
      'quotes_received', 
      'under_review', 
      'provider_contacted', 
      'quotation_received', 
      'viewed', 
      'responded', 
      'accepted', 
      'rejected', 
      'cancelled', 
      'completed', 
      'closed'
    ], 
    default: 'pending' 
  },
  status_history: [{
    previous_status: { type: String },
    new_status: { type: String },
    updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    remarks: { type: String },
    timestamp: { type: Date, default: Date.now }
  }],
  quotations_count: { type: Number, default: 0 },
  vendorResponse: {
    message: String,
    respondedAt: Date
  },
  isWhatsAppSent: { type: Boolean, default: false },
  is_mock: { type: Boolean, default: false }
}, { timestamps: true });

// Indexes
inquirySchema.index({ vendorId: 1, senderId: 1, category: 1, status: 1, createdAt: -1 });
inquirySchema.index({ businessId: 1, senderId: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('Inquiry', inquirySchema);
