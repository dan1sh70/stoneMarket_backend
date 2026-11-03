const mongoose = require('mongoose');

const inquiryActivityLogSchema = new mongoose.Schema({
  inquiry_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inquiry',
    required: true,
    index: true
  },
  performed_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  actor_type: {
    type: String,
    enum: ['buyer', 'manufacturer', 'admin', 'system'],
    default: 'manufacturer'
  },
  activity_type: {
    type: String,
    enum: [
      'inquiry_created',
      'inquiry_distributed',
      'inquiry_viewed',
      'inquiry_reviewed',
      'quote_submitted',
      'quote_revised',
      'quote_viewed',
      'quote_accepted',
      'quote_rejected',
      'quote_withdrawn',
      'message_sent',
      'inquiry_closed',
      'inquiry_reopened',
      'inquiry_completed'
    ],
    required: true,
    index: true
  },
  previous_status: {
    type: String
  },
  new_status: {
    type: String
  },
  stage: {
    type: Number, // 1: Inquiry Requested, 2: In Review, 3: Quotes Received, 4: Completed
    default: 1
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, { timestamps: true });

inquiryActivityLogSchema.index({ inquiry_id: 1, createdAt: -1 });

module.exports = mongoose.model('InquiryActivityLog', inquiryActivityLogSchema);
