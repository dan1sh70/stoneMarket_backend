const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  image: { type: String },
  type: { type: String, enum: ['news', 'event', 'market_update', 'announcement'], required: true },
  url: { type: String },
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'published' },
  published_at: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Activity', activitySchema);
