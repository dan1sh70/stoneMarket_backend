const mongoose = require('mongoose');

const transportVehicleSchema = new mongoose.Schema({
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'BusinessProfile', required: true, index: true },
  vehicleTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'VehicleType', required: true, index: true },
  driver_name: { type: String },
  driver_phone: { type: String },
  registration_number: { type: String, required: true },
  vehicle_model: { type: String },
  payload_capacity: { type: Number, required: true }, // in tons or custom
  capacity_unit: { type: String, default: 'tons' },
  dimensions: {
    length_ft: { type: Number },
    width_ft: { type: Number },
    height_ft: { type: Number }
  },
  permit_type: { 
    type: String, 
    enum: ['all_india', 'state_only', 'local_only', 'regional'], 
    default: 'all_india' 
  },
  permit_valid_until: { type: Date },
  availability_status: { 
    type: String, 
    enum: ['available_now', 'available_soon', 'in_service', 'unavailable'], 
    default: 'available_now',
    index: true 
  },
  expected_available_time: { type: String }, // e.g. "Available in 30 mins"
  service_type: {
    type: String,
    enum: ['national', 'local', 'both'],
    default: 'national',
    index: true
  },
  images: [{ type: String }],
  
  // Geospatial location for local nearby vehicle discovery
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [75.7873, 26.9124] // Default Jaipur coords
    }
  },
  city_name: { type: String },
  state_name: { type: String },
  last_location_updated_at: { type: Date, default: Date.now },
  is_active: { type: Boolean, default: true },
  is_mock: { type: Boolean, default: false }
}, { timestamps: true });

// 2dsphere index for nearby local vehicle radius queries
transportVehicleSchema.index({ location: '2dsphere' });
transportVehicleSchema.index({ providerId: 1, availability_status: 1 });

module.exports = mongoose.model('TransportVehicle', transportVehicleSchema);
