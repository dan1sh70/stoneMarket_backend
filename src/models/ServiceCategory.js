const mongoose = require('mongoose');

const serviceCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true, index: true },
  description: { type: String, default: null },
  icon: { type: String, default: null }, // S3 URL or icon identifier
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  sort_order: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('ServiceCategory', serviceCategorySchema);
