const mongoose = require('mongoose');

const advertisementSchema = new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' }, // nullable for admin-created ads
  title: String,
  imageUrl: String, // S3 URL
  targetUrl: String, // Deep link or external URL
  adType: { type: String, enum: ['home_banner', 'category_banner', 'popup', 'sponsored_listing'], required: true },
  targetCategory: String, // For category ads
  targetState: String, // Geographic targeting
  priority: { type: Number, default: 0 }, // Higher = shown first
  impressions: { type: Number, default: 0 },
  clicks: { type: Number, default: 0 },
  startDate: Date,
  endDate: Date,
  status: { type: String, enum: ['active', 'paused', 'expired'], default: 'active' },
  approvedByAdmin: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Advertisement', advertisementSchema);
