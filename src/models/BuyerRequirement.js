const mongoose = require('mongoose');

const buyerRequirementSchema = new mongoose.Schema({
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'BusinessProfile', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  description: { type: String },
  material: { type: String },
  product_type: { type: String },
  stone_type: { type: String },
  colour: { type: String },
  finish: { type: String },
  grade: { type: String },
  required_size: { type: String },
  required_thickness: { type: String },
  thickness_mm: { type: Number },
  quantity: { type: Number, required: true },
  quantity_unit: { type: String, default: 'sqft' },
  budget: {
    min: { type: Number },
    max: { type: Number },
    currency: { type: String, default: 'INR' }
  },
  delivery_location: {
    city: { type: String },
    state: { type: String },
    district: { type: String },
    area: { type: String },
    address: { type: String }
  },
  required_delivery_date: { type: Date },
  order_frequency: { type: String, default: 'one-time' },
  min_supplier_capacity: { type: Number },
  status: {
    type: String,
    enum: ['draft', 'open', 'paused', 'fulfilled', 'expired', 'cancelled'],
    default: 'open',
    index: true
  },
  visibility: {
    type: String,
    enum: ['public', 'verified_suppliers_only', 'private'],
    default: 'public'
  },
  attachments: [{
    url: { type: String },
    filename: { type: String },
    size: { type: Number },
    mimetype: { type: String }
  }],
  expiry_date: { type: Date },
  is_mock: { type: Boolean, default: false }
}, { timestamps: true });

buyerRequirementSchema.index({ title: 'text', description: 'text', material: 'text' });

module.exports = mongoose.model('BuyerRequirement', buyerRequirementSchema);
