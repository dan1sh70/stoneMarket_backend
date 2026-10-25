const mongoose = require('mongoose');

const freightRateSchema = new mongoose.Schema({
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'BusinessProfile', required: true, index: true },
  vehicleTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'VehicleType' },
  routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'TransportRoute' },
  origin_city_name: { type: String },
  destination_city_name: { type: String },
  service_type: { 
    type: String, 
    enum: ['national', 'local', 'both'], 
    default: 'national' 
  },
  pricing_model: {
    type: String,
    enum: ['per_ton', 'per_trip', 'per_km', 'per_vehicle', 'negotiable'],
    default: 'per_ton'
  },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  unit: { 
    type: String, 
    enum: ['INR per ton', 'INR per trip', 'INR per km', 'INR per vehicle', 'negotiable'], 
    default: 'INR per ton' 
  },
  minimum_charge: { type: Number, default: 0 },
  additional_charges: { type: String }, // e.g. "Toll & Octroi extra"
  effective_from: { type: Date, default: Date.now },
  effective_until: { type: Date },
  status: { 
    type: String, 
    enum: ['active', 'expired', 'archived'], 
    default: 'active',
    index: true
  },
  is_mock: { type: Boolean, default: false }
}, { timestamps: true });

freightRateSchema.index({ providerId: 1, status: 1 });

module.exports = mongoose.model('FreightRate', freightRateSchema);
