const mongoose = require('mongoose');

const ownerSchema = new mongoose.Schema({
  name: { type: String },
  designation: { type: String }, // For Trader Contacts
  phone: { type: String },
  whatsapp: { type: String },
  email: { type: String }, // For Trader Contacts
  is_primary: { type: Boolean, default: false }, // For Trader Contacts
  birth_date: { type: Date },
  anniversary_date: { type: Date },
  photo: { type: String } // S3 URL
});

const machineSchema = new mongoose.Schema({
  machine_name: { type: String, required: true },
  quantity: { type: Number, min: 1, default: 1 },
  description: { type: String },
  category: { type: String },
  operational_status: { type: String, default: 'Operational' },
  image: { type: String }
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
  logo: { type: String },
  cover_image: { type: String },
  gst_number: { type: String },
  email: { type: String },
  phone: { type: String },
  established_year: { type: Number },
  company_details: { type: String },
  about_business: { type: String },
  property_type: { type: String }, // Owned, Rented, Leased
  factory_type: { type: String, enum: ['owned', 'rented'], default: 'owned' },
  unit_status: { type: String, enum: ['domestic', 'export', 'both'], default: 'domestic' },
  factory_timings: { type: String },
  
  // Buyer Fields (Phase 1)
  buyer_business_types: [{ type: String }],
  purchasing_specializations: [{ type: String }],
  company_type: { type: String }, // Private Limited, Public Limited, Partnership, Proprietorship, LLP, Government / PSU, Joint Venture
  ongoing_projects_count: { type: Number, default: 0 },
  annual_purchasing_volume: { type: Number, default: 0 },
  purchasing_volume_unit: { type: String, default: 'Sq.ft' },
  procurement_capacity: { type: String },
  procurement_regions: [{ type: String }],
  sourcing_scope: { type: String, enum: ['Domestic', 'International', 'Both'], default: 'Domestic' },
  
  // Specific to Mining / Manufacturer / Showroom / Trader / Buyer
  manufacturer_category: { type: mongoose.Schema.Types.ObjectId, ref: 'ManufacturerCategory' },
  showroom_product_types: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ShowroomProductType' }],
  trader_categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TraderCategory' }],
  trader_type: [{ type: String }], // Wholesaler, Retailer, Exporter, etc.
  buyer_types: [{ type: mongoose.Schema.Types.ObjectId, ref: 'BuyerType' }],
  preferred_materials: [{ type: String }],
  preferred_products: [{ type: String }],
  requirement_summary: { type: String },
  industry: { type: String },
  website: { type: String },
  preferred_communication: { type: String, enum: ['phone', 'whatsapp', 'email'], default: 'phone' },
  
  // Buyer & Business Verification
  verification_status: { 
    type: String, 
    enum: ['pending', 'under_review', 'approved', 'rejected', 'suspended'], 
    default: 'pending' 
  },
  is_verified: { type: Boolean, default: false },
  verified_at: { type: Date },
  verified_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rejection_reason: { type: String },
  verification_documents: [{
    title: { type: String },
    document_name: { type: String },
    document_type: { type: String },
    document_number: { type: String },
    url: { type: String },
    file_url: { type: String },
    file_type: { type: String },
    status: { type: String, default: 'submitted' },
    uploaded_at: { type: Date, default: Date.now }
  }],
  business_registration: {
    registration_type: { type: String },
    registration_number: { type: String },
    document_url: { type: String }
  },

  brands: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Brand' }],
  granite_colors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GraniteColor' }], // Used for Materials/Stone Colors
  custom_stone_varieties: [{
    name: { type: String },
    category: { type: String },
    finish: { type: String },
    color: { type: String },
    stone_type: { type: String },
    available_quantity: { type: String },
    description: { type: String }
  }],
  gallery_photos: [{
    url: { type: String, required: true },
    is_cover: { type: Boolean, default: false },
    title: { type: String },
    caption: { type: String },
    category: { type: String, default: 'office' },
    uploaded_at: { type: Date, default: Date.now }
  }],
  gallery_videos: [{
    title: { type: String, required: true },
    url: { type: String },
    video_url: { type: String },
    youtube_url: { type: String },
    thumbnail: { type: String },
    duration: { type: String },
    category: { type: String, default: 'walkthrough' },
    video_type: { type: String, default: 'walkthrough' },
    source_type: { type: String, enum: ['upload', 'youtube'], default: 'upload' },
    uploaded_at: { type: Date, default: Date.now }
  }],
  verification_steps: {
    phone: {
      phone: { type: String },
      status: { type: String, enum: ['not_started', 'submitted', 'pending_review', 'verified', 'rejected'], default: 'not_started' },
      verified_at: { type: Date },
      otp: { type: String },
      otp_expires: { type: Date }
    },
    email: {
      email: { type: String },
      status: { type: String, enum: ['not_started', 'submitted', 'pending_review', 'verified', 'rejected'], default: 'not_started' },
      verified_at: { type: Date },
      token: { type: String },
      token_expires: { type: Date }
    },
    business: {
      registration_type: { type: String },
      registration_number: { type: String },
      document_url: { type: String },
      status: { type: String, enum: ['not_started', 'submitted', 'pending_review', 'verified', 'rejected'], default: 'not_started' },
      rejection_reason: { type: String },
      submitted_at: { type: Date },
      reviewed_at: { type: Date }
    },
    gst: {
      gstin: { type: String },
      certificate_url: { type: String },
      status: { type: String, enum: ['not_started', 'submitted', 'pending_review', 'verified', 'rejected'], default: 'not_started' },
      rejection_reason: { type: String },
      submitted_at: { type: Date },
      reviewed_at: { type: Date }
    },
    bank: {
      account_holder_name: { type: String },
      bank_name: { type: String },
      account_number: { type: String },
      ifsc_code: { type: String },
      cheque_document_url: { type: String },
      status: { type: String, enum: ['not_started', 'submitted', 'pending_review', 'verified', 'rejected'], default: 'not_started' },
      rejection_reason: { type: String },
      submitted_at: { type: Date },
      reviewed_at: { type: Date }
    }
  },
  verification_timeline: [{
    step: { type: String },
    status: { type: String },
    title: { type: String },
    description: { type: String },
    timestamp: { type: Date, default: Date.now }
  }],
  ec_number: { type: String }, // Mining
  ec_clearance_status: { type: String, default: 'Clearance Granted' },
  mining_lease_number: { type: String },
  mining_permit_number: { type: String },
  quarry_specialties: [{ type: String }],
  mining_category: { type: mongoose.Schema.Types.ObjectId, ref: 'MiningCategory' },
  iec_number: { type: String }, // Manufacturer & Trader
  is_export_unit: { type: Boolean },
  export_countries: [{ type: String }],
  monthly_capacity: { type: Number }, // tons or sqft
  capacity_unit: { type: String },
  display_area: { type: Number }, // sqft
  showroom_type: { type: String, default: 'Retail Showroom' },
  total_display_area: { type: Number },
  display_area_unit: { type: String, default: 'Sq.ft' },
  total_storage_capacity: { type: Number },
  storage_capacity_unit: { type: String, default: 'Sq.ft' },
  stone_categories_available: [{ type: String }],
  short_description: { type: String },
  business_registration_number: { type: String },
  // Trader Fields (Phase 1)
  trading_business_types: [{ type: String }],
  trading_specializations: [{ type: String }],
  trading_capabilities: [{ type: String }],
  monthly_trading_volume: { type: Number },
  trading_volume_unit: { type: String, default: 'Tons' },
  min_order_quantity: { type: Number },
  max_order_capacity: { type: Number },
  preferred_order_type: { type: String },
  supply_network_coverage: { type: String },
  operating_markets: [{ type: String }],
  trade_license_number: { type: String },
  team_size_min: { type: Number },
  team_size_max: { type: Number },
  machines: [machineSchema],
  working_times: { type: String }, // Legacy
  
  // Structured working hours
  working_hours: {
    monday: { is_open: { type: Boolean, default: true }, open: { type: String, default: '09:00' }, close: { type: String, default: '20:00' } },
    tuesday: { is_open: { type: Boolean, default: true }, open: { type: String, default: '09:00' }, close: { type: String, default: '20:00' } },
    wednesday: { is_open: { type: Boolean, default: true }, open: { type: String, default: '09:00' }, close: { type: String, default: '20:00' } },
    thursday: { is_open: { type: Boolean, default: true }, open: { type: String, default: '09:00' }, close: { type: String, default: '20:00' } },
    friday: { is_open: { type: Boolean, default: true }, open: { type: String, default: '09:00' }, close: { type: String, default: '20:00' } },
    saturday: { is_open: { type: Boolean, default: true }, open: { type: String, default: '09:00' }, close: { type: String, default: '20:00' } },
    sunday: { is_open: { type: Boolean, default: false }, open: { type: String, default: '10:00' }, close: { type: String, default: '16:00' } }
  },

  virtual_tour_url: { type: String },
  rating: { type: Number, default: 0 },
  review_count: { type: Number, default: 0 },
  
  // Specific to Transport
  transport_category: { type: String, enum: ['national', 'local', 'both'], default: 'national' },
  transport_subtypes: [{ type: String, enum: ['national', 'local'] }],
  dispatch_timings: { type: String, default: '24x7 Dispatch Available' },
  fleet_summary: { type: String }, // e.g. "Fleet of 25+ 10-wheeler and 12-wheeler trailers"
  has_all_india_permit: { type: Boolean, default: true },
  has_national_coverage: { type: Boolean, default: true },
  supported_vehicle_types: [{ type: mongoose.Schema.Types.ObjectId, ref: 'VehicleType' }],
  fleet_categories: [{
    category_name: { type: String, required: true }, // e.g. "Heavy Trailer", "Multi-Axle Truck", "Hydraulic Dumper"
    vehicle_type: { type: String },
    max_payload_ton: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 1 }
  }],
  operational_coverage_states: [{
    state_name: { type: String, required: true },
    cities: [{ type: String }]
  }],
  cover_images: [{ type: String }],
  gallery: [{ type: String }],
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
  operational_states: [{ type: String }], // List of state names e.g. ["Rajasthan", "Gujarat", "Delhi"]
  operational_cities: [{ type: String }], // List of city names e.g. ["Jaipur", "Kishangarh", "Ahmedabad"]


  // Specific to Service Providers
  service_categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ServiceCategory' }],

  // Owners (Step 2)
  owners: [ownerSchema], // Usually up to 2

  // Location / Address (Step 3)
  address: {
    state: { type: String },
    district: { type: String },
    area: { type: String },
    industrial_area: { type: String },
    commercial_area: { type: String },
    office_address: { type: String },
    full_address: { type: String },
    postal_code: { type: String },
    country: { type: String, default: 'India' },
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

  // Promotion Boost Fields (Phase 2)
  is_promoted: { type: Boolean, default: false },
  active_promotion_id: { type: mongoose.Schema.Types.ObjectId, ref: 'PromotionCampaign' },
  promotion_priority: { type: Number, default: 0 },
  promoted_badge: { type: String, default: 'Featured Supplier' },

  status: {
    type: String,
    enum: ['pending', 'active', 'suspended'],
    default: 'pending'
  },
  is_mock: { type: Boolean, default: false }
}, { timestamps: true });

businessProfileSchema.index({ company_name: 'text' });

module.exports = mongoose.model('BusinessProfile', businessProfileSchema);
