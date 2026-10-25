const Location = require('../models/Location');
const GraniteColor = require('../models/GraniteColor');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Get all active granite colors
// @route   GET /api/granite-colors
// @access  Public
exports.getGraniteColors = async (req, res, next) => {
  try {
    const colors = await GraniteColor.find({ status: 'active' }).select('-createdAt -updatedAt -__v');
    return successResponse(res, 'Granite colors retrieved successfully', { items: colors }, { total: colors.length });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all states (supports transport_type=national or general)
// @route   GET /api/locations/states or /api/v1/locations/states
// @access  Public
exports.getStates = async (req, res, next) => {
  try {
    const { transport_type } = req.query;
    const states = await Location.find().lean();

    if (transport_type === 'national' || transport_type === 'local') {
      const BusinessProfile = require('../models/BusinessProfile');
      const bType = transport_type === 'national' ? 'transport_national' : 'transport_local';

      const enriched = await Promise.all(states.map(async (s) => {
        const count = await BusinessProfile.countDocuments({
          business_type: { $in: [bType, 'transport_national', 'transport_local'] },
          transport_category: { $in: [transport_type, 'both'] },
          'address.state': { $regex: new RegExp(`^${s.name}$`, 'i') },
          status: 'active'
        });

        return {
          id: s._id,
          name: s.name,
          code: s.name.substring(0, 2).toUpperCase(),
          image: `https://domain.com/storage/states/${s.name.toLowerCase()}.webp`,
          provider_count: count
        };
      }));

      // Return all or filtered states
      return res.status(200).json({
        success: true,
        message: 'States retrieved successfully',
        data: enriched,
        items: enriched
      });
    }

    return successResponse(res, 'States retrieved successfully', { items: states });
  } catch (err) {
    next(err);
  }
};

// @desc    Get districts/cities for a state
// @route   GET /api/locations/states/:stateId/districts or /api/v1/locations/cities?state_id=...
// @access  Public
exports.getDistricts = async (req, res, next) => {
  try {
    const stateId = req.params.stateId || req.query.state_id;
    if (!stateId) return errorResponse(res, 'state_id parameter is required', null, 400);

    const state = await Location.findById(stateId).lean();
    if (!state) return errorResponse(res, 'State not found', null, 404);
    
    const { transport_type, search } = req.query;

    let districts = state.districts || [];
    if (search) {
      const sLower = search.toLowerCase();
      districts = districts.filter(d => d.name.toLowerCase().includes(sLower) || (d.areas && d.areas.some(a => a.name.toLowerCase().includes(sLower))));
    }

    if (transport_type === 'national' || transport_type === 'local') {
      const BusinessProfile = require('../models/BusinessProfile');
      const bType = transport_type === 'national' ? 'transport_national' : 'transport_local';

      const enriched = await Promise.all(districts.map(async (d) => {
        const count = await BusinessProfile.countDocuments({
          business_type: { $in: [bType, 'transport_national', 'transport_local'] },
          transport_category: { $in: [transport_type, 'both'] },
          'address.district': { $regex: new RegExp(`^${d.name}$`, 'i') },
          status: 'active'
        });

        return {
          id: d._id,
          city_id: d._id,
          name: d.name,
          city_name: d.name,
          state_name: state.name,
          areas: d.areas || [],
          provider_count: count
        };
      }));

      return res.status(200).json({
        success: true,
        message: 'Cities retrieved successfully',
        data: enriched,
        items: enriched
      });
    }

    return successResponse(res, 'Districts retrieved successfully', { items: state.districts });
  } catch (err) {
    next(err);
  }
};

// @desc    Get areas for a district
// @route   GET /api/locations/districts/:districtId/areas
// @access  Public
exports.getAreas = async (req, res, next) => {
  try {
    // Need to find the state that contains this district
    const state = await Location.findOne({ 'districts._id': req.params.districtId }, { 'districts.$': 1 });
    if (!state || !state.districts || state.districts.length === 0) {
      return errorResponse(res, 'District not found', null, 404);
    }
    
    const areas = state.districts[0].areas || [];
    return successResponse(res, 'Areas retrieved successfully', { items: areas });
  } catch (err) {
    next(err);
  }
};
