const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  name: { type: String, required: true },
  description: String,
  category: String,
  subcategory: String,
  specifications: [{
    key: String,
    value: String
  }],
  images: [String], // S3 URLs
  priceRange: {
    min: Number,
    max: Number,
    unit: String,
    visible: { type: Boolean, default: true }
  },
  graniteColors: [String], // Stone-specific field
  miningLocation: String, // Source location for mining products
  stock_status: { type: String, enum: ['in_stock', 'out_of_stock', 'on_order'], default: 'in_stock' },
  featured: { type: Boolean, default: false },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  views: { type: Number, default: 0 }
}, { timestamps: true });

// Indexes
productSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);
