const mongoose = require('mongoose');

const vehicleTypeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  configuration: { type: String }, // e.g. "10 Wheeler", "12 Wheeler", "Flatbed Trailer"
  default_payload_capacity: { type: Number }, // in tons
  image: { type: String },
  icon: { type: String },
  sort_order: { type: Number, default: 0 },
  is_active: { type: Boolean, default: true },
  is_mock: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('VehicleType', vehicleTypeSchema);
