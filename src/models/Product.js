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
  business_type: { type: String, enum: ['manufacturer', 'mining', 'showroom', 'trader'], default: 'manufacturer', index: true },
  sku: { type: String, index: true },
  color_name: String,
  block_dimensions: {
    length: Number,
    width: Number,
    height: Number,
    dimension_unit: { type: String, enum: ['CM', 'MM', 'METER', 'FEET'], default: 'FEET' }
  },
  volume_cbm: Number,
  additional_sizes: [{
    length: Number,
    width: Number,
    height: Number,
    dimension_unit: String,
    volume_cbm: Number
  }],
  weight: Number,
  weight_unit: { type: String, default: 'TON' },
  min_order_quantity: { type: Number, default: 1 },
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
  price: Number,
  selling_price: Number,
  pricing_unit: { type: String, default: 'Sq.ft' },
  quantity: Number,
  quantity_unit: { type: String, default: 'Sq.ft' },
  stock: Number,
  available_stock: Number,
  short_description: String,
  product_origin: String,
  low_stock_threshold: { type: Number, default: 10 },
  is_low_stock: { type: Boolean, default: false },
  is_out_of_stock: { type: Boolean, default: false },
  stock_unit: { type: String, default: 'Sq.ft' },
  availability_status: { 
    type: String, 
    enum: [
      'in_stock', 
      'limited_stock', 
      'out_of_stock', 
      'available_on_order', 
      'discontinued', 
      'made_to_order',
      'In Stock', 
      'Limited Stock', 
      'Out of Stock', 
      'Available on Order', 
      'Discontinued'
    ], 
    default: 'in_stock' 
  },
  target_publishing: {
    states: [String],
    districts: [String],
    categories: [String]
  },
  publishing_status: { type: String, enum: ['draft', 'published', 'archived'], default: 'published' },
  inquiry_count: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
  is_promoted: { type: Boolean, default: false },
  active_promotion_id: { type: mongoose.Schema.Types.ObjectId, ref: 'PromotionCampaign' },
  promotion_priority: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive', 'draft'], default: 'active' },
  views: { type: Number, default: 0 },
  is_mock: { type: Boolean, default: false }
}, { timestamps: true });

// Pre-save synchronization hook
productSchema.pre('save', function (next) {
  if (this.price !== undefined && this.selling_price === undefined) {
    this.selling_price = this.price;
  } else if (this.selling_price !== undefined && this.price === undefined) {
    this.price = this.selling_price;
  }
  if (this.stock !== undefined && this.available_stock === undefined) {
    this.available_stock = this.stock;
  } else if (this.available_stock !== undefined && this.stock === undefined) {
    this.stock = this.available_stock;
  }
  if (this.available_stock !== undefined) {
    this.is_out_of_stock = this.available_stock <= 0;
    this.is_low_stock = this.available_stock > 0 && this.available_stock <= (this.low_stock_threshold || 10);
  }
  next();
});

// Indexes
productSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);
