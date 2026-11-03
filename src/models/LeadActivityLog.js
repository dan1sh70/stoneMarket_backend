const mongoose = require('mongoose');

const leadActivityLogSchema = new mongoose.Schema({
  lead_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    required: true,
    index: true
  },
  actor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  actor_type: {
    type: String,
    enum: ['buyer', 'manufacturer', 'admin', 'system'],
    default: 'manufacturer'
  },
  event_type: {
    type: String,
    enum: [
      'lead_created',
      'lead_received',
      'lead_viewed',
      'lead_marked_in_discussion',
      'buyer_contacted',
      'message_received',
      'message_sent',
      'quote_created',
      'quote_sent',
      'quote_viewed',
      'quote_revised',
      'quote_accepted',
      'lead_converted',
      'lead_closed',
      'note_added',
      'note_updated',
      'note_deleted',
      'lead_shared'
    ],
    required: true,
    index: true
  },
  previous_status: {
    type: String,
    default: null
  },
  new_status: {
    type: String,
    default: null
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, { timestamps: true });

leadActivityLogSchema.index({ lead_id: 1, createdAt: -1 });

module.exports = mongoose.model('LeadActivityLog', leadActivityLogSchema);
