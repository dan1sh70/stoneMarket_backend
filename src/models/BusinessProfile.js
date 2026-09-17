const mongoose = require('mongoose');

const ownerSchema = new mongoose.Schema({
  name: { type: String },
  phone: { type: String },
  whatsapp: { type: String },
  birth_date: { type: Date },
  anniversary_date: { type: Date },
  photo: { type: String } // S3 URL
});

const machineSchema = new mongoose.Schema({
  machine_name: { type: String },
  quantity: { type: Number, min: 1 }
});

const businessProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  business_type: { 
    type: String, 
    enum: ['mining', 'manufacturer', 'showroom', 'trader', 'buyer', 'transport_national', 'transport_local', 'customer', 'service_provider'],
    required: true,
    index: true
  },
  
  // Common Fields
  company_name: { type: String },
  gst_number: { type: String },
  established_year: { type: Number },
  company_details: { type: String },
  
  // Specific to Mining / Manufacturer / Showroom
  granite_colors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GraniteColor' }],
  ec_number: { type: String }, // Mining
  iec_number: { type: String }, // Manufacturer
  is_export_unit: { type: Boolean },
  monthly_capacity: { type: Number }, // tons or sqft
  machines: [machineSchema],
  working_times: { type: String },
  
  // Specific to Transport
  vehicle_type: { type: String },
  vehicle_quantity: { type: Number },
  vehicle_name: { type: String },
  vehicle_number: { type: String },
  weight_capacity_ton: { type: Number },
  driving_experience_years: { type: Number },
  driving_license_number: { type: String },
  
  operational_areas: [{
    state_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' }, // Using Location for state
    district_ids: [{ type: mongoose.Schema.Types.ObjectId }]
  }],

  // Specific to Service Providers
  service_categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ServiceCategory' }],

  // Owners (Step 2)
  owners: [ownerSchema], // Usually up to 2

  // Location / Address (Step 3)
  address: {
    state: { type: String },
    district: { type: String },
    area: { type: String },
    full_address: { type: String },
    google_map_location: { type: String },
    latitude: { type: Number },
    longitude: { type: Number }
  },
  
  premises_status: { type: String, enum: ['owned', 'rented'] }, // Showroom
  
  // Legal/Consent
  terms_accepted: { type: Boolean, default: false },
  terms_accepted_at: { type: Date },
  privacy_policy_accepted: { type: Boolean, default: false },
  privacy_policy_accepted_at: { type: Date },

  status: {
    type: String,
    enum: ['pending', 'active', 'suspended'],
    default: 'pending'
  }
}, { timestamps: true });

businessProfileSchema.index({ company_name: 'text' });

module.exports = mongoose.model('BusinessProfile', businessProfileSchema);
