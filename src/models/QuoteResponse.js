const mongoose = require('mongoose');

const quoteResponseSchema = new mongoose.Schema({
  quoteRequestId: { type: mongoose.Schema.Types.ObjectId, ref: 'QuoteRequest', required: true, index: true },
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'BusinessProfile', required: true, index: true },
  supplierUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  offered_price: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  unit: { type: String, default: 'Sq.Ft' },
  vehicle_type: { type: String },
  offered_capacity: { type: Number },
  estimated_total: { type: Number },
  available_quantity: { type: Number },
  taxes: { type: Number, default: 0 },
  shipping_cost: { type: Number, default: 0 },
  additional_charges: { type: Number, default: 0 },
  estimated_delivery_time: { type: String },
  pickup_estimate: { type: Date },
  delivery_estimate: { type: Date },
  offer_validity: { type: Date },
  reference_number: { type: String },
  terms_and_conditions: { type: String },
  response_attachments: [{
    url: { type: String },
    filename: { type: String },
    size: { type: Number },
    mimetype: { type: String }
  }],
  status: {
    type: String,
    enum: ['draft', 'submitted', 'viewed', 'accepted', 'rejected', 'withdrawn', 'expired'],
    default: 'submitted'
  },
  is_mock: { type: Boolean, default: false }
}, { timestamps: true });

quoteResponseSchema.index({ quoteRequestId: 1, supplierId: 1 }, { unique: true });

module.exports = mongoose.model('QuoteResponse', quoteResponseSchema);
