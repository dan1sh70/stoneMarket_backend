const mongoose = require('mongoose');

const buyerTypeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true, index: true },
  description: { type: String },
  icon: { type: String },
  sort_order: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  is_mock: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('BuyerType', buyerTypeSchema);
