const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const BusinessProfile = require('../models/BusinessProfile');
const Product = require('../models/Product');
const Inquiry = require('../models/Inquiry');
const Lead = require('../models/Lead');
const SupportTicket = require('../models/SupportTicket');
const AppConfig = require('../models/AppConfig');
const News = require('../models/News');
const AdminLog = require('../models/AdminLog');
const Advertisement = require('../models/Advertisement');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// All routes require Super Admin authentication
router.use(protect);
router.use(authorize('admin'));

/**
 * 1. REAL-TIME PLATFORM KPI ANALYTICS
 * GET /api/admin/super/dashboard-stats
 */
router.get('/dashboard-stats', async (req, res) => {
  try {
    const [
      totalUsers,
      totalBusinesses,
      verifiedBusinesses,
      pendingBusinesses,
      activeListings,
      pendingListings,
      rejectedListings,
      totalInquiries,
      totalLeads,
      activeAds,
      totalTickets,
      newUsers30d
    ] = await Promise.all([
      User.countDocuments(),
      BusinessProfile.countDocuments(),
      BusinessProfile.countDocuments({ is_verified: true }),
      BusinessProfile.countDocuments({ is_verified: false }),
      Product.countDocuments({ status: 'active' }),
      Product.countDocuments({ status: { $in: ['draft', 'pending'] } }),
      Product.countDocuments({ status: 'rejected' }),
      Inquiry.countDocuments(),
      Lead.countDocuments(),
      Advertisement.countDocuments({ status: 'active' }),
      SupportTicket.countDocuments({ status: { $ne: 'closed' } }),
      User.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      })
    ]);

    // Aggregate Business Type breakdown
    const typeDistribution = await BusinessProfile.aggregate([
      { $group: { _id: '$business_type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Aggregate State-wise breakdown
    const stateDistribution = await BusinessProfile.aggregate([
      { $group: { _id: '$address.state', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 }
    ]);

    // Recent 5 Registrations
    const recentRegistrations = await BusinessProfile.find()
      .populate('userId', 'name mobile email')
      .sort({ createdAt: -1 })
      .limit(5);

    // Real Monthly Registrations from DB
    const allUsers = await User.find({}, 'createdAt').sort({ createdAt: 1 });
    const monthMap = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    allUsers.forEach((u) => {
      if (u.createdAt) {
        const d = new Date(u.createdAt);
        const label = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
        monthMap[label] = (monthMap[label] || 0) + 1;
      }
    });

    const realMonthlyTrend = Object.keys(monthMap).map((k) => ({
      month: k,
      count: monthMap[k]
    }));

    // Real Notification Feed for header bell
    const notifications = [
      { id: '1', title: 'Pending Enterprise Verification', desc: `${pendingBusinesses} businesses awaiting verification approval`, time: 'Live', type: 'verification' },
      { id: '2', title: 'Open Dispute Tickets', desc: `${totalTickets} unresolved customer support issues`, time: 'Live', type: 'report' },
      { id: '3', title: 'New Customer Signups', desc: `${newUsers30d} users registered in last 30 days`, time: '30 Days', type: 'user' },
      { id: '4', title: 'Active Lead Demands', desc: `${totalLeads} stone requirements awaiting seller quotation`, time: 'Live', type: 'lead' }
    ];

    return successResponse(res, 'Super Admin live stats fetched', {
      kpi: {
        totalUsers,
        totalBusinesses,
        verifiedBusinesses,
        pendingVerifications: pendingBusinesses,
        activeListings,
        pendingListings,
        rejectedListings,
        totalInquiries,
        totalLeads,
        activeAds,
        pendingSupport: totalTickets,
        newUsers30d
      },
      typeDistribution,
      stateDistribution,
      recentRegistrations,
      realMonthlyTrend,
      notifications
    });
  } catch (err) {
    return errorResponse(res, err.message, err, 500);
  }
});

/**
 * 2. LEADS DIRECTORY & OVERSIGHT
 * GET /api/admin/super/leads
 */
router.get('/leads', async (req, res) => {
  try {
    const { status, priority, search, page = 1, limit = 50 } = req.query;
    const query = {};
    if (status) query.lead_status = status;
    if (priority) query.priority = priority;

    const leads = await Lead.find(query)
      .populate('buyer_id', 'name mobile email')
      .populate('manufacturer_id', 'company_name phone email address')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Lead.countDocuments(query);

    return successResponse(res, 'Platform leads fetched', {
      leads,
      total,
      page: Number(page),
      limit: Number(limit)
    });
  } catch (err) {
    return errorResponse(res, err.message, err, 500);
  }
});

/**
 * PATCH /api/admin/super/leads/:id/status
 */
router.patch('/leads/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { lead_status: status },
      { new: true }
    );
    if (!lead) return errorResponse(res, 'Lead not found', null, 404);
    return successResponse(res, 'Lead status updated', lead);
  } catch (err) {
    return errorResponse(res, err.message, err, 500);
  }
});

/**
 * 3. REPORTS & COMPLAINTS / TICKETS
 * GET /api/admin/super/reports
 */
router.get('/reports', async (req, res) => {
  try {
    const { status, category } = req.query;
    const query = {};
    if (status) query.status = status;
    if (category) query.category = category;

    const tickets = await SupportTicket.find(query)
      .populate('userId', 'name mobile email role')
      .sort({ createdAt: -1 });

    return successResponse(res, 'Platform support reports and disputes fetched', tickets);
  } catch (err) {
    return errorResponse(res, err.message, err, 500);
  }
});

/**
 * PATCH /api/admin/super/reports/:id/status
 */
router.patch('/reports/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const ticket = await SupportTicket.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!ticket) return errorResponse(res, 'Ticket not found', null, 404);
    return successResponse(res, 'Report ticket status updated', ticket);
  } catch (err) {
    return errorResponse(res, err.message, err, 500);
  }
});

/**
 * 4. NOTIFICATIONS & BROADCAST ANNOUNCEMENTS
 * GET /api/admin/super/announcements
 */
router.get('/announcements', async (req, res) => {
  try {
    const list = await News.find().sort({ createdAt: -1 });
    return successResponse(res, 'Announcements fetched', list);
  } catch (err) {
    return errorResponse(res, err.message, err, 500);
  }
});

/**
 * POST /api/admin/super/announcements
 */
router.post('/announcements', async (req, res) => {
  try {
    const { title, content, type = 'industry_news', targetAudience = 'all', isBreakingNews = false } = req.body;
    const news = await News.create({
      title,
      content,
      type,
      targetAudience,
      isBreakingNews,
      createdBy: req.user._id,
      publishedAt: new Date()
    });
    return successResponse(res, 'Broadcast announcement published', news, 201);
  } catch (err) {
    return errorResponse(res, err.message, err, 500);
  }
});

/**
 * DELETE /api/admin/super/announcements/:id
 */
router.delete('/announcements/:id', async (req, res) => {
  try {
    await News.findByIdAndDelete(req.params.id);
    return successResponse(res, 'Announcement deleted');
  } catch (err) {
    return errorResponse(res, err.message, err, 500);
  }
});

/**
 * 5. ADMIN & STAFF RBAC MANAGEMENT
 * GET /api/admin/super/staff
 */
router.get('/staff', async (req, res) => {
  try {
    const staff = await User.find({ role: 'admin' }).select('-password').sort({ createdAt: -1 });
    return successResponse(res, 'Admin staff accounts fetched', staff);
  } catch (err) {
    return errorResponse(res, err.message, err, 500);
  }
});

/**
 * POST /api/admin/super/staff
 */
router.post('/staff', async (req, res) => {
  try {
    const { name, mobile, email, password } = req.body;
    const bcrypt = require('bcrypt');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password || 'StaffPass@2026', salt);

    const newStaff = await User.create({
      name,
      mobile,
      email,
      password: hashedPassword,
      role: 'admin',
      status: 'active'
    });

    return successResponse(res, 'Admin staff created successfully', {
      _id: newStaff._id,
      name: newStaff.name,
      email: newStaff.email,
      mobile: newStaff.mobile,
      role: newStaff.role
    }, 201);
  } catch (err) {
    return errorResponse(res, err.message, err, 500);
  }
});

/**
 * 6. PLATFORM SETTINGS MANAGEMENT
 * GET /api/admin/super/settings
 */
router.get('/settings', async (req, res) => {
  try {
    let config = await AppConfig.findOne({ key: 'global_config' });
    if (!config) {
      config = await AppConfig.create({ key: 'global_config' });
    }
    return successResponse(res, 'Platform global settings fetched', config);
  } catch (err) {
    return errorResponse(res, err.message, err, 500);
  }
});

/**
 * PUT /api/admin/super/settings
 */
router.put('/settings', async (req, res) => {
  try {
    const config = await AppConfig.findOneAndUpdate(
      { key: 'global_config' },
      { $set: req.body },
      { new: true, upsert: true }
    );
    return successResponse(res, 'Platform settings saved successfully', config);
  } catch (err) {
    return errorResponse(res, err.message, err, 500);
  }
});

/**
 * GET /api/admin/super/settings/keys
 * Full API keys details for Super Admin
 */
router.get('/settings/keys', async (req, res) => {
  try {
    let config = await AppConfig.findOne({ key: 'global_config' });
    if (!config) {
      config = await AppConfig.create({ key: 'global_config' });
    }
    const keys = config.api_keys || {};
    return successResponse(res, 'Super admin API keys retrieved', {
      gemini_api_key: keys.gemini_api_key || process.env.GEMINI_API_KEY || '',
      google_vision_api_key: keys.google_vision_api_key || process.env.GOOGLE_VISION_API_KEY || '',
      google_maps_api_key: keys.google_maps_api_key || process.env.GOOGLE_MAPS_API_KEY || '',
      aws_access_key: keys.aws_access_key || process.env.AWS_ACCESS_KEY_ID || '',
      aws_secret_key: keys.aws_secret_key || process.env.AWS_SECRET_ACCESS_KEY || '',
      aws_s3_bucket: keys.aws_s3_bucket || process.env.AWS_S3_BUCKET || '',
      aws_region: keys.aws_region || process.env.AWS_REGION || 'ap-south-1',
      twilio_account_sid: keys.twilio_account_sid || process.env.TWILIO_ACCOUNT_SID || '',
      twilio_auth_token: keys.twilio_auth_token || process.env.TWILIO_AUTH_TOKEN || '',
      twilio_phone_number: keys.twilio_phone_number || process.env.TWILIO_PHONE_NUMBER || ''
    });
  } catch (err) {
    return errorResponse(res, err.message, err, 500);
  }
});

/**
 * PUT /api/admin/super/settings/keys
 * Update API keys in database
 */
router.put('/settings/keys', async (req, res) => {
  try {
    const newKeys = req.body || {};
    let config = await AppConfig.findOne({ key: 'global_config' });
    if (!config) {
      config = new AppConfig({ key: 'global_config' });
    }
    config.api_keys = {
      ...(config.api_keys || {}),
      ...newKeys
    };
    await config.save();
    return successResponse(res, 'API keys updated successfully', config.api_keys);
  } catch (err) {
    return errorResponse(res, err.message, err, 500);
  }
});

/**
 * 7. CATEGORIES CRUD MANAGEMENT
 * GET /api/admin/super/categories
 */
router.get('/categories', async (req, res) => {
  try {
    const ServiceCategory = require('../models/ServiceCategory');
    const MainCategory = require('../models/MainCategory');

    let [serviceCats, mainCats] = await Promise.all([
      ServiceCategory.find().sort({ sort_order: 1, createdAt: -1 }),
      MainCategory.find().sort({ sort_order: 1, createdAt: -1 })
    ]);

    // Seed if empty
    if (serviceCats.length === 0) {
      const defaultServices = [
        { name: 'Machine Repair & Maintenance', slug: 'machine-repair', description: 'On-site maintenance for gangsaw and multi-blade machines', status: 'active' },
        { name: 'Stone Polishing Services', slug: 'stone-polishing', description: 'Diamond polishing, crystallization, and sealing', status: 'active' },
        { name: 'CNC & Waterjet Cutting', slug: 'cnc-waterjet-cutting', description: 'Contract precision stone cutting and inlays', status: 'active' },
        { name: 'Stone Transportation', slug: 'stone-transportation', description: 'Heavy trailer & open body logistics for stone blocks', status: 'active' },
        { name: 'Epoxy & Chemical Application', slug: 'epoxy-application', description: 'Crack filling, net pasting, and chemical treatments', status: 'active' }
      ];
      serviceCats = await ServiceCategory.insertMany(defaultServices);
    }

    return successResponse(res, 'Platform categories fetched', {
      serviceCategories: serviceCats,
      mainCategories: mainCats
    });
  } catch (err) {
    return errorResponse(res, err.message, err, 500);
  }
});

/**
 * POST /api/admin/super/categories
 */
router.post('/categories', async (req, res) => {
  try {
    const ServiceCategory = require('../models/ServiceCategory');
    const { name, slug, description, type = 'service' } = req.body;
    const generatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const cat = await ServiceCategory.create({
      name,
      slug: generatedSlug,
      description: description || '',
      status: 'active'
    });

    return successResponse(res, 'Category created successfully', cat, 201);
  } catch (err) {
    return errorResponse(res, err.message, err, 500);
  }
});

/**
 * PUT /api/admin/super/categories/:id
 */
router.put('/categories/:id', async (req, res) => {
  try {
    const ServiceCategory = require('../models/ServiceCategory');
    const cat = await ServiceCategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!cat) return errorResponse(res, 'Category not found', null, 404);
    return successResponse(res, 'Category updated successfully', cat);
  } catch (err) {
    return errorResponse(res, err.message, err, 500);
  }
});

/**
 * DELETE /api/admin/super/categories/:id
 */
router.delete('/categories/:id', async (req, res) => {
  try {
    const ServiceCategory = require('../models/ServiceCategory');
    await ServiceCategory.findByIdAndDelete(req.params.id);
    return successResponse(res, 'Category deleted successfully');
  } catch (err) {
    return errorResponse(res, err.message, err, 500);
  }
});

/**
 * 8. LOCATIONS CRUD MANAGEMENT
 * GET /api/admin/super/locations
 */
router.get('/locations', async (req, res) => {
  try {
    const Location = require('../models/Location');
    let locations = await Location.find().sort({ name: 1 });

    // Seed if empty
    if (locations.length === 0) {
      const defaultLocations = [
        {
          name: 'Rajasthan',
          districts: [
            { name: 'Kishangarh', areas: [{ name: 'Madanganj', pincode: '305801' }, { name: 'Marble Mandi', pincode: '305801' }, { name: 'Silora Industrial Area', pincode: '305802' }] },
            { name: 'Jalore', areas: [{ name: 'Phase 1 Industrial Area', pincode: '343001' }, { name: 'Bagra Quarry Hub', pincode: '343025' }] },
            { name: 'Rajsamand', areas: [{ name: 'Nathdwara', pincode: '313301' }, { name: 'Kelwa Mining Belt', pincode: '313334' }] },
            { name: 'Udaipur', areas: [{ name: 'Sukher', pincode: '313001' }, { name: 'Amberi', pincode: '313002' }, { name: 'Bhuwana', pincode: '313004' }] },
            { name: 'Jaipur', areas: [{ name: 'Mansarovar Industrial Area', pincode: '302020' }, { name: 'Sitapura', pincode: '302022' }] },
            { name: 'Makrana', areas: [{ name: 'Gunawati Range', pincode: '341505' }, { name: 'Borawar', pincode: '341502' }] }
          ]
        },
        {
          name: 'Gujarat',
          districts: [
            { name: 'Morbi', areas: [{ name: 'Ceramic City', pincode: '363641' }] },
            { name: 'Ahmedabad', areas: [{ name: 'Odhav GIDC', pincode: '382415' }, { name: 'Changodar', pincode: '382213' }] },
            { name: 'Surat', areas: [{ name: 'Sachin GIDC', pincode: '394230' }] }
          ]
        },
        {
          name: 'Karnataka',
          districts: [
            { name: 'Bengaluru', areas: [{ name: 'Jigani Industrial Area', pincode: '560105' }] },
            { name: 'Ilkal', areas: [{ name: 'Ilkal Granite Market', pincode: '587125' }] }
          ]
        },
        {
          name: 'Andhra Pradesh',
          districts: [
            { name: 'Ongole', areas: [{ name: 'Chimakurthy Galaxy Belt', pincode: '523226' }] },
            { name: 'Chittoor', areas: [{ name: 'Kuppam Granite Cluster', pincode: '517425' }] }
          ]
        },
        {
          name: 'Telangana',
          districts: [
            { name: 'Karimnagar', areas: [{ name: 'Tan Brown Mining Zone', pincode: '505001' }] },
            { name: 'Hyderabad', areas: [{ name: 'Kukatpally', pincode: '500072' }] }
          ]
        }
      ];
      locations = await Location.insertMany(defaultLocations);
    }

    return successResponse(res, 'Locations loaded from DB', locations);
  } catch (err) {
    return errorResponse(res, err.message, err, 500);
  }
});

/**
 * POST /api/admin/super/locations (Add State)
 */
router.post('/locations', async (req, res) => {
  try {
    const Location = require('../models/Location');
    const { name, districts } = req.body;
    const location = await Location.create({
      name,
      districts: districts || []
    });
    return successResponse(res, 'State created successfully', location, 201);
  } catch (err) {
    return errorResponse(res, err.message, err, 500);
  }
});

/**
 * POST /api/admin/super/locations/:stateId/districts (Add District)
 */
router.post('/locations/:stateId/districts', async (req, res) => {
  try {
    const Location = require('../models/Location');
    const { districtName, areaName, pincode } = req.body;
    const loc = await Location.findById(req.params.stateId);
    if (!loc) return errorResponse(res, 'State not found', null, 404);

    loc.districts.push({
      name: districtName,
      areas: areaName ? [{ name: areaName, pincode: pincode || '' }] : []
    });
    await loc.save();

    return successResponse(res, 'District added successfully', loc);
  } catch (err) {
    return errorResponse(res, err.message, err, 500);
  }
});

/**
 * DELETE /api/admin/super/locations/:stateId
 */
router.delete('/locations/:stateId', async (req, res) => {
  try {
    const Location = require('../models/Location');
    await Location.findByIdAndDelete(req.params.stateId);
    return successResponse(res, 'State location deleted');
  } catch (err) {
    return errorResponse(res, err.message, err, 500);
  }
});

/**
 * GET /api/admin/super/businesses
 * Direct MongoDB business directory for Super Admin
 */
router.get('/businesses', async (req, res) => {
  try {
    const { status, is_verified, business_type } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (is_verified !== undefined) filter.is_verified = is_verified === 'true';
    if (business_type) filter.business_type = business_type;

    const businesses = await BusinessProfile.find(filter)
      .populate('userId', 'name mobile email')
      .sort({ createdAt: -1 });

    return successResponse(res, 'All platform businesses retrieved', businesses);
  } catch (err) {
    return errorResponse(res, err.message, err, 500);
  }
});

/**
 * PUT /api/admin/super/businesses/:id/verify
 * Update business verification status directly
 */
router.put('/businesses/:id/verify', async (req, res) => {
  try {
    const { is_verified, verification_status } = req.body;
    const update = {};
    if (is_verified !== undefined) update.is_verified = Boolean(is_verified);
    if (verification_status) update.verification_status = verification_status;
    else if (is_verified === true) update.verification_status = 'approved';
    else if (is_verified === false) update.verification_status = 'rejected';

    if (update.is_verified) {
      update.verified_at = new Date();
    }

    const updated = await BusinessProfile.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true }
    );

    return successResponse(res, 'Business verification updated successfully', updated);
  } catch (err) {
    return errorResponse(res, err.message, err, 500);
  }
});

/**
 * ----------------------------------------------------
 * CUSTOM PAGES (CMS / POLICY / STATIC PAGES)
 * ----------------------------------------------------
 */
const CustomPage = require('../models/CustomPage');

// Helper to seed initial default policy pages if database is empty
async function seedDefaultCustomPages(adminUserId) {
  const count = await CustomPage.countDocuments();
  if (count === 0) {
    const defaults = [
      {
        title: 'Privacy Policy',
        slug: 'privacy-policy',
        category: 'policy',
        summary: 'How Stone Market India collects, handles, and protects user information and business trade data.',
        content: `<h2>1. Information We Collect</h2><p>Stone Market India collects registration details, business documents (GST certificates, trade licenses), catalogue specifications, communication records, and geolocation coordinates to facilitate industrial stone trade networking.</p><h2>2. Use of Business Data</h2><p>Verified business information and catalogue details are published on our digital marketplace to connect verified stone suppliers, mining operators, fabricators, and buyers.</p><h2>3. Data Protection & Security</h2><p>We deploy enterprise-grade encryption, secure credential hashing, and restricted API access to safeguard transaction ledgers and confidential quotation agreements.</p><h2>4. Contact Grievance Officer</h2><p>For privacy queries, contact privacy@stonemarketindia.com.</p>`,
        status: 'published',
        meta_title: 'Privacy Policy | Stone Market India',
        meta_description: 'Official Privacy Policy of Stone Market India - B2B Digital Stone & Mineral Marketplace.',
        is_system: true,
        created_by: adminUserId,
      },
      {
        title: 'Terms & Conditions',
        slug: 'terms-and-conditions',
        category: 'legal',
        summary: 'Platform usage agreement, trade obligations, verification policies, and seller guidelines.',
        content: `<h2>1. Platform Eligibility</h2><p>By registering on Stone Market India, you certify that you represent an authentic business, proprietorship, or enterprise engaged in natural stone, machinery, minerals, or logistics services.</p><h2>2. Product Listings & Authenticity</h2><p>Suppliers must submit accurate stone specifications, dimensional measurements, pricing units, and authentic quarry or manufacturing imagery.</p><h2>3. Inquiry & Direct Quotation</h2><p>Discussions, pricing negotiations, and quotations sent through the platform constitute direct trade negotiations between buyers and sellers.</p><h2>4. Termination & De-listing</h2><p>Stone Market India reserves the right to suspend accounts displaying fraudulent credentials or non-compliant trade practices.</p>`,
        status: 'published',
        meta_title: 'Terms and Conditions | Stone Market India',
        meta_description: 'Terms and conditions governing the use of Stone Market India digital marketplace.',
        is_system: true,
        created_by: adminUserId,
      },
      {
        title: 'Refund & Cancellation Policy',
        slug: 'refund-policy',
        category: 'policy',
        summary: 'Terms governing subscription plans, verified enterprise badges, and advertising promotion packages.',
        content: `<h2>1. Subscription & Promotion Packages</h2><p>Payments made for featured marketplace listings, targeted billboard advertisements, or verified enterprise onboarding packages are non-refundable once activated.</p><h2>2. Technical Service Disruptions</h2><p>In the event of verified platform downtime impacting scheduled promotional banners, proportional ad runtime credits will be provided.</p><h2>3. Billing Assistance</h2><p>For payment disputes or tax invoice corrections, reach out to billing@stonemarketindia.com within 7 business days.</p>`,
        status: 'published',
        meta_title: 'Refund & Cancellation Policy | Stone Market India',
        meta_description: 'Refund terms for marketplace promotions and vendor verification services on Stone Market India.',
        is_system: true,
        created_by: adminUserId,
      },
      {
        title: 'About Stone Market India',
        slug: 'about-us',
        category: 'company',
        summary: 'Overview of India’s premier digital stone, mineral, machinery, and logistics trade platform.',
        content: `<h2>Empowering India's Natural Stone Industry</h2><p>Stone Market India is a high-performance industrial networking ecosystem uniting quarry owners, granite & marble manufacturers, processing machinery fabricators, mineral powder micronizers, and heavy freight logistics providers.</p><h3>Pan-India Industrial Coverage</h3><p>Connecting regional stone hubs across Kishangarh, Makrana, Rajsamand, Jalore, Morbi, Ilkal, Ongole, and Karimnagar to nationwide buyers and architecture firms.</p>`,
        status: 'published',
        meta_title: 'About Us | Stone Market India',
        meta_description: 'Discover the mission, scale, and vision of Stone Market India.',
        is_system: true,
        created_by: adminUserId,
      }
    ];
    await CustomPage.insertMany(defaults);
  }
}

/**
 * GET /api/admin/super/pages
 * List all custom pages with optional search, category, and status filtering
 */
router.get('/pages', async (req, res) => {
  try {
    await seedDefaultCustomPages(req.user?._id);

    const { search, category, status } = req.query;
    const filter = {};

    if (status && status !== 'all') {
      filter.status = status;
    }
    if (category && category !== 'all') {
      filter.category = category;
    }
    if (search && search.trim()) {
      filter.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { slug: { $regex: search.trim(), $options: 'i' } },
        { summary: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const pages = await CustomPage.find(filter)
      .populate('updated_by', 'name email')
      .sort({ updatedAt: -1 });

    return successResponse(res, 'Custom pages retrieved successfully', pages);
  } catch (err) {
    return errorResponse(res, err.message, err, 500);
  }
});

/**
 * GET /api/admin/super/pages/:idOrSlug
 * Retrieve single page by ID or Slug
 */
router.get('/pages/:idOrSlug', async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const isObjectId = idOrSlug.match(/^[0-9a-fA-F]{24}$/);
    const query = isObjectId ? { _id: idOrSlug } : { slug: idOrSlug.toLowerCase() };

    const page = await CustomPage.findOne(query).populate('updated_by', 'name email');
    if (!page) {
      return errorResponse(res, 'Custom page not found', null, 404);
    }

    return successResponse(res, 'Custom page details retrieved', page);
  } catch (err) {
    return errorResponse(res, err.message, err, 500);
  }
});

/**
 * POST /api/admin/super/pages
 * Create a new custom page
 */
router.post('/pages', async (req, res) => {
  try {
    const {
      title,
      slug,
      category,
      content,
      summary,
      status,
      meta_title,
      meta_description
    } = req.body;

    if (!title || !content) {
      return errorResponse(res, 'Title and content are required', null, 400);
    }

    // Auto-generate or sanitize slug
    let finalSlug = slug ? slug.trim().toLowerCase() : title.trim().toLowerCase();
    finalSlug = finalSlug.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    // Check duplicate slug
    const existing = await CustomPage.findOne({ slug: finalSlug });
    if (existing) {
      return errorResponse(res, `Page with slug '${finalSlug}' already exists. Please choose a different slug.`, null, 409);
    }

    const newPage = await CustomPage.create({
      title: title.trim(),
      slug: finalSlug,
      category: category || 'policy',
      content,
      summary: summary || '',
      status: status || 'published',
      meta_title: meta_title || title.trim(),
      meta_description: meta_description || summary || '',
      created_by: req.user?._id,
      updated_by: req.user?._id,
      published_at: status === 'published' ? new Date() : undefined,
    });

    return successResponse(res, 'Custom page created successfully', newPage, 201);
  } catch (err) {
    return errorResponse(res, err.message, err, 500);
  }
});

/**
 * PUT /api/admin/super/pages/:id
 * Update an existing custom page
 */
router.put('/pages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const page = await CustomPage.findById(id);
    if (!page) {
      return errorResponse(res, 'Custom page not found', null, 404);
    }

    const {
      title,
      slug,
      category,
      content,
      summary,
      status,
      meta_title,
      meta_description
    } = req.body;

    if (title) page.title = title.trim();
    if (category) page.category = category;
    if (content !== undefined) page.content = content;
    if (summary !== undefined) page.summary = summary;
    if (status) {
      if (status === 'published' && page.status !== 'published') {
        page.published_at = new Date();
      }
      page.status = status;
    }
    if (meta_title !== undefined) page.meta_title = meta_title;
    if (meta_description !== undefined) page.meta_description = meta_description;

    if (slug && slug.trim().toLowerCase() !== page.slug) {
      let finalSlug = slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const existing = await CustomPage.findOne({ slug: finalSlug, _id: { $ne: page._id } });
      if (existing) {
        return errorResponse(res, `Page with slug '${finalSlug}' already exists.`, null, 409);
      }
      page.slug = finalSlug;
    }

    page.updated_by = req.user?._id;
    await page.save();

    return successResponse(res, 'Custom page updated successfully', page);
  } catch (err) {
    return errorResponse(res, err.message, err, 500);
  }
});

/**
 * PATCH /api/admin/super/pages/:id/status
 * Toggle page status (published, draft, archived)
 */
router.patch('/pages/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['published', 'draft', 'archived'].includes(status)) {
      return errorResponse(res, 'Invalid status value', null, 400);
    }

    const page = await CustomPage.findById(id);
    if (!page) {
      return errorResponse(res, 'Custom page not found', null, 404);
    }

    page.status = status;
    if (status === 'published' && !page.published_at) {
      page.published_at = new Date();
    }
    page.updated_by = req.user?._id;
    await page.save();

    return successResponse(res, `Page status changed to ${status}`, page);
  } catch (err) {
    return errorResponse(res, err.message, err, 500);
  }
});

/**
 * DELETE /api/admin/super/pages/:id
 * Delete a custom page
 */
router.delete('/pages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const page = await CustomPage.findById(id);
    if (!page) {
      return errorResponse(res, 'Custom page not found', null, 404);
    }

    if (page.is_system) {
      return errorResponse(res, 'System protected pages cannot be deleted. You can set them to draft instead.', null, 400);
    }

    await CustomPage.findByIdAndDelete(id);
    return successResponse(res, 'Custom page deleted successfully');
  } catch (err) {
    return errorResponse(res, err.message, err, 500);
  }
});

module.exports = router;

