const mongoose = require('mongoose');

const quoteRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'BusinessProfile' }, // Target supplier
  buyerProfileId: { type: mongoose.Schema.Types.ObjectId, ref: 'BusinessProfile' }, // Buyer profile if registered
  assignedSuppliers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'BusinessProfile' }], // Multi-supplier broadcast
  parentQuoteId: { type: mongoose.Schema.Types.ObjectId, ref: 'QuoteRequest' },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  requirementId: { type: mongoose.Schema.Types.ObjectId, ref: 'BuyerRequirement' },
  
  buyerContact: {
    name: { type: String },
    mobile: { type: String },
    email: { type: String },
    city: { type: String }
  },

  quantity: { type: Number, required: true },
  unit: { type: String, default: 'Sq.Ft' },
  size: { type: String },
  thickness: { type: String },
  finish: { type: String },
  grade: { type: String },
  delivery_location: {
    city: { type: String },
    state: { type: String },
    address: { type: String }
  },
  pickup_location: {
    city: { type: String },
    state: { type: String },
    address: { type: String }
  },
  cargo_type: { type: String },
  cargo_weight: { type: Number },
  required_vehicle_type: { type: String },
  vehicle_quantity: { type: Number, default: 1 },
  budget: { type: Number },
  reference_number: { type: String },
  required_delivery_date: { type: Date },
  preferred_pickup_date: { type: Date },
  additional_specifications: { type: String },
  message: { type: String, default: 'Request for quotation' },
  attachments: [{
    url: { type: String },
    filename: { type: String },
    size: { type: Number },
    mimetype: { type: String }
  }],
  status: { 
    type: String, 
    enum: ['draft', 'submitted', 'sent_to_suppliers', 'pending', 'viewed', 'responded', 'accepted', 'rejected', 'cancelled', 'closed', 'expired', 'withdrawn'], 
    default: 'submitted',
    index: true
  },
  is_mock: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('QuoteRequest', quoteRequestSchema);
