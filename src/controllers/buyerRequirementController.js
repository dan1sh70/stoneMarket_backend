const BuyerRequirement = require('../models/BuyerRequirement');
const BusinessProfile = require('../models/BusinessProfile');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// Helper to resolve or ensure buyer profile
const getOrCreateBuyerProfile = async (user) => {
  let profile = await BusinessProfile.findOne({ userId: user.id, business_type: 'buyer' });
  if (!profile) {
    profile = await BusinessProfile.create({
      userId: user.id,
      business_type: 'buyer',
      company_name: `${user.name || 'User'} Procurement`,
      status: 'active'
    });
  }
  return profile;
};

// @desc    Get all requirements created by the logged-in buyer
// @route   GET /api/buyer/requirements
// @access  Private (Buyer)
exports.getMyRequirements = async (req, res, next) => {
  try {
    const { status, page = 1, per_page = 20 } = req.query;
    const limit = parseInt(per_page);
    const skip = (parseInt(page) - 1) * limit;

    let query = { userId: req.user.id };
    if (status) {
      query.status = status;
    }

    const requirements = await BuyerRequirement.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await BuyerRequirement.countDocuments(query);

    return res.status(200).json({
      success: true,
      message: 'Buyer requirements retrieved successfully',
      data: requirements,
      meta: {
        current_page: parseInt(page),
        per_page: limit,
        total,
        last_page: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new purchasing requirement
// @route   POST /api/buyer/requirements
// @access  Private (Buyer)
exports.createRequirement = async (req, res, next) => {
  try {
    const {
      title,
      description,
      material,
      product_type,
      stone_type,
      colour,
      finish,
      grade,
      required_size,
      required_thickness,
      thickness_mm,
      quantity,
      quantity_unit = 'sqft',
      budget,
      delivery_location,
      required_delivery_date,
      order_frequency,
      min_supplier_capacity,
      status = 'open',
      visibility = 'public',
      attachments,
      expiry_date
    } = req.body;

    if (!title) {
      return errorResponse(res, 'Requirement title is required', null, 400);
    }
    if (!quantity || quantity <= 0) {
      return errorResponse(res, 'Quantity must be a positive number', null, 400);
    }

    const buyerProfile = await getOrCreateBuyerProfile(req.user);

    const requirement = await BuyerRequirement.create({
      buyerId: buyerProfile._id,
      userId: req.user.id,
      title,
      description,
      material,
      product_type,
      stone_type,
      colour,
      finish,
      grade,
      required_size,
      required_thickness,
      thickness_mm,
      quantity,
      quantity_unit,
      budget,
      delivery_location,
      required_delivery_date,
      order_frequency,
      min_supplier_capacity,
      status,
      visibility,
      attachments,
      expiry_date
    });

    // Update requirement summary on buyer profile if not set
    if (!buyerProfile.requirement_summary) {
      buyerProfile.requirement_summary = `${material || 'Stone'} ${product_type || 'Requirements'}`;
      await buyerProfile.save();
    }

    return successResponse(res, 'Requirement created successfully', requirement, 201);
  } catch (err) {
    next(err);
  }
};

// @desc    Get requirement by ID
// @route   GET /api/buyer/requirements/:requirement_id
// @access  Private (Buyer / Supplier / Admin)
exports.getRequirementById = async (req, res, next) => {
  try {
    const { requirement_id } = req.params;
    const requirement = await BuyerRequirement.findById(requirement_id)
      .populate('buyerId', 'company_name address rating review_count is_verified')
      .lean();

    if (!requirement) {
      return errorResponse(res, 'Requirement not found', null, 404);
    }

    const isOwner = req.user && req.user.id === requirement.userId.toString();
    const isAdmin = req.user && req.user.role === 'admin';

    // If not owner/admin, check visibility
    if (!isOwner && !isAdmin) {
      if (requirement.status !== 'open' || requirement.visibility === 'private') {
        return errorResponse(res, 'Not authorized to view this requirement', null, 403);
      }
    }

    return successResponse(res, 'Requirement details retrieved successfully', requirement);
  } catch (err) {
    next(err);
  }
};

// @desc    Update requirement (Owner only)
// @route   PUT /api/buyer/requirements/:requirement_id
// @access  Private (Owner Buyer)
exports.updateRequirement = async (req, res, next) => {
  try {
    const { requirement_id } = req.params;
    const requirement = await BuyerRequirement.findById(requirement_id);

    if (!requirement) {
      return errorResponse(res, 'Requirement not found', null, 404);
    }

    // Ownership check
    if (requirement.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return errorResponse(res, 'You are not authorized to update this requirement', null, 403);
    }

    const updatableFields = [
      'title', 'description', 'material', 'product_type', 'stone_type',
      'colour', 'finish', 'grade', 'required_size', 'required_thickness',
      'thickness_mm', 'quantity', 'quantity_unit', 'budget', 'delivery_location',
      'required_delivery_date', 'order_frequency', 'min_supplier_capacity',
      'status', 'visibility', 'attachments', 'expiry_date'
    ];

    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        requirement[field] = req.body[field];
      }
    });

    const updated = await requirement.save();
    return successResponse(res, 'Requirement updated successfully', updated);
  } catch (err) {
    next(err);
  }
};

// @desc    Delete requirement (Owner only)
// @route   DELETE /api/buyer/requirements/:requirement_id
// @access  Private (Owner Buyer)
exports.deleteRequirement = async (req, res, next) => {
  try {
    const { requirement_id } = req.params;
    const requirement = await BuyerRequirement.findById(requirement_id);

    if (!requirement) {
      return errorResponse(res, 'Requirement not found', null, 404);
    }

    if (requirement.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return errorResponse(res, 'You are not authorized to delete this requirement', null, 403);
    }

    await BuyerRequirement.deleteOne({ _id: requirement._id });
    return successResponse(res, 'Requirement deleted successfully', null);
  } catch (err) {
    next(err);
  }
};
