const mongoose = require('mongoose');

const estimateAuditLogSchema = new mongoose.Schema({
  estimate_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Estimate',
    required: true,
    index: true
  },
  actor_user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true // e.g. "CREATED", "UPDATED", "PAYMENT_ADDED", "PAYMENT_REVERSED", "FINALIZED", "CANCELLED"
  },
  previous_values: {
    type: mongoose.Schema.Types.Mixed
  },
  new_values: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('EstimateAuditLog', estimateAuditLogSchema);
