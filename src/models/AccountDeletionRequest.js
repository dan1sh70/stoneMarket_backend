const mongoose = require('mongoose');

const accountDeletionRequestSchema = new mongoose.Schema({
  identifier: {
    type: String,
    required: true,
    trim: true,
    index: true, // phone number or email
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  reason: {
    type: String,
    default: 'User requested account deletion via Play Store web portal',
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'cancelled'],
    default: 'pending',
    index: true,
  },
  request_ip: {
    type: String,
    default: '',
  },
  data_types_to_delete: [{
    type: String,
    default: ['Personal Profile', 'Catalogue Products', 'Inquiries', 'Mobile Credentials'],
  }],
  notes: {
    type: String,
    default: '',
  },
  requested_at: {
    type: Date,
    default: Date.now,
  },
  scheduled_deletion_date: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days grace period compliant with Google Play
  },
  completed_at: {
    type: Date,
    default: null,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('AccountDeletionRequest', accountDeletionRequestSchema);
