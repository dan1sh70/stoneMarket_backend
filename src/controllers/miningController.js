const MiningCategory = require('../models/MiningCategory');
const BusinessProfile = require('../models/BusinessProfile');
const Location = require('../models/Location');
const Product = require('../models/Product');
const { successResponse, errorResponse } = require('../utils/apiResponse');

exports.getMiningCategories = async (req, res, next) => {
  try {
    const categories = await MiningCategory.find({ status: 'active' }).sort({ sort_order: 1 }).lean();
    return successResponse(res, 'Mining categories retrieved successfully', { items: categories });
  } catch (err) {
    next(err);
  }
};

exports.getMiningStates = async (req, res, next) => {
  try {
    // Ideally we would aggregate BusinessProfile to find which states have businesses
    // For now we simulate this by grabbing all Locations and attaching counts
    const states = await Location.find().lean();
    
    // Example format mapping
    const items = states.map(s => ({
      state_id: s._id,
      name: s.name,
      slug: s.name.toLowerCase().replace(/\s+/g, '-'),
      image: `https://via.placeholder.com/200?text=${s.name}`,
      business_count: Math.floor(Math.random() * 100) + 1, // Simulated count
      label: "View Mining Suppliers"
    }));

    return successResponse(res, 'Mining regions retrieved successfully', { items });
  } catch (err) {
    next(err);
  }
};

exports.searchMiningLocations = async (req, res, next) => {
  try {
    const { state_id, search } = req.query;
    
    // In a real app we would use text indexes on Location or BusinessProfile address
    // Mock response for architecture completeness
    const items = [
      { id: '1', type: 'district', name: 'Jalore' },
      { id: '2', type: 'area', name: 'Makrana' }
    ];

    return successResponse(res, 'Locations retrieved successfully', { items });
  } catch (err) {
    next(err);
  }
};

exports.getMiningBusinesses = async (req, res, next) => {
  try {
    const { mining_category_id, state_id, district_id, search, page = 1, per_page = 20 } = req.query;
    
    const limit = parseInt(per_page);
    const skip = (parseInt(page) - 1) * limit;

    let query = { business_type: 'mining', status: 'active' };
    
    if (search) query.$text = { $search: search };
    if (state_id) query['address.state'] = state_id; // Naive map
    
    const businesses = await BusinessProfile.find(query)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await BusinessProfile.countDocuments(query);

    const items = businesses.map(b => ({
      id: b._id,
      name: b.company_name,
      business_type: b.business_type,
      tagline: b.company_details?.substring(0, 50),
      logo: b.owners?.[0]?.photo || null,
      location: b.address,
      verified: true
    }));

    return res.status(200).json({
      success: true,
      message: 'Mining businesses retrieved successfully',
      data: { items },
      errors: null,
      meta: {
        total,
        current_page: parseInt(page),
        per_page: limit,
        last_page: Math.ceil(total / limit)
      }
    });

  } catch (err) {
    next(err);
  }
};

exports.getMiningGallery = async (req, res, next) => {
  try {
    const { search, state_id, page = 1, per_page = 20 } = req.query;
    const limit = parseInt(per_page);
    const skip = (parseInt(page) - 1) * limit;

    // Gallery focuses on products (blocks)
    const products = await Product.find({ status: 'active', category: 'Mining' })
      .populate('vendorId', 'address')
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Product.countDocuments({ status: 'active', category: 'Mining' });

    const items = products.map(p => ({
      id: p._id,
      name: p.name,
      image: p.images?.[0],
      location: p.vendorId?.address || { state: 'Unknown' },
      business_id: p.vendorId?._id,
      is_favorite: false
    }));

    return res.status(200).json({
      success: true,
      message: 'Mining gallery retrieved',
      data: { items },
      errors: null,
      meta: {
        total,
        current_page: parseInt(page),
        per_page: limit,
        last_page: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    next(err);
  }
};
