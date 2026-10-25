const BusinessProfile = require('../models/BusinessProfile');
const BuyerType = require('../models/BuyerType');
const BuyerRequirement = require('../models/BuyerRequirement');
const BuyerReview = require('../models/BuyerReview');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// 1. Get Buyers (Admin)
// GET /api/admin/buyers
exports.getBuyers = async (req, res, next) => {
  try {
    const { verification_status, status, search, page = 1, per_page = 20 } = req.query;
    const limit = parseInt(per_page);
    const skip = (parseInt(page) - 1) * limit;

    let query = { business_type: 'buyer' };

    if (verification_status) query.verification_status = verification_status;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { company_name: { $regex: new RegExp(search, 'i') } },
        { 'address.district': { $regex: new RegExp(search, 'i') } },
        { 'address.state': { $regex: new RegExp(search, 'i') } }
      ];
    }

    const buyers = await BusinessProfile.find(query)
      .populate('buyer_types', 'name')
      .populate('userId', 'name mobile email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await BusinessProfile.countDocuments(query);

    return res.status(200).json({
      success: true,
      message: 'Admin buyers retrieved successfully',
      data: buyers,
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

// 2. Get Buyer Detail (Admin - includes private docs)
// GET /api/admin/buyers/:id
exports.getBuyerDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const buyer = await BusinessProfile.findOne({ _id: id, business_type: 'buyer' })
      .populate('buyer_types', 'name slug')
      .populate('userId', 'name mobile email')
      .populate('verified_by', 'name email')
      .lean();

    if (!buyer) {
      return errorResponse(res, 'Buyer not found', null, 404);
    }

    const requirements = await BuyerRequirement.find({ buyerId: id }).lean();
    const reviews = await BuyerReview.find({ buyerId: id }).populate('userId', 'name email').lean();

    return successResponse(res, 'Buyer details retrieved successfully', {
      buyer,
      requirements,
      reviews
    });
  } catch (err) {
    next(err);
  }
};

// 3. Update Buyer (Admin)
// PUT /api/admin/buyers/:id
exports.updateBuyer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const buyer = await BusinessProfile.findOne({ _id: id, business_type: 'buyer' });

    if (!buyer) {
      return errorResponse(res, 'Buyer not found', null, 404);
    }

    const updatableFields = [
      'company_name', 'company_details', 'status', 'buyer_types',
      'preferred_materials', 'preferred_products', 'requirement_summary',
      'industry', 'website', 'address', 'gst_number', 'iec_number'
    ];

    updatableFields.forEach(f => {
      if (req.body[f] !== undefined) buyer[f] = req.body[f];
    });

    const updated = await buyer.save();
    return successResponse(res, 'Buyer updated successfully', updated);
  } catch (err) {
    next(err);
  }
};

// 4. Verify Buyer (Admin Only)
// PUT /api/admin/buyers/:id/verify
exports.verifyBuyer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { verification_status, rejection_reason } = req.body;

    const allowedStatuses = ['pending', 'under_review', 'approved', 'rejected', 'suspended'];
    if (!verification_status || !allowedStatuses.includes(verification_status)) {
      return errorResponse(res, `Invalid verification status. Must be one of: ${allowedStatuses.join(', ')}`, null, 400);
    }

    const buyer = await BusinessProfile.findOne({ _id: id, business_type: 'buyer' });
    if (!buyer) {
      return errorResponse(res, 'Buyer not found', null, 404);
    }

    buyer.verification_status = verification_status;
    if (verification_status === 'approved') {
      buyer.is_verified = true;
      buyer.verified_at = new Date();
      buyer.verified_by = req.user.id;
      buyer.rejection_reason = undefined;
    } else {
      buyer.is_verified = false;
      if (verification_status === 'rejected') {
        buyer.rejection_reason = rejection_reason || 'Verification application does not meet platform requirements';
      }
    }

    const updated = await buyer.save();
    return successResponse(res, `Buyer verification status updated to '${verification_status}'`, updated);
  } catch (err) {
    next(err);
  }
};

// 5. Review Buyer Requirements (Admin)
// GET /api/admin/buyers/requirements
exports.getAllRequirements = async (req, res, next) => {
  try {
    const { status, search, page = 1, per_page = 20 } = req.query;
    const limit = parseInt(per_page);
    const skip = (parseInt(page) - 1) * limit;

    let query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: new RegExp(search, 'i') } },
        { material: { $regex: new RegExp(search, 'i') } }
      ];
    }

    const requirements = await BuyerRequirement.find(query)
      .populate('buyerId', 'company_name address')
      .populate('userId', 'name mobile')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await BuyerRequirement.countDocuments(query);

    return res.status(200).json({
      success: true,
      message: 'Requirements retrieved successfully',
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

// 6. Update Requirement Status (Admin)
// PUT /api/admin/buyers/requirements/:id/status
exports.updateRequirementStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowed = ['draft', 'open', 'paused', 'fulfilled', 'expired', 'cancelled'];
    if (!status || !allowed.includes(status)) {
      return errorResponse(res, `Invalid status. Must be one of: ${allowed.join(', ')}`, null, 400);
    }

    const requirement = await BuyerRequirement.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!requirement) {
      return errorResponse(res, 'Requirement not found', null, 404);
    }

    return successResponse(res, `Requirement status updated to '${status}'`, requirement);
  } catch (err) {
    next(err);
  }
};

// 7. Review Reviews (Admin)
// GET /api/admin/buyers/reviews
exports.getAllReviews = async (req, res, next) => {
  try {
    const { status = 'approved', page = 1, per_page = 20 } = req.query;
    const limit = parseInt(per_page);
    const skip = (parseInt(page) - 1) * limit;

    const query = status ? { status } : {};
    const reviews = await BuyerReview.find(query)
      .populate('userId', 'name email mobile')
      .populate('buyerId', 'company_name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await BuyerReview.countDocuments(query);

    return res.status(200).json({
      success: true,
      message: 'Reviews retrieved successfully',
      data: reviews,
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

// 8. Update Review Status (Admin Moderation)
// PUT /api/admin/buyers/reviews/:id/status
exports.updateReviewStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return errorResponse(res, 'Invalid review status', null, 400);
    }

    const review = await BuyerReview.findByIdAndUpdate(id, { status }, { new: true });
    if (!review) {
      return errorResponse(res, 'Review not found', null, 404);
    }

    // Recompute buyer rating
    const allApproved = await BuyerReview.find({ buyerId: review.buyerId, status: 'approved' });
    const totalCount = allApproved.length;
    const sum = allApproved.reduce((acc, r) => acc + r.rating, 0);
    const avg = totalCount > 0 ? parseFloat((sum / totalCount).toFixed(1)) : 0;

    await BusinessProfile.findByIdAndUpdate(review.buyerId, {
      rating: avg,
      review_count: totalCount
    });

    return successResponse(res, `Review status updated to '${status}'`, review);
  } catch (err) {
    next(err);
  }
};

// 9. Buyer Types Management (Admin)
// POST /api/admin/buyers/types
exports.createBuyerType = async (req, res, next) => {
  try {
    const { name, description, icon, sort_order = 0 } = req.body;
    if (!name) {
      return errorResponse(res, 'Buyer type name is required', null, 400);
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const exists = await BuyerType.findOne({ slug });
    if (exists) {
      return errorResponse(res, 'Buyer type with this name already exists', null, 400);
    }

    const buyerType = await BuyerType.create({
      name,
      slug,
      description,
      icon,
      sort_order,
      status: 'active'
    });

    return successResponse(res, 'Buyer type created successfully', buyerType, 201);
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/buyers/types/:id
exports.updateBuyerType = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, icon, sort_order, status } = req.body;

    const buyerType = await BuyerType.findById(id);
    if (!buyerType) {
      return errorResponse(res, 'Buyer type not found', null, 404);
    }

    if (name) {
      buyerType.name = name;
      buyerType.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }
    if (description !== undefined) buyerType.description = description;
    if (icon !== undefined) buyerType.icon = icon;
    if (sort_order !== undefined) buyerType.sort_order = sort_order;
    if (status !== undefined) buyerType.status = status;

    const updated = await buyerType.save();
    return successResponse(res, 'Buyer type updated successfully', updated);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/buyers/types/:id
exports.deleteBuyerType = async (req, res, next) => {
  try {
    const { id } = req.params;
    const buyerType = await BuyerType.findById(id);
    if (!buyerType) {
      return errorResponse(res, 'Buyer type not found', null, 404);
    }

    await BuyerType.deleteOne({ _id: id });
    return successResponse(res, 'Buyer type deleted successfully', null);
  } catch (err) {
    next(err);
  }
};
