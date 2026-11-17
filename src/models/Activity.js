const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Blog/Activity title is required'],
    trim: true
  },
  slug: {
    type: String,
    trim: true,
    lowercase: true,
    index: true
  },
  description: {
    type: String,
    trim: true
  }, // Short summary / excerpt for home feed cards
  content: {
    type: String
  }, // Full rich-text or markdown blog content
  image: {
    type: String
  }, // Featured cover banner image URL
  gallery_images: [{
    type: String
  }],
  type: {
    type: String,
    enum: ['news', 'event', 'market_update', 'announcement', 'blog', 'article'],
    default: 'blog',
    required: true,
    index: true
  },
  category: {
    type: String,
    default: 'General'
  },
  tags: [{
    type: String,
    trim: true
  }],
  url: {
    type: String,
    trim: true
  }, // Optional external link or canonical URL
  author_name: {
    type: String,
    default: 'Stone Market India Editorial'
  },
  author_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'published',
    index: true
  },
  is_featured: {
    type: Boolean,
    default: false
  },
  views_count: {
    type: Number,
    default: 0
  },
  likes_count: {
    type: Number,
    default: 0
  },
  published_at: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Auto-generate slug from title before save
activitySchema.pre('save', function (next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') + '-' + Date.now().toString().slice(-4);
  }
  next();
});

module.exports = mongoose.model('Activity', activitySchema);
