const mongoose = require('mongoose');

const userSessionSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  session_id: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  device_name: { 
    type: String, 
    default: 'Mobile Device' 
  },
  device_type: { 
    type: String, 
    enum: ['mobile', 'desktop', 'tablet', 'unknown'], 
    default: 'mobile' 
  },
  ip_address: { 
    type: String, 
    default: '127.0.0.1' 
  },
  location: { 
    type: String, 
    default: 'India' 
  },
  user_agent: { 
    type: String, 
    default: '' 
  },
  last_active: { 
    type: Date, 
    default: Date.now 
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

userSessionSchema.index({ userId: 1, is_active: 1, last_active: -1 });

module.exports = mongoose.model('UserSession', userSessionSchema);
