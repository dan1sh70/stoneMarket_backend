const mongoose = require('mongoose');

const quietHoursSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  enabled: {
    type: Boolean,
    default: false
  },
  start_time: {
    type: String,
    default: '22:00' // 10:00 PM
  },
  end_time: {
    type: String,
    default: '08:00' // 8:00 AM
  },
  timezone: {
    type: String,
    default: 'Asia/Kolkata'
  }
}, { timestamps: true });

module.exports = mongoose.model('QuietHours', quietHoursSchema);
