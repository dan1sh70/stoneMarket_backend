const mongoose = require('mongoose');

const inquiryMessageSchema = new mongoose.Schema({
  inquiry_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inquiry',
    required: true,
    index: true
  },
  quotation_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InquiryQuotation',
    default: null
  },
  sender_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  sender_type: {
    type: String,
    enum: ['buyer', 'manufacturer', 'admin'],
    required: true
  },
  receiver_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  attachments: [{
    url: String,
    filename: String,
    size: Number,
    mimetype: String
  }],
  is_read: {
    type: Boolean,
    default: false,
    index: true
  },
  read_at: {
    type: Date,
    default: null
  },
  is_mock: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

inquiryMessageSchema.index({ inquiry_id: 1, createdAt: 1 });

module.exports = mongoose.model('InquiryMessage', inquiryMessageSchema);
