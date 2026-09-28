const mongoose = require('mongoose');

const mainCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  description: { type: String },
  image: { type: String }, // S3 URL
  icon: { type: String },
  sort_order: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  // Optional: keep track of counts asynchronously
  business_count: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('MainCategory', mainCategorySchema);
