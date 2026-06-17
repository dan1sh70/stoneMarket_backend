const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: String,
  summary: String, // Short preview text
  imageUrl: String, // S3 URL
  type: {
    type: String,
    enum: [
      'industry_news',
      'government_announcement',
      'exhibition_alert',
      'market_update',
      'breaking_news'
    ]
  },
  isBreakingNews: { type: Boolean, default: false }, // Triggers popup on app open
  isPushNotification: { type: Boolean, default: false },
  targetAudience: { type: String, enum: ['all', 'vendors', 'buyers'], default: 'all' },
  publishedAt: Date,
  expiresAt: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // admin
}, { timestamps: true });

module.exports = mongoose.model('News', newsSchema);
