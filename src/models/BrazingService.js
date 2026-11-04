const mongoose = require('mongoose');

const brazingServiceSchema = new mongoose.Schema({
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BusinessProfile',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  service_id: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },

  // Step 1: Basic & Media
  service_name: {
    type: String,
    required: true,
    trim: true
  },
  brazing_service_type: {
    type: String,
    required: true,
    enum: [
      'Circular Blade Brazing',
      'Gangsaw Blade Brazing',
      'Diamond Tip Brazing',
      'Blade Retipping',
      'Wire Saw Connector Brazing',
      'Core Drill Bit Re-tipping',
      'Multi-Blade Brazing',
      'Other'
    ],
    default: 'Circular Blade Brazing'
  },
  description: {
    type: String,
    trim: true
  },
  images: [{
    type: String
  }],
  cover_image: {
    type: String
  },

  // Step 2: Specifications (Technical Capabilities)
  blade_size_supported: {
    type: String,
    required: true,
    trim: true // e.g. "48 Inch (1200mm)" or "1200mm – 3500mm Diameter"
  },
  blade_size_min: {
    type: Number
  },
  blade_size_max: {
    type: Number
  },
  blade_size_unit: {
    type: String,
    default: 'inch'
  },
  daily_brazing_capacity: {
    type: String,
    required: true,
    trim: true // e.g. "40 Blades / Shift" or "150 Blades / Day"
  },
  capacity_numeric: {
    type: Number
  },
  capacity_unit: {
    type: String,
    default: 'Blades / Day'
  },
  silver_solder_grade: {
    type: String,
    default: 'High Silver (49% Ag) Alloy & Flux'
  },
  brazing_machine_model: {
    type: String,
    default: 'Automated High-Frequency Induction Machine'
  },
  brazing_technology: {
    type: String,
    default: 'Automatic Induction Heating'
  },
  heating_method: {
    type: String,
    default: 'High-Frequency Induction'
  },
  segment_type: {
    type: String
  },
  diamond_segment_compatibility: {
    type: String
  },
  supported_blade_materials: [{
    type: String
  }],
  quality_standards: {
    type: String
  },

  // Step 3: Pricing & Terms
  service_price: {
    type: Number,
    required: true,
    min: 0
  },
  pricing_unit: {
    type: String,
    required: true,
    enum: [
      'Per Blade',
      'Per Inch',
      'Per Millimetre',
      'Per Segment',
      'Per Set',
      'Per Job',
      'Per Hour',
      'Per Kilogram',
      'Custom'
    ],
    default: 'Per Blade'
  },
  turnaround_time: {
    type: String,
    default: 'Same Day Dispatch' // Same Day, 24 Hours, 2–3 Days, 5–7 Days, Custom
  },
  minimum_order_quantity: {
    type: Number,
    default: 1
  },
  bulk_order_pricing: {
    type: String
  },
  advance_payment_requirement: {
    type: String
  },
  pickup_delivery_availability: {
    type: Boolean,
    default: true
  },
  service_warranty: {
    type: String
  },
  terms_and_conditions: {
    type: String
  },

  // Step 4: Target Publish Areas & Target Categories
  target_areas: [{
    state_name: { type: String, required: true },
    districts: [{ type: String }]
  }],
  target_categories: [{
    type: String,
    enum: [
      'Manufacturer',
      'Mining',
      'Showroom',
      'Trader',
      'Brazing Services',
      'Blades & Segments',
      'Machine Manufacturer',
      'Customer',
      'Other'
    ]
  }],

  // Publication & Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'draft'],
    default: 'active',
    index: true
  },

  // Engagement & Activity
  views_count: {
    type: Number,
    default: 0
  },
  inquiries_count: {
    type: Number,
    default: 0
  },
  leads_count: {
    type: Number,
    default: 0
  },
  is_mock: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

brazingServiceSchema.index({ service_name: 'text', description: 'text', brazing_service_type: 'text' });
brazingServiceSchema.index({ providerId: 1, status: 1 });

module.exports = mongoose.model('BrazingService', brazingServiceSchema);

