const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobile: { type: String, unique: true, required: true, index: true },
  email: { type: String, unique: true, sparse: true },
  password: { type: String }, // bcrypt-hashed
  role: { type: String, enum: ['buyer', 'vendor', 'admin'], default: 'buyer' },
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
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
