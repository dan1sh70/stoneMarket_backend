const mongoose = require('mongoose');

const analyticsEventSchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'BusinessProfile', required: true, index: true },
  eventType: { 
    type: String, 
    enum: [
      'profile_view', 
      'contact_click', 
      'call_click', 
      'whatsapp_click', 
      'email_click', 
      'product_view', 
      'service_view', 
      'image_view', 
      'video_view', 
      'business_save', 
      'inquiry_received', 
      'quote_request', 
      'profile_scroll', 
      'time_spent'
    ], 
    required: true, 
    index: true 
  },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  serviceId: { type: mongoose.Schema.Types.ObjectId },
  visitorId: { type: String }, // User ID or IP/Device ID
  visitorType: { type: String, enum: ['new', 'returning', 'repeat'], default: 'new' },
  source: { 
    type: String, 
    enum: ['Marketplace Search', 'Category Pages', 'Service Detail', 'Advertisement', 'Others'], 
    default: 'Marketplace Search' 
  },
  location: {
    city: { type: String },
    state: { type: String },
    country: { type: String, default: 'India' }
  },
  metadata: {
    duration_seconds: { type: Number, default: 0 },
    scroll_depth: { type: Number, default: 0 },
    referrer: { type: String }
  },
  timestamp: { type: Date, default: Date.now, index: true },
  is_mock: { type: Boolean, default: false }
}, { timestamps: true });

analyticsEventSchema.index({ businessId: 1, eventType: 1, timestamp: -1 });
analyticsEventSchema.index({ businessId: 1, timestamp: -1 });

module.exports = mongoose.model('AnalyticsEvent', analyticsEventSchema);
