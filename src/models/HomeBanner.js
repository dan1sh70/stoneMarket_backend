const mongoose = require('mongoose');

const homeBannerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String },
  description: { type: String },
  image: { type: String, required: true }, // S3 URL
  mobile_image: { type: String }, // S3 URL
  button_text: { type: String },
  button_url: { type: String },
  target_type: { type: String, enum: ['category', 'service', 'product', 'external', 'none'], default: 'none' },
  target_id: { type: mongoose.Schema.Types.ObjectId }, // Flexible ref
  sort_order: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive', 'scheduled'], default: 'active' },
  start_date: { type: Date },
  end_date: { type: Date }
}, { timestamps: true });

// Scope for active/valid banners
homeBannerSchema.index({ status: 1, sort_order: 1 });

module.exports = mongoose.model('HomeBanner', homeBannerSchema);
