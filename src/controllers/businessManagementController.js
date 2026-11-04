const BusinessProfile = require('../models/BusinessProfile');
const User = require('../models/User');
const Product = require('../models/Product');
const Inquiry = require('../models/Inquiry');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// Canonical list of all supported business types
const ALL_BUSINESS_TYPES = [
  { id: 'manufacturer', name: 'Stone Manufacturer', menuTitle: 'Product & Spares Management', path: '/manufacturer/dashboard' },
  { id: 'mining', name: 'Quarry & Mining', menuTitle: 'Product & Spares Management', path: '/mining/dashboard' },
  { id: 'showroom', name: 'Stone Showroom', menuTitle: 'Product & Spares Management', path: '/showroom/dashboard' },
  { id: 'trader', name: 'Stone Trader', menuTitle: 'Product & Spares Management', path: '/trader/dashboard' },
  { id: 'buyer', name: 'Stone Buyer', menuTitle: 'Buyer Requirements Management', path: '/buyer/dashboard' },
  { id: 'transport_national', name: 'National Transport', menuTitle: 'Fleet Management', path: '/transport/dashboard' },
  { id: 'transport_local', name: 'Local Transport', menuTitle: 'Fleet Management', path: '/transport/dashboard' },
  { id: 'brazing', name: 'Brazing & Tooling Service', menuTitle: 'Brazing Services Management', path: '/brazing/dashboard' },
  { id: 'abrasives_epoxy', name: 'Abrasives & Epoxy Chemicals', menuTitle: 'Product & Spares Management', path: '/abrasives/dashboard' },
  { id: 'machinery_parts', name: 'Stone Machinery Parts & Spares', menuTitle: 'Product & Spares Management', path: '/machinery/dashboard' },
  { id: 'mining_equipment', name: 'Heavy Mining Equipment', menuTitle: 'Product & Spares Management', path: '/mining-equipment/dashboard' },
  { id: 'solar_solutions', name: 'Industrial Solar Solutions', menuTitle: 'Product & Spares Management', path: '/solar/dashboard' },
  { id: 'diamond_blades', name: 'Diamond Blades & Segments', menuTitle: 'Product & Spares Management', path: '/diamond-blades/dashboard' },
  { id: 'machine_manufacturer', name: 'Stone Machine Manufacturer', menuTitle: 'Machinery Catalog Management', path: '/machine-manufacturer/dashboard' },
  { id: 'powder_supplier', name: 'Mineral & Powder Supplier', menuTitle: 'Powder Catalog Management', path: '/powder-supplier/dashboard' },
  { id: 'hydro_crane', name: 'Hydro & Heavy Crane Service', menuTitle: 'Equipment & Rental Management', path: '/hydro-crane/dashboard' },
  { id: 'machine_repairing', name: 'Machine Repairing', menuTitle: 'Repair Service Management', path: '/machine-repairing/dashboard' },
  { id: 'electrical_panel', name: 'Electrical Panel & Repairing', menuTitle: 'Electrical Service Management', path: '/electrical-panel/dashboard' },
  { id: 'water_supplier', name: 'Water Supplier', menuTitle: 'Water Supply Management', path: '/water-supplier/dashboard' },
  { id: 'ca_tax_advisor', name: 'CA & Tax Advisor', menuTitle: 'Professional Services Management', path: '/ca-tax-advisor/dashboard' },
  { id: 'banking_loan', name: 'Banking & Loan Services', menuTitle: 'Financial Services Management', path: '/banking-loan/dashboard' },
  { id: 'hotel_restaurant', name: 'Hotel & Restaurant', menuTitle: 'Hospitality Management', path: '/hotel-restaurant/dashboard' }
];

/**
 * GET /api/business-types
 * Returns full system registry of supported business types
 */
async function getSystemBusinessTypes(req, res) {
  try {
    const userRole = req.user ? req.user.role : null;
    const list = ALL_BUSINESS_TYPES.map(bt => ({
      ...bt,
      is_active: userRole ? (userRole === bt.id || (bt.id === 'transport_national' && userRole === 'transport')) : false
    }));

    return successResponse(res, 'System business types retrieved successfully', {
      total: list.length,
      current: userRole,
      business_types: list
    });
  } catch (error) {
    return errorResponse(res, error.message, error, 500);
  }
}

/**
 * GET /api/businesses
 * List all business profiles owned by the authenticated user
 */
async function getUserBusinesses(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const businesses = await BusinessProfile.find({ userId }).sort({ createdAt: -1 });

    const activeRole = req.user.role;
    const formatted = businesses.map(b => ({
      _id: b._id,
      id: b._id,
      business_id: b._id,
      business_type: b.business_type,
      company_name: b.company_name || 'My Business',
      business_category: b.business_category,
      is_verified: b.is_verified,
      verification_status: b.verification_status,
      address: b.address,
      rating: b.rating || 4.8,
      is_active: b.business_type === activeRole,
      createdAt: b.createdAt
    }));

    return successResponse(res, 'User businesses retrieved successfully', {
      total: formatted.length,
      active_business_type: activeRole,
      businesses: formatted
    });
  } catch (error) {
    return errorResponse(res, error.message, error, 500);
  }
}

/**
 * POST /api/businesses
 * Create a new business profile under the authenticated user
 */
async function createUserBusiness(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const { business_type, company_name, business_category, address, phone, email } = req.body;

    if (!business_type) {
      return errorResponse(res, 'business_type is required', null, 400);
    }

    const newBusiness = await BusinessProfile.create({
      userId,
      business_type,
      company_name: company_name || `${req.user.name || 'User'} ${business_type}`,
      business_category: business_category || business_type,
      phone: phone || req.user.mobile,
      email: email || req.user.email,
      address: address || { state: 'Rajasthan', country: 'India' },
      status: 'active'
    });

    return successResponse(res, 'Business profile created successfully', newBusiness, 201);
  } catch (error) {
    return errorResponse(res, error.message, error, 500);
  }
}

/**
 * GET /api/businesses/active
 * Fetch active business context for the authenticated user
 */
async function getActiveBusinessContext(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const activeRole = req.user.role;

    let business = await BusinessProfile.findOne({ userId, business_type: activeRole });
    if (!business) {
      business = await BusinessProfile.findOne({ userId }).sort({ createdAt: -1 });
    }

    const typeMeta = ALL_BUSINESS_TYPES.find(bt => bt.id === (business?.business_type || activeRole));

    return successResponse(res, 'Active business context retrieved', {
      business_id: business?._id || null,
      business_type: business?.business_type || activeRole,
      company_name: business?.company_name || req.user.name,
      menu_title: typeMeta?.menuTitle || 'Catalogue Management',
      dashboard_path: typeMeta?.path || '/dashboard',
      profile: business
    });
  } catch (error) {
    return errorResponse(res, error.message, error, 500);
  }
}

/**
 * POST /api/businesses/switch
 * Switch user's active business context / role
 */
async function switchUserBusiness(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const { target_business_type, target_business_id } = req.body;

    const user = await User.findById(userId);
    if (!user) return errorResponse(res, 'User not found', null, 404);

    let targetType = target_business_type;
    let targetProfile = null;

    if (target_business_id) {
      targetProfile = await BusinessProfile.findOne({ _id: target_business_id, userId });
      if (targetProfile) {
        targetType = targetProfile.business_type;
      }
    }

    if (!targetType) {
      return errorResponse(res, 'target_business_type or target_business_id is required', null, 400);
    }

    user.role = targetType;
    await user.save();

    if (!targetProfile) {
      targetProfile = await BusinessProfile.findOne({ userId, business_type: targetType });
    }

    return successResponse(res, `Successfully switched active business to ${targetType}`, {
      user_id: user._id,
      active_business_type: targetType,
      business_id: targetProfile ? targetProfile._id : null,
      business_name: targetProfile ? targetProfile.company_name : null
    });
  } catch (error) {
    return errorResponse(res, error.message, error, 500);
  }
}

/**
 * GET /api/businesses/:id
 * Retrieve details of a specific business profile
 */
async function getBusinessById(req, res) {
  try {
    const { id } = req.params;
    const business = await BusinessProfile.findById(id);
    if (!business) return errorResponse(res, 'Business profile not found', null, 404);

    return successResponse(res, 'Business profile retrieved successfully', business);
  } catch (error) {
    return errorResponse(res, error.message, error, 500);
  }
}

/**
 * PUT /api/businesses/:id
 * Update a business profile with ownership validation
 */
async function updateBusinessById(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const { id } = req.params;

    const business = await BusinessProfile.findById(id);
    if (!business) return errorResponse(res, 'Business profile not found', null, 404);

    // Ownership check (unless admin)
    if (business.userId.toString() !== userId.toString() && req.user.role !== 'admin') {
      return errorResponse(res, 'Unauthorized: You do not own this business profile', null, 403);
    }

    Object.assign(business, req.body);
    await business.save();

    return successResponse(res, 'Business profile updated successfully', business);
  } catch (error) {
    return errorResponse(res, error.message, error, 500);
  }
}

module.exports = {
  ALL_BUSINESS_TYPES,
  getSystemBusinessTypes,
  getUserBusinesses,
  createUserBusiness,
  getActiveBusinessContext,
  switchUserBusiness,
  getBusinessById,
  updateBusinessById
};

