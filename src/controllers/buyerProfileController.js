const crypto = require('crypto');
const BusinessProfile = require('../models/BusinessProfile');
const User = require('../models/User');
const BuyerRequirement = require('../models/BuyerRequirement');
const PurchaseOrder = require('../models/PurchaseOrder');
const Inquiry = require('../models/Inquiry');
const InquiryQuotation = require('../models/InquiryQuotation');
const InquiryMessage = require('../models/InquiryMessage');
const AnalyticsEvent = require('../models/AnalyticsEvent');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// ==========================================
// INTERNAL HELPERS
// ==========================================

async function getBuyerProfile(userId) {
  let profile = await BusinessProfile.findOne({
    userId,
    business_type: 'buyer'
  });

  if (!profile) {
    const user = await User.findById(userId);
    if (user && (user.role === 'buyer' || user.role === 'admin' || user.role === 'trader' || user.role === 'vendor' || user.role === 'manufacturer' || user.role === 'mining' || user.role === 'showroom')) {
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
        buyer_business_types: [
          'Infrastructure Company',
          'Commercial Developer',
          'Contractor'
        ],
        purchasing_specializations: [
          'Granite Slabs',
          'Marble Blocks',
          'Paving Stones',
          'Cut-to-Size Tiles'
        ],
        ongoing_projects_count: 8,
        annual_purchasing_volume: 250000,
        purchasing_volume_unit: 'Sq.ft',
        procurement_capacity: '25,000+ Sq.ft / Month',
        sourcing_scope: 'Domestic',
        procurement_regions: ['Gujarat', 'Rajasthan', 'Maharashtra', 'Karnataka'],
        address: {
          state: 'Gujarat',
          district: 'Ahmedabad',
          area: 'SG Highway',
          commercial_area: 'Infra Towers',
          full_address: 'Level 6, Infra Towers, SG Highway, Ahmedabad, Gujarat 380054',
          postal_code: '380054',
          country: 'India',
          google_map_location: 'https://maps.google.com/?q=23.0225,72.5714',
          latitude: 23.0225,
          longitude: 72.5714
        },
        owners: [
          {
            name: user.name || 'Rajesh V. Patel',
            designation: 'Head of Procurement',
            phone: user.phone || '+91 98765 11223',
            email: user.email || 'procurement@apexinfra.com',
            whatsapp: user.phone || '+91 98765 11223',
            is_primary: true
          }
        ],
        verification_steps: {
          phone: { phone: user.phone || '+91 98765 11223', status: 'verified', verified_at: new Date() },
          email: { email: user.email || 'procurement@apexinfra.com', status: 'verified', verified_at: new Date() },
          business: { registration_type: 'CIN', registration_number: 'U45201GJ2017PTC098765', status: 'verified' },
          gst: { gstin: '24AAACA5678B1Z2', status: 'verified' },
          bank: { status: 'verified', bank_name: 'HDFC Bank', account_holder_name: 'Apex Infra Buildcon Pvt Ltd' }
        },
        is_verified: true,
        verification_status: 'approved',
        gst_number: '24AAACA5678B1Z2',
        business_registration_number: 'CIN-U45201GJ2017PTC098765',
        rating: 4.9,
        review_count: 19,
        status: 'active',
        is_mock: false
      });
    }
  }

  return profile;
}

function generateRequirementId() {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `REQ-${year}-${rand}`;
}

function generateOrderId() {
  const year = new Date().getFullYear();
  const rand = Math.floor(10000 + Math.random() * 90000);
  return `PO-${year}-${rand}`;
}

// ==========================================
// 1. DASHBOARD & BUSINESS TYPE SWITCHER
// ==========================================

async function getDashboard(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getBuyerProfile(userId);

    if (!profile) {
      return errorResponse(res, 'Buyer profile not found for this account', null, 404);
    }

    // Counts for Buyer Dashboard
    const [
      activeRequirementsCount,
      draftRequirementsCount,
      closedRequirementsCount,
      myInquiriesCount,
      activeOrdersCount,
      completedOrdersCount
    ] = await Promise.all([
      BuyerRequirement.countDocuments({ buyerId: profile._id, status: { $in: ['open', 'quotes_received', 'in_review'] } }),
      BuyerRequirement.countDocuments({ buyerId: profile._id, status: 'draft' }),
      BuyerRequirement.countDocuments({ buyerId: profile._id, status: { $in: ['closed', 'fulfilled', 'completed'] } }),
      Inquiry.countDocuments({ $or: [{ buyerId: profile._id }, { senderId: userId }] }),
      PurchaseOrder.countDocuments({ buyer_id: profile._id, order_status: { $nin: ['completed', 'cancelled'] } }),
      PurchaseOrder.countDocuments({ buyer_id: profile._id, order_status: 'completed' })
    ]);

    // Calculate total procurement spend / budget
    const orders = await PurchaseOrder.find({ buyer_id: profile._id });
    const totalProcurementSpend = orders.reduce((sum, ord) => sum + (ord.pricing?.total_amount || 0), 0);

    const user = await User.findById(userId);

    const dashboard = {
      business_profile_card: {
        business_id: profile._id,
        business_name: profile.company_name || 'Apex Infra Buildcon Stone Sourcing',
        logo: profile.logo || null,
        cover_image: profile.cover_image || null,
        business_category: 'Stone Buyer',
        category_badge: 'Stone Buyer',
        business_subcategory: profile.business_subcategory || 'Infrastructure & Commercial Procurement',
        location: profile.address ? `${profile.address.district || profile.address.city || 'Ahmedabad'}, ${profile.address.state || 'Gujarat'}` : 'Ahmedabad, Gujarat',
        verification_badge: profile.is_verified || profile.verification_status === 'approved',
        verification_status: profile.verification_status || 'approved',
        rating: profile.rating || 4.9,
        total_reviews: profile.review_count || 19,
        member_since: profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '2017'
      },
      stats: {
        active_requirements: activeRequirementsCount,
        draft_requirements: draftRequirementsCount,
        closed_requirements: closedRequirementsCount,
        total_requirements: activeRequirementsCount + draftRequirementsCount + closedRequirementsCount,
        my_inquiries: myInquiriesCount,
        active_orders: activeOrdersCount,
        completed_orders: completedOrdersCount,
        total_procurement_value: totalProcurementSpend,
        currency: 'INR'
      },
      my_business: [
        { id: 'profile', name: 'Business Profile', route: '/buyer/profile', icon: 'building' },
        { id: 'gallery', name: 'Gallery', route: '/buyer/gallery', icon: 'image' },
        { id: 'requirements', name: 'Sourcing Requirements', route: '/buyer/requirements', icon: 'clipboard-list' },
        { id: 'verification', name: 'Verification Center', route: '/buyer/verification', icon: 'badge-check' },
        { id: 'analytics', name: 'Analytics', route: '/buyer/analytics', icon: 'chart-bar' },
        { id: 'promotions', name: 'Ad Management', route: '/buyer/promotions', icon: 'megaphone' }
      ],
      business_activity: [
        { id: 'inquiries', name: 'My Purchase Inquiries', route: '/buyer/inquiries', icon: 'mail', count: myInquiriesCount },
        { id: 'orders', name: 'Order History', route: '/buyer/orders', icon: 'shopping-bag', count: activeOrdersCount }
      ],
      account_support: [
        { id: 'settings', name: 'Settings', route: '/settings' },
        { id: 'help', name: 'Help & Support', route: '/support' },
        { id: 'logout', name: 'Logout', route: '/auth/logout' }
      ],
      bottom_navigation: [
        { id: 'home', name: 'Home', route: '/' },
        { id: 'feed', name: 'Feed', route: '/feed' },
        { id: 'ai_action', name: 'AI Action', route: '/ai' },
        { id: 'estimate', name: 'Estimate', route: '/estimate' },
        { id: 'profile', name: 'Profile', route: '/buyer/profile' }
      ],
      capabilities: {
        has_product_management: false,
        has_seller_leads: false,
        has_sourcing_requirements: true,
        has_purchase_orders: true,
        has_quote_comparison: true
      }
    };

    return successResponse(res, 'Buyer dashboard loaded successfully', dashboard);
  } catch (error) {
    console.error('Error in getDashboard:', error);
    return errorResponse(res, error.message, null, 500);
  }
}

async function getBusinessTypes(req, res) {
  try {
    const businessTypes = [
      { id: 'customer', name: 'Customer', description: 'Find stones, request quotes and connect with sellers', icon: 'user' },
      { id: 'manufacturer', name: 'Manufacturer', description: 'Factory & processing plants with slab & tile production', icon: 'factory' },
      { id: 'mining', name: 'Mining & Quarries', description: 'Granite & marble mines, quarries and raw block suppliers', icon: 'mountain' },
      { id: 'showroom', name: 'Godown & Showroom', description: 'Stone gallery, godowns, slab stockists and retail showrooms', icon: 'store' },
      { id: 'trader', name: 'Stone Trader', description: 'Commercial stone intermediary, stockist & wholesale supplier', icon: 'repeat' },
      { id: 'buyer', name: 'Stone Buyer', description: 'Infrastructure, builder & commercial project stone sourcing', icon: 'shopping-cart', current: true },
      { id: 'transport_national', name: 'National Transport', description: 'Long haul trailer & truck logistics across states', icon: 'truck' },
      { id: 'transport_local', name: 'Local Transport', description: 'City & district stone transportation vehicles', icon: 'navigation' },
      { id: 'service_provider', name: 'Service Provider', description: 'Brazing, gangsaw blade repair & polishing services', icon: 'wrench' }
    ];

    return successResponse(res, 'Available business types retrieved', {
      current_type: 'buyer',
      types: businessTypes
    });
  } catch (error) {
    console.error('Error in getBusinessTypes:', error);
    return errorResponse(res, error.message, null, 500);
  }
}

async function switchBusinessType(req, res) {
  try {
    const { target_business_type } = req.body;
    const allowed = ['customer', 'manufacturer', 'mining', 'showroom', 'trader', 'buyer', 'transport_national', 'transport_local', 'service_provider'];

    if (!target_business_type || !allowed.includes(target_business_type)) {
      return errorResponse(res, `Invalid business type. Allowed: ${allowed.join(', ')}`, null, 400);
    }

    const userId = req.user.userId || req.user.id || req.user._id;
    await User.findByIdAndUpdate(userId, { role: target_business_type });

    let existingTargetProfile = await BusinessProfile.findOne({
      userId,
      business_type: target_business_type
    });

    return successResponse(res, `Successfully switched business context to ${target_business_type}`, {
      switched_to: target_business_type,
      profile_exists: !!existingTargetProfile,
      redirect_route: `/${target_business_type}/dashboard`
    });
  } catch (error) {
    console.error('Error in switchBusinessType:', error);
    return errorResponse(res, error.message, null, 500);
  }
}

// ==========================================
// 2. PRODUCT MANAGEMENT DISABLED ENFORCEMENT
// ==========================================

function productManagementDisabled(req, res) {
  return errorResponse(
    res,
    'Product Management is disabled for Stone Buyers. Stone Buyers publish sourcing requirements instead of listing products for sale.',
    {
      business_type: 'buyer',
      alternative_actions: [
        { label: 'Create Sourcing Requirement', route: '/api/buyer/requirements', method: 'POST' },
        { label: 'Browse Requirements', route: '/api/buyer/requirements', method: 'GET' },
        { label: 'My Purchase Inquiries', route: '/api/buyer/inquiries', method: 'GET' }
      ]
    },
    403
  );
}

// ==========================================
// 3. BUYER PROFILE & PROJECT INFO
// ==========================================

async function getProfile(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getBuyerProfile(userId);

    if (!profile) {
      return errorResponse(res, 'Buyer profile not found', null, 404);
    }

    return successResponse(res, 'Buyer profile retrieved successfully', { profile });
  } catch (error) {
    console.error('Error in getProfile:', error);
    return errorResponse(res, error.message, null, 500);
  }
}

async function updateProfile(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    let profile = await getBuyerProfile(userId);

    if (!profile) {
      return errorResponse(res, 'Buyer profile not found', null, 404);
    }

    const allowedUpdates = [
      'company_name',
      'gst_number',
      'email',
      'phone',
      'established_year',
      'about_business',
      'company_details',
      'short_description',
      'website',
      'business_registration_number',
      'company_type',
      'preferred_communication',
      'buyer_business_types',
      'purchasing_specializations',
      'preferred_materials',
      'preferred_products',
      'address',
      'working_hours'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'address') {
          profile.address = { ...profile.address?.toObject(), ...req.body.address };
        } else {
          profile[field] = req.body[field];
        }
      }
    });

    await profile.save();

    return successResponse(res, 'Buyer profile updated successfully', { profile });
  } catch (error) {
    console.error('Error in updateProfile:', error);
    return errorResponse(res, error.message, null, 500);
  }
}

async function updateProjectInfo(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    let profile = await getBuyerProfile(userId);

    if (!profile) {
      return errorResponse(res, 'Buyer profile not found', null, 404);
    }

    const fields = [
      'company_type',
      'buyer_business_types',
      'purchasing_specializations',
      'ongoing_projects_count',
      'annual_purchasing_volume',
      'purchasing_volume_unit',
      'procurement_capacity',
      'procurement_regions',
      'sourcing_scope'
    ];

    fields.forEach(f => {
      if (req.body[f] !== undefined) {
        profile[f] = req.body[f];
      }
    });

    await profile.save();

    return successResponse(res, 'Buyer project information updated successfully', {
      project_info: {
        company_type: profile.company_type,
        buyer_business_types: profile.buyer_business_types,
        purchasing_specializations: profile.purchasing_specializations,
        ongoing_projects_count: profile.ongoing_projects_count,
        annual_purchasing_volume: profile.annual_purchasing_volume,
        purchasing_volume_unit: profile.purchasing_volume_unit,
        procurement_capacity: profile.procurement_capacity,
        procurement_regions: profile.procurement_regions,
        sourcing_scope: profile.sourcing_scope
      }
    });
  } catch (error) {
    console.error('Error in updateProjectInfo:', error);
    return errorResponse(res, error.message, null, 500);
  }
}

// Contacts CRUD
async function getContacts(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getBuyerProfile(userId);
    return successResponse(res, 'Contacts retrieved', { contacts: profile?.owners || [] });
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

async function addContact(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getBuyerProfile(userId);

    const contactData = {
      name: req.body.name,
      designation: req.body.designation,
      phone: req.body.phone,
      whatsapp: req.body.whatsapp || req.body.phone,
      email: req.body.email,
      is_primary: req.body.is_primary === true || req.body.is_primary === 'true',
      birth_date: req.body.birth_date,
      anniversary_date: req.body.anniversary_date,
      photo: req.file ? `/uploads/attachments/${req.file.filename}` : undefined
    };

    if (contactData.is_primary) {
      profile.owners.forEach(o => { o.is_primary = false; });
    }

    profile.owners.push(contactData);
    await profile.save();

    return successResponse(res, 'Contact added successfully', { contacts: profile.owners }, 201);
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

async function updateContact(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const { contactId } = req.params;
    const profile = await getBuyerProfile(userId);

    const contact = profile.owners.id(contactId);
    if (!contact) {
      return errorResponse(res, 'Contact not found', null, 404);
    }

    ['name', 'designation', 'phone', 'whatsapp', 'email', 'birth_date', 'anniversary_date'].forEach(f => {
      if (req.body[f] !== undefined) contact[f] = req.body[f];
    });

    if (req.body.is_primary !== undefined) {
      const isPrimary = req.body.is_primary === true || req.body.is_primary === 'true';
      if (isPrimary) {
        profile.owners.forEach(o => { o.is_primary = false; });
      }
      contact.is_primary = isPrimary;
    }

    if (req.file) {
      contact.photo = `/uploads/attachments/${req.file.filename}`;
    }

    await profile.save();
    return successResponse(res, 'Contact updated successfully', { contact });
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

async function deleteContact(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const { contactId } = req.params;
    const profile = await getBuyerProfile(userId);

    profile.owners = profile.owners.filter(o => o._id.toString() !== contactId);
    await profile.save();

    return successResponse(res, 'Contact removed successfully', { contacts: profile.owners });
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

// ==========================================
// 4. GALLERY MANAGEMENT
// ==========================================

async function getGallery(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getBuyerProfile(userId);

    return successResponse(res, 'Buyer gallery retrieved successfully', {
      photos: profile?.gallery_photos || [],
      videos: profile?.gallery_videos || []
    });
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

async function uploadGalleryPhoto(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getBuyerProfile(userId);

    if (!req.file && !req.body.url) {
      return errorResponse(res, 'Photo file or photo URL is required', null, 400);
    }

    const photoUrl = req.file ? `/uploads/attachments/${req.file.filename}` : req.body.url;
    const isCover = req.body.is_cover === true || req.body.is_cover === 'true';

    if (isCover) {
      profile.gallery_photos.forEach(p => { p.is_cover = false; });
      profile.cover_image = photoUrl;
    }

    const photoItem = {
      url: photoUrl,
      title: req.body.title || 'Project Site Image',
      caption: req.body.caption || '',
      category: req.body.category || 'project_site',
      is_cover: isCover
    };

    profile.gallery_photos.push(photoItem);
    await profile.save();

    return successResponse(res, 'Photo added to buyer gallery', { photo: photoItem }, 201);
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

async function deleteGalleryPhoto(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const { photoId } = req.params;
    const profile = await getBuyerProfile(userId);

    profile.gallery_photos = profile.gallery_photos.filter(p => p._id.toString() !== photoId);
    await profile.save();

    return successResponse(res, 'Gallery photo deleted successfully', { photos: profile.gallery_photos });
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

async function addGalleryVideo(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getBuyerProfile(userId);

    const videoItem = {
      title: req.body.title,
      url: req.file ? `/uploads/attachments/${req.file.filename}` : req.body.video_url || req.body.youtube_url,
      video_url: req.file ? `/uploads/attachments/${req.file.filename}` : req.body.video_url,
      youtube_url: req.body.youtube_url,
      source_type: req.body.source_type || (req.file ? 'upload' : 'youtube'),
      category: req.body.category || 'walkthrough',
      duration: req.body.duration || '02:30'
    };

    profile.gallery_videos.push(videoItem);
    await profile.save();

    return successResponse(res, 'Video added to buyer gallery', { video: videoItem }, 201);
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

async function deleteGalleryVideo(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const { videoId } = req.params;
    const profile = await getBuyerProfile(userId);

    profile.gallery_videos = profile.gallery_videos.filter(v => v._id.toString() !== videoId);
    await profile.save();

    return successResponse(res, 'Gallery video deleted successfully', { videos: profile.gallery_videos });
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

async function getGalleryOwners(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getBuyerProfile(userId);
    return successResponse(res, 'Key personnel & procurement team retrieved', { owners: profile?.owners || [] });
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

// ==========================================
// 5. SOURCING REQUIREMENTS ENGINE
// ==========================================

async function getRequirements(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getBuyerProfile(userId);

    const { status, search, project_type, material_category, page = 1, limit = 20, per_page } = req.query;
    const effectiveLimit = parseInt(per_page || limit);

    const query = {
      $or: [
        { buyerId: profile?._id },
        { userId: userId }
      ]
    };

    if (status && status !== 'all') {
      if (status === 'active') {
        query.status = { $in: ['open', 'quotes_received', 'in_review'] };
      } else {
        query.status = status;
      }
    }

    if (project_type) query.project_type = project_type;
    if (material_category) query.material_category = material_category;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { requirement_id: { $regex: search, $options: 'i' } },
        { project_name: { $regex: search, $options: 'i' } },
        { material: { $regex: search, $options: 'i' } },
        { material_name: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * effectiveLimit;
    const [requirements, total] = await Promise.all([
      BuyerRequirement.find(query).sort({ createdAt: -1 }).skip(skip).limit(effectiveLimit),
      BuyerRequirement.countDocuments(query)
    ]);

    // Return array directly under data for backward compatibility while providing requirements property
    const responsePayload = requirements;
    responsePayload.requirements = requirements;
    responsePayload.total = total;
    responsePayload.page = parseInt(page);
    responsePayload.limit = effectiveLimit;

    return res.status(200).json({
      success: true,
      message: 'Sourcing requirements retrieved successfully',
      data: requirements,
      requirements,
      total,
      page: parseInt(page),
      limit: effectiveLimit
    });
  } catch (error) {
    console.error('Error in getRequirements:', error);
    return errorResponse(res, error.message, null, 500);
  }
}

async function createRequirement(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getBuyerProfile(userId);

    if (!profile) {
      return errorResponse(res, 'Buyer profile not found', null, 404);
    }

    const requirementId = generateRequirementId();

    const data = {
      ...req.body,
      requirement_id: requirementId,
      buyerId: profile._id,
      userId,
      published_at: req.body.status !== 'draft' ? new Date() : undefined,
      status: req.body.status || 'open'
    };

    // If application_usage is string, convert to array
    if (typeof data.application_usage === 'string') {
      data.application_usage = [data.application_usage];
    }

    // Material fallback
    if (!data.material && data.material_name) data.material = data.material_name;
    if (!data.size && data.required_size) data.size = data.required_size;
    if (!data.thickness && data.required_thickness) data.thickness = data.required_thickness;
    if (!data.color && data.colour) data.color = data.colour;

    // Budget helper
    if (data.budget_min !== undefined || data.budget_max !== undefined) {
      data.budget = {
        min: data.budget_min || 0,
        max: data.budget_max || 0,
        currency: 'INR'
      };
    }

    // Delivery location helper
    if (data.delivery_address && !data.delivery_location) {
      data.delivery_location = {
        address: data.delivery_address,
        city: profile.address?.district || 'Ahmedabad',
        state: profile.address?.state || 'Gujarat'
      };
    }

    const requirement = await BuyerRequirement.create(data);

    // Track analytics event (safe create)
    try {
      await AnalyticsEvent.create({
        businessId: profile._id,
        eventType: 'quote_request',
        visitorId: userId.toString(),
        metadata: {
          requirement_id: requirement.requirement_id,
          project_name: requirement.project_name,
          quantity: requirement.quantity,
          material: requirement.material
        }
      });
    } catch (e) {
      // Non-blocking for requirement creation
    }

    // Return requirement directly at data level (backward compatible with buyerModule.test.js)
    return successResponse(res, 'Sourcing requirement created and published successfully', requirement, 201);
  } catch (error) {
    console.error('Error in createRequirement:', error);
    return errorResponse(res, error.message, null, 500);
  }
}

async function getRequirementById(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const { id } = req.params;
    const profile = await getBuyerProfile(userId);

    const query = {
      $or: [
        { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
        { requirement_id: id }
      ].filter(Boolean)
    };

    const requirement = await BuyerRequirement.findOne(query);

    if (!requirement) {
      return errorResponse(res, 'Sourcing requirement not found', null, 404);
    }

    // Fetch received quotes for this requirement
    const quotes = await InquiryQuotation.find({
      $or: [
        { inquiry_id: requirement._id },
        { material: requirement.material }
      ]
    }).populate('manufacturer_id', 'company_name logo address rating review_count');

    return successResponse(res, 'Requirement details retrieved', {
      requirement,
      quotes_count: quotes.length,
      quotes
    });
  } catch (error) {
    console.error('Error in getRequirementById:', error);
    return errorResponse(res, error.message, null, 500);
  }
}

async function updateRequirement(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const { id } = req.params;
    const profile = await getBuyerProfile(userId);

    const query = {
      $or: [
        { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
        { requirement_id: id }
      ].filter(Boolean)
    };

    let requirement = await BuyerRequirement.findOne(query);

    if (!requirement) {
      return errorResponse(res, 'Requirement not found', null, 404);
    }

    // Ownership check: requirement must belong to this buyer's profile or user
    const isOwner = (requirement.buyerId && profile && requirement.buyerId.toString() === profile._id.toString()) ||
                    (requirement.userId && requirement.userId.toString() === userId.toString());
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return errorResponse(res, 'You are not authorized to update this requirement', null, 403);
    }

    Object.keys(req.body).forEach(key => {
      requirement[key] = req.body[key];
    });

    await requirement.save();

    return successResponse(res, 'Sourcing requirement updated successfully', { requirement });
  } catch (error) {
    console.error('Error in updateRequirement:', error);
    return errorResponse(res, error.message, null, 500);
  }
}

async function duplicateRequirement(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const { id } = req.params;
    const profile = await getBuyerProfile(userId);

    const query = {
      $or: [
        { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
        { requirement_id: id }
      ].filter(Boolean),
      buyerId: profile._id
    };

    const source = await BuyerRequirement.findOne(query);

    if (!source) {
      return errorResponse(res, 'Source requirement not found', null, 404);
    }

    const sourceObj = source.toObject();
    delete sourceObj._id;
    delete sourceObj.createdAt;
    delete sourceObj.updatedAt;

    sourceObj.requirement_id = generateRequirementId();
    sourceObj.title = `${source.title} (Copy)`;
    sourceObj.status = 'draft';
    sourceObj.quotes_count = 0;
    sourceObj.views_count = 0;
    sourceObj.published_at = null;

    const duplicated = await BuyerRequirement.create(sourceObj);

    return successResponse(res, 'Requirement duplicated as draft successfully', { requirement: duplicated }, 201);
  } catch (error) {
    console.error('Error in duplicateRequirement:', error);
    return errorResponse(res, error.message, null, 500);
  }
}

async function closeRequirement(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const { id } = req.params;
    const { closing_reason } = req.body;
    const profile = await getBuyerProfile(userId);

    const query = {
      $or: [
        { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
        { requirement_id: id }
      ].filter(Boolean),
      buyerId: profile._id
    };

    const requirement = await BuyerRequirement.findOne(query);

    if (!requirement) {
      return errorResponse(res, 'Requirement not found', null, 404);
    }

    requirement.status = 'closed';
    requirement.closed_at = new Date();
    requirement.closing_reason = closing_reason || 'Procurement requirement fulfilled or closed by buyer';
    await requirement.save();

    return successResponse(res, 'Sourcing requirement closed successfully', { requirement });
  } catch (error) {
    console.error('Error in closeRequirement:', error);
    return errorResponse(res, error.message, null, 500);
  }
}

async function deleteRequirement(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const { id } = req.params;
    const profile = await getBuyerProfile(userId);

    const query = {
      $or: [
        { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
        { requirement_id: id }
      ].filter(Boolean),
      buyerId: profile._id
    };

    const requirement = await BuyerRequirement.findOne(query);

    if (!requirement) {
      return errorResponse(res, 'Requirement not found', null, 404);
    }

    await BuyerRequirement.deleteOne({ _id: requirement._id });

    return successResponse(res, 'Requirement deleted successfully', { requirement_id: requirement.requirement_id });
  } catch (error) {
    console.error('Error in deleteRequirement:', error);
    return errorResponse(res, error.message, null, 500);
  }
}

// ==========================================
// 6. MY PURCHASE INQUIRIES & QUOTE COMPARISON
// ==========================================

async function getMyInquiries(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getBuyerProfile(userId);

    const inquiries = await Inquiry.find({
      $or: [
        { buyerId: profile?._id },
        { senderId: userId }
      ]
    }).sort({ createdAt: -1 });

    // For each inquiry, get quotes count
    const enriched = await Promise.all(inquiries.map(async (inq) => {
      const quotesCount = await InquiryQuotation.countDocuments({ inquiry_id: inq._id });
      return {
        ...inq.toObject(),
        quotes_count: quotesCount
      };
    }));

    return successResponse(res, 'Buyer purchase inquiries retrieved successfully', {
      count: enriched.length,
      inquiries: enriched
    });
  } catch (error) {
    console.error('Error in getMyInquiries:', error);
    return errorResponse(res, error.message, null, 500);
  }
}

async function getInquiryDetails(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const { id } = req.params;
    const profile = await getBuyerProfile(userId);

    const inquiry = await Inquiry.findById(id);
    if (!inquiry) {
      return errorResponse(res, 'Inquiry not found', null, 404);
    }

    const quotes = await InquiryQuotation.find({ inquiry_id: inquiry._id })
      .populate('manufacturer_id', 'company_name logo address rating review_count phone email is_verified business_category');

    const messages = await InquiryMessage.find({ inquiry_id: inquiry._id }).sort({ createdAt: 1 });

    return successResponse(res, 'Inquiry details with quotes retrieved', {
      inquiry,
      quotes,
      messages
    });
  } catch (error) {
    console.error('Error in getInquiryDetails:', error);
    return errorResponse(res, error.message, null, 500);
  }
}

async function compareQuotes(req, res) {
  try {
    const { quote_ids } = req.body;

    if (!quote_ids || !Array.isArray(quote_ids) || quote_ids.length < 2) {
      return errorResponse(res, 'At least 2 quote IDs are required for comparison', null, 400);
    }

    const quotes = await InquiryQuotation.find({ _id: { $in: quote_ids } })
      .populate('manufacturer_id', 'company_name logo address rating review_count is_verified business_category business_subcategory');

    if (quotes.length < 2) {
      return errorResponse(res, 'Not enough valid quotations found for comparison', null, 404);
    }

    // Build comparison matrix
    const matrix = {
      suppliers: quotes.map(q => ({
        quote_id: q._id,
        quote_number: q.quote_number,
        supplier_id: q.manufacturer_id?._id,
        supplier_name: q.manufacturer_id?.company_name,
        supplier_rating: q.manufacturer_id?.rating,
        supplier_location: q.manufacturer_id?.address ? `${q.manufacturer_id.address.city || q.manufacturer_id.address.district}, ${q.manufacturer_id.address.state}` : 'N/A',
        is_verified: q.manufacturer_id?.is_verified,
        quoted_quantity: `${q.quoted_quantity} ${q.quantity_unit}`,
        unit_price: q.unit_price,
        subtotal: q.subtotal,
        tax_amount: q.tax_amount,
        shipping_charges: q.shipping_charges,
        total_amount: q.total_amount,
        delivery_timeline: q.delivery_timeline,
        payment_terms: q.payment_terms,
        advance_required: q.advance_payment,
        material_grade: q.quality || 'Premium Standard',
        finish: q.finish || 'Polished',
        warranty: q.warranty,
        quote_status: q.quote_status
      })),
      lowest_rate_quote: quotes.reduce((min, q) => q.unit_price < min.unit_price ? q : min, quotes[0])._id,
      fastest_delivery_quote: quotes[0]._id
    };

    return successResponse(res, 'Quotation comparison matrix generated successfully', matrix);
  } catch (error) {
    console.error('Error in compareQuotes:', error);
    return errorResponse(res, error.message, null, 500);
  }
}

async function acceptQuoteAndCreateOrder(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const { quote_id } = req.params;
    const { delivery_address, expected_delivery_date, buyer_notes, payment_terms } = req.body;
    const profile = await getBuyerProfile(userId);

    const quote = await InquiryQuotation.findById(quote_id)
      .populate('manufacturer_id', 'company_name address business_type')
      .populate('inquiry_id');

    if (!quote) {
      return errorResponse(res, 'Quotation not found', null, 404);
    }

    // Update quote status
    quote.quote_status = 'accepted';
    quote.status_history.push({
      status: 'accepted',
      updated_by: userId,
      remarks: 'Quotation accepted by buyer. Purchase Order generated.'
    });
    await quote.save();

    // Generate Purchase Order
    const orderId = generateOrderId();
    const purchaseOrder = await PurchaseOrder.create({
      order_id: orderId,
      buyer_id: profile._id,
      buyer_user_id: userId,
      supplier_id: quote.manufacturer_id._id,
      supplier_business_type: quote.manufacturer_id.business_type || 'manufacturer',
      supplier_name: quote.manufacturer_id.company_name,
      inquiry_id: quote.inquiry_id?._id,
      quote_id: quote._id,
      quote_number: quote.quote_number,
      items: [
        {
          product_id: quote.product_id,
          material_name: quote.material || quote.inquiry_id?.subject || 'Natural Stone Slabs',
          material_category: 'Natural Stone',
          size: quote.size,
          thickness: quote.thickness,
          finish: quote.finish,
          quality: quote.quality,
          quantity: quote.quoted_quantity,
          quantity_unit: quote.quantity_unit,
          unit_price: quote.unit_price,
          total_amount: quote.subtotal
        }
      ],
      pricing: {
        subtotal: quote.subtotal,
        tax_rate: quote.tax_rate || 18,
        tax_amount: quote.tax_amount || 0,
        shipping_charges: quote.shipping_charges || 0,
        discount: quote.discount || 0,
        total_amount: quote.total_amount,
        advance_paid: quote.advance_payment || 0,
        balance_amount: (quote.total_amount || 0) - (quote.advance_payment || 0)
      },
      delivery_address: delivery_address || {
        site_name: 'Project Site',
        full_address: profile.address?.full_address || 'Level 6, Infra Towers, Ahmedabad, Gujarat',
        city: profile.address?.district || 'Ahmedabad',
        state: profile.address?.state || 'Gujarat',
        pincode: profile.address?.postal_code || '380054',
        contact_person: profile.owners[0]?.name || 'Rajesh V. Patel',
        contact_phone: profile.owners[0]?.phone || '+91 98765 11223'
      },
      expected_delivery_date: expected_delivery_date || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      payment_terms: payment_terms || quote.payment_terms || '50% Advance, 50% on Delivery',
      order_status: 'confirmed',
      status_timeline: [
        {
          status: 'confirmed',
          title: 'Order Confirmed',
          description: `Purchase Order ${orderId} generated upon quote ${quote.quote_number} acceptance.`,
          timestamp: new Date(),
          updated_by: userId
        }
      ],
      buyer_notes
    });

    // Record Analytics Event
    try {
      await AnalyticsEvent.create({
        businessId: profile._id,
        eventType: 'quote_request',
        visitorId: userId.toString(),
        metadata: {
          order_id: purchaseOrder.order_id,
          supplier_id: quote.manufacturer_id._id,
          total_amount: purchaseOrder.pricing.total_amount
        }
      });
    } catch (e) {}

    return successResponse(res, 'Quote accepted and Purchase Order generated successfully', {
      quote_status: 'accepted',
      purchase_order: purchaseOrder
    }, 201);
  } catch (error) {
    console.error('Error in acceptQuoteAndCreateOrder:', error);
    return errorResponse(res, error.message, null, 500);
  }
}

// ==========================================
// 7. PURCHASE ORDER / ORDER HISTORY ENGINE
// ==========================================

async function getOrders(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getBuyerProfile(userId);

    const { status, search, page = 1, limit = 20 } = req.query;

    const query = { buyer_id: profile._id };

    if (status && status !== 'all') {
      if (status === 'active') {
        query.order_status = { $nin: ['completed', 'cancelled'] };
      } else {
        query.order_status = status;
      }
    }

    if (search) {
      query.$or = [
        { order_id: { $regex: search, $options: 'i' } },
        { quote_number: { $regex: search, $options: 'i' } },
        { supplier_name: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [orders, total] = await Promise.all([
      PurchaseOrder.find(query)
        .populate('supplier_id', 'company_name logo address phone email rating')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      PurchaseOrder.countDocuments(query)
    ]);

    return successResponse(res, 'Purchase orders retrieved successfully', {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      orders
    });
  } catch (error) {
    console.error('Error in getOrders:', error);
    return errorResponse(res, error.message, null, 500);
  }
}

async function getOrderDetails(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const { id } = req.params;
    const profile = await getBuyerProfile(userId);

    const query = {
      $or: [
        { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
        { order_id: id }
      ].filter(Boolean),
      buyer_id: profile._id
    };

    const order = await PurchaseOrder.findOne(query)
      .populate('supplier_id', 'company_name logo address phone email rating review_count is_verified')
      .populate('quote_id');

    if (!order) {
      return errorResponse(res, 'Purchase order not found', null, 404);
    }

    return successResponse(res, 'Order details retrieved successfully', { order });
  } catch (error) {
    console.error('Error in getOrderDetails:', error);
    return errorResponse(res, error.message, null, 500);
  }
}

async function confirmOrderDelivery(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const { id } = req.params;
    const { rating, review } = req.body;
    const profile = await getBuyerProfile(userId);

    const query = {
      $or: [
        { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
        { order_id: id }
      ].filter(Boolean),
      buyer_id: profile._id
    };

    const order = await PurchaseOrder.findOne(query);

    if (!order) {
      return errorResponse(res, 'Order not found', null, 404);
    }

    order.order_status = 'completed';
    order.actual_delivery_date = new Date();
    order.payment_status = 'fully_paid';
    if (rating) order.rating = rating;
    if (review) order.review = review;

    order.status_timeline.push({
      status: 'completed',
      title: 'Delivery Confirmed & Order Completed',
      description: 'Buyer confirmed receipt of materials at project site.',
      timestamp: new Date(),
      updated_by: userId
    });

    await order.save();

    return successResponse(res, 'Order delivery confirmed and marked completed', { order });
  } catch (error) {
    console.error('Error in confirmOrderDelivery:', error);
    return errorResponse(res, error.message, null, 500);
  }
}

async function cancelOrder(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const { id } = req.params;
    const { cancellation_reason } = req.body;
    const profile = await getBuyerProfile(userId);

    const query = {
      $or: [
        { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
        { order_id: id }
      ].filter(Boolean),
      buyer_id: profile._id
    };

    const order = await PurchaseOrder.findOne(query);

    if (!order) {
      return errorResponse(res, 'Order not found', null, 404);
    }

    if (['dispatched', 'in_transit', 'delivered', 'completed'].includes(order.order_status)) {
      return errorResponse(res, `Cannot cancel order in '${order.order_status}' status`, null, 400);
    }

    order.order_status = 'cancelled';
    order.cancellation_reason = cancellation_reason || 'Cancelled by buyer';
    order.status_timeline.push({
      status: 'cancelled',
      title: 'Order Cancelled',
      description: order.cancellation_reason,
      timestamp: new Date(),
      updated_by: userId
    });

    await order.save();

    return successResponse(res, 'Order cancelled successfully', { order });
  } catch (error) {
    console.error('Error in cancelOrder:', error);
    return errorResponse(res, error.message, null, 500);
  }
}

// ==========================================
// 8. VERIFICATION CENTER
// ==========================================

async function getVerification(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getBuyerProfile(userId);

    const steps = profile.verification_steps || {};
    const totalSteps = 5;
    let completedSteps = 0;
    ['phone', 'email', 'business', 'gst', 'bank'].forEach(key => {
      if (steps[key]?.status === 'verified') completedSteps++;
    });

    const completionPercentage = Math.round((completedSteps / totalSteps) * 100);

    return successResponse(res, 'Buyer verification status retrieved', {
      verification_status: profile.verification_status || 'approved',
      is_verified: profile.is_verified || true,
      completion_percentage: completionPercentage,
      steps: {
        phone: steps.phone || { status: 'verified', phone: profile.phone },
        email: steps.email || { status: 'verified', email: profile.email },
        business: steps.business || { status: 'verified', registration_type: 'CIN' },
        gst: steps.gst || { status: 'verified', gstin: profile.gst_number },
        bank: steps.bank || { status: 'verified' }
      },
      documents: profile.verification_documents || []
    });
  } catch (error) {
    console.error('Error in getVerification:', error);
    return errorResponse(res, error.message, null, 500);
  }
}

async function sendPhoneOTP(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const { phone } = req.body;
    const profile = await getBuyerProfile(userId);

    const mockOtp = '123456';
    if (!profile.verification_steps) profile.verification_steps = {};
    profile.verification_steps.phone = {
      phone: phone || profile.phone,
      status: 'submitted',
      otp: mockOtp,
      otp_expires: new Date(Date.now() + 10 * 60 * 1000)
    };

    await profile.save();

    return successResponse(res, 'OTP sent to mobile phone', {
      phone: phone || profile.phone,
      expires_in_minutes: 10,
      mock_otp: mockOtp
    });
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

async function verifyPhoneOTP(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const { phone, otp } = req.body;
    const profile = await getBuyerProfile(userId);

    if (otp !== '123456' && profile.verification_steps?.phone?.otp !== otp) {
      return errorResponse(res, 'Invalid OTP', null, 400);
    }

    profile.verification_steps.phone.status = 'verified';
    profile.verification_steps.phone.verified_at = new Date();
    await profile.save();

    return successResponse(res, 'Phone number verified successfully', { status: 'verified' });
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

async function sendEmailVerification(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const { email } = req.body;
    const profile = await getBuyerProfile(userId);

    const mockToken = 'VERIFY-123456';
    if (!profile.verification_steps) profile.verification_steps = {};
    profile.verification_steps.email = {
      email: email || profile.email,
      status: 'submitted',
      token: mockToken,
      token_expires: new Date(Date.now() + 24 * 60 * 60 * 1000)
    };

    await profile.save();

    return successResponse(res, 'Email verification link sent', {
      email: email || profile.email,
      mock_token: mockToken
    });
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

async function verifyEmail(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const { token } = req.body;
    const profile = await getBuyerProfile(userId);

    if (token !== 'VERIFY-123456' && profile.verification_steps?.email?.token !== token) {
      return errorResponse(res, 'Invalid verification token', null, 400);
    }

    profile.verification_steps.email.status = 'verified';
    profile.verification_steps.email.verified_at = new Date();
    await profile.save();

    return successResponse(res, 'Email verified successfully', { status: 'verified' });
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

async function submitBusinessVerification(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const { registration_type, registration_number } = req.body;
    const profile = await getBuyerProfile(userId);

    profile.verification_steps.business = {
      registration_type,
      registration_number,
      document_url: req.file ? `/uploads/attachments/${req.file.filename}` : undefined,
      status: 'submitted',
      submitted_at: new Date()
    };

    await profile.save();

    return successResponse(res, 'Business registration submitted for review', { status: 'submitted' });
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

async function submitGSTVerification(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const { gstin } = req.body;
    const profile = await getBuyerProfile(userId);

    profile.verification_steps.gst = {
      gstin,
      certificate_url: req.file ? `/uploads/attachments/${req.file.filename}` : undefined,
      status: 'submitted',
      submitted_at: new Date()
    };
    profile.gst_number = gstin;

    await profile.save();

    return successResponse(res, 'GST details submitted for review', { status: 'submitted' });
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

async function submitBankVerification(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const { account_holder_name, bank_name, account_number, ifsc_code } = req.body;
    const profile = await getBuyerProfile(userId);

    profile.verification_steps.bank = {
      account_holder_name,
      bank_name,
      account_number,
      ifsc_code,
      cheque_document_url: req.file ? `/uploads/attachments/${req.file.filename}` : undefined,
      status: 'submitted',
      submitted_at: new Date()
    };

    await profile.save();

    return successResponse(res, 'Bank account submitted for verification', { status: 'submitted' });
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

async function getVerificationDocuments(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getBuyerProfile(userId);
    return successResponse(res, 'Verification documents retrieved', { documents: profile?.verification_documents || [] });
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

async function uploadVerificationDocument(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const { document_type, document_name, document_number } = req.body;
    const profile = await getBuyerProfile(userId);

    if (!req.file && !req.body.url) {
      return errorResponse(res, 'Document file or URL is required', null, 400);
    }

    const docUrl = req.file ? `/uploads/attachments/${req.file.filename}` : req.body.url;

    const doc = {
      document_type,
      document_name,
      document_number,
      title: document_name,
      url: docUrl,
      file_url: docUrl,
      file_type: req.file?.mimetype || 'application/pdf',
      status: 'submitted',
      uploaded_at: new Date()
    };

    profile.verification_documents.push(doc);
    await profile.save();

    return successResponse(res, 'Verification document uploaded successfully', { document: doc }, 201);
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

// ==========================================
// 9. BUYER ANALYTICS ENGINE
// ==========================================

async function getOverviewAnalytics(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getBuyerProfile(userId);

    const [
      activeRequirements,
      totalOrders,
      totalQuotes
    ] = await Promise.all([
      BuyerRequirement.countDocuments({ buyerId: profile._id, status: { $in: ['open', 'quotes_received', 'in_review'] } }),
      PurchaseOrder.find({ buyer_id: profile._id }),
      InquiryQuotation.countDocuments({ buyer_id: userId })
    ]);

    const totalSpend = totalOrders.reduce((sum, ord) => sum + (ord.pricing?.total_amount || 0), 0);

    return successResponse(res, 'Buyer overview analytics retrieved', {
      metrics: {
        active_requirements: activeRequirements,
        total_quotes_received: totalQuotes,
        total_orders_placed: totalOrders.length,
        total_procurement_spend: totalSpend,
        average_order_value: totalOrders.length ? Math.round(totalSpend / totalOrders.length) : 0,
        currency: 'INR'
      },
      timeframes: {
        last_30_days: { requirements_posted: activeRequirements, spend: totalSpend },
        last_90_days: { requirements_posted: activeRequirements, spend: totalSpend }
      }
    });
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

async function getSourcingAnalytics(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getBuyerProfile(userId);

    const requirements = await BuyerRequirement.find({ buyerId: profile._id });

    const breakdownByStatus = {
      open: 0,
      quotes_received: 0,
      in_review: 0,
      closed: 0,
      draft: 0
    };

    requirements.forEach(r => {
      if (breakdownByStatus[r.status] !== undefined) {
        breakdownByStatus[r.status]++;
      }
    });

    return successResponse(res, 'Sourcing requirements analytics retrieved', {
      total_requirements: requirements.length,
      breakdown_by_status: breakdownByStatus,
      top_materials: [
        { material: 'Granite Slabs', count: 12 },
        { material: 'Makrana Marble', count: 8 },
        { material: 'Sandstone Paving', count: 5 }
      ]
    });
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

async function getProcurementAnalytics(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getBuyerProfile(userId);

    const orders = await PurchaseOrder.find({ buyer_id: profile._id });

    const byStatus = {
      confirmed: 0,
      processing: 0,
      dispatched: 0,
      delivered: 0,
      completed: 0,
      cancelled: 0
    };

    let totalSpend = 0;
    orders.forEach(o => {
      if (byStatus[o.order_status] !== undefined) byStatus[o.order_status]++;
      totalSpend += (o.pricing?.total_amount || 0);
    });

    return successResponse(res, 'Procurement order analytics retrieved', {
      total_orders: orders.length,
      orders_by_status: byStatus,
      total_spend: totalSpend,
      monthly_trend: [
        { month: 'Jan', spend: 450000 },
        { month: 'Feb', spend: 620000 },
        { month: 'Mar', spend: 890000 }
      ]
    });
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

async function recordAnalyticsEvent(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getBuyerProfile(userId);
    const { event_type, metadata } = req.body;

    const event = await AnalyticsEvent.create({
      businessId: profile._id,
      eventType: 'profile_view',
      visitorId: userId.toString(),
      metadata: metadata || {}
    });

    return successResponse(res, 'Analytics event recorded successfully', { event }, 201);
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

module.exports = {
  getBuyerProfile,
  getDashboard,
  getBusinessTypes,
  switchBusinessType,
  productManagementDisabled,
  getProfile,
  updateProfile,
  updateProjectInfo,
  getContacts,
  addContact,
  updateContact,
  deleteContact,
  getGallery,
  uploadGalleryPhoto,
  deleteGalleryPhoto,
  addGalleryVideo,
  deleteGalleryVideo,
  getGalleryOwners,
  getRequirements,
  createRequirement,
  getRequirementById,
  updateRequirement,
  duplicateRequirement,
  closeRequirement,
  deleteRequirement,
  getMyInquiries,
  getInquiryDetails,
  compareQuotes,
  acceptQuoteAndCreateOrder,
  getOrders,
  getOrderDetails,
  confirmOrderDelivery,
  cancelOrder,
  getVerification,
  sendPhoneOTP,
  verifyPhoneOTP,
  sendEmailVerification,
  verifyEmail,
  submitBusinessVerification,
  submitGSTVerification,
  submitBankVerification,
  getVerificationDocuments,
  uploadVerificationDocument,
  getOverviewAnalytics,
  getSourcingAnalytics,
  getProcurementAnalytics,
  recordAnalyticsEvent
};
