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
  businessProfileId: { type: mongoose.Schema.Types.ObjectId, ref: 'BusinessProfile' },
  material: String,
  cover_image: String,
  pattern: String,
  finish: String,
  size: String,
  thickness: String,
  quality: String,
  approx_weight: String,
  country_of_origin: { type: String, default: 'India' },
  applications: [String],
  selling_price: Number,
  pricing_unit: { type: String, default: 'Sq.ft' },
  quantity: Number,
  quantity_unit: { type: String, default: 'Sq.ft' },
  available_stock: Number,
  stock_unit: { type: String, default: 'Sq.ft' },
  availability_status: { type: String, enum: ['in_stock', 'out_of_stock', 'made_to_order'], default: 'in_stock' },
  target_publishing: {
    states: [String],
    districts: [String],
    categories: [String]
  },
  publishing_status: { type: String, enum: ['draft', 'published', 'archived'], default: 'published' },
  inquiry_count: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
  status: { type: String, enum: ['active', 'inactive', 'draft'], default: 'active' },
  views: { type: Number, default: 0 },
  is_mock: { type: Boolean, default: false }
}, { timestamps: true });

// Indexes
productSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);
