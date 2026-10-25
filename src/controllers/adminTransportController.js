const BusinessProfile = require('../models/BusinessProfile');
const TransportVehicle = require('../models/TransportVehicle');
const TransportRoute = require('../models/TransportRoute');
const VehicleType = require('../models/VehicleType');
const Inquiry = require('../models/Inquiry');
const QuoteRequest = require('../models/QuoteRequest');
const QuoteResponse = require('../models/QuoteResponse');
const AdminLog = require('../models/AdminLog');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// 1. List Providers
// GET /api/v1/admin/transport/providers
exports.getAdminProviders = async (req, res, next) => {
  try {
    const { verification_status, status, transport_category, search, page = 1, per_page = 20 } = req.query;
    const limit = parseInt(per_page);
    const skip = (parseInt(page) - 1) * limit;

    let query = {
      business_type: { $in: ['transport_national', 'transport_local'] }
    };

    if (verification_status) query.verification_status = verification_status;
    if (status) query.status = status;
    if (transport_category) query.transport_category = transport_category;
    if (search) {
      query.$or = [
        { company_name: { $regex: new RegExp(search, 'i') } },
        { 'address.district': { $regex: new RegExp(search, 'i') } },
        { 'address.state': { $regex: new RegExp(search, 'i') } }
      ];
    }

    const total = await BusinessProfile.countDocuments(query);
    const providers = await BusinessProfile.find(query)
      .populate('userId', 'name mobile email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return res.status(200).json({
      success: true,
      message: 'Transport providers retrieved successfully.',
      data: providers,
      meta: {
        current_page: parseInt(page),
        per_page: limit,
        total,
        last_page: Math.ceil(total / limit) || 1
      }
    });
  } catch (err) {
    next(err);
  }
};

// 2. Get Single Provider Details (includes full verification documents)
// GET /api/v1/admin/transport/providers/:provider_id
exports.getAdminProviderById = async (req, res, next) => {
  try {
    const provider = await BusinessProfile.findOne({
      _id: req.params.provider_id,
      business_type: { $in: ['transport_national', 'transport_local'] }
    })
      .populate('userId', 'name mobile email')
      .lean();

    if (!provider) {
      return errorResponse(res, 'Transport provider not found', null, 404);
    }

    const vehicles = await TransportVehicle.find({ providerId: provider._id }).lean();
    const routes = await TransportRoute.find({ providerId: provider._id }).lean();

    return res.status(200).json({
      success: true,
      message: 'Provider details retrieved successfully.',
      data: {
        provider,
        vehicles,
        routes
      }
    });
  } catch (err) {
    next(err);
  }
};

// 3. Verification Approval / Rejection
// PATCH /api/v1/admin/transport/providers/:provider_id/verification
exports.updateVerificationStatus = async (req, res, next) => {
  try {
    const { status, rejection_reason } = req.body;
    if (!['approved', 'rejected', 'under_review', 'suspended'].includes(status)) {
      return errorResponse(res, 'Invalid verification status', null, 400);
    }

    const provider = await BusinessProfile.findOne({
      _id: req.params.provider_id,
      business_type: { $in: ['transport_national', 'transport_local'] }
    });

    if (!provider) {
      return errorResponse(res, 'Transport provider not found', null, 404);
    }

    const previousStatus = provider.verification_status;
    provider.verification_status = status;
    provider.is_verified = status === 'approved';
    if (status === 'approved') {
      provider.verified_at = new Date();
      provider.verified_by = req.user.id;
      provider.rejection_reason = undefined;
    } else if (status === 'rejected') {
      provider.rejection_reason = rejection_reason || 'Documents incomplete or invalid';
    }

    await provider.save();

    // Audit Log
    await AdminLog.create({
      adminId: req.user.id,
      action: `TRANSPORT_PROVIDER_VERIFICATION_${status.toUpperCase()}`,
      targetType: 'transport_provider',
      targetId: provider._id,
      details: {
        previous_status: previousStatus,
        new_status: status,
        rejection_reason
      }
    });

    return res.status(200).json({
      success: true,
      message: `Provider verification status updated to '${status}'.`,
      data: provider
    });
  } catch (err) {
    next(err);
  }
};

// 4. Update Status (Active / Suspended)
// PATCH /api/v1/admin/transport/providers/:provider_id/status
exports.updateProviderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['active', 'suspended', 'pending'].includes(status)) {
      return errorResponse(res, 'Invalid provider status', null, 400);
    }

    const provider = await BusinessProfile.findOneAndUpdate(
      { _id: req.params.provider_id, business_type: { $in: ['transport_national', 'transport_local'] } },
      { status },
      { new: true }
    );

    if (!provider) {
      return errorResponse(res, 'Transport provider not found', null, 404);
    }

    return res.status(200).json({
      success: true,
      message: `Provider account status set to '${status}'.`,
      data: provider
    });
  } catch (err) {
    next(err);
  }
};

// 5. Analytics
// GET /api/v1/admin/transport/analytics
exports.getTransportAnalytics = async (req, res, next) => {
  try {
    const totalProviders = await BusinessProfile.countDocuments({
      business_type: { $in: ['transport_national', 'transport_local'] }
    });
    const verifiedProviders = await BusinessProfile.countDocuments({
      business_type: { $in: ['transport_national', 'transport_local'] },
      $or: [{ is_verified: true }, { verification_status: 'approved' }]
    });
    const pendingProviders = await BusinessProfile.countDocuments({
      business_type: { $in: ['transport_national', 'transport_local'] },
      verification_status: 'pending'
    });
    const nationalProviders = await BusinessProfile.countDocuments({
      business_type: 'transport_national'
    });
    const localProviders = await BusinessProfile.countDocuments({
      business_type: 'transport_local'
    });
    const totalVehicles = await TransportVehicle.countDocuments({ is_active: true });
    const availableVehicles = await TransportVehicle.countDocuments({
      is_active: true,
      availability_status: 'available_now'
    });
    const activeRoutes = await TransportRoute.countDocuments({ is_active: true });
    const totalInquiries = await Inquiry.countDocuments({ category: 'Transport' });
    const totalQuoteRequests = await QuoteRequest.countDocuments({
      $or: [{ required_vehicle_type: { $exists: true } }, { cargo_weight: { $exists: true } }]
    });

    return res.status(200).json({
      success: true,
      message: 'Transport marketplace analytics retrieved successfully.',
      data: {
        total_providers: totalProviders,
        verified_providers: verifiedProviders,
        pending_verification: pendingProviders,
        national_providers: nationalProviders,
        local_providers: localProviders,
        active_vehicles: totalVehicles,
        available_vehicles: availableVehicles,
        active_routes: activeRoutes,
        total_inquiries: totalInquiries,
        total_quote_requests: totalQuoteRequests
      }
    });
  } catch (err) {
    next(err);
  }
};

// 6. Manage Vehicle Types
// GET /api/v1/admin/transport/vehicle-types
exports.getVehicleTypes = async (req, res, next) => {
  try {
    const types = await VehicleType.find().sort({ sort_order: 1 }).lean();
    return res.status(200).json({
      success: true,
      message: 'Vehicle types retrieved successfully.',
      data: types
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/admin/transport/vehicle-types
exports.createVehicleType = async (req, res, next) => {
  try {
    const { name, configuration, default_payload_capacity, description, icon, image, sort_order } = req.body;
    if (!name) return errorResponse(res, 'Vehicle type name is required', null, 400);

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const vehicleType = await VehicleType.create({
      name,
      slug,
      configuration: configuration || name,
      default_payload_capacity: default_payload_capacity || 20,
      description,
      icon,
      image,
      sort_order: sort_order || 0,
      is_active: true
    });

    return res.status(201).json({
      success: true,
      message: 'Vehicle type created successfully.',
      data: vehicleType
    });
  } catch (err) {
    next(err);
  }
};
