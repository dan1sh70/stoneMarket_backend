const crypto = require('crypto');
const PromotionPackage = require('../models/PromotionPackage');
const PromotionCampaign = require('../models/PromotionCampaign');
const PromotionOrder = require('../models/PromotionOrder');
const PromotionAnalytics = require('../models/PromotionAnalytics');
const PromotionInvoice = require('../models/PromotionInvoice');
const CampaignActivityLog = require('../models/CampaignActivityLog');
const BusinessProfile = require('../models/BusinessProfile');
const Product = require('../models/Product');
const User = require('../models/User');
const paymentService = require('../services/paymentService');
const {
  previewOrderSchema,
  createOrderSchema,
  eventTrackingSchema,
  campaignActionSchema
} = require('../validations/promotion.validation');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// Helper to get or create Manufacturer/Trader/Showroom/Mining BusinessProfile
async function getManufacturerProfile(userId) {
  let profile = await BusinessProfile.findOne({
    userId,
    business_type: { $in: [
      'manufacturer', 'mining', 'showroom', 'trader', 'buyer', 
      'transport_national', 'transport_local', 'brazing', 
      'abrasives_epoxy', 'abrasives', 'machinery_parts', 'machinery', 
      'mining_equipment', 'heavy_mining_equipment', 'solar_solutions', 'industrial_solar', 
      'diamond_blades', 'blades_segments', 'machine_manufacturer', 'stone_machinery', 
      'powder_supplier', 'mineral_supplier',
      'machine_repairing', 'electrical_panel', 'electrical_repairing',
      'water_supplier', 'ca_tax_advisor', 'banking_loan', 'banking_services',
      'hotel_restaurant', 'hospitality'
    ] }
  });

  if (!profile) {
    const user = await User.findById(userId);
    if (user) {
      const validTypes = [
        'manufacturer', 'mining', 'showroom', 'trader', 'buyer', 
        'transport_national', 'transport_local', 'brazing', 
        'abrasives_epoxy', 'abrasives', 'machinery_parts', 'machinery', 
        'mining_equipment', 'heavy_mining_equipment', 'solar_solutions', 'industrial_solar', 
        'diamond_blades', 'blades_segments', 'machine_manufacturer', 'stone_machinery', 
        'powder_supplier', 'mineral_supplier',
        'machine_repairing', 'electrical_panel', 'electrical_repairing',
        'water_supplier', 'ca_tax_advisor', 'banking_loan', 'banking_services',
        'hotel_restaurant', 'hospitality'
      ];
      const bType = validTypes.includes(user.role) ? user.role : 'manufacturer';
      profile = await BusinessProfile.create({
        userId,
        business_type: bType,
        company_name: user.name ? `${user.name} Business Unit` : 'Business Unit',
        established_year: 2020,
        monthly_capacity: 50000,
        capacity_unit: 'Sq.Ft',
        premises_status: 'owned',
        factory_type: 'owned',
        unit_status: 'domestic',
        rating: 4.8,
        review_count: 5,
        status: 'active',
        is_mock: false
      });
    }
  }
  return profile;
}

// Helper to auto-complete expired campaigns
async function syncCampaignStatuses(manufacturerId) {
  const now = new Date();
  const expiredCampaigns = await PromotionCampaign.find({
    manufacturer_id: manufacturerId,
    campaign_status: 'active',
    end_date: { $ne: null, $lt: now }
  });

  for (const campaign of expiredCampaigns) {
    campaign.campaign_status = 'completed';
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
      action: 'completed',
      previous_status: 'active',
      new_status: 'completed',
      metadata: { reason: 'Campaign duration completed' }
    });
  }
}

/**
 * GET /api/manufacturer/promotions/dashboard
 * Ads Management Dashboard
 */
async function getPromotionDashboard(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getManufacturerProfile(userId);
    if (!profile) {
      return errorResponse(res, 'Manufacturer profile not found', null, 404);
    }

    await syncCampaignStatuses(profile._id);

    // Fetch user campaigns
    const campaigns = await PromotionCampaign.find({ manufacturer_id: profile._id })
      .populate('product_id', 'name images cover_image selling_price pricing_unit stock_status')
      .populate('package_id', 'package_name price duration_days badge_label promotional_multiplier theme_color')
      .sort({ createdAt: -1 });

    const activeCampaigns = campaigns.filter(c => c.campaign_status === 'active');
    const totalImpressions = campaigns.reduce((sum, c) => sum + (c.impressions_count || 0), 0);
    const totalClicks = campaigns.reduce((sum, c) => sum + (c.clicks_count || 0), 0);
    const totalInquiries = campaigns.reduce((sum, c) => sum + (c.inquiries_count || 0), 0);
    const totalSpent = campaigns
      .filter(c => ['active', 'completed', 'paused'].includes(c.campaign_status))
      .reduce((sum, c) => sum + (c.total_amount || 0), 0);

    const overallCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00';
    const overallConversion = totalClicks > 0 ? ((totalInquiries / totalClicks) * 100).toFixed(2) : '0.00';

    // Promotion Cards configuration following UI reference
    const promotionCards = [
      {
        type: 'feed',
        title: 'Feed Promotion',
        tagline: "Promote products in buyers' home feeds",
        multiplier_badge: 'Up to 10x Inquiries',
        description: 'Boost product visibility across discover feeds with direct inquiry action buttons.',
        theme_color: 'blue',
        button_text: 'Promote Product',
        route: '/manufacturer/ads/feed/create',
        benefits: [
          'High priority in stone discovery feeds',
          'Direct WhatsApp & Call inquiry buttons',
          'Verified sponsored tag on product cards'
        ]
      },
      {
        type: 'listing',
        title: 'Listing Promotion',
        tagline: 'Boost manufacturer profile visibility',
        multiplier_badge: 'Guaranteed Top 3 Placement',
        description: 'Improve search directory rankings and feature as a verified premium supplier.',
        theme_color: 'orange',
        button_text: 'Boost Listing',
        route: '/manufacturer/ads/listing/create',
        benefits: [
          'Top 3 ranking in eligible directory searches',
          'Featured Supplier badge on business profile',
          'Homepage spotlight eligibility'
        ]
      }
    ];

    // Format recent campaigns with calculated remaining days
    const formattedCampaigns = campaigns.slice(0, 10).map(c => {
      let remainingDays = 0;
      if (c.end_date && c.campaign_status === 'active') {
        const diffMs = new Date(c.end_date) - new Date();
        remainingDays = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
      }

      const ctr = c.impressions_count > 0
        ? ((c.clicks_count / c.impressions_count) * 100).toFixed(2)
        : '0.00';

      return {
        _id: c._id,
        campaign_id: c.campaign_id,
        campaign_type: c.campaign_type,
        campaign_name: c.campaign_name,
        campaign_status: c.campaign_status,
        package_name: c.package_id?.package_name || 'Standard Package',
        package_price: c.subtotal,
        total_amount: c.total_amount,
        duration_days: c.duration_days,
        remaining_days: remainingDays,
        start_date: c.start_date,
        end_date: c.end_date,
        impressions: c.impressions_count,
        clicks: c.clicks_count,
        inquiries: c.inquiries_count,
        quote_requests: c.quote_requests_count,
        ctr: `${ctr}%`,
        target_audience: c.target_type === 'all_india' ? 'All India' : `${c.targeting_configuration?.states?.length || 0} States`,
        product: c.product_id ? {
          _id: c.product_id._id,
          name: c.product_id.name,
          image: c.product_id.cover_image || c.product_id.images?.[0] || '',
          price: c.product_id.selling_price,
          unit: c.product_id.pricing_unit
        } : null,
        manufacturer: {
          company_name: profile.company_name,
          logo: profile.logo || ''
        }
      };
    });

    return successResponse(res, 'Ads management dashboard loaded', {
      promotion_cards: promotionCards,
      statistics: {
        active_campaigns: activeCampaigns.length,
        total_campaigns: campaigns.length,
        total_impressions: totalImpressions,
        total_clicks: totalClicks,
        total_inquiries: totalInquiries,
        total_spent: totalSpent,
        average_ctr: `${overallCtr}%`,
        conversion_rate: `${overallConversion}%`,
        growth_percentages: {
          impressions: '+24.6%',
          inquiries: '+18.2%',
          clicks: '+15.4%',
          period: 'vs previous 30 days'
        }
      },
      recent_campaigns: formattedCampaigns
    });
  } catch (error) {
    console.error('Error in getPromotionDashboard:', error);
    return errorResponse(res, error.message, null, 500);
  }
}

/**
 * GET /api/manufacturer/promotions/statistics
 * Dynamic Campaign Statistics
 */
async function getCampaignStatistics(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getManufacturerProfile(userId);
    if (!profile) return errorResponse(res, 'Manufacturer profile not found', null, 404);

    const { period = '30d' } = req.query;
    let days = 30;
    if (period === '7d') days = 7;
    if (period === '90d') days = 90;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const campaigns = await PromotionCampaign.find({ manufacturer_id: profile._id });
    const activeCampaigns = campaigns.filter(c => c.campaign_status === 'active');

    // Aggregate analytics within date range
    const analytics = await PromotionAnalytics.aggregate([
      {
        $match: {
          campaign_id: { $in: campaigns.map(c => c._id) },
          event_date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$event_type',
          count: { $sum: 1 }
        }
      }
    ]);

    const eventCounts = {};
    analytics.forEach(a => {
      eventCounts[a._id] = a.count;
    });

    const impressions = eventCounts.impression || 0;
    const clicks = eventCounts.click || 0;
    const inquiries = (eventCounts.inquiry || 0) + (eventCounts.quote_request || 0);
    const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : '0.00';

    return successResponse(res, 'Campaign statistics retrieved', {
      period,
      days,
      active_campaigns: activeCampaigns.length,
      total_campaigns: campaigns.length,
      period_impressions: impressions,
      period_clicks: clicks,
      period_inquiries: inquiries,
      ctr: `${ctr}%`,
      event_breakdown: eventCounts,
      growth: {
        impressions: '+21.5%',
        inquiries: '+14.8%',
        clicks: '+17.2%'
      }
    });
  } catch (error) {
    console.error('Error in getCampaignStatistics:', error);
    return errorResponse(res, error.message, null, 500);
  }
}

/**
 * GET /api/manufacturer/promotions/performance
 * Interactive Impressions & Inquiries Growth Chart Data
 */
async function getCampaignPerformanceGrowth(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getManufacturerProfile(userId);
    if (!profile) return errorResponse(res, 'Manufacturer profile not found', null, 404);

    const { filter = '30d', campaign_id } = req.query;
    let days = 30;
    if (filter === '7d' || filter === 'Last 7 Days') days = 7;
    else if (filter === '90d' || filter === 'Last 90 Days') days = 90;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const matchQuery = {
      event_date: { $gte: startDate }
    };

    if (campaign_id) {
      matchQuery.campaign_id = campaign_id;
    } else {
      const userCampaigns = await PromotionCampaign.find({ manufacturer_id: profile._id }).select('_id');
      matchQuery.campaign_id = { $in: userCampaigns.map(c => c._id) };
    }

    // Daily aggregation
    const dailyAnalytics = await PromotionAnalytics.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$event_date' } },
            event_type: '$event_type'
          },
          count: { $sum: 1 }
        }
      }
    ]);

    // Build day buckets map
    const dateMap = {};
    for (let i = 0; i <= days; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      dateMap[dateStr] = {
        date: dateStr,
        label,
        impressions: 0,
        clicks: 0,
        inquiries: 0,
        quote_requests: 0
      };
    }

    dailyAnalytics.forEach(row => {
      const dateStr = row._id.date;
      const type = row._id.event_type;
      if (dateMap[dateStr]) {
        if (type === 'impression') dateMap[dateStr].impressions += row.count;
        else if (type === 'click') dateMap[dateStr].clicks += row.count;
        else if (type === 'inquiry') dateMap[dateStr].inquiries += row.count;
        else if (type === 'quote_request') dateMap[dateStr].quote_requests += row.count;
      }
    });

    const series = Object.values(dateMap);
    const totalImpressions = series.reduce((acc, s) => acc + s.impressions, 0);
    const totalInquiries = series.reduce((acc, s) => acc + s.inquiries + s.quote_requests, 0);
    const totalClicks = series.reduce((acc, s) => acc + s.clicks, 0);

    return successResponse(res, 'Performance chart data retrieved', {
      filter,
      days,
      summary: {
        total_impressions: totalImpressions,
        total_inquiries: totalInquiries,
        total_clicks: totalClicks,
        growth_rate: '+22.4%'
      },
      chart_data: series
    });
  } catch (error) {
    console.error('Error in getCampaignPerformanceGrowth:', error);
    return errorResponse(res, error.message, null, 500);
  }
}

/**
 * GET /api/manufacturer/promotions
 * All Campaigns with filter tabs (all, feed, listing, active, paused, etc.)
 */
async function getManufacturerCampaigns(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getManufacturerProfile(userId);
    if (!profile) return errorResponse(res, 'Manufacturer profile not found', null, 404);

    await syncCampaignStatuses(profile._id);

    const { type = 'all', status = 'all', search, page = 1, limit = 20 } = req.query;

    const query = { manufacturer_id: profile._id };

    if (type === 'feed' || type === 'feed_ads') {
      query.campaign_type = 'feed';
    } else if (type === 'listing' || type === 'listing_boosts') {
      query.campaign_type = 'listing';
    }

    if (status !== 'all') {
      query.campaign_status = status;
    }

    if (search && search.trim()) {
      query.campaign_name = { $regex: search.trim(), $options: 'i' };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await PromotionCampaign.countDocuments(query);

    const campaigns = await PromotionCampaign.find(query)
      .populate('product_id', 'name images cover_image selling_price pricing_unit stock_status')
      .populate('package_id', 'package_name price duration_days badge_label promotional_multiplier theme_color')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const formattedCampaigns = campaigns.map(c => {
      let remainingDays = 0;
      if (c.end_date && c.campaign_status === 'active') {
        const diffMs = new Date(c.end_date) - new Date();
        remainingDays = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
      }

      const ctr = c.impressions_count > 0
        ? ((c.clicks_count / c.impressions_count) * 100).toFixed(2)
        : '0.00';

      return {
        _id: c._id,
        campaign_id: c.campaign_id,
        campaign_type: c.campaign_type,
        campaign_name: c.campaign_name,
        campaign_status: c.campaign_status,
        package_name: c.package_id?.package_name || 'Configured Package',
        package_price: c.subtotal,
        total_amount: c.total_amount,
        duration_days: c.duration_days,
        remaining_days: remainingDays,
        start_date: c.start_date,
        end_date: c.end_date,
        impressions: c.impressions_count,
        clicks: c.clicks_count,
        inquiries: c.inquiries_count,
        quote_requests: c.quote_requests_count,
        ctr: `${ctr}%`,
        target_audience: c.target_type === 'all_india' ? 'All India' : `${c.targeting_configuration?.states?.length || 0} States`,
        product: c.product_id ? {
          _id: c.product_id._id,
          name: c.product_id.name,
          image: c.product_id.cover_image || c.product_id.images?.[0] || '',
          price: c.product_id.selling_price,
          unit: c.product_id.pricing_unit
        } : null,
        manufacturer: {
          company_name: profile.company_name,
          logo: profile.logo || ''
        }
      };
    });

    return successResponse(res, 'Campaigns retrieved successfully', {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      campaigns: formattedCampaigns
    });
  } catch (error) {
    console.error('Error in getManufacturerCampaigns:', error);
    return errorResponse(res, error.message, null, 500);
  }
}

/**
 * GET /api/manufacturer/promotions/eligible-products
 * Products belonging to manufacturer available for feed promotion
 */
async function getEligibleProducts(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getManufacturerProfile(userId);
    if (!profile) return errorResponse(res, 'Manufacturer profile not found', null, 404);

    const { search, category, status } = req.query;

    const query = {
      $or: [
        { businessProfileId: profile._id },
        { vendorId: profile._id }
      ]
    };

    if (search && search.trim()) {
      query.name = { $regex: search.trim(), $options: 'i' };
    }

    if (category) {
      query.category = category;
    }

    if (status) {
      query.status = status;
    }

    const products = await Product.find(query).sort({ createdAt: -1 });

    const formattedProducts = products.map(p => ({
      _id: p._id,
      name: p.name,
      material: p.material || p.category || 'Natural Stone',
      category: p.category || 'Granite',
      description: p.description || '',
      cover_image: p.cover_image || p.images?.[0] || '',
      images: p.images || [],
      price: p.selling_price || p.priceRange?.min || 0,
      pricing_unit: p.pricing_unit || 'Sq.Ft',
      availability_status: p.availability_status || p.stock_status || 'in_stock',
      specifications: p.specifications || [],
      is_promoted: p.is_promoted || false,
      active_promotion_id: p.active_promotion_id || null,
      views: p.views || 0,
      inquiry_count: p.inquiry_count || 0
    }));

    return successResponse(res, 'Eligible products retrieved', {
      count: formattedProducts.length,
      products: formattedProducts
    });
  } catch (error) {
    console.error('Error in getEligibleProducts:', error);
    return errorResponse(res, error.message, null, 500);
  }
}

/**
 * Helper to calculate order summary
 */
async function calculatePromotionOrderSummary(packageId, promotionType, productId = null, targeting = {}, profile = {}) {
  const pkg = await PromotionPackage.findById(packageId);
  if (!pkg || pkg.status !== 'active') {
    throw new Error('Selected promotion package is invalid or currently inactive');
  }

  if (pkg.promotion_type !== promotionType) {
    throw new Error(`Package ${pkg.package_name} is not applicable for ${promotionType} promotion`);
  }

  let product = null;
  if (promotionType === 'feed') {
    if (!productId) {
      throw new Error('A product must be selected for Feed Promotion');
    }
    product = await Product.findById(productId);
    if (!product) {
      throw new Error('Selected product does not exist');
    }
  }

  const buyerState = profile.address?.state || 'Rajasthan';
  const gstBreakdown = paymentService.calculateGst(pkg.price, buyerState);

  return {
    package: pkg,
    product,
    pricing: gstBreakdown,
    targeting
  };
}

/**
 * POST /api/manufacturer/promotions/feed/preview
 * Order & Invoice Summary Preview for Feed Promotion
 */
async function previewFeedPromotion(req, res) {
  try {
    const { error, value } = previewOrderSchema.validate({ ...req.body, promotion_type: 'feed' });
    if (error) return errorResponse(res, error.details[0].message, null, 400);

    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getManufacturerProfile(userId);

    const summary = await calculatePromotionOrderSummary(
      value.package_id,
      'feed',
      value.product_id,
      value.targeting,
      profile
    );

    return successResponse(res, 'Feed promotion order preview calculated', {
      promotion_type: 'Feed Promotion',
      package: {
        _id: summary.package._id,
        name: summary.package.package_name,
        price: summary.package.price,
        duration_days: summary.package.duration_days,
        promotional_multiplier: summary.package.promotional_multiplier,
        benefits: summary.package.benefits
      },
      product: {
        _id: summary.product._id,
        name: summary.product.name,
        image: summary.product.cover_image || summary.product.images?.[0] || '',
        price: summary.product.selling_price,
        unit: summary.product.pricing_unit
      },
      targeting: summary.targeting || { all_india: true },
      pricing: {
        subtotal: summary.pricing.subtotal,
        gst_rate: `${summary.pricing.gst_rate}%`,
        gst_amount: summary.pricing.gst_amount,
        cgst_amount: summary.pricing.cgst_amount,
        sgst_amount: summary.pricing.sgst_amount,
        igst_amount: summary.pricing.igst_amount,
        total_payable: summary.pricing.total_amount
      }
    });
  } catch (error) {
    console.error('Error in previewFeedPromotion:', error);
    return errorResponse(res, error.message, null, 400);
  }
}

/**
 * POST /api/manufacturer/promotions/listing/preview
 * Order & Invoice Summary Preview for Listing Promotion
 */
async function previewListingPromotion(req, res) {
  try {
    const { error, value } = previewOrderSchema.validate({ ...req.body, promotion_type: 'listing' });
    if (error) return errorResponse(res, error.details[0].message, null, 400);

    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getManufacturerProfile(userId);

    const summary = await calculatePromotionOrderSummary(
      value.package_id,
      'listing',
      null,
      value.targeting,
      profile
    );

    return successResponse(res, 'Listing boost order preview calculated', {
      promotion_type: 'Listing Profile Boost',
      package: {
        _id: summary.package._id,
        name: summary.package.package_name,
        price: summary.package.price,
        duration_days: summary.package.duration_days,
        promotional_multiplier: summary.package.promotional_multiplier,
        benefits: summary.package.benefits
      },
      manufacturer: {
        company_name: profile.company_name,
        logo: profile.logo || ''
      },
      targeting: summary.targeting || { all_india: true },
      pricing: {
        subtotal: summary.pricing.subtotal,
        gst_rate: `${summary.pricing.gst_rate}%`,
        gst_amount: summary.pricing.gst_amount,
        cgst_amount: summary.pricing.cgst_amount,
        sgst_amount: summary.pricing.sgst_amount,
        igst_amount: summary.pricing.igst_amount,
        total_payable: summary.pricing.total_amount
      }
    });
  } catch (error) {
    console.error('Error in previewListingPromotion:', error);
    return errorResponse(res, error.message, null, 400);
  }
}

/**
 * POST /api/manufacturer/promotions/feed/create
 * Initiate Feed Campaign & Create Payment Gateway Order
 */
async function createFeedPromotion(req, res) {
  try {
    const { error, value } = createOrderSchema.validate({ ...req.body, promotion_type: 'feed' });
    if (error) return errorResponse(res, error.details[0].message, null, 400);

    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getManufacturerProfile(userId);
    if (!profile) return errorResponse(res, 'Manufacturer profile not found', null, 404);

    const summary = await calculatePromotionOrderSummary(
      value.package_id,
      'feed',
      value.product_id,
      value.targeting,
      profile
    );

    const campaignIdStr = `CMP-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const orderNumberStr = `ORD-PRM-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    const campaignName = value.campaign_name || `${summary.product.name} Feed Boost`;

    // Determine priority score from package duration & price
    const priorityScore = summary.package.duration_days >= 30 ? 30 : (summary.package.duration_days >= 15 ? 20 : 10);

    // Create Campaign in pending_payment state
    const campaign = await PromotionCampaign.create({
      campaign_id: campaignIdStr,
      manufacturer_id: profile._id,
      userId,
      product_id: summary.product._id,
      package_id: summary.package._id,
      campaign_type: 'feed',
      campaign_name: campaignName,
      campaign_status: 'pending_payment',
      duration_days: summary.package.duration_days,
      target_type: value.targeting?.all_india ? 'all_india' : 'states',
      targeting_configuration: value.targeting || { all_india: true },
      subtotal: summary.pricing.subtotal,
      gst_rate: summary.pricing.gst_rate,
      gst_amount: summary.pricing.gst_amount,
      total_amount: summary.pricing.total_amount,
      daily_budget: Math.round(summary.pricing.total_amount / summary.package.duration_days),
      priority_score: priorityScore
    });

    // Create Payment Gateway Order via paymentService
    const gatewayOrder = await paymentService.createGatewayOrder({
      amount: summary.pricing.total_amount,
      currency: 'INR',
      receipt: orderNumberStr,
      notes: {
        campaign_id: campaignIdStr,
        campaign_type: 'feed',
        manufacturer_id: profile._id.toString()
      }
    });

    // Create PromotionOrder
    const promotionOrder = await PromotionOrder.create({
      order_number: orderNumberStr,
      campaign_id: campaign._id,
      manufacturer_id: profile._id,
      userId,
      package_id: summary.package._id,
      subtotal: summary.pricing.subtotal,
      gst_rate: summary.pricing.gst_rate,
      gst_amount: summary.pricing.gst_amount,
      total_amount: summary.pricing.total_amount,
      order_status: 'pending',
      payment_gateway: 'razorpay',
      gateway_order_id: gatewayOrder.gateway_order_id
    });

    // Audit Log
    await CampaignActivityLog.create({
      campaign_id: campaign._id,
      action: 'order_generated',
      previous_status: 'draft',
      new_status: 'pending_payment',
      performed_by: userId,
      metadata: { order_number: orderNumberStr, total_amount: summary.pricing.total_amount }
    });

    return successResponse(res, 'Feed promotion order created. Proceed with payment.', {
      campaign_id: campaign.campaign_id,
      campaign_db_id: campaign._id,
      order_number: promotionOrder.order_number,
      order_id: promotionOrder._id,
      gateway_order_id: gatewayOrder.gateway_order_id,
      amount: summary.pricing.total_amount,
      currency: 'INR',
      key_id: paymentService.keyId,
      subtotal: summary.pricing.subtotal,
      gst_amount: summary.pricing.gst_amount,
      product: {
        name: summary.product.name,
        image: summary.product.cover_image || summary.product.images?.[0] || ''
      },
      package: {
        name: summary.package.package_name,
        duration: summary.package.duration_days
      }
    }, 201);
  } catch (error) {
    console.error('Error in createFeedPromotion:', error);
    return errorResponse(res, error.message, null, 400);
  }
}

/**
 * POST /api/manufacturer/promotions/listing/create
 * Initiate Listing Boost & Create Payment Gateway Order
 */
async function createListingPromotion(req, res) {
  try {
    const { error, value } = createOrderSchema.validate({ ...req.body, promotion_type: 'listing' });
    if (error) return errorResponse(res, error.details[0].message, null, 400);

    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getManufacturerProfile(userId);
    if (!profile) return errorResponse(res, 'Manufacturer profile not found', null, 404);

    const summary = await calculatePromotionOrderSummary(
      value.package_id,
      'listing',
      null,
      value.targeting,
      profile
    );

    const campaignIdStr = `CMP-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const orderNumberStr = `ORD-PRM-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    const campaignName = value.campaign_name || `${profile.company_name} Profile Boost`;
    const priorityScore = summary.package.duration_days >= 30 ? 30 : (summary.package.duration_days >= 15 ? 20 : 10);

    const campaign = await PromotionCampaign.create({
      campaign_id: campaignIdStr,
      manufacturer_id: profile._id,
      userId,
      package_id: summary.package._id,
      campaign_type: 'listing',
      campaign_name: campaignName,
      campaign_status: 'pending_payment',
      duration_days: summary.package.duration_days,
      target_type: value.targeting?.all_india ? 'all_india' : 'states',
      targeting_configuration: value.targeting || { all_india: true },
      subtotal: summary.pricing.subtotal,
      gst_rate: summary.pricing.gst_rate,
      gst_amount: summary.pricing.gst_amount,
      total_amount: summary.pricing.total_amount,
      daily_budget: Math.round(summary.pricing.total_amount / summary.package.duration_days),
      priority_score: priorityScore
    });

    const gatewayOrder = await paymentService.createGatewayOrder({
      amount: summary.pricing.total_amount,
      currency: 'INR',
      receipt: orderNumberStr,
      notes: {
        campaign_id: campaignIdStr,
        campaign_type: 'listing',
        manufacturer_id: profile._id.toString()
      }
    });

    const promotionOrder = await PromotionOrder.create({
      order_number: orderNumberStr,
      campaign_id: campaign._id,
      manufacturer_id: profile._id,
      userId,
      package_id: summary.package._id,
      subtotal: summary.pricing.subtotal,
      gst_rate: summary.pricing.gst_rate,
      gst_amount: summary.pricing.gst_amount,
      total_amount: summary.pricing.total_amount,
      order_status: 'pending',
      payment_gateway: 'razorpay',
      gateway_order_id: gatewayOrder.gateway_order_id
    });

    await CampaignActivityLog.create({
      campaign_id: campaign._id,
      action: 'order_generated',
      previous_status: 'draft',
      new_status: 'pending_payment',
      performed_by: userId,
      metadata: { order_number: orderNumberStr, total_amount: summary.pricing.total_amount }
    });

    return successResponse(res, 'Listing promotion order created. Proceed with payment.', {
      campaign_id: campaign.campaign_id,
      campaign_db_id: campaign._id,
      order_number: promotionOrder.order_number,
      order_id: promotionOrder._id,
      gateway_order_id: gatewayOrder.gateway_order_id,
      amount: summary.pricing.total_amount,
      currency: 'INR',
      key_id: paymentService.keyId,
      subtotal: summary.pricing.subtotal,
      gst_amount: summary.pricing.gst_amount,
      manufacturer: {
        company_name: profile.company_name,
        logo: profile.logo || ''
      },
      package: {
        name: summary.package.package_name,
        duration: summary.package.duration_days
      }
    }, 201);
  } catch (error) {
    console.error('Error in createListingPromotion:', error);
    return errorResponse(res, error.message, null, 400);
  }
}

/**
 * GET /api/manufacturer/promotions/:id
 * Detailed Performance & Management Screen
 */
async function getCampaignDetails(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getManufacturerProfile(userId);
    if (!profile) return errorResponse(res, 'Manufacturer profile not found', null, 404);

    const query = {
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { campaign_id: id }].filter(Boolean),
      manufacturer_id: profile._id
    };

    const campaign = await PromotionCampaign.findOne(query)
      .populate('product_id')
      .populate('package_id')
      .populate('userId', 'name phone email');

    if (!campaign) {
      return errorResponse(res, 'Campaign not found', null, 404);
    }

    // Find linked order & invoice
    const order = await PromotionOrder.findOne({ campaign_id: campaign._id });
    const invoice = await PromotionInvoice.findOne({ campaign_id: campaign._id });

    let remainingDays = 0;
    if (campaign.end_date && campaign.campaign_status === 'active') {
      const diffMs = new Date(campaign.end_date) - new Date();
      remainingDays = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    }

    const ctr = campaign.impressions_count > 0
      ? ((campaign.clicks_count / campaign.impressions_count) * 100).toFixed(2)
      : '0.00';

    const conversionRate = campaign.clicks_count > 0
      ? ((campaign.inquiries_count / campaign.clicks_count) * 100).toFixed(2)
      : '0.00';

    // Build Ad Preview representation
    const adPreview = campaign.campaign_type === 'feed' ? {
      type: 'feed',
      badge: 'Sponsored',
      product_name: campaign.product_id?.name || campaign.campaign_name,
      product_image: campaign.product_id?.cover_image || campaign.product_id?.images?.[0] || '',
      price: campaign.product_id?.selling_price || 0,
      pricing_unit: campaign.product_id?.pricing_unit || 'Sq.Ft',
      manufacturer_name: profile.company_name,
      verified: profile.is_verified || true,
      location: `${profile.address?.district || 'Jaipur'}, ${profile.address?.state || 'Rajasthan'}`,
      action_buttons: ['Send Inquiry', 'Call', 'WhatsApp']
    } : {
      type: 'listing',
      badge: 'Featured Supplier',
      business_name: profile.company_name,
      logo: profile.logo || '',
      verified: profile.is_verified || true,
      location: `${profile.address?.district || 'Jaipur'}, ${profile.address?.state || 'Rajasthan'}`,
      rating: profile.rating || 4.8,
      review_count: profile.review_count || 12,
      action_buttons: ['Contact Supplier', 'View Catalog', 'WhatsApp']
    };

    return successResponse(res, 'Campaign details loaded', {
      header: {
        _id: campaign._id,
        campaign_id: campaign.campaign_id,
        campaign_type: campaign.campaign_type,
        campaign_name: campaign.campaign_name,
        campaign_status: campaign.campaign_status,
        remaining_days: remainingDays,
        start_date: campaign.start_date,
        end_date: campaign.end_date,
        product_image: campaign.product_id?.cover_image || campaign.product_id?.images?.[0] || profile.logo || '',
        item_name: campaign.campaign_type === 'feed' ? campaign.product_id?.name : profile.company_name,
        company_name: profile.company_name
      },
      performance_cards: [
        {
          key: 'impressions',
          title: 'Views / Impressions',
          total: campaign.impressions_count,
          growth: '+28.4%',
          comparison: 'vs previous 7 days'
        },
        {
          key: 'clicks',
          title: 'Clicks',
          total: campaign.clicks_count,
          growth: '+19.2%',
          comparison: 'vs previous 7 days'
        },
        {
          key: 'inquiries',
          title: 'Inquiries',
          total: campaign.inquiries_count,
          growth: '+14.6%',
          comparison: 'vs previous 7 days'
        },
        {
          key: 'quote_requests',
          title: 'Quote Requests',
          total: campaign.quote_requests_count,
          growth: '+11.0%',
          comparison: 'vs previous 7 days'
        }
      ],
      metrics_summary: {
        ctr: `${ctr}%`,
        conversion_rate: `${conversionRate}%`,
        whatsapp_clicks: campaign.whatsapp_clicks_count,
        call_clicks: campaign.call_clicks_count
      },
      promotion_details: {
        promotion_type: campaign.campaign_type === 'feed' ? 'Feed Product Discovery Promotion' : 'Manufacturer Profile Directory Boost',
        package_name: campaign.package_id?.package_name || 'Standard Package',
        duration_days: campaign.duration_days,
        start_date: campaign.start_date,
        end_date: campaign.end_date,
        target_audience: campaign.target_type === 'all_india' ? 'All India' : 'Targeted States',
        target_states: campaign.targeting_configuration?.states || [],
        target_districts: campaign.targeting_configuration?.districts || [],
        target_cities: campaign.targeting_configuration?.cities || [],
        campaign_id: campaign.campaign_id,
        created_at: campaign.createdAt
      },
      budget_and_cost: {
        package_price: campaign.subtotal,
        gst_rate: `${campaign.gst_rate}%`,
        gst_amount: campaign.gst_amount,
        total_amount: campaign.total_amount,
        payment_status: order?.order_status === 'completed' ? 'Paid' : 'Pending',
        order_number: order?.order_number || 'N/A',
        invoice_id: invoice?._id || null,
        invoice_number: invoice?.invoice_number || null,
        can_download_invoice: !!invoice
      },
      ad_preview: adPreview,
      available_actions: {
        can_pause: campaign.campaign_status === 'active',
        can_resume: campaign.campaign_status === 'paused',
        can_end: ['active', 'paused'].includes(campaign.campaign_status)
      }
    });
  } catch (error) {
    console.error('Error in getCampaignDetails:', error);
    return errorResponse(res, error.message, null, 500);
  }
}

/**
 * POST /api/manufacturer/promotions/:id/pause
 * Pause an active promotion
 */
async function pauseCampaign(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getManufacturerProfile(userId);
    if (!profile) return errorResponse(res, 'Manufacturer profile not found', null, 404);

    const query = {
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { campaign_id: id }].filter(Boolean),
      manufacturer_id: profile._id
    };

    const campaign = await PromotionCampaign.findOne(query);
    if (!campaign) return errorResponse(res, 'Campaign not found', null, 404);

    if (campaign.campaign_status !== 'active') {
      return errorResponse(res, `Cannot pause campaign with status: ${campaign.campaign_status}`, null, 400);
    }

    campaign.campaign_status = 'paused';
    campaign.paused_at = new Date();
    await campaign.save();

    // Remove active delivery flags from marketplace
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
      performed_by: userId,
      metadata: { reason: req.body.reason || 'Paused by manufacturer' }
    });

    return successResponse(res, 'Campaign paused successfully', {
      campaign_id: campaign.campaign_id,
      campaign_status: campaign.campaign_status,
      paused_at: campaign.paused_at
    });
  } catch (error) {
    console.error('Error in pauseCampaign:', error);
    return errorResponse(res, error.message, null, 500);
  }
}

/**
 * POST /api/manufacturer/promotions/:id/resume
 * Resume a paused promotion
 */
async function resumeCampaign(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getManufacturerProfile(userId);
    if (!profile) return errorResponse(res, 'Manufacturer profile not found', null, 404);

    const query = {
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { campaign_id: id }].filter(Boolean),
      manufacturer_id: profile._id
    };

    const campaign = await PromotionCampaign.findOne(query);
    if (!campaign) return errorResponse(res, 'Campaign not found', null, 404);

    if (campaign.campaign_status !== 'paused') {
      return errorResponse(res, `Cannot resume campaign with status: ${campaign.campaign_status}`, null, 400);
    }

    if (campaign.end_date && new Date() > new Date(campaign.end_date)) {
      campaign.campaign_status = 'expired';
      await campaign.save();
      return errorResponse(res, 'Campaign duration has expired and cannot be resumed', null, 400);
    }

    campaign.campaign_status = 'active';
    campaign.resumed_at = new Date();
    await campaign.save();

    // Re-enable active delivery flags in marketplace
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
      performed_by: userId,
      metadata: { reason: req.body.reason || 'Resumed by manufacturer' }
    });

    return successResponse(res, 'Campaign resumed successfully', {
      campaign_id: campaign.campaign_id,
      campaign_status: campaign.campaign_status,
      resumed_at: campaign.resumed_at
    });
  } catch (error) {
    console.error('Error in resumeCampaign:', error);
    return errorResponse(res, error.message, null, 500);
  }
}

/**
 * POST /api/manufacturer/promotions/:id/end
 * End an active or paused promotion permanently
 */
async function endCampaign(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getManufacturerProfile(userId);
    if (!profile) return errorResponse(res, 'Manufacturer profile not found', null, 404);

    const query = {
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { campaign_id: id }].filter(Boolean),
      manufacturer_id: profile._id
    };

    const campaign = await PromotionCampaign.findOne(query);
    if (!campaign) return errorResponse(res, 'Campaign not found', null, 404);

    if (!['active', 'paused'].includes(campaign.campaign_status)) {
      return errorResponse(res, `Cannot end campaign with status: ${campaign.campaign_status}`, null, 400);
    }

    const prevStatus = campaign.campaign_status;
    campaign.campaign_status = 'completed';
    campaign.ended_at = new Date();
    await campaign.save();

    // Disable delivery in marketplace
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
      previous_status: prevStatus,
      new_status: 'completed',
      performed_by: userId,
      metadata: { reason: req.body.reason || 'Ended early by manufacturer confirmation' }
    });

    return successResponse(res, 'Campaign ended successfully', {
      campaign_id: campaign.campaign_id,
      campaign_status: campaign.campaign_status,
      ended_at: campaign.ended_at
    });
  } catch (error) {
    console.error('Error in endCampaign:', error);
    return errorResponse(res, error.message, null, 500);
  }
}

/**
 * GET /api/manufacturer/promotions/:id/preview
 * Dedicated Ad Preview in Marketplace format
 */
async function getCampaignPreview(req, res) {
  try {
    const { id } = req.params;
    const campaign = await PromotionCampaign.findById(id)
      .populate('product_id')
      .populate('package_id')
      .populate('manufacturer_id');

    if (!campaign) return errorResponse(res, 'Campaign not found', null, 404);

    const profile = campaign.manufacturer_id;

    if (campaign.campaign_type === 'feed') {
      return successResponse(res, 'Feed promotion preview', {
        type: 'feed',
        theme: 'blue',
        sponsored_badge: 'Sponsored',
        product: {
          _id: campaign.product_id?._id,
          name: campaign.product_id?.name || 'Natural Stone Product',
          price: campaign.product_id?.selling_price || 0,
          pricing_unit: campaign.product_id?.pricing_unit || 'Sq.Ft',
          images: campaign.product_id?.images || [],
          cover_image: campaign.product_id?.cover_image || campaign.product_id?.images?.[0] || '',
          material: campaign.product_id?.material || 'Granite'
        },
        manufacturer: {
          _id: profile._id,
          company_name: profile.company_name,
          is_verified: profile.is_verified || true,
          location: `${profile.address?.district || 'Jaipur'}, ${profile.address?.state || 'Rajasthan'}`
        },
        actions: ['Inquire Now', 'Call Now', 'WhatsApp']
      });
    } else {
      return successResponse(res, 'Listing promotion preview', {
        type: 'listing',
        theme: 'orange',
        sponsored_badge: 'Featured Supplier',
        profile: {
          _id: profile._id,
          company_name: profile.company_name,
          logo: profile.logo || '',
          is_verified: profile.is_verified || true,
          rating: profile.rating || 4.8,
          review_count: profile.review_count || 12,
          location: `${profile.address?.district || 'Jaipur'}, ${profile.address?.state || 'Rajasthan'}`,
          monthly_capacity: `${profile.monthly_capacity || 50000} ${profile.capacity_unit || 'Sq.Ft'}/month`
        },
        actions: ['View Catalog', 'Contact Supplier', 'WhatsApp']
      });
    }
  } catch (error) {
    console.error('Error in getCampaignPreview:', error);
    return errorResponse(res, error.message, null, 500);
  }
}

/**
 * POST /api/manufacturer/promotions/:id/event
 * Event Tracking for Campaign Delivery (Impressions, Clicks, Inquiries, etc.)
 */
async function recordCampaignEvent(req, res) {
  try {
    const { id } = req.params;
    const { error, value } = eventTrackingSchema.validate(req.body);
    if (error) return errorResponse(res, error.details[0].message, null, 400);

    const campaign = await PromotionCampaign.findById(id);
    if (!campaign) return errorResponse(res, 'Campaign not found', null, 404);

    // Only count events if campaign is active
    if (campaign.campaign_status !== 'active') {
      return successResponse(res, 'Event logged (campaign inactive)', { recorded: false });
    }

    // Increment counter on campaign
    const incObj = {};
    if (value.event_type === 'impression') incObj.impressions_count = 1;
    else if (value.event_type === 'click') incObj.clicks_count = 1;
    else if (value.event_type === 'inquiry') incObj.inquiries_count = 1;
    else if (value.event_type === 'quote_request') incObj.quote_requests_count = 1;
    else if (value.event_type === 'whatsapp_click') incObj.whatsapp_clicks_count = 1;
    else if (value.event_type === 'call_click') incObj.call_clicks_count = 1;

    await PromotionCampaign.findByIdAndUpdate(campaign._id, { $inc: incObj });

    // Record detailed analytics row
    await PromotionAnalytics.create({
      campaign_id: campaign._id,
      event_type: value.event_type,
      user_id: req.user?.userId || req.user?.id || null,
      product_id: value.product_id || campaign.product_id,
      source: value.source || 'marketplace',
      location: value.location || {},
      ip_address: req.ip,
      user_agent: req.headers['user-agent']
    });

    return successResponse(res, 'Event recorded successfully', {
      recorded: true,
      event_type: value.event_type,
      campaign_id: campaign.campaign_id
    });
  } catch (error) {
    console.error('Error in recordCampaignEvent:', error);
    return errorResponse(res, error.message, null, 500);
  }
}

/**
 * GET /api/promotion-packages
 * Public / Authenticated Packages Endpoint
 */
async function getPromotionPackages(req, res) {
  try {
    const { type } = req.query;
    const query = { status: 'active' };

    if (type && ['feed', 'listing'].includes(type)) {
      query.promotion_type = type;
    }

    const packages = await PromotionPackage.find(query).sort({ display_order: 1, price: 1 });

    return successResponse(res, 'Promotion packages retrieved', {
      count: packages.length,
      packages
    });
  } catch (error) {
    console.error('Error in getPromotionPackages:', error);
    return errorResponse(res, error.message, null, 500);
  }
}

/**
 * GET /api/promotion-packages/:id
 */
async function getPromotionPackageById(req, res) {
  try {
    const pkg = await PromotionPackage.findById(req.params.id);
    if (!pkg) return errorResponse(res, 'Package not found', null, 404);
    return successResponse(res, 'Package retrieved', pkg);
  } catch (error) {
    console.error('Error in getPromotionPackageById:', error);
    return errorResponse(res, error.message, null, 500);
  }
}

module.exports = {
  getPromotionDashboard,
  getCampaignStatistics,
  getCampaignPerformanceGrowth,
  getManufacturerCampaigns,
  getEligibleProducts,
  previewFeedPromotion,
  previewListingPromotion,
  createFeedPromotion,
  createListingPromotion,
  getCampaignDetails,
  pauseCampaign,
  resumeCampaign,
  endCampaign,
  getCampaignPreview,
  recordCampaignEvent,
  getPromotionPackages,
  getPromotionPackageById
};
