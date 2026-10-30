const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobile: { type: String, unique: true, required: true, index: true },
  email: { type: String, unique: true, sparse: true },
  password: { type: String }, // bcrypt-hashed
  role: { 
    type: String, 
    enum: [
      'admin', 
      'mining', 
      'manufacturer', 
      'showroom', 
      'trader', 
      'buyer', 
      'transport_national', 
      'transport_local', 
      'customer'
    ], 
    default: 'customer' 
  },
  googleProviderId: { type: String, sparse: true, unique: true },
  status: { type: String, enum: ['active', 'suspended', 'pending'], default: 'pending' },
  otp: {
    code: String,
    expiresAt: Date
  },
  fcmToken: { type: String },
  savedBusinesses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' }],
  inquiryHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Inquiry' }],
  preferredState: String,
  preferredCity: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date,

  // Customer Profile & Personal Details
  profile_picture: { type: String, default: null },
  whatsapp_number: { type: String, default: null },
  date_of_birth: { type: Date, default: null },
  city: { type: String, default: null },
  state: { type: String, default: null },
  bio: { type: String, default: null },
  verification_status: { 
    type: String, 
    enum: ['unverified', 'pending', 'verified', 'rejected'], 
    default: 'unverified' 
  },
  rating: { type: Number, default: 0 },
  review_count: { type: Number, default: 0 },

  // Customer Settings & Preferences
  preferences: {
    language: { type: String, default: 'en' },
    appearance: { type: String, enum: ['light', 'dark', 'system'], default: 'system' }
  },

  // Notification Preferences
  notification_preferences: {
    new_inquiry: { type: Boolean, default: true },
    lead_messages: { type: Boolean, default: true },
    quote_requests: { type: Boolean, default: true },
    ad_performance: { type: Boolean, default: true },
    subscription_billing: { type: Boolean, default: true },
    marketing_emails: { type: Boolean, default: true }
  },

  // Quiet Hours Configuration
  quiet_hours: {
    enabled: { type: Boolean, default: false },
    start_time: { type: String, default: '22:00' },
    end_time: { type: String, default: '08:00' },
    timezone: { type: String, default: 'Asia/Kolkata' }
  },

  // Mobile Change Verification State
  pending_mobile_verification: {
    new_mobile: { type: String },
    otp: { type: String },
    expiresAt: { type: Date }
  },

  is_mock: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
