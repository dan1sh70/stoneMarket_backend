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
    file_name: String,
    file_path: String,
    file_type: String,
    size: Number,
    file_size: Number,
    mimetype: String
  }],
  referralSource: String,
  contactInfo: {
    name: String,
    company: String,
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
  // Phase 3 Extensions
  inquiry_number: { type: String, index: true },
  requirement_title: String,
  material: String,
  color: String,
  pattern: String,
  country_of_origin: { type: String, default: 'India' },
  delivery_location: String,
  response_deadline: Date,
  assigned_manufacturers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'BusinessProfile' }],
  recipients: [{
    manufacturer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'BusinessProfile' },
    delivery_status: { type: String, default: 'delivered' },
    viewed_at: Date,
    responded_at: Date
  }],
  closure_reason: String,
  closure_comments: String,
  closed_reason: String,
  closed_at: Date,
  inquiry_status: {
    type: String,
    default: 'pending'
  },
  status: { 
    type: String, 
    enum: [
      'new', 
      'submitted', 
      'pending', 
      'in_review', 
      'quotes_received', 
      'partially_quoted',
      'under_review', 
      'provider_contacted', 
      'quotation_received', 
      'viewed', 
      'responded', 
      'accepted', 
      'rejected', 
      'cancelled', 
      'completed', 
      'closed',
      'expired'
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

// Pre-save synchronization between status and inquiry_status
inquirySchema.pre('save', function(next) {
  if (this.isModified('status') && !this.isModified('inquiry_status')) {
    this.inquiry_status = this.status;
  } else if (this.isModified('inquiry_status') && !this.isModified('status')) {
    this.status = this.inquiry_status;
  }
  next();
});

module.exports = mongoose.model('Inquiry', inquirySchema);

