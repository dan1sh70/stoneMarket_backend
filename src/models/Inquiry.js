const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, // Optional
  category: { type: String, required: true }, // Must match vendor category for routing logic
  subject: String,
  message: String,
  requirements: String, // Detailed requirement text
  contactInfo: {
    name: String,
    mobile: String,
    email: String
  },
  status: { type: String, enum: ['new', 'viewed', 'responded', 'closed'], default: 'new' },
  vendorResponse: {
    message: String,
    respondedAt: Date
  },
  isWhatsAppSent: { type: Boolean, default: false }
}, { timestamps: true });

// Indexes
inquirySchema.index({ vendorId: 1, senderId: 1, category: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('Inquiry', inquirySchema);
