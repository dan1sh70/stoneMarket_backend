const mongoose = require('mongoose');

const buyerReviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'BusinessProfile', required: true, index: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  review: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },
  is_mock: { type: Boolean, default: false }
}, { timestamps: true });

buyerReviewSchema.index({ userId: 1, buyerId: 1 }, { unique: true });

module.exports = mongoose.model('BuyerReview', buyerReviewSchema);
