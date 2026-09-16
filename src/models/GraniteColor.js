const mongoose = require('mongoose');

const graniteColorSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  image: { type: String, required: true }, // S3 URL
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('GraniteColor', graniteColorSchema);
