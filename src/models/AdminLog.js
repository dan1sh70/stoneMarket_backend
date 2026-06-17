const mongoose = require('mongoose');

const adminLogSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true }, // e.g. "VENDOR_APPROVED", "USER_SUSPENDED", "AD_REJECTED"
  targetType: { type: String, enum: ['user', 'vendor', 'ad', 'news', 'inquiry'], required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
  details: { type: mongoose.Schema.Types.Mixed }, // Before/after state or action details
  ip: String
}, { timestamps: true });

module.exports = mongoose.model('AdminLog', adminLogSchema);
