const mongoose = require('mongoose');

const customerFavoriteSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  productId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: true, 
    index: true 
  },
  is_mock: { 
    type: Boolean, 
    default: false 
  }
}, { 
  timestamps: true 
});

customerFavoriteSchema.index({ userId: 1, productId: 1 }, { unique: true });

module.exports = mongoose.model('CustomerFavorite', customerFavoriteSchema);
