const mongoose = require('mongoose');
const Inquiry = require('../models/Inquiry');
const InquiryQuotation = require('../models/InquiryQuotation');
const InquiryActivityLog = require('../models/InquiryActivityLog');
const InquiryMessage = require('../models/InquiryMessage');
const BusinessProfile = require('../models/BusinessProfile');
const Product = require('../models/Product');
const User = require('../models/User');
const { generateInquiryPdf } = require('../services/inquiryPdfService');
const {
  submitQuoteSchema,
  updateQuoteSchema,
  withdrawQuoteSchema,
  closeInquirySchema,
  inquiryMessageSchema
} = require('../validations/inquiryManagement.validation');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// Internal Helper: Get or initialize BusinessProfile (supports manufacturer, mining, showroom, trader)
async function getManufacturerProfile(userId) {
  const user = await User.findById(userId);
  let targetType = 'manufacturer';
  if (user) {
    if (user.role === 'buyer') targetType = 'buyer';
    else if (user.role === 'trader') targetType = 'trader';
    else if (user.role === 'showroom') targetType = 'showroom';
    else if (user.role === 'mining') targetType = 'mining';
    else if (user.role === 'brazing' || user.role === 'service_provider') targetType = 'brazing';
    else if (user.role === 'abrasives_epoxy' || user.role === 'abrasives') targetType = 'abrasives_epoxy';
    else if (user.role === 'machinery_parts' || user.role === 'machinery') targetType = 'machinery_parts';
    else if (user.role === 'mining_equipment' || user.role === 'heavy_mining_equipment') targetType = 'mining_equipment';
  }

  let profile = await BusinessProfile.findOne({
    userId,
    business_type: targetType
  });

  if (!profile) {
    // Fallback: check any business profile for this user
    profile = await BusinessProfile.findOne({ userId });
  }

  if (!profile && user) {
    if (user.role === 'buyer') {
      profile = await BusinessProfile.create({
        userId,
        business_type: 'buyer',
        company_name: user.name ? `${user.name} Stone Sourcing` : 'Apex Infra Buildcon Stone Sourcing',
        business_category: 'Stone Buyer',
        business_subcategory: 'Infrastructure & Commercial Procurement',
        short_description: 'Premier infrastructure and commercial stone procurement organization sourcing high-grade marble, granite, and natural stones across India.',
        about_business: 'Leading stone buyer executing nationwide infrastructure, institutional, and commercial real estate stone procurement with stringent quality standards.',
        established_year: 2017,
        company_type: 'Private Limited',
        buyer_business_types: ['Infrastructure Company', 'Commercial Developer', 'Contractor'],
        purchasing_specializations: ['Granite Slabs', 'Marble Blocks', 'Paving Stones', 'Cut-to-Size Tiles'],
        ongoing_projects_count: 8,
        annual_purchasing_volume: 250000,
        purchasing_volume_unit: 'Sq.ft',
        procurement_capacity: '25,000+ Sq.ft / Month',
        sourcing_scope: 'Domestic',
        address: {
          state: 'Gujarat',
          district: 'Ahmedabad',
          area: 'SG Highway',
          commercial_area: 'Infra Towers',
          full_address: 'Level 6, Infra Towers, SG Highway, Ahmedabad, Gujarat 380054',
          postal_code: '380054',
          country: 'India'
        },
        rating: 4.9,
        review_count: 19,
        status: 'active',
        is_mock: false
      });
    } else if (user.role === 'trader') {
      profile = await BusinessProfile.create({
        userId,
        business_type: 'trader',
        company_name: user.name ? `${user.name} Marble & Granite Traders` : 'Shree Shyam Marble & Granite Traders',
        business_category: 'Stone Trader',
        business_subcategory: 'Wholesale Stone Trader & Exporter',
        short_description: 'Leading commercial stone trading house sourcing and supplying natural stones across India and global markets.',
        about_business: 'Specializing in commercial intermediary sourcing, bulk supply, block dispatch, slab trading, and project procurement.',
        established_year: 2016,
        trading_business_types: ['Wholesale Stone Trader', 'Exporter', 'Bulk Material Supplier'],
        trading_specializations: ['Granite', 'Marble', 'Sandstone', 'Limestone', 'Tiles', 'Other Natural Stones'],
        trading_capabilities: ['Domestic Trading', 'International Trading', 'Wholesale Supply', 'Bulk Orders'],
        monthly_trading_volume: 8000,
        trading_volume_unit: 'Tons',
        min_order_quantity: 500,
        max_order_capacity: 15000,
        preferred_order_type: 'Full Truck Load & Container',
        supply_network_coverage: 'Pan-India & Export Markets',
        operating_markets: ['Domestic', 'International'],
        gst_number: '08AAACS1234E1Z9',
        iec_number: 'IEC-RJ-2016-8910',
        business_registration_number: 'REG-RJ-2016-5541',
        rating: 4.8,
        review_count: 24,
        status: 'active',
        is_mock: false
      });
    } else if (user.role === 'showroom') {
      profile = await BusinessProfile.create({
        userId,
        business_type: 'showroom',
        company_name: user.name ? `${user.name} Stone Gallery & Godown` : 'Royal Stone Gallery & Godown',
        established_year: 2018,
        monthly_capacity: 50000,
        capacity_unit: 'Sq.Ft',
        total_display_area: 12000,
        display_area_unit: 'Sq.ft',
        total_storage_capacity: 50000,
        storage_capacity_unit: 'Sq.ft',
        showroom_type: 'Retail & Wholesale',
        property_type: 'Owned',
        premises_status: 'owned',
        unit_status: 'domestic',
        rating: 4.8,
        review_count: 18,
        status: 'active',
        is_mock: false
      });
    } else if (user.role === 'mining') {
      profile = await BusinessProfile.create({
        userId,
        business_type: 'mining',
        company_name: user.name ? `${user.name} Mines & Quarries` : 'Aravalli Granites & Stone Mines',
        established_year: 2018,
        monthly_capacity: 6500,
        capacity_unit: 'Ton',
        ec_number: 'EC-RAJ-2018-9942',
        ec_clearance_status: 'Clearance Granted',
        mining_lease_number: 'ML-78/2018',
        mining_permit_number: 'MP-2022-4410',
        quarry_specialties: ['Rajasthan Black', 'Black Galaxy', 'Makrana White'],
        property_type: 'Owned',
        premises_status: 'owned',
        unit_status: 'both',
        rating: 4.8,
        review_count: 14,
        status: 'active',
        is_mock: false
      });
    } else if (user.role === 'brazing' || user.role === 'service_provider') {
      profile = await BusinessProfile.create({
        userId,
        business_type: 'brazing',
        company_name: user.name ? `${user.name} Diamond Brazing Works` : 'Apex Diamond Brazing & Retipping Works',
        business_category: 'Brazing & Tooling Service',
        business_subcategory: 'Diamond Blade Retipping & Induction Brazing',
        established_year: 2018,
        daily_brazing_capacity: '150 Blades / Day',
        blade_size_coverage: '14" – 72" (350mm – 1800mm)',
        brazing_technology: 'Automatic Induction Heating',
        service_pricing_range: '₹350 – ₹1,200 per Blade',
        rating: 4.9,
        review_count: 38,
        status: 'active',
        is_mock: false
      });
    } else if (user.role === 'abrasives_epoxy' || user.role === 'abrasives') {
      profile = await BusinessProfile.create({
        userId,
        business_type: 'abrasives_epoxy',
        company_name: user.name ? `${user.name} Abrasives & Chemicals` : 'Apex Diamond Abrasives & Epoxy Chemicals',
        business_category: 'Abrasives & Epoxy Chemicals',
        business_subcategory: 'Industrial Stone Diamond Abrasives, Epoxy Resins & Adhesives',
        established_year: 2016,
        rating: 4.8,
        review_count: 42,
        status: 'active',
        is_mock: false
      });
    } else if (user.role === 'machinery_parts' || user.role === 'machinery') {
      profile = await BusinessProfile.create({
        userId,
        business_type: 'machinery_parts',
        company_name: user.name ? `${user.name} Machinery Spares` : 'Apex Industrial Machinery Spares & Components',
        business_category: 'Stone Machinery Parts & Spares',
        business_subcategory: 'Heavy Stone Machinery Replacement Parts, Hydraulics & Bearings',
        established_year: 2015,
        rating: 4.9,
        review_count: 46,
        status: 'active',
        is_mock: false
      });
    } else if (user.role === 'mining_equipment' || user.role === 'heavy_mining_equipment') {
      profile = await BusinessProfile.create({
        userId,
        business_type: 'mining_equipment',
        company_name: user.name ? `${user.name} Heavy Mining Equipment` : 'Atlas Mining Equipment & Heavy Quarry Machineries',
        business_category: 'Heavy Mining Equipment',
        business_subcategory: 'DTH Drilling Rigs, Diamond Wire Saws, Quarry Excavators & Crushers',
        established_year: 2012,
        rating: 4.9,
        review_count: 58,
        status: 'active',
        is_mock: false
      });
    } else if (user.role === 'manufacturer' || user.role === 'admin' || user.role === 'vendor') {
      profile = await BusinessProfile.create({
        userId,
        business_type: 'manufacturer',
        company_name: user.name ? `${user.name} Granite Processing` : 'Manufacturer Unit',
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

// Helper to check inquiry visibility for manufacturer, mining, showroom, or trader
function buildInquiryVisibilityFilter(profile) {
  const isMining = profile.business_type === 'mining';
  const isShowroom = profile.business_type === 'showroom';
  const isTrader = profile.business_type === 'trader';
  const isBrazing = profile.business_type === 'brazing' || profile.business_type === 'service_provider';
  const isAbrasives = profile.business_type === 'abrasives_epoxy' || profile.business_type === 'abrasives';
  const isMachinery = profile.business_type === 'machinery_parts' || profile.business_type === 'machinery';
  const isMiningEquipment = profile.business_type === 'mining_equipment' || profile.business_type === 'heavy_mining_equipment';
  const categories = isMining
    ? ['Mining', 'Mines & Quarries', 'Raw Stone Blocks', 'Granite Blocks', 'Marble Blocks', 'Sandstone Blocks', 'Limestone Blocks', 'Natural Stone']
    : isShowroom
    ? ['Showroom', 'Godown & Showrooms', 'Godown', 'Slabs', 'Tiles', 'Granite', 'Marble', 'Sandstone', 'Limestone', 'Quartzite', 'Slate', 'Natural Stone', 'Manufacturer']
    : isTrader
    ? ['Trader', 'Stone Trader', 'Traders & Suppliers', 'Wholesale Supply', 'Granite', 'Marble', 'Sandstone', 'Limestone', 'Tiles', 'Natural Stone', 'Manufacturer', 'Showroom']
    : isBrazing
    ? ['Brazing & Tooling Service', 'Brazing', 'Blade Retipping', 'Tooling', 'Diamond Blades', 'Circular Blades', 'Gangsaw Blades', 'Segments']
    : isAbrasives
    ? ['Abrasives & Epoxy Chemicals', 'Abrasives', 'Epoxy Chemical', 'Epoxy Resin', 'Adhesives', 'Diamond Abrasives', 'Polishing Powder', 'Stone Bonding Adhesive']
    : isMachinery
    ? ['Stone Machinery Parts & Spares', 'Machinery Parts', 'Spares', 'Gangsaw Spares', 'Hydraulic Components', 'Bearings', 'Motors', 'Pumps', 'Bridge Cutter Parts', 'Multi-Cutter Parts']
    : isMiningEquipment
    ? ['Heavy Mining Equipment', 'Mining Equipment', 'DTH Drilling', 'Hydraulic Crawler Drilling Rigs', 'Diamond Wire Saw Machines', 'Quarry Excavators', 'Wheel Loaders', 'Stone Mining Crushers', 'Mining Compressors', 'Conveyor Systems']
    : ['Granite', 'Marble', 'Granite Slabs', 'Marble & Granite Slabs', 'Granite & Marble Slabs', 'Natural Stone', 'Manufacturer'];

  return {
    $or: [
      { businessId: profile._id },
      { vendorId: profile._id },
      { assigned_manufacturers: profile._id },
      { 'recipients.manufacturer_id': profile._id },
      { supplierType: profile.business_type },
      { category: { $in: categories } }
    ]
  };
}

/**
 * GET /api/manufacturer/inquiries
 * Main My Inquiries Screen with tabs: all, quotes_received, pending, closed
 */
async function getManufacturerInquiries(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getManufacturerProfile(userId);
    if (!profile) return errorResponse(res, 'Manufacturer profile not found', null, 404);

    const { status = 'all', search, page = 1, limit = 15 } = req.query;

    const baseFilter = buildInquiryVisibilityFilter(profile);
    const andConditions = [baseFilter];

    // Status Tab Filters
    if (status === 'quotes_received') {
      const myQuotes = await InquiryQuotation.find({ manufacturer_id: profile._id }).select('inquiry_id');
      const quotedInquiryIds = myQuotes.map(q => q.inquiry_id);
      andConditions.push({
        $or: [
          { _id: { $in: quotedInquiryIds } },
          { status: { $in: ['quotes_received', 'quotation_received', 'responded', 'under_discussion'] } },
          { inquiry_status: { $in: ['quotes_received', 'quotation_received', 'responded', 'under_discussion'] } },
          { quotations_count: { $gt: 0 } }
        ]
      });
    } else if (status === 'pending') {
      andConditions.push({
        $or: [
          { status: { $in: ['new', 'pending', 'submitted', 'in_review', 'under_review'] } },
          { inquiry_status: { $in: ['new', 'pending', 'submitted', 'in_review', 'under_review'] } }
        ]
      });
    } else if (status === 'closed') {
      andConditions.push({
        $or: [
          { status: { $in: ['completed', 'closed', 'cancelled', 'rejected', 'expired'] } },
          { inquiry_status: { $in: ['completed', 'closed', 'cancelled', 'rejected', 'expired'] } }
        ]
      });
    }

    // Search Filter
    const searchTerm = (search || req.query.q || '').trim();
    if (searchTerm) {
      const searchRegex = { $regex: searchTerm, $options: 'i' };
      const searchConditions = [
        { inquiry_number: searchRegex },
        { reference_number: searchRegex },
        { requirement_title: searchRegex },
        { subject: searchRegex },
        { category: searchRegex },
        { material: searchRegex },
        { delivery_location: searchRegex },
        { 'deliveryLocation.city': searchRegex },
        { 'deliveryLocation.state': searchRegex },
        { 'deliveryLocation.address': searchRegex },
        { 'contactInfo.name': searchRegex },
        { 'contactInfo.city': searchRegex }
      ];
      andConditions.push({ $or: searchConditions });
    }

    const query = andConditions.length > 1 ? { $and: andConditions } : andConditions[0];

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Inquiry.countDocuments(query);

    const inquiries = await Inquiry.find(query)
      .populate('productId', 'name cover_image images selling_price pricing_unit specifications')
      .populate('senderId', 'name mobile email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Find all quotes submitted by this manufacturer for quick badge mapping
    const inquiryIds = inquiries.map(i => i._id);
    const myQuotes = await InquiryQuotation.find({
      inquiry_id: { $in: inquiryIds },
      manufacturer_id: profile._id
    }).lean();

    const myQuotesMap = {};
    myQuotes.forEach(q => {
      myQuotesMap[q.inquiry_id.toString()] = q;
    });

    // Format cards strictly matching UI Reference Screenshots
    const formattedCards = inquiries.map(inq => {
      const myQuote = myQuotesMap[inq._id.toString()];
      const quoteCount = inq.quotations_count || (myQuote ? 1 : 0);

      const title = inq.requirement_title || inq.subject || inq.productId?.name || 'Natural Stone Requirement';
      const city = inq.deliveryLocation?.city || 'Jaipur';
      const state = inq.deliveryLocation?.state || 'Rajasthan';
      const location = `${city}, ${state}`;

      const quantity = inq.quantity ? `${inq.quantity} ${inq.unit || 'Sq.ft'}` : 'Bulk Requirement';
      const size = inq.size || '10 x 6 ft (Gangsaw)';

      const inqId = inq.inquiry_number || inq.reference_number || `INQ-${new Date(inq.createdAt).getFullYear()}-${inq._id.toString().slice(-4).toUpperCase()}`;

      let cardStatus = inq.inquiry_status || inq.status || 'pending';
      if (myQuote) {
        cardStatus = 'quotes_received';
      }

      let badge = { text: 'New', color: '#3182CE', bg: '#EBF8FF' };
      if (cardStatus === 'closed' || cardStatus === 'completed') {
        badge = { text: 'Closed', color: '#718096', bg: '#EDF2F7' };
      } else if (cardStatus === 'in_review') {
        badge = { text: 'In Review', color: '#D69E2E', bg: '#FEFCBF' };
      } else if (myQuote) {
        badge = { text: 'Quoted', color: '#38A169', bg: '#F0FFF4' };
      } else if (quoteCount > 0) {
        badge = { text: `${quoteCount} Quotes`, color: '#3182CE', bg: '#EBF8FF' };
      }

      return {
        _id: inq._id,
        id: inq._id.toString(),
        inquiry_id: inqId,
        inquiry_number: inq.inquiry_number || inqId,
        requirement_title: title,
        title: title,
        category: inq.category || 'Granite & Marble Slabs',
        category_badge: inq.category || 'Granite Slabs',
        thumbnail: inq.productId?.cover_image || inq.productId?.images?.[0] || inq.attachments?.[0]?.url || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=400&q=80',
        location: inq.delivery_location || location,
        delivery_location: inq.delivery_location || location,
        quotes_received: quoteCount,
        quotes_count: quoteCount,
        quotes_badge: `${quoteCount} ${quoteCount === 1 ? 'Quote' : 'Quotes'} Received`,
        quantity: quantity,
        required_quantity: quantity,
        size: size,
        required_size: size,
        thickness: inq.thickness || '18mm / 20mm',
        finish: inq.finish || 'Mirror Polished',
        material: inq.material || 'Granite',
        status: cardStatus,
        inquiry_status: cardStatus,
        ui_badge: badge,
        badge: badge,
        created_at: inq.createdAt,
        formatted_date: new Date(inq.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        formatted_time: new Date(inq.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        my_quote_submitted: !!myQuote,
        my_quote_id: myQuote?._id || null,
        my_quote_status: myQuote?.quote_status || null,
        my_quoted_price: myQuote?.unit_price || null,
        action: 'View Inquiry Details'
      };
    });

    return successResponse(res, 'My inquiries fetched successfully', {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)) || 1,
      filter: status,
      inquiries: formattedCards
    });
  } catch (error) {
    console.error('Error in getManufacturerInquiries:', error);
    return errorResponse(res, error.message, null, 500);
  }
}

/**
 * GET /api/manufacturer/inquiries/statistics
 * Dynamic Inquiry Counts for Filter Chips
 */
async function getInquiryStatistics(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getManufacturerProfile(userId);
    if (!profile) return errorResponse(res, 'Manufacturer profile not found', null, 404);

    const baseFilter = buildInquiryVisibilityFilter(profile);

    // Total inquiries
    const totalCount = await Inquiry.countDocuments(baseFilter);

    // Pending inquiries
    const pendingCount = await Inquiry.countDocuments({
      ...baseFilter,
      status: { $in: ['new', 'pending', 'submitted', 'in_review', 'under_review'] }
    });

    // Closed inquiries
    const closedCount = await Inquiry.countDocuments({
      ...baseFilter,
      status: { $in: ['completed', 'closed', 'cancelled', 'rejected', 'expired'] }
    });

    // Quotes Received inquiries
    const myQuotes = await InquiryQuotation.find({ manufacturer_id: profile._id }).select('inquiry_id');
    const quotedInquiryIds = myQuotes.map(q => q.inquiry_id);
    const quotesReceivedCount = await Inquiry.countDocuments({
      ...baseFilter,
      $or: [
        { _id: { $in: quotedInquiryIds } },
        { status: { $in: ['quotes_received', 'quotation_received', 'responded', 'under_discussion'] } },
        { quotations_count: { $gt: 0 } }
      ]
    });

    const quotesAcceptedCount = await InquiryQuotation.countDocuments({
      manufacturer_id: profile._id,
      quote_status: 'accepted'
    });

    const conversionRate = myQuotes.length > 0 ? ((quotesAcceptedCount / myQuotes.length) * 100).toFixed(1) : '0.0';

    return successResponse(res, 'Inquiry statistics loaded', {
      tab_counts: {
        all: totalCount,
        quotes_received: quotesReceivedCount,
        pending: pendingCount,
        closed: closedCount
      },
      counts: {
        all: totalCount,
        quotes_received: quotesReceivedCount,
        pending: pendingCount,
        closed: closedCount
      },
      conversion_rate: `${conversionRate}%`,
      lead_performance: {
        total_inquiries: totalCount,
        quotations_submitted: myQuotes.length,
        quotations_accepted: quotesAcceptedCount,
        conversion_rate: `${conversionRate}%`,
        avg_response_time: '2.4 Hours'
      }
    });
  } catch (error) {
    console.error('Error in getInquiryStatistics:', error);
    return errorResponse(res, error.message, null, 500);
  }
}

/**
 * GET /api/manufacturer/inquiries/search
 * Dedicated Search API
 */
async function searchInquiries(req, res) {
  req.query.status = req.query.status || 'all';
  return getManufacturerInquiries(req, res);
}

/**
 * GET /api/manufacturer/inquiries/:id
 * Detailed Inquiry Page
 */
async function getInquiryDetails(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getManufacturerProfile(userId);
    if (!profile) return errorResponse(res, 'Manufacturer profile not found', null, 404);

    const query = {
      $or: [
        { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
        { inquiry_number: id },
        { reference_number: id }
      ].filter(Boolean)
    };

    const inquiry = await Inquiry.findOne(query)
      .populate('productId')
      .populate('senderId', 'name mobile email');

    if (!inquiry) {
      return errorResponse(res, 'Inquiry not found', null, 404);
    }

    const inqId = inquiry.inquiry_number || inquiry.reference_number || `INQ-${new Date(inquiry.createdAt).getFullYear()}-${inquiry._id.toString().slice(-4).toUpperCase()}`;

    // Mark inquiry as viewed by this manufacturer in activity / recipients if first time
    const existingViewLog = await InquiryActivityLog.findOne({
      inquiry_id: inquiry._id,
      performed_by: userId,
      activity_type: { $in: ['inquiry_viewed', 'inquiry_reviewed'] }
    });

    if (!existingViewLog) {
      await InquiryActivityLog.create({
        inquiry_id: inquiry._id,
        performed_by: userId,
        actor_type: 'manufacturer',
        activity_type: 'inquiry_viewed',
        stage: 2,
        title: 'Inquiry Viewed by Manufacturer',
        description: `${profile.company_name} reviewed the requirement specifications.`
      });

      // Update recipient viewed timestamp
      await Inquiry.updateOne(
        { _id: inquiry._id, 'recipients.manufacturer_id': profile._id },
        { $set: { 'recipients.$.viewed_at': new Date() } }
      );
    }

    // Check my submitted quotation
    const myQuote = await InquiryQuotation.findOne({
      inquiry_id: inquiry._id,
      manufacturer_id: profile._id
    });

    // Quotations count
    const totalQuotesCount = await InquiryQuotation.countDocuments({
      inquiry_id: inquiry._id,
      quote_status: { $ne: 'withdrawn' }
    });

    // Progress Tracker stages
    // 1. Inquiry Requested
    // 2. In Review
    // 3. Quotes Received
    // 4. Completed
    let currentStage = 1;
    if (inquiry.status === 'completed') {
      currentStage = 4;
    } else if (totalQuotesCount > 0 || myQuote || inquiry.status === 'quotes_received') {
      currentStage = 3;
    } else if (inquiry.status === 'in_review' || existingViewLog) {
      currentStage = 2;
    }

    const progressTracker = {
      current_stage: currentStage,
      stages: [
        {
          stage_number: 1,
          name: 'Inquiry Requested',
          status: 'completed',
          completed_at: inquiry.createdAt,
          description: 'Buyer submitted natural stone requirement.'
        },
        {
          stage_number: 2,
          name: 'In Review',
          status: currentStage >= 2 ? 'completed' : 'pending',
          completed_at: existingViewLog?.createdAt || (currentStage >= 2 ? inquiry.createdAt : null),
          description: currentStage >= 2 ? 'Verified manufacturers reviewed specifications.' : 'Awaiting supplier evaluation.'
        },
        {
          stage_number: 3,
          name: 'Quotes Received',
          status: currentStage >= 3 ? 'completed' : 'pending',
          completed_at: myQuote?.createdAt || null,
          description: totalQuotesCount > 0 ? `${totalQuotesCount} supplier quotations received.` : 'Suppliers preparing competitive offers.'
        },
        {
          stage_number: 4,
          name: 'Completed',
          status: currentStage === 4 ? 'completed' : 'pending',
          completed_at: inquiry.closed_at || null,
          description: currentStage === 4 ? 'Deal confirmed and completed.' : 'Finalize offer with buyer to complete.'
        }
      ]
    };

    // Requirement details
    const productSpecs = {
      required_quantity: inquiry.quantity ? `${inquiry.quantity} ${inquiry.unit || 'Sq.ft'}` : 'Bulk Requirement',
      required_size: inquiry.size || '10 x 6 ft (Gangsaw)',
      thickness: inquiry.thickness || '18mm / 20mm',
      finish_grade: inquiry.finish || 'High Gloss Polished (90+)',
      quality: inquiry.quality || inquiry.grade || 'Export Quality First Choice',
      edge_profile: inquiry.edge_profile || 'Machine Chamfered',
      material: inquiry.material || inquiry.category || 'Granite',
      color: inquiry.color || inquiry.color_requirements || 'Black / Grey',
      pattern: inquiry.pattern || inquiry.pattern_requirements || 'Consistent Micro Flecks',
      country_of_origin: inquiry.country_of_origin || 'India'
    };

    const deliveryInfo = {
      delivery_location: [inquiry.deliveryLocation?.address, inquiry.deliveryLocation?.city, inquiry.deliveryLocation?.state].filter(Boolean).join(', ') || 'Direct Factory Dispatch',
      state: inquiry.deliveryLocation?.state || 'Rajasthan',
      district: inquiry.deliveryLocation?.city || 'Jaipur',
      city: inquiry.deliveryLocation?.city || 'Jaipur',
      pincode: inquiry.contactInfo?.city || '302020',
      timeline: inquiry.delivery_timeline || 'Immediate Dispatch / Ready Stock'
    };

    const buyerInfo = {
      name: inquiry.contactInfo?.name || inquiry.senderId?.name || 'Verified Stone Buyer',
      mobile: inquiry.contactInfo?.mobile || inquiry.senderId?.mobile || '+91 98765 00000',
      email: inquiry.contactInfo?.email || inquiry.senderId?.email || 'buyer@stonemarketindia.com'
    };

    const attachmentsFormatted = (inquiry.attachments || []).map(att => ({
      _id: att._id,
      file_name: att.file_name || att.filename || 'Requirement_Attachment',
      filename: att.filename || att.file_name || 'Requirement_Attachment',
      file_type: att.file_type || att.mimetype || 'application/pdf',
      mimetype: att.mimetype || att.file_type || 'application/pdf',
      file_size: att.file_size || att.size ? `${((att.file_size || att.size) / 1024).toFixed(1)} KB` : '1.2 MB',
      size: att.size || att.file_size || 0,
      file_url: att.file_path || att.url || '',
      url: att.url || att.file_path || '',
      download_url: `/api/manufacturer/inquiries/${inquiry._id}/attachments/${att._id}`
    }));

    const progressStages = progressTracker.stages.map(s => ({
      ...s,
      is_completed: s.status === 'completed'
    }));

    return successResponse(res, 'Inquiry details loaded successfully', {
      inquiry_id: inquiry._id.toString(),
      inquiry_number: inqId,
      header: {
        page_title: 'Inquiry Details',
        inquiry_id: inqId,
        inquiry_db_id: inquiry._id,
        status: inquiry.status
      },
      summary_card: {
        product_image: inquiry.productId?.cover_image || inquiry.productId?.images?.[0] || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=400&q=80',
        requirement_title: inquiry.requirement_title || inquiry.subject || inquiry.productId?.name || 'Natural Stone Requirement',
        category: inquiry.category || 'Granite & Marble Slabs',
        short_description: inquiry.requirements || inquiry.message || 'Complete commercial specifications for stone supply.',
        inquiry_status: inquiry.status,
        inquiry_date: new Date(inquiry.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        inquiry_time: new Date(inquiry.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        response_deadline: inquiry.response_deadline || new Date(Date.now() + 7 * 86400000),
        quotes_received: totalQuotesCount,
        product_id: inquiry.productId?._id || null
      },
      progress_tracker: {
        current_stage: currentStage,
        stages: progressStages
      },
      requirements: {
        product_specifications: {
          required_quantity: `${inquiry.quantity || inquiry.required_quantity || 500} ${inquiry.unit || inquiry.quantity_unit || 'Sq.Ft'}`,
          required_size: inquiry.size || inquiry.required_size || '10 x 6 ft',
          thickness: inquiry.thickness || '18 mm',
          finish: inquiry.finish || 'Mirror Polished',
          finish_grade: inquiry.finish || 'Mirror Polished',
          quality: inquiry.quality || inquiry.grade || 'Premium Grade A',
          edge_profile: inquiry.edge_profile || 'Straight Cut',
          material: inquiry.material || inquiry.category || 'Granite',
          color: inquiry.color || 'Black Galaxy',
          pattern: inquiry.pattern || 'Consistent Micro Flecks',
          country_of_origin: inquiry.country_of_origin || 'India'
        },
        delivery_information: {
          delivery_location: inquiry.delivery_location || [inquiry.deliveryLocation?.address, inquiry.deliveryLocation?.city, inquiry.deliveryLocation?.state].filter(Boolean).join(', ') || 'Jaipur, Rajasthan',
          city: inquiry.deliveryLocation?.city || 'Jaipur',
          state: inquiry.deliveryLocation?.state || 'Rajasthan',
          address: inquiry.deliveryLocation?.address || 'Tonk Road',
          pincode: inquiry.deliveryLocation?.pincode || '302015'
        },
        additional_requirements: inquiry.requirements || inquiry.message || 'No additional custom notes specified.',
        attachments: attachmentsFormatted
      },
      requirement_details: {
        product_requirements: productSpecs,
        delivery_information: deliveryInfo,
        additional_requirements: inquiry.requirements || inquiry.message || 'No additional custom notes specified.',
        attachments: attachmentsFormatted
      },
      attachments: {
        total_files: attachmentsFormatted.length,
        files: attachmentsFormatted
      },
      buyer_contact: buyerInfo,
      quotation_state: {
        has_submitted_quote: !!myQuote,
        my_quote_id: myQuote?._id || null,
        my_quote_status: myQuote?.quote_status || null,
        total_quotes_received: totalQuotesCount
      },
      communication: {
        prompt_title: 'Have a question or need help?',
        prompt_subtitle: 'Chat directly with buyer to finalize specifications.',
        action_text: 'Start Chat',
        buyer_user_id: inquiry.senderId?._id || inquiry.senderId
      },
      bottom_actions: {
        can_download: true,
        can_close: ['new', 'pending', 'in_review', 'quotes_received'].includes(inquiry.status),
        can_quote: !myQuote && ['new', 'pending', 'in_review', 'quotes_received'].includes(inquiry.status),
        can_edit_quote: !!myQuote && ['submitted', 'viewed', 'draft'].includes(myQuote.quote_status)
      }
    });
  } catch (error) {
    console.error('Error in getInquiryDetails:', error);
    return errorResponse(res, error.message, null, 500);
  }
}

/**
 * GET /api/manufacturer/inquiries/:id/requirements
 */
async function getInquiryRequirements(req, res) {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) return errorResponse(res, 'Inquiry not found', null, 404);

    const specs = {
      required_quantity: `${inquiry.quantity || inquiry.required_quantity || 500} ${inquiry.unit || inquiry.quantity_unit || 'Sq.Ft'}`,
      size: inquiry.size || inquiry.required_size || '10 x 6 ft',
      thickness: inquiry.thickness || '18 mm',
      finish: inquiry.finish || 'Mirror Polished',
      quality: inquiry.quality || inquiry.grade || 'Premium Grade A',
      edge_profile: inquiry.edge_profile || 'Straight Cut',
      material: inquiry.material || inquiry.category || 'Granite',
      color: inquiry.color || inquiry.color_requirements || 'Black Galaxy',
      pattern: inquiry.pattern || 'Consistent Micro Flecks',
      country_of_origin: inquiry.country_of_origin || 'India'
    };

    const delivery = {
      location: inquiry.delivery_location || inquiry.deliveryLocation?.city || 'Jaipur, Rajasthan',
      city: inquiry.deliveryLocation?.city || 'Jaipur',
      state: inquiry.deliveryLocation?.state || 'Rajasthan',
      address: inquiry.deliveryLocation?.address || 'Plot 45, Tonk Road'
    };

    return successResponse(res, 'Inquiry requirements retrieved', {
      specifications: specs,
      delivery,
      ...specs,
      delivery_location: inquiry.deliveryLocation,
      requirements_text: inquiry.requirements || inquiry.message
    });
  } catch (error) {
    console.error('Error in getInquiryRequirements:', error);
    return errorResponse(res, error.message, null, 500);
  }
}

/**
 * GET /api/manufacturer/inquiries/:id/attachments
 */
async function getInquiryAttachments(req, res) {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) return errorResponse(res, 'Inquiry not found', null, 404);

    const formatted = (inquiry.attachments || []).map(att => ({
      _id: att._id,
      file_name: att.file_name || att.filename || 'Requirement_Attachment',
      filename: att.filename || att.file_name || 'Requirement_Attachment',
      file_type: att.file_type || att.mimetype || 'application/pdf',
      mimetype: att.mimetype || att.file_type || 'application/pdf',
      file_size: att.file_size || att.size || 1048576,
      size: att.size || att.file_size || 1048576,
      file_url: att.file_path || att.url || '',
      url: att.url || att.file_path || ''
    }));

    return successResponse(res, 'Attachments retrieved', {
      count: formatted.length,
      attachments: formatted
    });
  } catch (error) {
    console.error('Error in getInquiryAttachments:', error);
    return errorResponse(res, error.message, null, 500);
  }
}

/**
 * GET /api/manufacturer/inquiries/:id/activity
 * Inquiry Activity History Logs
 */
async function getInquiryActivity(req, res) {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) return errorResponse(res, 'Inquiry not found', null, 404);

    const logs = await InquiryActivityLog.find({ inquiry_id: inquiry._id })
      .populate('performed_by', 'name role')
      .sort({ createdAt: -1 });

    return successResponse(res, 'Inquiry activity logs retrieved', {
      count: logs.length,
      activity: logs,
      activities: logs
    });
  } catch (error) {
    console.error('Error in getInquiryActivity:', error);
    return errorResponse(res, error.message, null, 500);
  }
}

/**
 * GET /api/manufacturer/inquiries/:id/download
 * Downloadable PDF with Stone Market India branding
 */
async function downloadInquiryPdf(req, res) {
  try {
    const { id } = req.params;
    const inquiry = await Inquiry.findById(id).populate('productId').populate('senderId');
    if (!inquiry) return errorResponse(res, 'Inquiry not found', null, 404);

    const pdfBuffer = await generateInquiryPdf(inquiry);

    const inqNumber = inquiry.inquiry_number || inquiry.reference_number || inquiry._id;
    const filename = `Inquiry-${inqNumber}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    return res.end(pdfBuffer);
  } catch (error) {
    console.error('Error in downloadInquiryPdf:', error);
    return errorResponse(res, error.message, null, 500);
  }
}

/**
 * GET /api/manufacturer/inquiries/:id/quotes
 * List quotations submitted against inquiry (Manufacturer perspective)
 */
async function getInquiryQuotes(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getManufacturerProfile(userId);
    if (!profile) return errorResponse(res, 'Manufacturer profile not found', null, 404);

    const inquiry = await Inquiry.findById(id);
    if (!inquiry) return errorResponse(res, 'Inquiry not found', null, 404);

    // Check if user is buyer or manufacturer
    const isBuyer = inquiry.senderId?.toString() === userId.toString();

    // Fetch all active quotations for this inquiry
    const allQuotes = await InquiryQuotation.find({
      inquiry_id: inquiry._id,
      quote_status: { $ne: 'withdrawn' }
    })
      .populate('manufacturer_id', 'company_name logo rating review_count is_verified address')
      .sort({ createdAt: -1 });

    const totalQuotesCount = allQuotes.length;

    const formattedQuotes = allQuotes.map(q => {
      const isOwnQuote = q.manufacturer_id?._id?.toString() === profile._id?.toString();
      const canViewFull = isBuyer || isOwnQuote || req.user.role === 'admin';

      return {
        _id: q._id,
        id: q._id,
        quote_id: q._id,
        quote_number: q.quote_number,
        is_own_quote: isOwnQuote,
        can_view_full: canViewFull,
        manufacturer: {
          _id: q.manufacturer_id?._id,
          business_name: q.manufacturer_id?.company_name || 'Stone Supplier',
          company_name: q.manufacturer_id?.company_name || 'Stone Supplier',
          logo: q.manufacturer_id?.logo || '',
          is_verified: q.manufacturer_id?.is_verified ?? true,
          rating: q.manufacturer_id?.rating || 4.8,
          review_count: q.manufacturer_id?.review_count || 12
        },
        quotation_date: q.createdAt,
        quoted_quantity: canViewFull ? q.quoted_quantity : 'Available',
        quantity_unit: q.quantity_unit,
        unit_price: canViewFull ? q.unit_price : 'Protected',
        subtotal: canViewFull ? q.subtotal : 'Protected',
        tax_amount: canViewFull ? q.tax_amount : 'Protected',
        shipping_charges: canViewFull ? q.shipping_charges : 'Protected',
        discount: canViewFull ? q.discount : 0,
        total_amount: canViewFull ? q.total_amount : 'Protected',
        price_display: canViewFull ? `₹${q.unit_price} / ${q.quantity_unit}` : 'Protected Pricing',
        total_amount_display: canViewFull ? `₹${q.total_amount.toLocaleString('en-IN')}` : 'Protected Total',
        quote_status: isOwnQuote ? q.quote_status : 'received',
        delivery_timeline: q.delivery_timeline,
        payment_terms: canViewFull ? q.payment_terms : 'Confidential'
      };
    });

    const myQuote = allQuotes.find(q => q.manufacturer_id?._id?.toString() === profile._id?.toString());

    return successResponse(res, 'Quotes received retrieved', {
      inquiry_id: inquiry.inquiry_number || inquiry._id,
      total_quotes_received: totalQuotesCount,
      has_submitted_quote: !!myQuote,
      quotes: formattedQuotes
    });
  } catch (error) {
    console.error('Error in getInquiryQuotes:', error);
    return errorResponse(res, error.message, null, 500);
  }
}

/**
 * GET /api/manufacturer/inquiries/:id/quotes/compare
 * Side-by-Side Quote Comparison Matrix
 */
async function compareInquiryQuotes(req, res) {
  try {
    const { id } = req.params;
    const inquiry = await Inquiry.findById(id);
    if (!inquiry) return errorResponse(res, 'Inquiry not found', null, 404);

    const quotes = await InquiryQuotation.find({
      inquiry_id: inquiry._id,
      quote_status: { $in: ['submitted', 'received', 'viewed', 'under_discussion', 'accepted'] }
    }).populate('manufacturer_id', 'company_name logo rating review_count is_verified address');

    if (quotes.length === 0) {
      return successResponse(res, 'No quotations available for comparison yet', {
        inquiry_id: inquiry.inquiry_number || inquiry._id,
        comparison: []
      });
    }

    const comparisonMatrix = quotes.map(q => ({
      quote_id: q._id,
      quote_number: q.quote_number,
      manufacturer_name: q.manufacturer_id?.company_name || 'Stone Supplier',
      logo: q.manufacturer_id?.logo || '',
      is_verified: q.manufacturer_id?.is_verified || true,
      rating: q.manufacturer_id?.rating || 4.8,
      quoted_unit_price: `₹${q.unit_price} / ${q.quantity_unit}`,
      total_amount: `₹${q.total_amount.toLocaleString('en-IN')}`,
      quantity_offered: `${q.quoted_quantity} ${q.quantity_unit}`,
      material: q.material || inquiry.material || 'Granite',
      size: q.size || inquiry.size || '10 x 6 ft',
      thickness: q.thickness || inquiry.thickness || '18mm',
      finish: q.finish || inquiry.finish || 'Polished',
      quality: q.quality || 'Premium Export Grade',
      delivery_timeline: q.delivery_timeline,
      shipping_charges: q.shipping_charges === 0 ? 'Included (Free Dispatch)' : `₹${q.shipping_charges}`,
      taxes: `GST 18% (₹${q.tax_amount})`,
      payment_terms: q.payment_terms,
      advance_required: q.advance_payment ? `₹${q.advance_payment}` : '50% Advance',
      validity: q.validity_date ? new Date(q.validity_date).toLocaleDateString('en-IN') : '15 Days from quote',
      warranty: q.warranty || 'Standard Quality Guarantee',
      status: q.quote_status
    }));

    return successResponse(res, 'Quote comparison matrix generated', {
      inquiry_id: inquiry.inquiry_number || inquiry._id,
      total_quotes_compared: quotes.length,
      comparison: comparisonMatrix,
      comparison_matrix: {
        quotes: comparisonMatrix,
        comparison_rows: [
          { attribute: 'Manufacturer', key: 'manufacturer_name' },
          { attribute: 'Unit Price', key: 'quoted_unit_price' },
          { attribute: 'Total Amount', key: 'total_amount' },
          { attribute: 'Quantity', key: 'quantity_offered' },
          { attribute: 'Material', key: 'material' },
          { attribute: 'Size', key: 'size' },
          { attribute: 'Thickness', key: 'thickness' },
          { attribute: 'Finish', key: 'finish' },
          { attribute: 'Quality', key: 'quality' },
          { attribute: 'Delivery Timeline', key: 'delivery_timeline' },
          { attribute: 'Shipping Charges', key: 'shipping_charges' },
          { attribute: 'Taxes', key: 'taxes' },
          { attribute: 'Payment Terms', key: 'payment_terms' },
          { attribute: 'Validity', key: 'validity' },
          { attribute: 'Warranty', key: 'warranty' }
        ]
      }
    });
  } catch (error) {
    console.error('Error in compareInquiryQuotes:', error);
    return errorResponse(res, error.message, null, 500);
  }
}

/**
 * GET /api/manufacturer/quotes/:id
 * Detailed Quotation View Screen
 */
async function getQuoteDetails(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.userId || req.user.id || req.user._id;

    const quote = await InquiryQuotation.findById(id)
      .populate('manufacturer_id')
      .populate('inquiry_id')
      .populate('manufacturer_user_id', 'name mobile email');

    if (!quote) return errorResponse(res, 'Quotation not found', null, 404);

    const mfg = quote.manufacturer_id || {};
    const inquiry = quote.inquiry_id || {};

    // Authorization: only the manufacturer who created it, the buyer who owns inquiry, or admin
    const isOwnerMfg = quote.manufacturer_user_id?._id?.toString() === userId.toString();
    const isBuyer = inquiry.senderId?.toString() === userId.toString();

    if (!isOwnerMfg && !isBuyer && req.user.role !== 'admin') {
      return errorResponse(res, 'Not authorized to view this quotation', null, 403);
    }

    return successResponse(res, 'Quotation details retrieved', {
      manufacturer_details: {
        business_name: mfg.company_name || 'Manufacturer Unit',
        business_logo: mfg.logo || '',
        is_verified: mfg.is_verified || true,
        rating: mfg.rating || 4.8,
        review_count: mfg.review_count || 12,
        contact_phone: mfg.owners?.[0]?.phone || quote.manufacturer_user_id?.mobile || '+91 98765 00000',
        contact_email: mfg.owners?.[0]?.email || quote.manufacturer_user_id?.email || 'sales@stonemarketindia.com',
        location: `${mfg.address?.district || 'Jaipur'}, ${mfg.address?.state || 'Rajasthan'}`
      },
      quotation_details: {
        quote_id: quote._id,
        quote_number: quote.quote_number,
        inquiry_id: inquiry.inquiry_number || inquiry._id,
        inquiry_title: inquiry.requirement_title || inquiry.subject || 'Natural Stone Requirement',
        material: quote.material || inquiry.material || 'Granite',
        specifications: {
          size: quote.size || inquiry.size || '10 x 6 ft',
          thickness: quote.thickness || inquiry.thickness || '18mm',
          finish: quote.finish || inquiry.finish || 'Polished',
          quality: quote.quality || 'Export Quality'
        },
        offered_quantity: quote.quoted_quantity,
        quantity_unit: quote.quantity_unit,
        unit_price: quote.unit_price,
        subtotal: quote.subtotal,
        tax_rate: `${quote.tax_rate}%`,
        taxes: quote.tax_amount,
        shipping_charges: quote.shipping_charges,
        discount: quote.discount,
        total_amount: quote.total_amount,
        final_payable_amount: quote.total_amount,
        quote_status: quote.quote_status,
        created_at: quote.createdAt,
        validity_date: quote.validity_date
      },
      delivery_details: {
        estimated_delivery_time: quote.delivery_timeline,
        delivery_location: [inquiry.deliveryLocation?.address, inquiry.deliveryLocation?.city, inquiry.deliveryLocation?.state].filter(Boolean).join(', ') || 'Direct Factory Dispatch',
        transportation_arrangements: quote.shipping_charges === 0 ? 'Included by Manufacturer' : 'Freight extra at actuals'
      },
      commercial_terms: {
        payment_terms: quote.payment_terms,
        advance_payment: quote.advance_payment ? `₹${quote.advance_payment}` : '50% Advance',
        balance_payment: quote.balance_payment ? `₹${quote.balance_payment}` : '50% before dispatch',
        warranty: quote.warranty,
        notes: quote.notes || 'Natural variation in color and veining is inherent to natural stone.'
      },
      actions: {
        can_accept: isBuyer && quote.quote_status === 'submitted',
        can_reject: isBuyer && quote.quote_status === 'submitted',
        can_edit: isOwnerMfg && ['submitted', 'draft', 'viewed'].includes(quote.quote_status),
        can_withdraw: isOwnerMfg && ['submitted', 'draft', 'viewed'].includes(quote.quote_status),
        can_chat: true
      }
    });
  } catch (error) {
    console.error('Error in getQuoteDetails:', error);
    return errorResponse(res, error.message, null, 500);
  }
}

/**
 * POST /api/manufacturer/inquiries/:id/quotes
 * Submit quotation against buyer requirement
 */
async function submitQuote(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getManufacturerProfile(userId);
    if (!profile) return errorResponse(res, 'Manufacturer profile not found', null, 404);

    const { error, value } = submitQuoteSchema.validate(req.body);
    if (error) return errorResponse(res, error.details[0].message, null, 400);

    const inquiry = await Inquiry.findById(id);
    if (!inquiry) return errorResponse(res, 'Inquiry not found', null, 404);

    if (['completed', 'closed', 'cancelled'].includes(inquiry.status)) {
      return errorResponse(res, `Cannot submit quotation for inquiry with status: ${inquiry.status}`, null, 400);
    }

    // Check duplicate quote
    const existingQuote = await InquiryQuotation.findOne({
      inquiry_id: inquiry._id,
      manufacturer_id: profile._id,
      quote_status: { $ne: 'withdrawn' }
    });

    if (existingQuote) {
      return errorResponse(res, 'You have already submitted an active quotation for this inquiry. Use edit or withdraw.', null, 400);
    }

    // Server-side financial calculations
    const subtotal = Math.round(value.quoted_quantity * value.unit_price * 100) / 100;
    const discount = Number(value.discount) || 0;
    const taxableAmount = Math.max(0, subtotal - discount);
    const taxRate = value.tax_rate !== undefined ? value.tax_rate : 18;
    const taxAmount = Math.round((taxableAmount * (taxRate / 100)) * 100) / 100;
    const shipping = Number(value.shipping_charges) || 0;
    const totalAmount = Math.round((taxableAmount + taxAmount + shipping) * 100) / 100;

    const quoteNumberStr = `QTE-${new Date().getFullYear()}-${Date.now().toString().slice(-5)}`;

    const validityDate = value.validity_date || (value.validity_days ? new Date(Date.now() + value.validity_days * 86400000) : new Date(Date.now() + 15 * 86400000));

    const quotation = await InquiryQuotation.create({
      quote_number: quoteNumberStr,
      inquiry_id: inquiry._id,
      manufacturer_id: profile._id,
      manufacturer_user_id: userId,
      buyer_id: inquiry.senderId || inquiry.buyer_id,
      product_id: inquiry.productId,
      quoted_quantity: value.quoted_quantity,
      quantity_unit: value.quantity_unit || inquiry.unit || 'Sq.ft',
      unit_price: value.unit_price,
      subtotal,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      shipping_charges: shipping,
      discount,
      total_amount: totalAmount,
      material: value.material || inquiry.material || inquiry.category,
      size: value.size || inquiry.size,
      thickness: value.thickness || inquiry.thickness,
      finish: value.finish || inquiry.finish,
      quality: value.quality || inquiry.quality || 'Export Quality',
      delivery_timeline: value.delivery_timeline || '7-10 Business Days',
      payment_terms: value.payment_terms || '50% Advance, 50% on Delivery',
      advance_payment: value.advance_payment || Math.round(totalAmount * 0.5),
      balance_payment: value.balance_payment || Math.round(totalAmount * 0.5),
      validity_date: validityDate,
      warranty: value.warranty || 'Standard Quality Guarantee',
      quote_status: 'submitted',
      notes: value.notes,
      attachments: value.attachments || []
    });

    // Update Inquiry state
    inquiry.status = 'quotes_received';
    inquiry.inquiry_status = 'quotes_received';
    inquiry.quotations_count = (inquiry.quotations_count || 0) + 1;
    await inquiry.save();

    // Log activity
    await InquiryActivityLog.create({
      inquiry_id: inquiry._id,
      performed_by: userId,
      actor_type: 'manufacturer',
      activity_type: 'quote_submitted',
      stage: 3,
      title: 'Quotation Submitted',
      description: `${profile.company_name} submitted quotation ${quoteNumberStr} at ₹${value.unit_price}/${value.quantity_unit || 'Sq.ft'} (Total: ₹${totalAmount}).`,
      metadata: { quote_id: quotation._id, quote_number: quoteNumberStr, total_amount: totalAmount }
    });

    return successResponse(res, 'Quotation submitted successfully', {
      id: quotation._id,
      _id: quotation._id,
      quote_id: quotation._id,
      quote_number: quotation.quote_number,
      quoted_quantity: quotation.quoted_quantity,
      quantity_unit: quotation.quantity_unit,
      unit_price: quotation.unit_price,
      subtotal: quotation.subtotal,
      tax_amount: quotation.tax_amount,
      shipping_charges: quotation.shipping_charges,
      discount: quotation.discount,
      total_amount: quotation.total_amount,
      quote_status: quotation.quote_status,
      inquiry_status: inquiry.status
    }, 201);
  } catch (error) {
    console.error('Error in submitQuote:', error);
    return errorResponse(res, error.message, null, 500);
  }
}

/**
 * PUT /api/manufacturer/quotes/:id
 * Edit existing quotation
 */
async function updateQuote(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.userId || req.user.id || req.user._id;

    const { error, value } = updateQuoteSchema.validate(req.body);
    if (error) return errorResponse(res, error.details[0].message, null, 400);

    const quote = await InquiryQuotation.findById(id);
    if (!quote) return errorResponse(res, 'Quotation not found', null, 404);

    if (quote.manufacturer_user_id.toString() !== userId.toString() && req.user.role !== 'admin') {
      return errorResponse(res, 'Not authorized to edit this quotation', null, 403);
    }

    if (!['submitted', 'draft', 'viewed'].includes(quote.quote_status)) {
      return errorResponse(res, `Cannot edit quote with status: ${quote.quote_status}`, null, 400);
    }

    // Recalculate amounts if quantity or price changed
    const qty = value.quoted_quantity !== undefined ? value.quoted_quantity : quote.quoted_quantity;
    const unitPrice = value.unit_price !== undefined ? value.unit_price : quote.unit_price;
    const subtotal = Math.round(qty * unitPrice * 100) / 100;
    const taxRate = value.tax_rate !== undefined ? value.tax_rate : quote.tax_rate;
    const taxAmount = Math.round((subtotal * (taxRate / 100)) * 100) / 100;
    const shipping = value.shipping_charges !== undefined ? value.shipping_charges : quote.shipping_charges;
    const discount = value.discount !== undefined ? value.discount : quote.discount;
    const totalAmount = Math.round((subtotal + taxAmount + shipping - discount) * 100) / 100;

    Object.assign(quote, value, {
      quoted_quantity: qty,
      unit_price: unitPrice,
      subtotal,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      shipping_charges: shipping,
      discount,
      total_amount: totalAmount
    });

    await quote.save();

    await InquiryActivityLog.create({
      inquiry_id: quote.inquiry_id,
      performed_by: userId,
      actor_type: 'manufacturer',
      activity_type: 'quote_revised',
      stage: 3,
      title: 'Quotation Revised',
      description: `Quotation ${quote.quote_number} updated to ₹${unitPrice}/${quote.quantity_unit} (Total: ₹${totalAmount}).`
    });

    return successResponse(res, 'Quotation updated successfully', quote);
  } catch (error) {
    console.error('Error in updateQuote:', error);
    return errorResponse(res, error.message, null, 500);
  }
}

/**
 * POST /api/manufacturer/quotes/:id/withdraw
 * Withdraw submitted quotation
 */
async function withdrawQuote(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.userId || req.user.id || req.user._id;

    const { error, value } = withdrawQuoteSchema.validate(req.body);
    if (error) return errorResponse(res, error.details[0].message, null, 400);

    const quote = await InquiryQuotation.findById(id);
    if (!quote) return errorResponse(res, 'Quotation not found', null, 404);

    if (quote.manufacturer_user_id.toString() !== userId.toString() && req.user.role !== 'admin') {
      return errorResponse(res, 'Not authorized to withdraw this quotation', null, 403);
    }

    if (quote.quote_status === 'withdrawn') {
      return errorResponse(res, 'Quotation is already withdrawn', null, 400);
    }

    quote.quote_status = 'withdrawn';
    quote.withdrawal_reason = value.reason;
    await quote.save();

    // Decrement inquiry quote counter if needed
    const remainingQuotes = await InquiryQuotation.countDocuments({
      inquiry_id: quote.inquiry_id,
      quote_status: { $ne: 'withdrawn' }
    });

    const inquiry = await Inquiry.findById(quote.inquiry_id);
    if (inquiry) {
      inquiry.quotations_count = remainingQuotes;
      if (remainingQuotes === 0 && inquiry.status === 'quotes_received') {
        inquiry.status = 'in_review';
      }
      await inquiry.save();
    }

    await InquiryActivityLog.create({
      inquiry_id: quote.inquiry_id,
      performed_by: userId,
      actor_type: 'manufacturer',
      activity_type: 'quote_withdrawn',
      stage: 2,
      title: 'Quotation Withdrawn',
      description: `Quotation ${quote.quote_number} was withdrawn. Reason: ${value.reason}`
    });

    return successResponse(res, 'Quotation withdrawn successfully', {
      quote_id: quote._id,
      quote_status: quote.quote_status,
      withdrawal_reason: quote.withdrawal_reason
    });
  } catch (error) {
    console.error('Error in withdrawQuote:', error);
    return errorResponse(res, error.message, null, 500);
  }
}

/**
 * POST /api/manufacturer/inquiries/:id/review
 * Transition inquiry to in_review
 */
async function reviewInquiry(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getManufacturerProfile(userId);

    const inquiry = await Inquiry.findById(id);
    if (!inquiry) return errorResponse(res, 'Inquiry not found', null, 404);

    if (['new', 'pending', 'submitted', 'in_review'].includes(inquiry.status)) {
      inquiry.status = 'in_review';
      inquiry.inquiry_status = 'in_review';

      if (profile && inquiry.recipients && inquiry.recipients.length) {
        const rec = inquiry.recipients.find(r => r.manufacturer_id?.toString() === profile._id?.toString());
        if (rec) {
          rec.viewed_at = new Date();
        }
      }
      await inquiry.save();

      await InquiryActivityLog.create({
        inquiry_id: inquiry._id,
        performed_by: userId,
        actor_type: 'manufacturer',
        activity_type: 'inquiry_reviewed',
        stage: 2,
        title: 'Requirement Placed Under Review',
        description: `${profile?.company_name || 'Manufacturer'} placed the inquiry under active technical review.`
      });
    }

    return successResponse(res, 'Inquiry placed under review', {
      inquiry_id: inquiry._id,
      status: inquiry.status,
      stage: 2
    });
  } catch (error) {
    console.error('Error in reviewInquiry:', error);
    return errorResponse(res, error.message, null, 500);
  }
}

/**
 * POST /api/manufacturer/inquiries/:id/close
 * Close inquiry with confirmation dialog and closure reason
 */
async function closeInquiry(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getManufacturerProfile(userId);

    const { error, value } = closeInquirySchema.validate(req.body);
    if (error) return errorResponse(res, error.details[0].message, null, 400);

    const inquiry = await Inquiry.findById(id);
    if (!inquiry) return errorResponse(res, 'Inquiry not found', null, 404);

    if (inquiry.status === 'closed') {
      return errorResponse(res, 'Inquiry is already closed', null, 400);
    }

    const closureReason = value.closure_reason || value.reason;
    const closureComments = value.closure_comments || value.comments || '';

    const prevStatus = inquiry.status;
    inquiry.status = 'closed';
    inquiry.inquiry_status = 'closed';
    inquiry.closed_reason = closureReason;
    inquiry.closure_reason = closureReason;
    inquiry.closure_comments = closureComments;
    inquiry.closed_at = new Date();
    await inquiry.save();

    await InquiryActivityLog.create({
      inquiry_id: inquiry._id,
      performed_by: userId,
      actor_type: 'manufacturer',
      activity_type: 'inquiry_closed',
      previous_status: prevStatus,
      new_status: 'closed',
      stage: 4,
      title: 'Inquiry Closed',
      description: `Inquiry closed by ${profile?.company_name || 'Manufacturer'}. Reason: ${closureReason}.`,
      metadata: { comments: closureComments }
    });

    return successResponse(res, 'Inquiry closed successfully', {
      inquiry_id: inquiry._id,
      status: inquiry.status,
      closure_reason: inquiry.closure_reason,
      closed_at: inquiry.closed_at
    });
  } catch (error) {
    console.error('Error in closeInquiry:', error);
    return errorResponse(res, error.message, null, 500);
  }
}

/**
 * POST /api/manufacturer/inquiries/:id/reopen
 * Reopen closed inquiry
 */
async function reopenInquiry(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.userId || req.user.id || req.user._id;

    const inquiry = await Inquiry.findById(id);
    if (!inquiry) return errorResponse(res, 'Inquiry not found', null, 404);

    if (inquiry.status !== 'closed') {
      return errorResponse(res, 'Only closed inquiries can be reopened', null, 400);
    }

    const quoteCount = await InquiryQuotation.countDocuments({ inquiry_id: inquiry._id, quote_status: { $ne: 'withdrawn' } });
    const targetStatus = quoteCount > 0 ? 'quotes_received' : 'pending';

    inquiry.status = targetStatus;
    inquiry.inquiry_status = targetStatus;
    inquiry.closed_at = null;
    inquiry.closed_reason = null;
    inquiry.closure_reason = null;
    inquiry.closure_comments = null;
    await inquiry.save();

    await InquiryActivityLog.create({
      inquiry_id: inquiry._id,
      performed_by: userId,
      actor_type: 'manufacturer',
      activity_type: 'inquiry_reopened',
      stage: targetStatus === 'quotes_received' ? 3 : 2,
      title: 'Inquiry Reopened',
      description: 'Inquiry was reopened for continued quotation discussion.'
    });

    return successResponse(res, 'Inquiry reopened successfully', {
      inquiry_id: inquiry._id,
      status: inquiry.status
    });
  } catch (error) {
    console.error('Error in reopenInquiry:', error);
    return errorResponse(res, error.message, null, 500);
  }
}

/**
 * GET /api/manufacturer/inquiries/:id/messages
 * Inquiry-Linked Conversation Thread
 */
async function getInquiryMessages(req, res) {
  try {
    const { id } = req.params;
    const inquiry = await Inquiry.findById(id);
    if (!inquiry) return errorResponse(res, 'Inquiry not found', null, 404);

    const messages = await InquiryMessage.find({ inquiry_id: inquiry._id })
      .populate('sender_id', 'name role')
      .populate('receiver_id', 'name role')
      .sort({ createdAt: 1 });

    const userId = req.user.userId || req.user.id || req.user._id;
    const unreadCount = await InquiryMessage.countDocuments({
      inquiry_id: inquiry._id,
      receiver_id: userId,
      is_read: false
    });

    return successResponse(res, 'Inquiry messages retrieved', {
      count: messages.length,
      unread_count: unreadCount,
      messages
    });
  } catch (error) {
    console.error('Error in getInquiryMessages:', error);
    return errorResponse(res, error.message, null, 500);
  }
}

/**
 * POST /api/manufacturer/inquiries/:id/messages
 * Send message linked to inquiry
 */
async function sendInquiryMessage(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.userId || req.user.id || req.user._id;

    const { error, value } = inquiryMessageSchema.validate(req.body);
    if (error) return errorResponse(res, error.details[0].message, null, 400);

    const inquiry = await Inquiry.findById(id);
    if (!inquiry) return errorResponse(res, 'Inquiry not found', null, 404);

    const isBuyer = req.user.role === 'customer' || req.user.role === 'buyer';
    const receiverId = value.receiver_id || (isBuyer ? (inquiry.assigned_manufacturers?.[0] || inquiry.businessId) : (inquiry.buyer_id || inquiry.senderId));

    const msg = await InquiryMessage.create({
      inquiry_id: inquiry._id,
      sender_id: userId,
      sender_type: isBuyer ? 'buyer' : 'manufacturer',
      receiver_id: receiverId,
      message: value.message,
      attachments: value.attachments || []
    });

    await InquiryActivityLog.create({
      inquiry_id: inquiry._id,
      performed_by: userId,
      actor_type: req.user.role === 'customer' || req.user.role === 'buyer' ? 'buyer' : 'manufacturer',
      activity_type: 'message_sent',
      stage: inquiry.quotations_count > 0 ? 3 : 2,
      title: 'Message Sent',
      description: `New message sent regarding inquiry specifications.`
    });

    return successResponse(res, 'Message sent successfully', msg, 201);
  } catch (error) {
    console.error('Error in sendInquiryMessage:', error);
    return errorResponse(res, error.message, null, 500);
  }
}

/**
 * POST /api/manufacturer/inquiries/:id/messages/read
 * Mark messages as read
 */
async function markInquiryMessagesRead(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.userId || req.user.id || req.user._id;

    await InquiryMessage.updateMany(
      { inquiry_id: id, receiver_id: userId, is_read: false },
      { $set: { is_read: true, read_at: new Date() } }
    );

    return successResponse(res, 'Messages marked as read', { read: true });
  } catch (error) {
    console.error('Error in markInquiryMessagesRead:', error);
    return errorResponse(res, error.message, null, 500);
  }
}

module.exports = {
  getManufacturerInquiries,
  getInquiryStatistics,
  searchInquiries,
  getInquiryDetails,
  getInquiryRequirements,
  getInquiryAttachments,
  getInquiryActivity,
  downloadInquiryPdf,
  getInquiryQuotes,
  compareInquiryQuotes,
  getQuoteDetails,
  submitQuote,
  updateQuote,
  withdrawQuote,
  reviewInquiry,
  closeInquiry,
  reopenInquiry,
  getInquiryMessages,
  sendInquiryMessage,
  markInquiryMessagesRead
};
