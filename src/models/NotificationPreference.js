const mongoose = require('mongoose');

const notificationPreferenceSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  new_inquiry: {
    type: Boolean,
    default: true
  },
  lead_messages: {
    type: Boolean,
    default: true
  },
  quote_requests: {
    type: Boolean,
    default: true
  },
  ad_performance: {
    type: Boolean,
    default: true
  },
  subscription_billing: {
    type: Boolean,
    default: true
  },
  marketing_emails: {
    type: Boolean,
    default: false
  },
  channels: {
    in_app: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: false }
  }
}, { timestamps: true });

module.exports = mongoose.model('NotificationPreference', notificationPreferenceSchema);
