const mongoose = require('mongoose');

const customerNotificationSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  title: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  category: { 
    type: String, 
    enum: [
      'New Inquiry', 
      'Lead Messages', 
      'Quote Requests', 
      'Ad Performance', 
      'Subscription & Billing', 
      'Marketing Emails', 
      'Order Updates',
      'System'
    ], 
    default: 'New Inquiry' 
  },
  related_entity_id: { 
    type: mongoose.Schema.Types.ObjectId 
  },
  related_entity_type: { 
    type: String, 
    enum: ['inquiry', 'quote', 'estimate', 'ticket', 'system'], 
    default: 'inquiry' 
  },
  is_read: { 
    type: Boolean, 
    default: false,
    index: true 
  },
  read_at: { 
    type: Date, 
    default: null 
  },
  deep_link: { 
    type: String, 
    default: null 
  },
  is_mock: { 
    type: Boolean, 
    default: false 
  }
}, { 
  timestamps: true 
});

customerNotificationSchema.index({ userId: 1, is_read: 1, createdAt: -1 });

module.exports = mongoose.model('CustomerNotification', customerNotificationSchema);
