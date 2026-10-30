const mongoose = require('mongoose');

const customerAddressSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  state: { 
    type: String, 
    required: [true, 'State is required'], 
    trim: true 
  },
  district: { 
    type: String, 
    required: [true, 'District/City is required'], 
    trim: true 
  },
  area: { 
    type: String, 
    trim: true, 
    default: '' 
  },
  full_address: { 
    type: String, 
    required: [true, 'Full address is required'], 
    trim: true 
  },
  pin_code: { 
    type: String, 
    required: [true, 'PIN Code is required'], 
    trim: true,
    match: [/^\d{6}$/, 'Please provide a valid 6-digit PIN code']
  },
  address_label: { 
    type: String, 
    enum: ['Home', 'Office', 'Project Site', 'Warehouse', 'Site', 'Other'], 
    default: 'Home' 
  },
  is_default: { 
    type: Boolean, 
    default: false 
  },
  is_mock: { 
    type: Boolean, 
    default: false 
  }
}, { 
  timestamps: true 
});

customerAddressSchema.index({ userId: 1, is_default: 1 });

module.exports = mongoose.model('CustomerAddress', customerAddressSchema);
