const Vendor = require('../models/Vendor');
const Product = require('../models/Product');

// @desc    Global unified search
// @route   GET /api/v1/search
// @access  Public
exports.globalSearch = async (req, res, next) => {
  try {
    const { q, type, state, city, category, page = 1, limit = 10 } = req.query;
    
    let results = [];
    let totalPages = 0;
    
    // If type is not provided or is 'business'/'service'
    if (!type || type === 'business' || type === 'service') {
      let vQuery = { status: 'active' };
      if (q) vQuery.$text = { $search: q };
      if (state) vQuery['address.state'] = state;
      if (city) vQuery['address.city'] = city;
      if (category) vQuery.category = category;

      const vendors = await Vendor.find(vQuery)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();
        
      const count = await Vendor.countDocuments(vQuery);
      
      results = [...results, ...vendors.map(v => ({ type: 'vendor', data: v }))];
      totalPages = Math.max(totalPages, Math.ceil(count / limit));
    }

    // If type is not provided or is 'product'
    if (!type || type === 'product') {
      let pQuery = { status: 'active' };
      if (q) pQuery.$text = { $search: q };
      if (category) pQuery.category = category;
      
      const products = await Product.find(pQuery)
        .populate('vendorId', 'businessName address badges')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();
        
      // If state/city filters apply, we filter products by populated vendor location.
      // (For robust filtering, it's better to store state/city denormalized in the product model)
      let filteredProducts = products;
      if (state || city) {
        filteredProducts = products.filter(p => {
          if (!p.vendorId) return false;
          let match = true;
          if (state && p.vendorId.address.state !== state) match = false;
          if (city && p.vendorId.address.city !== city) match = false;
          return match;
        });
      }

      const count = await Product.countDocuments(pQuery);

      results = [...results, ...filteredProducts.map(p => ({ type: 'product', data: p }))];
      totalPages = Math.max(totalPages, Math.ceil(count / limit));
    }

    res.json({
      results,
      totalPages,
      currentPage: page
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Find vendors within radius
// @route   GET /api/v1/search/nearby
// @access  Public
exports.nearbySearch = async (req, res, next) => {
  try {
    const { lat, lng, radius, category, limit = 20 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude (lat) and Longitude (lng) are required' });
    }

    const radiusInMeters = (radius || 10) * 1000; // default 10km

    let query = {
      status: 'active',
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)] // MongoDB expects [lng, lat]
          },
          $maxDistance: radiusInMeters
        }
      }
    };

    if (category) query.category = category;

    const vendors = await Vendor.find(query).limit(limit * 1);

    res.json(vendors);
  } catch (err) {
    next(err);
  }
};
