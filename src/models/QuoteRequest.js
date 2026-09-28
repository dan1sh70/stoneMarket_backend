const mongoose = require('mongoose');

const quoteRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'BusinessProfile', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  quantity: { type: Number, required: true },
  unit: { type: String, default: 'Sq.Ft' },
  message: { type: String, required: true },
  status: { type: String, enum: ['pending', 'viewed', 'responded', 'accepted', 'rejected', 'closed'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('QuoteRequest', quoteRequestSchema);
