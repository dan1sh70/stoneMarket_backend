const mongoose = require('mongoose');

const customPageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Page title is required'],
    trim: true,
  },
  slug: {
    type: String,
    required: [true, 'Page slug is required'],
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  category: {
    type: String,
    enum: ['policy', 'company', 'legal', 'support', 'general'],
    default: 'policy',
  },
  content: {
    type: String,
    required: [true, 'Page content is required'],
  },
  summary: {
    type: String,
    default: '',
    trim: true,
  },
  status: {
    type: String,
    enum: ['published', 'draft', 'archived'],
    default: 'published',
    index: true,
  },
  meta_title: {
    type: String,
    default: '',
    trim: true,
  },
  meta_description: {
    type: String,
    default: '',
    trim: true,
  },
  is_system: {
    type: Boolean,
    default: false,
  },
  published_at: {
    type: Date,
    default: Date.now,
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  updated_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('CustomPage', customPageSchema);
