const mongoose = require('mongoose');

const transportRouteSchema = new mongoose.Schema({
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'BusinessProfile', required: true, index: true },
  origin_city_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  origin_city_name: { type: String, required: true },
  origin_state_name: { type: String, required: true },
  destination_city_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  destination_city_name: { type: String, required: true },
  destination_state_name: { type: String, required: true },
  route_type: { 
    type: String, 
    enum: ['regular', 'direct_only', 'multi_stop'], 
    default: 'regular' 
  },
  directionality: { 
    type: String, 
    enum: ['bidirectional', 'one_way'], 
    default: 'bidirectional' 
  },
  direct_route_only: { type: Boolean, default: false },
  estimated_transit_days: { type: Number, default: 2 },
  default_freight_rate: { type: Number },
  rate_unit: { type: String, default: 'INR per ton' },
  is_active: { type: Boolean, default: true },
  is_mock: { type: Boolean, default: false }
}, { timestamps: true });

transportRouteSchema.index({ origin_city_id: 1, destination_city_id: 1, is_active: 1 });
transportRouteSchema.index({ providerId: 1, is_active: 1 });

module.exports = mongoose.model('TransportRoute', transportRouteSchema);
