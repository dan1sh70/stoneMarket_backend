const mongoose = require('mongoose');

const supportFaqSchema = new mongoose.Schema({
  question: { 
    type: String, 
    required: true, 
    trim: true 
  },
  answer: { 
    type: String, 
    required: true, 
    trim: true 
  },
  category: { 
    type: String, 
    enum: [
      'Orders & Delivery', 
      'Stone Types & Pricing', 
      'Quotations & Estimates', 
      'Account & Security', 
      'General'
    ], 
    default: 'General' 
  },
  sort_order: { 
    type: Number, 
    default: 0 
  },
  is_active: { 
    type: Boolean, 
    default: true 
  },
  is_mock: { 
    type: Boolean, 
    default: false 
  }
}, { 
  timestamps: true 
});

supportFaqSchema.index({ category: 1, sort_order: 1 });

module.exports = mongoose.model('SupportFaq', supportFaqSchema);
