const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  plan: { type: String, enum: ['free', 'premium', 'top_featured'], required: true },
  features: {
    whatsappButton: { type: Boolean, default: false },
    callButton: { type: Boolean, default: false },
    inquiryForm: { type: Boolean, default: true },
    locationButton: { type: Boolean, default: false },
    extraPhotos: { type: Boolean, default: false },
    priorityVisibility: { type: Boolean, default: false },
    homeBanner: { type: Boolean, default: false },
    topSearchVisibility: { type: Boolean, default: false },
    pushNotificationPromo: { type: Boolean, default: false },
    trustedBadge: { type: Boolean, default: false }
  },
  billingCycle: { type: String, enum: ['monthly', 'quarterly', 'yearly'] },
  startDate: Date,
  endDate: Date,
  isActive: { type: Boolean, default: true },
  paymentHistory: [{
    amount: Number,
    date: Date,
    transactionId: String,
    method: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);
