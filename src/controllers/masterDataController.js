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

// @desc    Get all states
// @route   GET /api/locations/states
// @access  Public
exports.getStates = async (req, res, next) => {
  try {
    const states = await Location.find().select('name');
    return successResponse(res, 'States retrieved successfully', { items: states });
  } catch (err) {
    next(err);
  }
};

// @desc    Get districts for a state
// @route   GET /api/locations/states/:stateId/districts
// @access  Public
exports.getDistricts = async (req, res, next) => {
  try {
    const state = await Location.findById(req.params.stateId).select('districts.name');
    if (!state) return errorResponse(res, 'State not found', null, 404);
    
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
