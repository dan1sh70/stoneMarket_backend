const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  logo: { type: String },
  description: { type: String },
  website: { type: String },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  is_mock: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Brand', brandSchema);
