const mongoose = require('mongoose');

const measurementUnitSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  symbol: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  unit_category: {
    type: String,
    enum: ['dimension', 'area', 'weight', 'count', 'length'],
    required: true
  },
  // Conversion factor to SI/base unit in that category
  // e.g. for dimension: base is metre (cm=0.01, inch=0.0254, ft=0.3048)
  // for area: base is sqm (sqm=1, sqft=0.092903)
  conversion_factor: {
    type: Number,
    default: 1
  },
  is_active: {
    type: Boolean,
    default: true
  },
  is_mock: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('MeasurementUnit', measurementUnitSchema);
