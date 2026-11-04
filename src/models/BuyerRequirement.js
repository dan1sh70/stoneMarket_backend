const mongoose = require('mongoose');

const buyerRequirementSchema = new mongoose.Schema({
  requirement_id: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'BusinessProfile', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  
  // Step 1: Basic Information
  title: { type: String, required: true },
  project_name: { type: String },
  project_type: { 
    type: String, 
    enum: ['Commercial', 'Residential', 'Infrastructure', 'Industrial', 'Institutional', 'Hospitality', 'Public / Government', 'Other'],
    default: 'Commercial' 
  },
  material_category: { type: String }, // e.g. Granite, Marble, Sandstone, Quartzite, Limestone, Slate
  material_name: { type: String }, // e.g. Black Galaxy Granite, Makrana White Marble
  description: { type: String },
  application_usage: [{ type: String }], // Flooring, Wall Cladding, Countertops, Paving, Facades, Steps & Risers, Monuments, etc.

  // Step 2: Material Specifications
  material: { type: String },
  product_type: { type: String },
  stone_type: { type: String },
  colour: { type: String },
  color: { type: String },
  pattern: { type: String }, // Plain, Veined, Speckled, Flamed, Bush-hammered, Textured
  required_size: { type: String },
  size: { type: String },
  required_thickness: { type: String },
  thickness: { type: String },
  thickness_mm: { type: Number },
  finish: { type: String }, // Polished, Honed, Flamed, Leather, Bush Hammered, Brushed, Antique
  grade: { type: String },
  quality: { type: String, enum: ['Commercial Grade', 'Standard Grade', 'Premium Grade', 'First Choice / Export Quality'], default: 'Standard Grade' },
  edge_profile: { type: String }, // Straight / Beveled, Bullnose, Half Bullnose, Ogee, Chamfered, Machine Cut
  surface_treatment: { type: String }, // Epoxy Treated, Water Repellent, Anti-skid, Sealant Coated, None
  preferred_origin: { type: String }, // e.g. Rajasthan, Andhra Pradesh, Karnataka, Italy, Vietnam, Any

  // Step 3: Quantity & Budget
  quantity: { type: Number, required: true },
  quantity_unit: { type: String, enum: ['sqft', 'sqm', 'tons', 'cbm', 'pieces', 'containers'], default: 'sqft' },
  budget: {
    min: { type: Number },
    max: { type: Number },
    currency: { type: String, default: 'INR' }
  },
  budget_type: { type: String, enum: ['Total Budget', 'Rate per Sq.ft', 'Rate per Ton', 'Rate per Unit', 'Negotiable'], default: 'Rate per Sq.ft' },
  target_price: { type: Number }, // Expected unit rate

  // Step 4: Delivery & Timeline
  delivery_location: {
    city: { type: String },
    state: { type: String },
    district: { type: String },
    area: { type: String },
    address: { type: String },
    pincode: { type: String }
  },
  delivery_address: { type: String },
  required_delivery_date: { type: Date },
  procurement_timeline: { type: String, enum: ['Immediate (Within 7 Days)', '15 - 30 Days', '1 - 2 Months', '3 - 6 Months', 'Long-term / Phased Delivery'], default: '15 - 30 Days' },
  delivery_type: { type: String, enum: ['Ex-Factory / Quarry Pickup', 'FOR Project Site', 'CIF / Port Delivery', 'Supplier Managed Transportation'], default: 'FOR Project Site' },
  order_frequency: { type: String, default: 'one-time' },
  min_supplier_capacity: { type: Number },

  // Step 5: Additional Requirements & Attachments
  additional_instructions: { type: String },
  special_requirements: {
    quality_standards: { type: String },
    inspection_required: { type: Boolean, default: false },
    inspection_details: { type: String },
    packaging_type: { type: String }, // Wooden Crates, Bundles, A-Frames, Loose
    transportation_required: { type: Boolean, default: true },
    sample_required: { type: Boolean, default: false },
    test_certificate_required: { type: Boolean, default: false }
  },
  attachments: [{
    url: { type: String },
    filename: { type: String },
    size: { type: Number },
    mimetype: { type: String },
    uploaded_at: { type: Date, default: Date.now }
  }],

  // Step 6: Supplier Targeting
  supplier_targeting: {
    all_india: { type: Boolean, default: true },
    target_categories: [{ 
      type: String, 
      enum: ['Manufacturer', 'Mining', 'Showroom', 'Trader'] 
    }],
    target_states: [{ type: String }],
    target_districts: [{ type: String }],
    verified_suppliers_only: { type: Boolean, default: false },
    min_supplier_rating: { type: Number, default: 0 }
  },

  // Quotes & Activity Tracking
  quotes_count: { type: Number, default: 0 },
  lowest_quote: { type: Number },
  highest_quote: { type: Number },
  views_count: { type: Number, default: 0 },

  // Status & Lifecycle
  status: {
    type: String,
    enum: ['draft', 'open', 'quotes_received', 'in_review', 'paused', 'fulfilled', 'closed', 'expired', 'cancelled'],
    default: 'open',
    index: true
  },
  visibility: {
    type: String,
    enum: ['public', 'verified_suppliers_only', 'private'],
    default: 'public'
  },
  expiry_date: { type: Date },
  published_at: { type: Date },
  closed_at: { type: Date },
  closing_reason: { type: String },
  is_mock: { type: Boolean, default: false }
}, { timestamps: true });

buyerRequirementSchema.index({ title: 'text', description: 'text', material: 'text', project_name: 'text' });

module.exports = mongoose.model('BuyerRequirement', buyerRequirementSchema);
