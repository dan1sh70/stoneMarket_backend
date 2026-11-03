const mongoose = require('mongoose');

const leadNoteSchema = new mongoose.Schema({
  lead_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    required: true,
    index: true
  },
  manufacturer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BusinessProfile',
    required: true,
    index: true
  },
  author_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  note: {
    type: String,
    required: true,
    trim: true
  },
  is_mock: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

leadNoteSchema.index({ lead_id: 1, createdAt: -1 });

module.exports = mongoose.model('LeadNote', leadNoteSchema);
