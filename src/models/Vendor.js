const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  businessName: { type: String, required: true, index: true },
  slug: { type: String, unique: true },
  category: {
    type: String,
    enum: [
      'Mining',
      'Granite Manufacturer',
      'Traders & Suppliers',
      'Transporters',
      'Machinery',
      'Tools & Abrasives',
      'Industrial Services'
    ]
  },
  subcategory: String,
  description: String,
  logo: String, // S3 URL
  coverImage: String, // S3 URL
  galleryImages: {
    type: [String],
    validate: [v => v.length <= 20, 'Exceeds limit of 20 images']
  },
  gstNumber: { type: String, unique: true, sparse: true },
  gstVerified: { type: Boolean, default: false },
  documentsVerified: { type: Boolean, default: false },
  mobileVerified: { type: Boolean, default: true },
  verificationDocuments: [{
    type: { type: String },
    url: String
  }],
  listingType: { type: String, enum: ['free', 'premium', 'top_featured'], default: 'free' },
  badges: {
    trusted: { type: Boolean, default: false },
    verified: { type: Boolean, default: false },
    premium: { type: Boolean, default: false }
  },
  contact: {
    mobile: String,
    whatsapp: String,
    email: String,
    website: String
  },
  address: {
    line1: String,
    city: String,
    state: String,
    pincode: String
  },
  location: {
    type: {
      type: String,
      enum: ['Point']
    },
    coordinates: {
      type: [Number] // [longitude, latitude]
    }
  },
  stats: {
    profileViews: { type: Number, default: 0 },
    inquiriesReceived: { type: Number, default: 0 },
    productViews: { type: Number, default: 0 }
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'suspended'],
    default: 'pending'
  },
  verificationDocuments: [{
    type: String, // URLs to uploaded docs
    status: { type: String, enum: ['pending', 'approved', 'rejected'] }
  }],
  listingType: { type: String, enum: ['free', 'premium', 'top_featured'], default: 'free' },
  badges: {
    trusted: { type: Boolean, default: false },
    verified: { type: Boolean, default: false },
    premium: { type: Boolean, default: false }
  },
  subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' }
}, { timestamps: true });

// Compound indexes
vendorSchema.index({ location: '2dsphere' });
vendorSchema.index({ businessName: 'text', description: 'text' });

module.exports = mongoose.model('Vendor', vendorSchema);
