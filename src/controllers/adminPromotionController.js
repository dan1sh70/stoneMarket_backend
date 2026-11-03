const PromotionPackage = require('../models/PromotionPackage');
const PromotionCampaign = require('../models/PromotionCampaign');
const PromotionOrder = require('../models/PromotionOrder');
const PromotionInvoice = require('../models/PromotionInvoice');
const Payment = require('../models/Payment');
const CampaignActivityLog = require('../models/CampaignActivityLog');
const Product = require('../models/Product');
const BusinessProfile = require('../models/BusinessProfile');
const { packageSchema, packageUpdateSchema } = require('../validations/promotion.validation');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// ==========================================
// PACKAGE MANAGEMENT
// ==========================================

async function getAllPackages(req, res) {
  try {
    const { type, status } = req.query;
    const query = {};
    if (type) query.promotion_type = type;
    if (status) query.status = status;

    const packages = await PromotionPackage.find(query).sort({ display_order: 1, price: 1 });
    return successResponse(res, 'Admin promotion packages retrieved', {
      count: packages.length,
      packages
    });
  } catch (error) {
    console.error('Error in getAllPackages:', error);
    return errorResponse(res, error.message, null, 500);
  }
}

async function createPackage(req, res) {
  try {
    const { error, value } = packageSchema.validate(req.body);
    if (error) return errorResponse(res, error.details[0].message, null, 400);

    const newPackage = await PromotionPackage.create(value);
    return successResponse(res, 'Promotion package created successfully', newPackage, 201);
  } catch (error) {
    console.error('Error in createPackage:', error);
    return errorResponse(res, error.message, null, 500);
  }
}

async function updatePackage(req, res) {
  try {
    const { id } = req.params;
    const { error, value } = packageUpdateSchema.validate(req.body);
    if (error) return errorResponse(res, error.details[0].message, null, 400);

    const updated = await PromotionPackage.findByIdAndUpdate(id, value, { new: true });
    if (!updated) return errorResponse(res, 'Promotion package not found', null, 404);

    return successResponse(res, 'Promotion package updated successfully', updated);
  } catch (error) {
    console.error('Error in updatePackage:', error);
    return errorResponse(res, error.message, null, 500);
  }
}

async function deletePackage(req, res) {
  try {
    const { id } = req.params;
    // Soft delete/deactivate so existing campaigns still reference it
    const pkg = await PromotionPackage.findByIdAndUpdate(id, { status: 'inactive' }, { new: true });
    if (!pkg) return errorResponse(res, 'Promotion package not found', null, 404);

    return successResponse(res, 'Promotion package deactivated successfully', pkg);
  } catch (error) {
    console.error('Error in deletePackage:', error);
    return errorResponse(res, error.message, null, 500);
  }
}

// ==========================================
// CAMPAIGN MANAGEMENT (ADMIN)
// ==========================================

async function getAllCampaigns(req, res) {
  try {
    const { type, status, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (type && type !== 'all') query.campaign_type = type;
    if (status && status !== 'all') query.campaign_status = status;
    if (search && search.trim()) {
      query.campaign_name = { $regex: search.trim(), $options: 'i' };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await PromotionCampaign.countDocuments(query);

    const campaigns = await PromotionCampaign.find(query)
      .populate('manufacturer_id', 'company_name logo address is_verified')
      .populate('product_id', 'name cover_image selling_price')
      .populate('package_id', 'package_name price duration_days')
      .populate('userId', 'name phone email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    return successResponse(res, 'Admin campaigns retrieved successfully', {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      campaigns
    });
  } catch (error) {
    console.error('Error in getAllCampaigns:', error);
    return errorResponse(res, error.message, null, 500);
  }
}

async function adminPauseCampaign(req, res) {
  try {
    const { id } = req.params;
    const campaign = await PromotionCampaign.findById(id);
    if (!campaign) return errorResponse(res, 'Campaign not found', null, 404);

    campaign.campaign_status = 'paused';
    campaign.paused_at = new Date();
    await campaign.save();

    if (campaign.campaign_type === 'feed' && campaign.product_id) {
      await Product.findByIdAndUpdate(campaign.product_id, {
        is_promoted: false,
        active_promotion_id: null,
        promotion_priority: 0
      });
    } else if (campaign.campaign_type === 'listing') {
      await BusinessProfile.findByIdAndUpdate(campaign.manufacturer_id, {
        is_promoted: false,
        active_promotion_id: null,
        promotion_priority: 0
      });
    }

    await CampaignActivityLog.create({
      campaign_id: campaign._id,
      action: 'paused',
      previous_status: 'active',
      new_status: 'paused',
      performed_by: req.user?.userId || req.user?.id || null,
      metadata: { reason: req.body.reason || 'Paused by administrator' }
    });

    return successResponse(res, 'Campaign paused by admin', campaign);
  } catch (error) {
    console.error('Error in adminPauseCampaign:', error);
    return errorResponse(res, error.message, null, 500);
  }
}

async function adminResumeCampaign(req, res) {
  try {
    const { id } = req.params;
    const campaign = await PromotionCampaign.findById(id);
    if (!campaign) return errorResponse(res, 'Campaign not found', null, 404);

    campaign.campaign_status = 'active';
    campaign.resumed_at = new Date();
    await campaign.save();

    if (campaign.campaign_type === 'feed' && campaign.product_id) {
      await Product.findByIdAndUpdate(campaign.product_id, {
        is_promoted: true,
        active_promotion_id: campaign._id,
        promotion_priority: campaign.priority_score
      });
    } else if (campaign.campaign_type === 'listing') {
      await BusinessProfile.findByIdAndUpdate(campaign.manufacturer_id, {
        is_promoted: true,
        active_promotion_id: campaign._id,
        promotion_priority: campaign.priority_score,
        promoted_badge: 'Featured Supplier'
      });
    }

    await CampaignActivityLog.create({
      campaign_id: campaign._id,
      action: 'resumed',
      previous_status: 'paused',
      new_status: 'active',
      performed_by: req.user?.userId || req.user?.id || null,
      metadata: { reason: req.body.reason || 'Resumed by administrator' }
    });

    return successResponse(res, 'Campaign resumed by admin', campaign);
  } catch (error) {
    console.error('Error in adminResumeCampaign:', error);
    return errorResponse(res, error.message, null, 500);
  }
}

async function adminEndCampaign(req, res) {
  try {
    const { id } = req.params;
    const campaign = await PromotionCampaign.findById(id);
    if (!campaign) return errorResponse(res, 'Campaign not found', null, 404);

    const prev = campaign.campaign_status;
    campaign.campaign_status = 'completed';
    campaign.ended_at = new Date();
    await campaign.save();

    if (campaign.campaign_type === 'feed' && campaign.product_id) {
      await Product.findByIdAndUpdate(campaign.product_id, {
        is_promoted: false,
        active_promotion_id: null,
        promotion_priority: 0
      });
    } else if (campaign.campaign_type === 'listing') {
      await BusinessProfile.findByIdAndUpdate(campaign.manufacturer_id, {
        is_promoted: false,
        active_promotion_id: null,
        promotion_priority: 0
      });
    }

    await CampaignActivityLog.create({
      campaign_id: campaign._id,
      action: 'ended',
      previous_status: prev,
      new_status: 'completed',
      performed_by: req.user?.userId || req.user?.id || null,
      metadata: { reason: req.body.reason || 'Ended early by administrator' }
    });

    return successResponse(res, 'Campaign ended by admin', campaign);
  } catch (error) {
    console.error('Error in adminEndCampaign:', error);
    return errorResponse(res, error.message, null, 500);
  }
}

// ==========================================
// FINANCIAL MANAGEMENT (ADMIN)
// ==========================================

async function getAllOrders(req, res) {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.order_status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await PromotionOrder.countDocuments(query);

    const orders = await PromotionOrder.find(query)
      .populate('manufacturer_id', 'company_name')
      .populate('campaign_id', 'campaign_id campaign_name campaign_type')
      .populate('package_id', 'package_name price')
      .populate('userId', 'name phone email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    return successResponse(res, 'Admin promotion orders retrieved', {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      orders
    });
  } catch (error) {
    console.error('Error in getAllOrders:', error);
    return errorResponse(res, error.message, null, 500);
  }
}

async function getAllInvoices(req, res) {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await PromotionInvoice.countDocuments({});

    const invoices = await PromotionInvoice.find({})
      .populate('manufacturer_id', 'company_name')
      .populate('campaign_id', 'campaign_id campaign_name')
      .populate('order_id', 'order_number')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    return successResponse(res, 'Admin promotion invoices retrieved', {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      invoices
    });
  } catch (error) {
    console.error('Error in getAllInvoices:', error);
    return errorResponse(res, error.message, null, 500);
  }
}

async function getAdminPromotionStatistics(req, res) {
  try {
    const totalCampaigns = await PromotionCampaign.countDocuments({});
    const activeCampaigns = await PromotionCampaign.countDocuments({ campaign_status: 'active' });
    const feedCampaigns = await PromotionCampaign.countDocuments({ campaign_type: 'feed' });
    const listingCampaigns = await PromotionCampaign.countDocuments({ campaign_type: 'listing' });

    const totalOrders = await PromotionOrder.countDocuments({});
    const completedOrders = await PromotionOrder.countDocuments({ order_status: 'completed' });

    const revenueResult = await PromotionOrder.aggregate([
      { $match: { order_status: 'completed' } },
      { $group: { _id: null, totalRevenue: { $sum: '$total_amount' }, totalGst: { $sum: '$gst_amount' } } }
    ]);

    const revenue = revenueResult[0]?.totalRevenue || 0;
    const gstCollected = revenueResult[0]?.totalGst || 0;

    return successResponse(res, 'Admin promotion statistics loaded', {
      campaigns: {
        total: totalCampaigns,
        active: activeCampaigns,
        feed: feedCampaigns,
        listing: listingCampaigns
      },
      orders: {
        total: totalOrders,
        completed: completedOrders
      },
      financials: {
        total_revenue: revenue,
        total_gst_collected: gstCollected
      }
    });
  } catch (error) {
    console.error('Error in getAdminPromotionStatistics:', error);
    return errorResponse(res, error.message, null, 500);
  }
}

module.exports = {
  getAllPackages,
  createPackage,
  updatePackage,
  deletePackage,
  getAllCampaigns,
  adminPauseCampaign,
  adminResumeCampaign,
  adminEndCampaign,
  getAllOrders,
  getAllInvoices,
  getAdminPromotionStatistics
};
