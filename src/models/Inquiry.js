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
  status: { type: String, enum: ['new', 'viewed', 'responded', 'closed'], default: 'new' },
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
