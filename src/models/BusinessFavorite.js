const mongoose = require('mongoose');

const businessFavoriteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'BusinessProfile', required: true },
  is_mock: { type: Boolean, default: false }
}, { timestamps: true });

businessFavoriteSchema.index({ userId: 1, businessId: 1 }, { unique: true });

module.exports = mongoose.model('BusinessFavorite', businessFavoriteSchema);
