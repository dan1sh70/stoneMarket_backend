const mongoose = require('mongoose');

const transportVehicleSchema = new mongoose.Schema({
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'BusinessProfile', required: true, index: true },
  vehicleTypeId: { type: mongoose.Schema.Types.ObjectId, ref: 'VehicleType', index: true },
  vehicle_name: { type: String }, // e.g. "Tata 407 Mini Truck", "Ashok Leyland 2820"
  vehicle_category: { type: String }, // e.g. "Heavy Trailer", "Multi-Axle Truck", "Hydraulic Dumper", "Mini Truck"
  driver_name: { type: String },
  driver_phone: { type: String },
  driving_license_number: { type: String },
  driving_experience_years: { type: Number },
  license_verification_status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
  registration_number: { type: String, required: true },
  vehicle_model: { type: String },
  payload_capacity: { type: Number, required: true }, // in tons or custom
  weight_capacity_ton: { type: Number }, // alias for payload_capacity in tons
  capacity_unit: { type: String, default: 'tons' },
  fitness_certificate_url: { type: String },
  insurance_details: {
    policy_number: { type: String },
    valid_until: { type: Date }
  },
  pollution_certificate_url: { type: String },
  permit_details: { type: String },
  has_gps_tracking: { type: Boolean, default: false },
  driver_assigned: { type: String },
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
