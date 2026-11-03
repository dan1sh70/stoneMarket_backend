const mongoose = require('mongoose');

const userPreferencesSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  language: {
    type: String,
    enum: ['en', 'hi', 'ur'],
    default: 'en'
  },
  appearance: {
    type: String,
    enum: ['light', 'dark', 'system'],
    default: 'system'
  },
  timezone: {
    type: String,
    default: 'Asia/Kolkata'
  }
}, { timestamps: true });

module.exports = mongoose.model('UserPreferences', userPreferencesSchema);
