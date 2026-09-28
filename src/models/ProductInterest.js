const mongoose = require('mongoose');

const productInterestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
}, { timestamps: true });

// Prevent duplicate interests
productInterestSchema.index({ userId: 1, productId: 1 }, { unique: true });
productInterestSchema.index({ productId: 1 }); // For counting

module.exports = mongoose.model('ProductInterest', productInterestSchema);
