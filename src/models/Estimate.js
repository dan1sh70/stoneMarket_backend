const mongoose = require('mongoose');

// Subdocument Schema for Slab Measurement Rows
const slabMeasurementRowSchema = new mongoose.Schema({
  serial_number: {
    type: Number,
    required: true
  },
  length: {
    type: Number,
    required: true,
    min: 0
  },
  width: {
    type: Number,
    required: true,
    min: 0
  },
  calculated_area: {
    type: Number,
    required: true,
    default: 0
  }
}, { _id: true });

// Subdocument Schema for Particular Estimate Items
const particularItemSchema = new mongoose.Schema({
  serial_number: {
    type: Number,
    required: true
  },
  particular_name: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    required: true,
    trim: true,
    default: 'sqft'
  },
  unit_price: {
    type: Number,
    required: true,
    min: 0
  },
  calculated_amount: {
    type: Number,
    required: true,
    default: 0
  }
}, { _id: true });

// Subdocument Schema for Payments against Particular Estimate
const estimatePaymentSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
    min: 0.01
  },
  payment_date: {
    type: Date,
    default: Date.now
  },
  payment_method: {
    type: String,
    enum: ['cash', 'bank_transfer', 'upi', 'cheque', 'card', 'other'],
    default: 'cash'
  },
  transaction_reference: {
    type: String,
    trim: true,
    default: ''
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  },
  status: {
    type: String,
    enum: ['completed', 'reversed'],
    default: 'completed'
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

const estimateSchema = new mongoose.Schema({
  reference_number: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  owner_user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  estimate_type: {
    type: String,
    enum: ['slab', 'particular'],
    required: true,
    index: true
  },

  // Company Details Snapshot (Controlled by company_details_enabled)
  company_details_enabled: {
    type: Boolean,
    default: false
  },
  company_name_snapshot: {
    type: String,
    trim: true,
    default: ''
  },
  company_mobile_snapshot: {
    type: String,
    trim: true,
    default: ''
  },
  company_email_snapshot: {
    type: String,
    trim: true,
    default: ''
  },
  company_address_snapshot: {
    type: String,
    trim: true,
    default: ''
  },
  payment_terms_snapshot: {
    type: String,
    trim: true,
    default: ''
  },

  // Party Details
  party_name: {
    type: String,
    required: true,
    trim: true
  },
  party_address: {
    type: String,
    trim: true,
    default: ''
  },
  party_contact: {
    type: String,
    trim: true,
    default: ''
  },
  estimate_date: {
    type: Date,
    default: Date.now
  },

  currency: {
    type: String,
    default: 'INR'
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  },

  // Totals & Financials
  subtotal: {
    type: Number,
    default: 0
  },
  total_amount: {
    type: Number,
    required: true,
    default: 0
  },
  status: {
    type: String,
    enum: ['draft', 'finalized', 'cancelled'],
    default: 'draft',
    index: true
  },

  // Slab Estimate Specifics
  slab_details: {
    colour_quality: { type: String, trim: true, default: '' },
    vehicle_number: { type: String, trim: true, default: '' },
    block_lot_number: { type: String, trim: true, default: '' },
    measured_by: { type: String, trim: true, default: '' },
    measurement_unit: {
      type: String,
      enum: ['cm', 'inch', 'feet'],
      default: 'inch'
    },
    area_unit: {
      type: String,
      enum: ['sqft', 'sqm'],
      default: 'sqft'
    },
    unit_price: {
      type: Number,
      default: 0
    },
    total_area: {
      type: Number,
      default: 0
    },
    measurement_rows: [slabMeasurementRowSchema]
  },

  // Particular Estimate Specifics
  particular_details: {
    items: [particularItemSchema],
    total_quantity: {
      type: Number,
      default: 0
    },
    quantity_summary: [{
      unit: String,
      total_quantity: Number
    }],
    payments: [estimatePaymentSchema],
    total_paid: {
      type: Number,
      default: 0
    },
    remaining_balance: {
      type: Number,
      default: 0
    },
    payment_status: {
      type: String,
      enum: ['unpaid', 'partially_paid', 'paid', 'overpaid'],
      default: 'unpaid'
    },
    amount_in_words: {
      type: String,
      default: 'Zero Only'
    }
  },

  is_mock: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('Estimate', estimateSchema);
