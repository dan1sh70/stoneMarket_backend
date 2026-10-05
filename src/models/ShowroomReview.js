const mongoose = require('mongoose');

const showroomReviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  showroomId: { type: mongoose.Schema.Types.ObjectId, ref: 'BusinessProfile', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  review: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' } // Auto-approve for now
}, { timestamps: true });

showroomReviewSchema.index({ userId: 1, showroomId: 1 }, { unique: true }); // Prevent duplicate reviews

module.exports = mongoose.model('ShowroomReview', showroomReviewSchema);
