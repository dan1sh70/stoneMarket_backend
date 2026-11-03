const mongoose = require('mongoose');

const campaignActivityLogSchema = new mongoose.Schema({
  campaign_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PromotionCampaign',
    required: true,
    index: true
  },
  action: {
    type: String,
    enum: [
      'created',
      'order_generated',
      'payment_pending',
      'payment_successful',
      'payment_failed',
      'activated',
      'paused',
      'resumed',
      'ended',
      'completed',
      'expired',
      'rejected',
      'cancelled',
      'status_changed'
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
  performed_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, { timestamps: true });

campaignActivityLogSchema.index({ campaign_id: 1, createdAt: -1 });

module.exports = mongoose.model('CampaignActivityLog', campaignActivityLogSchema);
