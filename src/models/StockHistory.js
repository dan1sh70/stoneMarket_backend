const mongoose = require('mongoose');

const stockHistorySchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true
  },
  businessProfileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BusinessProfile',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  previous_stock: {
    type: Number,
    required: true
  },
  updated_stock: {
    type: Number,
    required: true
  },
  stock_change: {
    type: Number,
    required: true
  },
  change_type: {
    type: String,
    enum: ['set', 'increase', 'decrease', 'adjustment'],
    default: 'adjustment'
  },
  change_reason: {
    type: String,
    default: 'Stock adjustment'
  },
  updated_by: {
    type: String,
    default: 'Showroom Manager'
  },
  date_time: {
    type: Date,
    default: Date.now,
    index: true
  }
}, { timestamps: true });

stockHistorySchema.index({ productId: 1, date_time: -1 });
stockHistorySchema.index({ businessProfileId: 1, date_time: -1 });

module.exports = mongoose.model('StockHistory', stockHistorySchema);
