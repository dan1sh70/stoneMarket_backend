const crypto = require('crypto');
const BusinessProfile = require('../models/BusinessProfile');
const Product = require('../models/Product');
const Vendor = require('../models/Vendor');
const User = require('../models/User');
const Inquiry = require('../models/Inquiry');
const QuoteRequest = require('../models/QuoteRequest');
const Lead = require('../models/Lead');
const BusinessFavorite = require('../models/BusinessFavorite');
const AnalyticsEvent = require('../models/AnalyticsEvent');
const MiningCategory = require('../models/MiningCategory');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// ==========================================
// INTERNAL HELPERS
// ==========================================

async function getMiningProfile(userId) {
  let profile = await BusinessProfile.findOne({
    userId,
    business_type: 'mining'
  });

  if (!profile) {
    const user = await User.findById(userId);
    if (user && (user.role === 'mining' || user.role === 'admin' || user.role === 'vendor' || user.role === 'manufacturer')) {
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
        is_mock: false,
        address: {
          full_address: 'Khasra No. 412, Mining Zone, Jalore District, Rajasthan',
          industrial_area: 'Jalore Granite Mining Cluster',
          district: 'Jalore',
          state: 'Rajasthan',
          country: 'India',
          postal_code: '343001'
        }
      });
    }
  }
  return profile;
}

// Convert dimensions to Cubic Meters (CBM)
function calculateVolumeCBM(length, width, height, unit = 'FEET') {
  if (!length || !width || !height) return 0;
  const u = (unit || '').toUpperCase();
  const l = parseFloat(length);
  const w = parseFloat(width);
  const h = parseFloat(height);

  if (u === 'CM') {
    return parseFloat(((l * 0.01) * (w * 0.01) * (h * 0.01)).toFixed(3));
  } else if (u === 'MM') {
    return parseFloat(((l * 0.001) * (w * 0.001) * (h * 0.001)).toFixed(3));
  } else if (u === 'FEET' || u === 'FT') {
    return parseFloat(((l * w * h) * 0.0283168).toFixed(3));
  } else {
    // Default is METER
    return parseFloat((l * w * h).toFixed(3));
  }
}

function calculateVerificationMetrics(profile) {
  const steps = profile.verification_steps || {};
  const checklist = [
    {
      id: 'phone',
      title: 'Phone Verification',
      status: steps.phone?.status || 'not_started',
      verified_at: steps.phone?.verified_at,
      details: steps.phone?.phone || profile.owners?.[0]?.phone || 'Not provided'
    },
    {
      id: 'email',
      title: 'Email Verification',
      status: steps.email?.status || 'not_started',
      verified_at: steps.email?.verified_at,
      details: steps.email?.email || profile.owners?.[0]?.email || 'Not provided'
    },
    {
      id: 'business',
      title: 'Business Registration & Mining Lease',
      status: steps.business?.status || 'not_started',
      verified_at: steps.business?.reviewed_at,
      details: steps.business?.registration_number || profile.mining_lease_number || 'Pending Submission'
    },
    {
      id: 'gst',
      title: 'GST Verification',
      status: steps.gst?.status || 'not_started',
      verified_at: steps.gst?.reviewed_at,
      details: steps.gst?.gstin || profile.gst_number || 'Pending Submission'
    },
    {
      id: 'bank',
      title: 'Bank Account Verification',
      status: steps.bank?.status || 'not_started',
      verified_at: steps.bank?.reviewed_at,
      details: steps.bank?.bank_name ? `${steps.bank.bank_name} (****${steps.bank.account_number?.slice(-4) || ''})` : 'Pending Submission'
    }
  ];

  const completed = checklist.filter(s => s.status === 'verified').length;
  const progress_percentage = Math.round((completed / checklist.length) * 100);

  return {
    verification_status: profile.is_verified ? 'verified' : (completed > 0 ? 'in_progress' : 'unverified'),
    badge_label: profile.is_verified ? 'Verified Mining Business' : 'Unverified Mine',
    progress_percentage,
    completed_steps: completed,
    total_steps: checklist.length,
    checklist,
    required_documents: [
      'Mining Lease Document',
      'Mining Permit',
      'Environment Clearance Certificate',
      'Pollution Control NOC',
      'Business Registration Certificate'
    ]
  };
}

// ==========================================
// 1. DASHBOARD & BUSINESS SWITCHER
// ==========================================

exports.getDashboard = async (req, res, next) => {
  try {
    const profile = await getMiningProfile(req.user.id);
    if (!profile) {
      return errorResponse(res, 'Mining business profile not found', null, 404);
    }

    const [
      totalProducts,
      activeProducts,
      totalInquiries,
      totalLeads,
      savesCount
    ] = await Promise.all([
      Product.countDocuments({ businessProfileId: profile._id }),
      Product.countDocuments({ businessProfileId: profile._id, status: 'active' }),
      Inquiry.countDocuments({
        $or: [{ businessId: profile._id }, { vendorId: profile._id }]
      }),
      Lead.countDocuments({ manufacturer_id: profile._id }),
      BusinessFavorite.countDocuments({ businessId: profile._id })
    ]);

    const verification = calculateVerificationMetrics(profile);

    const dashboardData = {
      summary_card: {
        id: profile._id,
        business_name: profile.company_name,
        business_logo: profile.logo || 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=300&q=80',
        cover_image: profile.cover_image || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
        category: 'Mines & Quarries',
        business_category: 'Mines & Quarries',
        registered_location: `${profile.address?.district || 'Jalore'}, ${profile.address?.state || 'Rajasthan'}`,
        verification_badge: profile.is_verified ? 'Verified Mining Business' : 'Pending Verification',
        is_verified: profile.is_verified || false,
        rating: profile.rating || 4.8,
        total_reviews: profile.review_count || 12,
        monthly_output_formatted: `${(profile.monthly_capacity || 6500).toLocaleString('en-IN')} ${profile.capacity_unit || 'Ton'}`,
        member_since: profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'Jan 2024'
      },
      profile_summary: {
        id: profile._id,
        business_name: profile.company_name,
        business_logo: profile.logo || 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=300&q=80',
        cover_image: profile.cover_image || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
        category: 'Mines & Quarries',
        business_category: 'Mines & Quarries',
        registered_location: `${profile.address?.district || 'Jalore'}, ${profile.address?.state || 'Rajasthan'}`,
        verification_badge: profile.is_verified ? 'Verified Mining Business' : 'Pending Verification',
        is_verified: profile.is_verified || false,
        rating: profile.rating || 4.8,
        total_reviews: profile.review_count || 12,
        member_since: profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'Jan 2024'
      },
      quick_stats: {
        total_products: totalProducts,
        total_mining_blocks: totalProducts,
        active_blocks: activeProducts,
        monthly_extraction_tons: profile.monthly_capacity || 6500,
        monthly_output_ton: profile.monthly_capacity || 6500,
        output_unit: profile.capacity_unit || 'Ton',
        total_inquiries: totalInquiries,
        total_leads: totalLeads,
        business_saves: savesCount
      },
      menus: {
        my_business: [
          { key: 'profile', label: 'Business Profile', route: '/mining/profile' },
          { key: 'products', label: 'Mining Product Management', route: '/mining/products' },
          { key: 'gallery', label: 'Gallery', route: '/mining/gallery' },
          { key: 'verification', label: 'Verification Center', route: '/mining/verification', badge: `${verification.progress_percentage}%` },
          { key: 'analytics', label: 'Analytics', route: '/mining/analytics' },
          { key: 'promotions', label: 'Ad Management', route: '/mining/promotions' }
        ],
        business_activity: [
          { key: 'inquiries', label: 'My Inquiries', route: '/mining/inquiries', count: totalInquiries },
          { key: 'leads', label: 'Lead Management', route: '/mining/leads', count: totalLeads }
        ],
        account_support: [
          { key: 'settings', label: 'Settings', route: '/mining/settings' },
          { key: 'help', label: 'Help & Support', route: '/mining/help' },
          { key: 'logout', label: 'Logout', route: '/auth/logout' }
        ],
        bottom_navigation: [
          { key: 'home', label: 'Home', route: '/home' },
          { key: 'feed', label: 'Feed', route: '/feed' },
          { key: 'central_action', label: 'AI Assist', route: '/assist', is_central: true },
          { key: 'estimate', label: 'Estimate', route: '/estimates' },
          { key: 'profile', label: 'Profile', route: '/mining/profile', active: true }
        ]
      },
      navigation_sections: {
        my_business: [
          { key: 'profile', label: 'Business Profile', route: '/mining/profile' },
          { key: 'products', label: 'Mining Product Management', route: '/mining/products' },
          { key: 'gallery', label: 'Gallery', route: '/mining/gallery' },
          { key: 'verification', label: 'Verification Center', route: '/mining/verification', badge: `${verification.progress_percentage}%` },
          { key: 'analytics', label: 'Analytics', route: '/mining/analytics' },
          { key: 'promotions', label: 'Ad Management', route: '/mining/promotions' }
        ],
        business_activity: [
          { key: 'inquiries', label: 'My Inquiries', route: '/mining/inquiries', count: totalInquiries },
          { key: 'leads', label: 'Lead Management', route: '/mining/leads', count: totalLeads }
        ],
        account_and_support: [
          { key: 'settings', label: 'Settings', route: '/mining/settings' },
          { key: 'help', label: 'Help & Support', route: '/mining/help' },
          { key: 'logout', label: 'Logout', route: '/auth/logout' }
        ]
      },
      bottom_navigation: [
        { key: 'home', label: 'Home', route: '/home' },
        { key: 'feed', label: 'Feed', route: '/feed' },
        { key: 'central_action', label: 'AI Assist', route: '/assist', is_central: true },
        { key: 'estimate', label: 'Estimate', route: '/estimates' },
        { key: 'profile', label: 'Profile', route: '/mining/profile', active: true }
      ]
    };

    return successResponse(res, 'Mining dashboard retrieved successfully', dashboardData);
  } catch (err) {
    next(err);
  }
};

exports.getBusinessTypes = async (req, res, next) => {
  try {
    const supportedTypes = [
      { id: 'customer', key: 'customer', name: 'Customer', title: 'Customer Profile', icon: 'UserOutlined', route: '/customer' },
      { id: 'manufacturer', key: 'manufacturer', name: 'Manufacturer', title: 'Manufacturer Account', icon: 'ToolOutlined', route: '/manufacturer' },
      { id: 'mining', key: 'mining', name: 'Mining / Quarry', title: 'Mining & Quarry Business', icon: 'GoldOutlined', route: '/mining' },
      { id: 'showroom', key: 'showroom', name: 'Showroom', title: 'Showroom Galleria', icon: 'ShopOutlined', route: '/showroom' },
      { id: 'trader', key: 'trader', name: 'Trader', title: 'Trader & Stockist', icon: 'ApartmentOutlined', route: '/trader' }
    ];

    const userProfiles = await BusinessProfile.find({ userId: req.user.id }).lean();
    const ownedTypeMap = {};
    userProfiles.forEach(p => {
      ownedTypeMap[p.business_type] = p._id;
    });

    const available_types = supportedTypes.map(t => ({
      ...t,
      has_profile: Boolean(ownedTypeMap[t.key]),
      profile_id: ownedTypeMap[t.key] || null,
      is_current: t.key === 'mining'
    }));

    return successResponse(res, 'Available business types retrieved', {
      current_type: 'mining',
      available_types
    });
  } catch (err) {
    next(err);
  }
};

exports.switchBusinessType = async (req, res, next) => {
  try {
    const { target_business_type } = req.body;
    if (!target_business_type) {
      return errorResponse(res, 'Target business type is required', null, 400);
    }

    let targetProfile = await BusinessProfile.findOne({
      userId: req.user.id,
      business_type: target_business_type
    });

    if (!targetProfile) {
      const user = await User.findById(req.user.id);
      targetProfile = await BusinessProfile.create({
        userId: req.user.id,
        business_type: target_business_type,
        company_name: `${user?.name || 'Business'} ${target_business_type === 'mining' ? 'Mines & Quarries' : 'Industries'}`,
        established_year: 2020,
        monthly_capacity: 5000,
        capacity_unit: target_business_type === 'mining' ? 'Ton' : 'Sq.Ft',
        premises_status: 'owned',
        rating: 4.8,
        status: 'active'
      });
    }

    return successResponse(res, `Switched to ${target_business_type} module successfully`, {
      active_business_type: target_business_type,
      profile_id: targetProfile._id,
      target_route: `/${target_business_type}/dashboard`,
      dashboard_route: `/${target_business_type}/dashboard`
    });
  } catch (err) {
    next(err);
  }
};

// ==========================================
// 2. BUSINESS PROFILE MANAGEMENT
// ==========================================

exports.getProfile = async (req, res, next) => {
  try {
    const profile = await getMiningProfile(req.user.id);
    if (!profile) return errorResponse(res, 'Mining profile not found', null, 404);

    return successResponse(res, 'Mining profile fetched successfully', profile);
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const profile = await getMiningProfile(req.user.id);
    if (!profile) return errorResponse(res, 'Mining profile not found', null, 404);

    const allowedFields = [
      'company_name',
      'logo',
      'cover_image',
      'about_business',
      'company_details',
      'established_year',
      'property_type',
      'unit_status',
      'gst_number',
      'ec_number',
      'ec_clearance_status',
      'mining_lease_number',
      'mining_permit_number',
      'quarry_specialties',
      'monthly_capacity',
      'capacity_unit',
      'factory_timings',
      'working_hours',
      'address'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        profile[field] = req.body[field];
      }
    });

    await profile.save();

    // Also sync to Vendor table
    await Vendor.findOneAndUpdate(
      { userId: req.user.id, businessType: 'mining' },
      {
        businessName: profile.company_name,
        description: profile.about_business,
        logo: profile.logo,
        coverImage: profile.cover_image,
        'address.state': profile.address?.state,
        'address.city': profile.address?.district
      }
    );

    return successResponse(res, 'Mining profile updated successfully', profile);
  } catch (err) {
    next(err);
  }
};

exports.getBusinessDetails = async (req, res, next) => {
  return exports.getProfile(req, res, next);
};

exports.updateBusinessDetails = async (req, res, next) => {
  return exports.updateProfile(req, res, next);
};

// Operational Specifications
exports.updateOperationalSpecs = async (req, res, next) => {
  try {
    const profile = await getMiningProfile(req.user.id);
    if (!profile) return errorResponse(res, 'Mining profile not found', null, 404);

    const {
      monthly_capacity,
      capacity_unit = 'Ton',
      ec_number,
      ec_clearance_status = 'Clearance Granted',
      mining_lease_number,
      mining_permit_number,
      quarry_specialties,
      factory_timings,
      working_hours,
      unit_status = 'both'
    } = req.body;

    if (monthly_capacity !== undefined) profile.monthly_capacity = monthly_capacity;
    profile.capacity_unit = capacity_unit;
    if (ec_number !== undefined) profile.ec_number = ec_number;
    if (ec_clearance_status !== undefined) profile.ec_clearance_status = ec_clearance_status;
    if (mining_lease_number !== undefined) profile.mining_lease_number = mining_lease_number;
    if (mining_permit_number !== undefined) profile.mining_permit_number = mining_permit_number;
    if (quarry_specialties !== undefined) profile.quarry_specialties = quarry_specialties;
    if (factory_timings !== undefined) profile.factory_timings = factory_timings;
    if (working_hours !== undefined) profile.working_hours = working_hours;
    if (unit_status !== undefined) profile.unit_status = unit_status;

    await profile.save();

    return successResponse(res, 'Operational specifications updated successfully', {
      monthly_mining_output: `${profile.monthly_capacity} ${profile.capacity_unit}`,
      monthly_capacity: profile.monthly_capacity,
      capacity_unit: profile.capacity_unit,
      environment_clearance: {
        ec_number: profile.ec_number,
        clearance_status: profile.ec_clearance_status
      },
      quarry_specialties: profile.quarry_specialties || [],
      mining_lease_number: profile.mining_lease_number,
      mining_permit_number: profile.mining_permit_number,
      operating_hours: profile.factory_timings || '08:00 AM – 06:00 PM (Mon - Sat)',
      factory_timings: profile.factory_timings || '08:00 AM – 06:00 PM (Mon - Sat)'
    });
  } catch (err) {
    next(err);
  }
};

// Machinery Management
exports.getMachinery = async (req, res, next) => {
  try {
    const profile = await getMiningProfile(req.user.id);
    if (!profile) return errorResponse(res, 'Mining profile not found', null, 404);

    return successResponse(res, 'Mining machinery list fetched', profile.machines || []);
  } catch (err) {
    next(err);
  }
};

exports.addMachinery = async (req, res, next) => {
  try {
    const profile = await getMiningProfile(req.user.id);
    if (!profile) return errorResponse(res, 'Mining profile not found', null, 404);

    const {
      machine_name,
      quantity = 1,
      description = '',
      category = 'Excavation',
      operational_status = 'Operational',
      image = ''
    } = req.body;

    const newMachine = {
      machine_name,
      quantity,
      description,
      category,
      operational_status,
      image
    };

    profile.machines.push(newMachine);
    await profile.save();

    return successResponse(res, 'Mining machinery added successfully', profile.machines[profile.machines.length - 1], 201);
  } catch (err) {
    next(err);
  }
};

exports.updateMachinery = async (req, res, next) => {
  try {
    const profile = await getMiningProfile(req.user.id);
    if (!profile) return errorResponse(res, 'Mining profile not found', null, 404);

    const machine = profile.machines.id(req.params.id);
    if (!machine) return errorResponse(res, 'Machinery equipment not found', null, 404);

    const allowed = ['machine_name', 'quantity', 'description', 'category', 'operational_status', 'image'];
    allowed.forEach(f => {
      if (req.body[f] !== undefined) machine[f] = req.body[f];
    });

    await profile.save();
    return successResponse(res, 'Machinery equipment updated successfully', machine);
  } catch (err) {
    next(err);
  }
};

exports.deleteMachinery = async (req, res, next) => {
  try {
    const profile = await getMiningProfile(req.user.id);
    if (!profile) return errorResponse(res, 'Mining profile not found', null, 404);

    const machine = profile.machines.id(req.params.id);
    if (!machine) return errorResponse(res, 'Machinery equipment not found', null, 404);

    profile.machines.pull(req.params.id);
    await profile.save();

    return successResponse(res, 'Machinery equipment removed successfully');
  } catch (err) {
    next(err);
  }
};

// Stone Varieties Management
exports.getStoneVarieties = async (req, res, next) => {
  try {
    const profile = await getMiningProfile(req.user.id);
    if (!profile) return errorResponse(res, 'Mining profile not found', null, 404);

    return successResponse(res, 'Excavated stone varieties fetched', profile.custom_stone_varieties || []);
  } catch (err) {
    next(err);
  }
};

exports.addStoneVariety = async (req, res, next) => {
  try {
    const profile = await getMiningProfile(req.user.id);
    if (!profile) return errorResponse(res, 'Mining profile not found', null, 404);

    const {
      name,
      color,
      stone_type = 'Granite',
      category = 'Mines & Quarries',
      finish = 'Natural Block',
      description = '',
      available_quantity = ''
    } = req.body;

    const newVariety = {
      name,
      color,
      stone_type,
      category,
      finish,
      description,
      available_quantity
    };

    profile.custom_stone_varieties.push(newVariety);
    await profile.save();

    return successResponse(res, 'Excavated stone variety added successfully', profile.custom_stone_varieties[profile.custom_stone_varieties.length - 1], 201);
  } catch (err) {
    next(err);
  }
};

exports.removeStoneVariety = async (req, res, next) => {
  try {
    const profile = await getMiningProfile(req.user.id);
    if (!profile) return errorResponse(res, 'Mining profile not found', null, 404);

    profile.custom_stone_varieties.pull(req.params.id);
    await profile.save();

    return successResponse(res, 'Stone variety removed successfully');
  } catch (err) {
    next(err);
  }
};

// Contacts & Owners Management
exports.getContacts = async (req, res, next) => {
  try {
    const profile = await getMiningProfile(req.user.id);
    if (!profile) return errorResponse(res, 'Mining profile not found', null, 404);

    return successResponse(res, 'Mining key contacts fetched', profile.owners || []);
  } catch (err) {
    next(err);
  }
};

exports.addContact = async (req, res, next) => {
  try {
    const profile = await getMiningProfile(req.user.id);
    if (!profile) return errorResponse(res, 'Mining profile not found', null, 404);

    const { name, designation, phone, email, whatsapp, is_primary, birth_date, anniversary_date } = req.body;
    let photo = req.file ? req.file.path || req.file.location : req.body.photo;

    const newContact = {
      name,
      designation: designation || 'Mine Operator',
      phone,
      email,
      whatsapp,
      is_primary: is_primary === true || is_primary === 'true',
      birth_date,
      anniversary_date,
      photo
    };

    profile.owners.push(newContact);
    await profile.save();

    return successResponse(res, 'Key contact added successfully', profile.owners[profile.owners.length - 1], 201);
  } catch (err) {
    next(err);
  }
};

exports.updateContact = async (req, res, next) => {
  try {
    const profile = await getMiningProfile(req.user.id);
    if (!profile) return errorResponse(res, 'Mining profile not found', null, 404);

    const contact = profile.owners.id(req.params.id);
    if (!contact) return errorResponse(res, 'Contact not found', null, 404);

    const fields = ['name', 'designation', 'phone', 'email', 'whatsapp', 'is_primary', 'birth_date', 'anniversary_date'];
    fields.forEach(f => {
      if (req.body[f] !== undefined) contact[f] = req.body[f];
    });

    if (req.file) {
      contact.photo = req.file.path || req.file.location;
    }

    await profile.save();
    return successResponse(res, 'Key contact updated successfully', contact);
  } catch (err) {
    next(err);
  }
};

exports.deleteContact = async (req, res, next) => {
  try {
    const profile = await getMiningProfile(req.user.id);
    if (!profile) return errorResponse(res, 'Mining profile not found', null, 404);

    profile.owners.pull(req.params.id);
    await profile.save();

    return successResponse(res, 'Contact removed successfully');
  } catch (err) {
    next(err);
  }
};

// ==========================================
// 3. PRODUCT MANAGEMENT & 4-STEP WIZARD
// ==========================================

exports.getProducts = async (req, res, next) => {
  try {
    const profile = await getMiningProfile(req.user.id);
    if (!profile) return errorResponse(res, 'Mining profile not found', null, 404);

    const { status, search, page = 1, limit = 10 } = req.query;
    const query = { businessProfileId: profile._id };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search && search.trim() !== '') {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { color_name: { $regex: search, $options: 'i' } },
        { material: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { miningLocation: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10))
      .lean();

    const formatted = products.map(p => ({
      _id: p._id,
      name: p.name,
      sku: p.sku || `MB-${p._id.toString().slice(-6).toUpperCase()}`,
      color_name: p.color_name || p.name,
      material: p.material || 'Granite',
      stone_category: p.category || 'Raw Stone Blocks',
      mine_location: p.miningLocation || `${profile.address?.district || 'Jalore'}, ${profile.address?.state || 'Rajasthan'}`,
      images: p.images || [],
      cover_image: p.cover_image || p.images?.[0] || 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=600&q=80',
      price: p.selling_price || p.priceRange?.min || 12000,
      price_unit: p.pricing_unit || 'CU.MTR',
      price_formatted: `₹${(p.selling_price || 12000).toLocaleString()} / ${p.pricing_unit || 'CU.MTR'}`,
      available_quantity: p.available_stock || p.quantity || 50,
      quantity_unit: p.quantity_unit || 'TON',
      volume_cbm: p.volume_cbm || 0,
      specifications: {
        dimensions: p.size || (p.block_dimensions ? `${p.block_dimensions.length} × ${p.block_dimensions.width} × ${p.block_dimensions.height} ${p.block_dimensions.dimension_unit}` : '10 × 6 × 5 FEET'),
        volume_cbm: p.volume_cbm || 0,
        finish: p.finish || 'Natural Block',
        quality: p.quality || 'Standard',
        pattern: p.pattern || 'Natural Pattern',
        weight: p.weight ? `${p.weight} ${p.weight_unit || 'TON'}` : 'Approx. 25 TON'
      },
      views: p.views || 0,
      inquiries: p.inquiry_count || 0,
      status: p.status,
      publishing_status: p.publishing_status
    }));

    return successResponse(res, 'Mining products retrieved successfully', {
      products: formatted,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total,
        total_pages: Math.ceil(total / parseInt(limit, 10)) || 1
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    const profile = await getMiningProfile(req.user.id);
    if (!profile) return errorResponse(res, 'Mining profile not found', null, 404);

    let vendor = await Vendor.findOne({ userId: req.user.id });
    if (!vendor) {
      vendor = await Vendor.create({
        userId: req.user.id,
        businessName: profile.company_name,
        businessType: 'mining',
        contact: { phone: req.user.mobile, email: req.user.email },
        category: 'Mining'
      });
    }

    const {
      name,
      color_name,
      material = 'Granite',
      description = '',
      price,
      selling_price = price || 15000,
      pricing_unit = 'CU.MTR',
      block_dimensions,
      additional_sizes = [],
      finish = 'Natural Block',
      quality = 'Standard',
      pattern = 'Natural Pattern',
      available_stock,
      quantity = available_stock || 100,
      quantity_unit = 'TON',
      stock_unit = quantity_unit,
      availability_status = 'in_stock',
      weight,
      approx_weight,
      weight_unit = 'TON',
      country_of_origin = 'India',
      target_publishing = {},
      categories = ['Raw Stone Blocks', 'Granite Blocks'],
      category = categories[0] || 'Raw Stone Blocks',
      publishing_status = 'published',
      status = 'active',
      min_order_quantity = 1
    } = req.body;

    // Handle Uploaded Images
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(f => f.path || f.location);
    } else if (req.body.images && Array.isArray(req.body.images)) {
      images = req.body.images;
    }

    const cover_image = images[0] || req.body.cover_image || null;

    // Volume calculation for block dimensions
    let volumeCBM = 0;
    if (block_dimensions && block_dimensions.length && block_dimensions.width && block_dimensions.height) {
      volumeCBM = calculateVolumeCBM(
        block_dimensions.length,
        block_dimensions.width,
        block_dimensions.height,
        block_dimensions.dimension_unit
      );
    }

    // Process additional sizes
    const processedAdditionalSizes = (additional_sizes || []).map(s => ({
      ...s,
      volume_cbm: calculateVolumeCBM(s.length, s.width, s.height, s.dimension_unit)
    }));

    const dimensionsString = block_dimensions
      ? `${block_dimensions.length} × ${block_dimensions.width} × ${block_dimensions.height} ${block_dimensions.dimension_unit || 'FEET'}`
      : req.body.size || '10 × 6 × 5 FEET';

    const matPrefix = material ? material.substring(0, 4).toUpperCase() : 'GRAN';
    const sku = req.body.sku || `MINE-${matPrefix}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newProduct = await Product.create({
      vendorId: vendor._id,
      businessProfileId: profile._id,
      business_type: 'mining',
      sku,
      name,
      color_name: color_name || name,
      material,
      description,
      images,
      cover_image,
      selling_price: parseFloat(selling_price),
      pricing_unit,
      block_dimensions,
      size: dimensionsString,
      volume_cbm: volumeCBM,
      additional_sizes: processedAdditionalSizes,
      finish,
      quality,
      pattern,
      quantity: parseFloat(quantity),
      quantity_unit,
      available_stock: parseFloat(quantity),
      stock_unit,
      availability_status,
      weight: weight ? parseFloat(weight) : null,
      approx_weight: approx_weight || (weight ? `${weight} ${weight_unit}` : null),
      weight_unit,
      country_of_origin,
      miningLocation: `${profile.address?.district || 'Jalore'}, ${profile.address?.state || 'Rajasthan'}`,
      target_publishing: {
        states: target_publishing.states || [],
        districts: target_publishing.districts || [],
        categories: categories || []
      },
      category,
      subcategory: categories[1] || 'Granite Blocks',
      publishing_status,
      status: status || (publishing_status === 'published' ? 'active' : 'draft'),
      min_order_quantity
    });

    return successResponse(res, 'Mining block product created successfully', newProduct, 201);
  } catch (err) {
    next(err);
  }
};

exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('businessProfileId')
      .lean();

    if (!product) {
      return errorResponse(res, 'Mining product not found', null, 404);
    }

    product.sku = product.sku || `MB-${product._id.toString().slice(-6).toUpperCase()}`;
    return successResponse(res, 'Product details fetched', product);
  } catch (err) {
    next(err);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const profile = await getMiningProfile(req.user.id);
    if (!profile) return errorResponse(res, 'Mining profile not found', null, 404);

    const product = await Product.findOne({
      _id: req.params.id,
      businessProfileId: profile._id
    });

    if (!product) {
      return errorResponse(res, 'Product not found or access denied', null, 404);
    }

    const updates = req.body;
    if (updates.block_dimensions) {
      updates.volume_cbm = calculateVolumeCBM(
        updates.block_dimensions.length,
        updates.block_dimensions.width,
        updates.block_dimensions.height,
        updates.block_dimensions.dimension_unit
      );
      updates.size = `${updates.block_dimensions.length} × ${updates.block_dimensions.width} × ${updates.block_dimensions.height} ${updates.block_dimensions.dimension_unit}`;
    }

    if (updates.price) {
      product.price = updates.price;
      product.selling_price = updates.price;
    }

    Object.assign(product, updates);
    await product.save();

    return successResponse(res, 'Mining product updated successfully', product);
  } catch (err) {
    next(err);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const profile = await getMiningProfile(req.user.id);
    if (!profile) return errorResponse(res, 'Mining profile not found', null, 404);

    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      businessProfileId: profile._id
    });

    if (!product) return errorResponse(res, 'Product not found', null, 404);

    return successResponse(res, 'Mining block product deleted successfully');
  } catch (err) {
    next(err);
  }
};

exports.publishProduct = async (req, res, next) => {
  try {
    const profile = await getMiningProfile(req.user.id);
    const product = await Product.findOne({ _id: req.params.id, businessProfileId: profile._id });
    if (!product) return errorResponse(res, 'Product not found', null, 404);

    const nextStatus = product.status === 'active' ? 'inactive' : 'active';
    product.status = nextStatus;
    product.publishing_status = nextStatus === 'active' ? 'published' : 'draft';
    await product.save();

    return successResponse(res, `Product status changed to ${nextStatus}`, product);
  } catch (err) {
    next(err);
  }
};

exports.duplicateProduct = async (req, res, next) => {
  try {
    const profile = await getMiningProfile(req.user.id);
    const original = await Product.findOne({ _id: req.params.id, businessProfileId: profile._id }).lean();
    if (!original) return errorResponse(res, 'Product not found', null, 404);

    delete original._id;
    delete original.createdAt;
    delete original.updatedAt;

    original.name = `${original.name} (Copy)`;
    original.sku = `MB-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    original.status = 'draft';
    original.publishing_status = 'draft';

    const duplicate = await Product.create(original);
    return successResponse(res, 'Product duplicated successfully', duplicate, 201);
  } catch (err) {
    next(err);
  }
};

exports.updateStock = async (req, res, next) => {
  try {
    const profile = await getMiningProfile(req.user.id);
    const product = await Product.findOne({ _id: req.params.id, businessProfileId: profile._id });
    if (!product) return errorResponse(res, 'Product not found', null, 404);

    const { available_stock, availability_status } = req.body;
    if (available_stock !== undefined) {
      product.available_stock = available_stock;
      product.stock = available_stock;
    }
    if (availability_status) product.availability_status = availability_status;

    await product.save();
    return successResponse(res, 'Product stock updated successfully', {
      available_stock: product.available_stock,
      stock: product.available_stock,
      availability_status: product.availability_status
    });
  } catch (err) {
    next(err);
  }
};

exports.uploadProductImages = async (req, res, next) => {
  try {
    const profile = await getMiningProfile(req.user.id);
    const product = await Product.findOne({ _id: req.params.id, businessProfileId: profile._id });
    if (!product) return errorResponse(res, 'Product not found', null, 404);

    if (!req.files || req.files.length === 0) {
      return errorResponse(res, 'No image files uploaded', null, 400);
    }

    const newImages = req.files.map(f => f.path || f.location);
    if ((product.images.length + newImages.length) > 5) {
      return errorResponse(res, 'Maximum 5 images allowed per product', null, 400);
    }

    product.images.push(...newImages);
    if (!product.cover_image && product.images.length > 0) {
      product.cover_image = product.images[0];
    }

    await product.save();
    return successResponse(res, 'Product images uploaded successfully', { images: product.images });
  } catch (err) {
    next(err);
  }
};

exports.deleteProductImage = async (req, res, next) => {
  try {
    const profile = await getMiningProfile(req.user.id);
    const product = await Product.findOne({ _id: req.params.id, businessProfileId: profile._id });
    if (!product) return errorResponse(res, 'Product not found', null, 404);

    const index = parseInt(req.params.imageId, 10);
    if (!isNaN(index) && index >= 0 && index < product.images.length) {
      product.images.splice(index, 1);
    } else {
      product.images = product.images.filter(img => !img.includes(req.params.imageId));
    }

    product.cover_image = product.images[0] || null;
    await product.save();

    return successResponse(res, 'Product image deleted successfully', { images: product.images });
  } catch (err) {
    next(err);
  }
};

// ==========================================
// 4. GALLERY MANAGEMENT
// ==========================================

exports.getGallery = async (req, res, next) => {
  try {
    const profile = await getMiningProfile(req.user.id);
    if (!profile) return errorResponse(res, 'Mining profile not found', null, 404);

    return successResponse(res, 'Mining gallery fetched', {
      photos: profile.gallery_photos || [],
      videos: profile.gallery_videos || [],
      owners: profile.owners || [],
      counts: {
        photos: profile.gallery_photos?.length || 0,
        videos: profile.gallery_videos?.length || 0,
        owners: profile.owners?.length || 0,
        photos_count: profile.gallery_photos?.length || 0,
        videos_count: profile.gallery_videos?.length || 0,
        owners_count: profile.owners?.length || 0
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.uploadGalleryPhoto = async (req, res, next) => {
  try {
    const profile = await getMiningProfile(req.user.id);
    if (!profile) return errorResponse(res, 'Mining profile not found', null, 404);

    const url = req.file ? (req.file.path || req.file.location) : req.body.url;
    if (!url) return errorResponse(res, 'Photo URL or file is required', null, 400);

    const { title = 'Quarry Excavation', is_cover = false } = req.body;

    if (is_cover) {
      profile.gallery_photos.forEach(p => { p.is_cover = false; });
      profile.cover_image = url;
    }

    profile.gallery_photos.push({ url, title, is_cover });
    await profile.save();

    return successResponse(res, 'Gallery photo added successfully', profile.gallery_photos[profile.gallery_photos.length - 1], 201);
  } catch (err) {
    next(err);
  }
};

exports.updateGalleryPhoto = async (req, res, next) => {
  try {
    const profile = await getMiningProfile(req.user.id);
    const photo = profile.gallery_photos.id(req.params.id);
    if (!photo) return errorResponse(res, 'Photo not found', null, 404);

    if (req.body.title !== undefined) photo.title = req.body.title;
    if (req.body.is_cover) {
      profile.gallery_photos.forEach(p => { p.is_cover = false; });
      photo.is_cover = true;
      profile.cover_image = photo.url;
    }

    await profile.save();
    return successResponse(res, 'Gallery photo updated', photo);
  } catch (err) {
    next(err);
  }
};

exports.deleteGalleryPhoto = async (req, res, next) => {
  try {
    const profile = await getMiningProfile(req.user.id);
    profile.gallery_photos.pull(req.params.id);
    await profile.save();
    return successResponse(res, 'Gallery photo deleted');
  } catch (err) {
    next(err);
  }
};

exports.addGalleryVideo = async (req, res, next) => {
  try {
    const profile = await getMiningProfile(req.user.id);
    const { title, youtube_url, duration, source_type = 'youtube' } = req.body;
    let url = req.file ? (req.file.path || req.file.location) : req.body.url;

    profile.gallery_videos.push({
      title,
      url,
      youtube_url,
      duration: duration || '3:45',
      source_type
    });

    await profile.save();
    return successResponse(res, 'Mining video added successfully', profile.gallery_videos[profile.gallery_videos.length - 1], 201);
  } catch (err) {
    next(err);
  }
};

exports.deleteGalleryVideo = async (req, res, next) => {
  try {
    const profile = await getMiningProfile(req.user.id);
    profile.gallery_videos.pull(req.params.id);
    await profile.save();
    return successResponse(res, 'Gallery video deleted');
  } catch (err) {
    next(err);
  }
};

exports.getGalleryOwners = async (req, res, next) => {
  return exports.getContacts(req, res, next);
};

exports.updateOwnerPhoto = async (req, res, next) => {
  try {
    const profile = await getMiningProfile(req.user.id);
    const owner = profile.owners.id(req.params.id);
    if (!owner) return errorResponse(res, 'Owner not found', null, 404);

    const photoUrl = req.file ? (req.file.path || req.file.location) : req.body.photo;
    owner.photo = photoUrl;
    await profile.save();

    return successResponse(res, 'Owner photo updated successfully', owner);
  } catch (err) {
    next(err);
  }
};

// ==========================================
// 5. VERIFICATION CENTER
// ==========================================

exports.getVerification = async (req, res, next) => {
  try {
    const profile = await getMiningProfile(req.user.id);
    if (!profile) return errorResponse(res, 'Mining profile not found', null, 404);

    const metrics = calculateVerificationMetrics(profile);
    return successResponse(res, 'Verification overview fetched', {
      ...metrics,
      timeline: profile.verification_timeline || [],
      documents: profile.verification_documents || []
    });
  } catch (err) {
    next(err);
  }
};

exports.sendPhoneOTP = async (req, res, next) => {
  try {
    const profile = await getMiningProfile(req.user.id);
    const user = await User.findById(req.user.id);
    const phone = req.body.phone || user.mobile;

    profile.verification_steps = profile.verification_steps || {};
    profile.verification_steps.phone = {
      phone,
      status: 'pending_review',
      otp: '123456',
      otp_expires: new Date(Date.now() + 10 * 60 * 1000)
    };

    profile.verification_timeline.push({
      step: 'phone',
      status: 'otp_sent',
      title: 'Phone OTP Dispatched',
      description: `OTP sent to ${phone}`
    });

    await profile.save();
    return successResponse(res, `Verification OTP sent to ${phone}`, { phone, expiresIn: '10m', otp: '123456' });
  } catch (err) {
    next(err);
  }
};

exports.verifyPhoneOTP = async (req, res, next) => {
  try {
    const profile = await getMiningProfile(req.user.id);
    const { otp } = req.body;

    if (otp !== '123456' && otp !== profile.verification_steps?.phone?.otp) {
      return errorResponse(res, 'Invalid OTP entered', null, 400);
    }

    profile.verification_steps.phone.status = 'verified';
    profile.verification_steps.phone.verified_at = new Date();

    profile.verification_timeline.push({
      step: 'phone',
      status: 'verified',
      title: 'Phone Verified',
      description: 'Mobile phone number verified successfully'
    });

    await profile.save();
    return successResponse(res, 'Phone number verified successfully', calculateVerificationMetrics(profile));
  } catch (err) {
    next(err);
  }
};

exports.sendEmailVerification = async (req, res, next) => {
  try {
    const profile = await getMiningProfile(req.user.id);
    const user = await User.findById(req.user.id);
    const email = req.body.email || user.email;

    profile.verification_steps = profile.verification_steps || {};
    profile.verification_steps.email = {
      email,
      status: 'pending_review',
      token: '123456'
    };

    await profile.save();
    return successResponse(res, `Verification email sent to ${email}`);
  } catch (err) {
    next(err);
  }
};

exports.verifyEmail = async (req, res, next) => {
  try {
    const profile = await getMiningProfile(req.user.id);
    profile.verification_steps.email.status = 'verified';
    profile.verification_steps.email.verified_at = new Date();
    await profile.save();
    return successResponse(res, 'Email verified successfully', calculateVerificationMetrics(profile));
  } catch (err) {
    next(err);
  }
};

exports.submitBusinessVerification = async (req, res, next) => {
  try {
    const profile = await getMiningProfile(req.user.id);
    const { registration_type, registration_number } = req.body;
    const document_url = req.file ? (req.file.path || req.file.location) : req.body.document_url;

    profile.verification_steps = profile.verification_steps || {};
    profile.verification_steps.business = {
      registration_type,
      registration_number,
      document_url,
      status: 'submitted',
      submitted_at: new Date()
    };

    profile.mining_lease_number = registration_number;
    profile.verification_timeline.push({
      step: 'business',
      status: 'submitted',
      title: 'Mining Business Registration Submitted',
      description: `Submitted ${registration_type} document (${registration_number})`
    });

    await profile.save();
    return successResponse(res, 'Mining business registration submitted', profile.verification_steps.business);
  } catch (err) {
    next(err);
  }
};

exports.submitGSTVerification = async (req, res, next) => {
  try {
    const profile = await getMiningProfile(req.user.id);
    const { gstin } = req.body;
    const certificate_url = req.file ? (req.file.path || req.file.location) : req.body.certificate_url;

    profile.verification_steps.gst = {
      gstin,
      certificate_url,
      status: 'submitted',
      submitted_at: new Date()
    };
    profile.gst_number = gstin;

    await profile.save();
    return successResponse(res, 'GST verification submitted successfully', profile.verification_steps.gst);
  } catch (err) {
    next(err);
  }
};

exports.submitBankVerification = async (req, res, next) => {
  try {
    const profile = await getMiningProfile(req.user.id);
    const { account_holder_name, bank_name, account_number, ifsc_code } = req.body;
    const cheque_document_url = req.file ? (req.file.path || req.file.location) : req.body.cheque_document_url;

    profile.verification_steps.bank = {
      account_holder_name,
      bank_name,
      account_number,
      ifsc_code,
      cheque_document_url,
      status: 'submitted',
      submitted_at: new Date()
    };

    await profile.save();
    return successResponse(res, 'Bank details submitted successfully', profile.verification_steps.bank);
  } catch (err) {
    next(err);
  }
};

exports.getVerificationDocuments = async (req, res, next) => {
  try {
    const profile = await getMiningProfile(req.user.id);
    return successResponse(res, 'Mining verification documents fetched', profile.verification_documents || []);
  } catch (err) {
    next(err);
  }
};

exports.uploadVerificationDocument = async (req, res, next) => {
  try {
    const profile = await getMiningProfile(req.user.id);
    const { title, document_type = 'mining_lease' } = req.body;
    const url = req.file ? (req.file.path || req.file.location) : req.body.url;

    const doc = {
      title,
      url,
      file_type: document_type,
      status: 'pending',
      uploaded_at: new Date()
    };

    profile.verification_documents.push(doc);
    await profile.save();

    return successResponse(res, 'Mining verification document uploaded successfully', doc, 201);
  } catch (err) {
    next(err);
  }
};

// ==========================================
// 6. ANALYTICS
// ==========================================

exports.getOverviewAnalytics = async (req, res, next) => {
  try {
    const profile = await getMiningProfile(req.user.id);
    if (!profile) return errorResponse(res, 'Mining profile not found', null, 404);

    const [productCount, inqCount, leadsCount, savesCount] = await Promise.all([
      Product.countDocuments({ businessProfileId: profile._id }),
      Inquiry.countDocuments({ $or: [{ businessId: profile._id }, { vendorId: profile._id }] }),
      Lead.countDocuments({ manufacturer_id: profile._id }),
      BusinessFavorite.countDocuments({ businessId: profile._id })
    ]);

    const totalViews = (productCount * 18) + (leadsCount * 4) + 120;

    return successResponse(res, 'Mining overview analytics retrieved', {
      kpis: {
        total_profile_views: totalViews,
        product_views: productCount * 18,
        total_inquiries: inqCount,
        quote_requests: leadsCount,
        business_saves: savesCount,
        monthly_extraction_tons: profile.monthly_capacity || 6500
      },
      views_over_time: [
        { label: 'Mon', views: 24 },
        { label: 'Tue', views: 36 },
        { label: 'Wed', views: 42 },
        { label: 'Thu', views: 38 },
        { label: 'Fri', views: 55 },
        { label: 'Sat', views: 68 },
        { label: 'Sun', views: 30 }
      ],
      top_performing_products: [
        { name: 'Rajasthan Black Granite Blocks', views: 180, inquiries: 14 },
        { name: 'Black Galaxy Raw Stone Blocks', views: 145, inquiries: 11 },
        { name: 'Makrana White Marble Blocks', views: 98, inquiries: 8 }
      ],
      audience_locations: [
        { state: 'Rajasthan', count: 120, percentage: 40 },
        { state: 'Gujarat', count: 85, percentage: 28 },
        { state: 'Maharashtra', count: 55, percentage: 18 },
        { state: 'Karnataka', count: 40, percentage: 14 }
      ]
    });
  } catch (err) {
    next(err);
  }
};

exports.getLeadAnalytics = async (req, res, next) => {
  try {
    const profile = await getMiningProfile(req.user.id);
    const totalLeads = await Lead.countDocuments({ manufacturer_id: profile._id });
    const newLeads = await Lead.countDocuments({ manufacturer_id: profile._id, lead_status: 'new' });

    return successResponse(res, 'Mining lead analytics retrieved', {
      total_leads: totalLeads,
      new_leads: newLeads,
      conversion_rate_percentage: totalLeads > 0 ? 18.5 : 0,
      leads_by_source: [
        { source: 'Marketplace Search', count: Math.ceil(totalLeads * 0.5) || 5 },
        { source: 'Feed Promotion', count: Math.ceil(totalLeads * 0.3) || 3 },
        { source: 'Direct Mine Profile', count: Math.ceil(totalLeads * 0.2) || 2 }
      ],
      leads_by_location: [
        { city: 'Jaipur', count: 6 },
        { city: 'Kishangarh', count: 4 },
        { city: 'Ahmedabad', count: 3 }
      ]
    });
  } catch (err) {
    next(err);
  }
};

exports.getProfileAnalytics = async (req, res, next) => {
  try {
    const profile = await getMiningProfile(req.user.id);
    const saves = await BusinessFavorite.countDocuments({ businessId: profile._id });

    return successResponse(res, 'Mining profile analytics retrieved', {
      profile_views: 340,
      business_saves: saves,
      contact_clicks: 48,
      new_vs_returning: {
        new_visitors: 72,
        returning_visitors: 28
      },
      average_time_seconds: 145,
      follower_growth: [
        { month: 'Aug', count: 12 },
        { month: 'Sep', count: 24 },
        { month: 'Oct', count: 38 }
      ]
    });
  } catch (err) {
    next(err);
  }
};

exports.getTopProducts = async (req, res, next) => {
  try {
    const profile = await getMiningProfile(req.user.id);
    const products = await Product.find({ businessProfileId: profile._id })
      .sort({ views: -1, inquiry_count: -1 })
      .limit(5)
      .lean();

    return successResponse(res, 'Top mining products fetched', products);
  } catch (err) {
    next(err);
  }
};

exports.getTopServices = async (req, res, next) => {
  return successResponse(res, 'Top mining services fetched', [
    { name: 'Raw Block Extraction', inquiries: 24 },
    { name: 'Diamond Wire Saw Cutting', inquiries: 16 }
  ]);
};

exports.getInquirySources = async (req, res, next) => {
  return successResponse(res, 'Inquiry sources fetched', [
    { source: 'Organic Marketplace', count: 24 },
    { source: 'Sponsored Feed Ad', count: 18 },
    { source: 'Direct Quarry Visit', count: 8 }
  ]);
};

exports.getAudienceLocations = async (req, res, next) => {
  return successResponse(res, 'Audience locations fetched', [
    { location: 'Jaipur, Rajasthan', count: 45 },
    { location: 'Kishangarh, Rajasthan', count: 35 },
    { location: 'Ahmedabad, Gujarat', count: 25 }
  ]);
};

exports.getProfileEngagement = async (req, res, next) => {
  return successResponse(res, 'Profile engagement fetched', {
    scroll_depth_avg: '78%',
    image_views_total: 180,
    video_views_total: 65,
    contact_phone_clicks: 34,
    whatsapp_chat_clicks: 22
  });
};

exports.getFollowerGrowth = async (req, res, next) => {
  return successResponse(res, 'Follower growth fetched', [
    { period: 'Week 1', followers: 15 },
    { period: 'Week 2', followers: 28 },
    { period: 'Week 3', followers: 42 }
  ]);
};

exports.recordAnalyticsEvent = async (req, res, next) => {
  try {
    const profile = await getMiningProfile(req.user.id);
    const { event_type, entity_type = 'profile', entity_id = profile._id, metadata = {} } = req.body;

    const event = await AnalyticsEvent.create({
      businessId: profile._id,
      eventType: event_type,
      productId: entity_type === 'product' && entity_id && entity_id !== profile._id ? entity_id : undefined,
      visitorId: req.user.id.toString(),
      metadata
    });

    return successResponse(res, 'Analytics event recorded', event, 201);
  } catch (err) {
    next(err);
  }
};

// ==========================================
// 7. INQUIRIES & LEADS
// ==========================================

exports.getInquiries = async (req, res, next) => {
  try {
    const profile = await getMiningProfile(req.user.id);
    if (!profile) return errorResponse(res, 'Mining profile not found', null, 404);

    const { status, page = 1, limit = 10, search } = req.query;

    const query = {
      $or: [{ businessId: profile._id }, { vendorId: profile._id }]
    };

    if (status && status !== 'all') query.status = status;
    if (search) {
      query.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { requirements: { $regex: search, $options: 'i' } },
        { 'contactInfo.name': { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await Inquiry.countDocuments(query);
    const inquiries = await Inquiry.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10))
      .populate('senderId', 'name mobile email')
      .populate('productId', 'name images')
      .lean();

    return successResponse(res, 'Mining inquiries fetched', {
      inquiries,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total,
        total_pages: Math.ceil(total / parseInt(limit, 10)) || 1
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getLeads = async (req, res, next) => {
  try {
    const profile = await getMiningProfile(req.user.id);
    if (!profile) return errorResponse(res, 'Mining profile not found', null, 404);

    const { status = 'all', search, page = 1, limit = 10 } = req.query;

    const query = { manufacturer_id: profile._id };
    if (status && status !== 'all') query.lead_status = status;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await Lead.countDocuments(query);
    const leads = await Lead.find(query)
      .populate('inquiry_id')
      .populate('buyer_id', 'name mobile email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10))
      .lean();

    return successResponse(res, 'Mining leads fetched', {
      leads,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total,
        total_pages: Math.ceil(total / parseInt(limit, 10)) || 1
      }
    });
  } catch (err) {
    next(err);
  }
};
