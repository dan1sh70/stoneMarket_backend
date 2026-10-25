const BusinessProfile = require('../models/BusinessProfile');
const TransportVehicle = require('../models/TransportVehicle');
const TransportRoute = require('../models/TransportRoute');
const FreightRate = require('../models/FreightRate');
const VehicleType = require('../models/VehicleType');
const Inquiry = require('../models/Inquiry');
const QuoteRequest = require('../models/QuoteRequest');
const QuoteResponse = require('../models/QuoteResponse');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// Helper to get authenticated transport provider profile
const getAuthenticatedProvider = async (userId) => {
  return await BusinessProfile.findOne({
    userId,
    business_type: { $in: ['transport_national', 'transport_local'] }
  });
};

// ==========================================
// 1. PROVIDER PROFILE & CONTACTS
// ==========================================
// GET /api/v1/provider/transport/profile
exports.getProviderProfile = async (req, res, next) => {
  try {
    const provider = await getAuthenticatedProvider(req.user.id);
    if (!provider) {
      return errorResponse(res, 'Transport provider profile not found', null, 404);
    }

    return res.status(200).json({
      success: true,
      message: 'Provider profile retrieved successfully.',
      data: provider
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/v1/provider/transport/profile
exports.updateProviderProfile = async (req, res, next) => {
  try {
    const provider = await getAuthenticatedProvider(req.user.id);
    if (!provider) {
      return errorResponse(res, 'Transport provider profile not found', null, 404);
    }

    const {
      company_name,
      company_details,
      fleet_summary,
      has_all_india_permit,
      has_national_coverage,
      operational_states,
      operational_cities,
      working_hours,
      cover_images,
      gallery,
      address
    } = req.body;

    if (company_name) provider.company_name = company_name;
    if (company_details) provider.company_details = company_details;
    if (fleet_summary) provider.fleet_summary = fleet_summary;
    if (typeof has_all_india_permit === 'boolean') provider.has_all_india_permit = has_all_india_permit;
    if (typeof has_national_coverage === 'boolean') provider.has_national_coverage = has_national_coverage;
    if (operational_states) provider.operational_states = operational_states;
    if (operational_cities) provider.operational_cities = operational_cities;
    if (working_hours) provider.working_hours = working_hours;
    if (cover_images) provider.cover_images = cover_images;
    if (gallery) provider.gallery = gallery;
    if (address) provider.address = { ...provider.address, ...address };

    await provider.save();

    return res.status(200).json({
      success: true,
      message: 'Provider profile updated successfully.',
      data: provider
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/provider/transport/contacts
exports.getProviderContacts = async (req, res, next) => {
  try {
    const provider = await getAuthenticatedProvider(req.user.id);
    if (!provider) return errorResponse(res, 'Provider profile not found', null, 404);

    return res.status(200).json({
      success: true,
      message: 'Authorized contacts retrieved successfully.',
      data: provider.owners || []
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/provider/transport/contacts
exports.addProviderContact = async (req, res, next) => {
  try {
    const provider = await getAuthenticatedProvider(req.user.id);
    if (!provider) return errorResponse(res, 'Provider profile not found', null, 404);

    const { name, designation, phone, whatsapp, photo, is_primary } = req.body;
    if (!name || !phone) {
      return errorResponse(res, 'Name and phone are required', null, 400);
    }

    provider.owners = provider.owners || [];
    provider.owners.push({
      name,
      designation: designation || 'Transport Coordinator',
      phone,
      whatsapp: whatsapp || phone,
      photo,
      is_primary: !!is_primary
    });

    await provider.save();

    return res.status(201).json({
      success: true,
      message: 'Contact added successfully.',
      data: provider.owners
    });
  } catch (err) {
    next(err);
  }
};

// ==========================================
// 2. FLEET & VEHICLE MANAGEMENT
// ==========================================
// GET /api/v1/provider/transport/vehicles
exports.getProviderVehicles = async (req, res, next) => {
  try {
    const provider = await getAuthenticatedProvider(req.user.id);
    if (!provider) return errorResponse(res, 'Provider profile not found', null, 404);

    const vehicles = await TransportVehicle.find({ providerId: provider._id, is_active: true })
      .populate('vehicleTypeId', 'name configuration icon')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      message: 'Vehicles retrieved successfully.',
      data: vehicles
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/provider/transport/vehicles
exports.createProviderVehicle = async (req, res, next) => {
  try {
    const provider = await getAuthenticatedProvider(req.user.id);
    if (!provider) return errorResponse(res, 'Provider profile not found', null, 404);

    const {
      vehicleTypeId,
      driver_name,
      driver_phone,
      registration_number,
      vehicle_model,
      payload_capacity,
      capacity_unit = 'tons',
      dimensions,
      permit_type = 'all_india',
      service_type = 'national',
      images = [],
      latitude,
      longitude,
      city_name,
      state_name,
      availability_status = 'available_now',
      expected_available_time
    } = req.body;

    if (!registration_number || !payload_capacity || !vehicleTypeId) {
      return errorResponse(res, 'vehicleTypeId, registration_number, and payload_capacity are required', null, 400);
    }

    const coords = (!isNaN(parseFloat(longitude)) && !isNaN(parseFloat(latitude)))
      ? [parseFloat(longitude), parseFloat(latitude)]
      : (provider.address?.longitude && provider.address?.latitude ? [provider.address.longitude, provider.address.latitude] : [75.7873, 26.9124]);

    const vehicle = await TransportVehicle.create({
      providerId: provider._id,
      vehicleTypeId,
      driver_name: driver_name || provider.owners?.[0]?.name,
      driver_phone: driver_phone || provider.owners?.[0]?.phone,
      registration_number,
      vehicle_model,
      payload_capacity,
      capacity_unit,
      dimensions,
      permit_type,
      service_type,
      images,
      location: {
        type: 'Point',
        coordinates: coords
      },
      city_name: city_name || provider.address?.district,
      state_name: state_name || provider.address?.state,
      availability_status,
      expected_available_time,
      is_active: true
    });

    return res.status(201).json({
      success: true,
      message: 'Vehicle added to fleet successfully.',
      data: vehicle
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/v1/provider/transport/vehicles/:vehicle_id
exports.updateProviderVehicle = async (req, res, next) => {
  try {
    const provider = await getAuthenticatedProvider(req.user.id);
    if (!provider) return errorResponse(res, 'Provider profile not found', null, 404);

    const vehicle = await TransportVehicle.findOne({ _id: req.params.vehicle_id, providerId: provider._id });
    if (!vehicle) {
      return errorResponse(res, 'Vehicle not found or unauthorized', null, 404);
    }

    const {
      driver_name,
      driver_phone,
      payload_capacity,
      permit_type,
      availability_status,
      expected_available_time,
      images,
      latitude,
      longitude,
      city_name,
      state_name
    } = req.body;

    if (driver_name) vehicle.driver_name = driver_name;
    if (driver_phone) vehicle.driver_phone = driver_phone;
    if (payload_capacity) vehicle.payload_capacity = payload_capacity;
    if (permit_type) vehicle.permit_type = permit_type;
    if (availability_status) vehicle.availability_status = availability_status;
    if (expected_available_time !== undefined) vehicle.expected_available_time = expected_available_time;
    if (images) vehicle.images = images;
    if (city_name) vehicle.city_name = city_name;
    if (state_name) vehicle.state_name = state_name;

    if (!isNaN(parseFloat(longitude)) && !isNaN(parseFloat(latitude))) {
      vehicle.location = {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      };
      vehicle.last_location_updated_at = new Date();
    }

    await vehicle.save();

    return res.status(200).json({
      success: true,
      message: 'Vehicle details updated successfully.',
      data: vehicle
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/v1/provider/transport/vehicles/:vehicle_id/availability
exports.updateVehicleAvailability = async (req, res, next) => {
  try {
    const provider = await getAuthenticatedProvider(req.user.id);
    if (!provider) return errorResponse(res, 'Provider profile not found', null, 404);

    const { availability_status, expected_available_time } = req.body;
    if (!availability_status) {
      return errorResponse(res, 'availability_status is required', null, 400);
    }

    const vehicle = await TransportVehicle.findOneAndUpdate(
      { _id: req.params.vehicle_id, providerId: provider._id },
      { availability_status, expected_available_time },
      { new: true }
    );

    if (!vehicle) {
      return errorResponse(res, 'Vehicle not found or unauthorized', null, 404);
    }

    return res.status(200).json({
      success: true,
      message: 'Vehicle availability updated successfully.',
      data: vehicle
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/v1/provider/transport/vehicles/:vehicle_id
exports.deleteProviderVehicle = async (req, res, next) => {
  try {
    const provider = await getAuthenticatedProvider(req.user.id);
    if (!provider) return errorResponse(res, 'Provider profile not found', null, 404);

    const vehicle = await TransportVehicle.findOneAndUpdate(
      { _id: req.params.vehicle_id, providerId: provider._id },
      { is_active: false },
      { new: true }
    );

    if (!vehicle) {
      return errorResponse(res, 'Vehicle not found or unauthorized', null, 404);
    }

    return res.status(200).json({
      success: true,
      message: 'Vehicle removed from active fleet.'
    });
  } catch (err) {
    next(err);
  }
};

// ==========================================
// 3. ROUTES & COVERAGE MANAGEMENT
// ==========================================
// GET /api/v1/provider/transport/routes
exports.getProviderRoutes = async (req, res, next) => {
  try {
    const provider = await getAuthenticatedProvider(req.user.id);
    if (!provider) return errorResponse(res, 'Provider profile not found', null, 404);

    const routes = await TransportRoute.find({ providerId: provider._id, is_active: true }).lean();
    return res.status(200).json({
      success: true,
      message: 'Provider routes retrieved successfully.',
      data: routes
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/provider/transport/routes
exports.createProviderRoute = async (req, res, next) => {
  try {
    const provider = await getAuthenticatedProvider(req.user.id);
    if (!provider) return errorResponse(res, 'Provider profile not found', null, 404);

    const {
      origin_city_id,
      origin_city_name,
      origin_state_name,
      destination_city_id,
      destination_city_name,
      destination_state_name,
      route_type = 'regular',
      directionality = 'bidirectional',
      direct_route_only = false,
      estimated_transit_days = 2,
      default_freight_rate,
      rate_unit = 'INR per ton'
    } = req.body;

    if (!origin_city_id || !destination_city_id || !origin_city_name || !destination_city_name) {
      return errorResponse(res, 'Origin and destination details are required', null, 400);
    }

    const route = await TransportRoute.create({
      providerId: provider._id,
      origin_city_id,
      origin_city_name,
      origin_state_name: origin_state_name || 'Rajasthan',
      destination_city_id,
      destination_city_name,
      destination_state_name: destination_state_name || 'Delhi',
      route_type,
      directionality,
      direct_route_only,
      estimated_transit_days,
      default_freight_rate,
      rate_unit,
      is_active: true
    });

    return res.status(201).json({
      success: true,
      message: 'Transport route created successfully.',
      data: route
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/v1/provider/transport/routes/:route_id
exports.deleteProviderRoute = async (req, res, next) => {
  try {
    const provider = await getAuthenticatedProvider(req.user.id);
    if (!provider) return errorResponse(res, 'Provider profile not found', null, 404);

    await TransportRoute.findOneAndDelete({ _id: req.params.route_id, providerId: provider._id });

    return res.status(200).json({
      success: true,
      message: 'Transport route deleted successfully.'
    });
  } catch (err) {
    next(err);
  }
};

// ==========================================
// 4. FREIGHT RATE MANAGEMENT (PROVIDER)
// ==========================================
// POST /api/v1/provider/freight-rates
exports.createFreightRate = async (req, res, next) => {
  try {
    const provider = await getAuthenticatedProvider(req.user.id);
    if (!provider) return errorResponse(res, 'Provider profile not found', null, 404);

    const {
      vehicleTypeId,
      routeId,
      origin_city_name,
      destination_city_name,
      pricing_model = 'per_ton',
      amount,
      currency = 'INR',
      unit = 'INR per ton',
      minimum_charge = 0,
      additional_charges,
      effective_until
    } = req.body;

    if (!amount || amount <= 0) {
      return errorResponse(res, 'Valid freight amount is required', null, 400);
    }

    const rate = await FreightRate.create({
      providerId: provider._id,
      vehicleTypeId,
      routeId,
      origin_city_name,
      destination_city_name,
      pricing_model,
      amount,
      currency,
      unit,
      minimum_charge,
      additional_charges,
      effective_until,
      status: 'active'
    });

    return res.status(201).json({
      success: true,
      message: 'Freight rate created successfully.',
      data: rate
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/v1/provider/freight-rates/:rate_id
exports.updateFreightRate = async (req, res, next) => {
  try {
    const provider = await getAuthenticatedProvider(req.user.id);
    if (!provider) return errorResponse(res, 'Provider profile not found', null, 404);

    const rate = await FreightRate.findOneAndUpdate(
      { _id: req.params.rate_id, providerId: provider._id },
      req.body,
      { new: true }
    );

    if (!rate) {
      return errorResponse(res, 'Freight rate not found or unauthorized', null, 404);
    }

    return res.status(200).json({
      success: true,
      message: 'Freight rate updated successfully.',
      data: rate
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/v1/provider/freight-rates/:rate_id
exports.deleteFreightRate = async (req, res, next) => {
  try {
    const provider = await getAuthenticatedProvider(req.user.id);
    if (!provider) return errorResponse(res, 'Provider profile not found', null, 404);

    await FreightRate.findOneAndUpdate(
      { _id: req.params.rate_id, providerId: provider._id },
      { status: 'archived' }
    );

    return res.status(200).json({
      success: true,
      message: 'Freight rate archived successfully.'
    });
  } catch (err) {
    next(err);
  }
};

// ==========================================
// 5. INQUIRIES & QUOTE REQUESTS (PROVIDER)
// ==========================================
// GET /api/v1/provider/transport/inquiries
exports.getProviderInquiries = async (req, res, next) => {
  try {
    const provider = await getAuthenticatedProvider(req.user.id);
    if (!provider) return errorResponse(res, 'Provider profile not found', null, 404);

    const inquiries = await Inquiry.find({ businessId: provider._id, category: 'Transport' })
      .populate('senderId', 'name mobile email')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      message: 'Provider inquiries retrieved successfully.',
      data: inquiries
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/v1/provider/transport/inquiries/:inquiry_id/status
exports.updateProviderInquiryStatus = async (req, res, next) => {
  try {
    const provider = await getAuthenticatedProvider(req.user.id);
    if (!provider) return errorResponse(res, 'Provider profile not found', null, 404);

    const { status, vendor_response } = req.body;
    const inquiry = await Inquiry.findOne({ _id: req.params.inquiry_id, businessId: provider._id });
    if (!inquiry) return errorResponse(res, 'Inquiry not found or unauthorized', null, 404);

    if (status) inquiry.status = status;
    if (vendor_response) {
      inquiry.vendorResponse = {
        message: vendor_response,
        respondedAt: new Date()
      };
    }
    await inquiry.save();

    return res.status(200).json({
      success: true,
      message: 'Inquiry status updated successfully.',
      data: inquiry
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/provider/transport/quote-requests
exports.getProviderQuoteRequests = async (req, res, next) => {
  try {
    const provider = await getAuthenticatedProvider(req.user.id);
    if (!provider) return errorResponse(res, 'Provider profile not found', null, 404);

    const requests = await QuoteRequest.find({
      $or: [
        { businessId: provider._id },
        { assignedSuppliers: provider._id }
      ]
    })
      .populate('userId', 'name mobile email')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      message: 'Provider quote requests retrieved successfully.',
      data: requests
    });
  } catch (err) {
    next(err);
  }
};
