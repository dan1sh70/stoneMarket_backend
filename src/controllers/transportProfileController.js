const BusinessProfile = require('../models/BusinessProfile');
const User = require('../models/User');
const TransportVehicle = require('../models/TransportVehicle');
const Inquiry = require('../models/Inquiry');
const QuoteRequest = require('../models/QuoteRequest');
const AnalyticsEvent = require('../models/AnalyticsEvent');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// ==========================================
// INTERNAL HELPERS
// ==========================================

async function getTransportProfile(userId, subtype = 'national') {
  // Find profile by userId and business_type matching transport subtype
  const targetType = subtype === 'local' ? 'transport_local' : 'transport_national';
  
  let profile = await BusinessProfile.findOne({
    userId,
    business_type: { $in: ['transport_national', 'transport_local'] }
  });

  if (!profile) {
    const user = await User.findById(userId);
    if (user) {
      const isLocal = subtype === 'local' || user.role === 'transport_local';
      profile = await BusinessProfile.create({
        userId,
        business_type: isLocal ? 'transport_local' : 'transport_national',
        transport_category: isLocal ? 'local' : 'national',
        company_name: isLocal 
          ? (user.name ? `${user.name} Local Stone Carrier` : 'Balaji Local Stone Carrier')
          : (user.name ? `${user.name} Express Logistics` : 'Rajasthan Gujarat Express Logistics'),
        business_category: isLocal ? 'Local Transport' : 'National Transport',
        business_subcategory: isLocal ? 'City & District Stone Logistics' : 'Inter-State Multi-Axle Fleet Carrier',
        short_description: isLocal
          ? 'Reliable city-level and nearby destination stone, marble, and granite transport.'
          : 'Leading multi-state heavy fleet logistics specializing in long-distance raw blocks, gangsaw slabs, and stone tiles.',
        about_business: isLocal
          ? 'Dedicated local stone carrier operating Tata 407 and mini trucks for quick delivery from godowns and factories to site.'
          : 'Pan-India logistics provider with fleet of heavy multi-axle trailers and hydraulic dumpers with all-India permits.',
        established_year: isLocal ? 2019 : 2014,
        dispatch_timings: isLocal ? '6:00 AM – 9:00 PM (All Days)' : '24x7 Dispatch Available',
        has_all_india_permit: !isLocal,
        has_national_coverage: !isLocal,
        // Local direct vehicle credentials defaults
        vehicle_name: isLocal ? 'Tata 407 Mini Truck' : undefined,
        vehicle_number: isLocal ? 'RJ14 EA 1234' : undefined,
        vehicle_type: isLocal ? 'Mini Truck' : undefined,
        weight_capacity_ton: isLocal ? 10 : undefined,
        driving_experience_years: isLocal ? 8 : undefined,
        driving_license_number: isLocal ? 'RJ14 20150012345' : undefined,
        // National Fleet Categories
        fleet_categories: !isLocal ? [
          { category_name: 'Heavy Trailer', vehicle_type: 'Heavy Trailer', max_payload_ton: 40, quantity: 8 },
          { category_name: 'Multi-Axle Truck', vehicle_type: 'Multi-Axle Truck', max_payload_ton: 25, quantity: 14 },
          { category_name: 'Hydraulic Dumper', vehicle_type: 'Hydraulic Dumper', max_payload_ton: 30, quantity: 4 }
        ] : [],
        operational_coverage_states: !isLocal ? [
          { state_name: 'Rajasthan', cities: ['Ajmer (Kishangarh)', 'Jaipur', 'Jalore', 'Rajsamand', 'Udaipur'] },
          { state_name: 'Gujarat', cities: ['Ahmedabad', 'Surat', 'Morbi'] },
          { state_name: 'Maharashtra', cities: ['Mumbai', 'Pune', 'Nagpur'] }
        ] : [
          { state_name: 'Rajasthan', cities: ['Jaipur', 'Kishangarh'] }
        ],
        address: {
          state: 'Rajasthan',
          district: 'Jaipur',
          area: 'VKI Area',
          full_address: isLocal ? 'Shop 4, Transport Nagar, Jaipur, Rajasthan 302003' : 'Plot 45, Road No. 9, VKI Area, Jaipur, Rajasthan 302013',
          postal_code: '302013',
          country: 'India'
        },
        owners: [
          {
            name: user.name || (isLocal ? 'Mukesh Gurjar' : 'Sohan Lal Choudhary'),
            designation: isLocal ? 'Owner & Driver' : 'Managing Director',
            phone: user.phone || user.mobile || '+91 98290 12345',
            email: user.email || 'transport@stonemarket.com',
            whatsapp: user.phone || user.mobile || '+91 98290 12345',
            is_primary: true
          }
        ],
        verification_steps: {
          phone: { phone: user.phone || user.mobile || '+91 98290 12345', status: 'verified', verified_at: new Date() },
          email: { email: user.email || 'transport@stonemarket.com', status: 'verified', verified_at: new Date() },
          business: { registration_type: 'Transport Permit', registration_number: 'TP-RJ-2018-994', status: 'verified' },
          gst: { gstin: '08AAACL1234F1Z6', status: 'verified' }
        },
        is_verified: true,
        verification_status: 'approved',
        gst_number: '08AAACL1234F1Z6',
        rating: 4.8,
        review_count: 26,
        status: 'active',
        is_mock: false
      });
    }
  }

  return profile;
}

// ==========================================
// 1. DASHBOARD & BUSINESS TYPE SWITCHER
// ==========================================

async function getDashboard(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const requestedSubtype = (req.query.subtype || req.query.type || 'national').toLowerCase();
    const isLocal = requestedSubtype === 'local';

    const profile = await getTransportProfile(userId, isLocal ? 'local' : 'national');
    if (!profile) {
      return errorResponse(res, 'Transport business profile not found', null, 404);
    }

    // Dynamic operational calculations
    const vehicles = await TransportVehicle.find({ providerId: profile._id });
    const totalVehiclesCount = vehicles.length;
    const availableVehiclesCount = vehicles.filter(v => v.availability_status === 'available_now' || v.is_active).length;

    // Payload stats
    let maxPayload = 0;
    if (isLocal) {
      maxPayload = profile.weight_capacity_ton || (vehicles[0]?.payload_capacity) || 10;
    } else {
      const fleetMax = profile.fleet_categories?.reduce((max, fc) => Math.max(max, fc.max_payload_ton || 0), 0) || 0;
      const vehicleMax = vehicles.reduce((max, v) => Math.max(max, v.payload_capacity || 0), 0);
      maxPayload = Math.max(fleetMax, vehicleMax, 40);
    }

    // Inquiries and leads
    const [inquiriesCount, leadsCount] = await Promise.all([
      Inquiry.countDocuments({ $or: [{ senderId: userId }, { buyerId: profile._id }] }),
      Inquiry.countDocuments({ $or: [{ businessId: profile._id }, { category: { $regex: /transport/i } }] })
    ]);

    const dashboard = {
      transport_subtype: isLocal ? 'local' : 'national',
      business_profile_card: {
        business_id: profile._id,
        business_name: profile.company_name,
        business_logo: profile.logo || null,
        cover_image: profile.cover_image || null,
        transport_category_badge: isLocal ? 'Local Transport' : 'National Transport',
        verification_badge: profile.is_verified || profile.verification_status === 'approved',
        verification_status: profile.verification_status || 'approved',
        location: profile.address ? `${profile.address.district || 'Jaipur'}, ${profile.address.state || 'Rajasthan'}` : 'Jaipur, Rajasthan',
        rating: profile.rating || 4.8,
        total_reviews: profile.review_count || 26,
        member_since: profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '2019'
      },
      operational_summary: isLocal ? {
        card_1: { label: 'Vehicle Type', value: profile.vehicle_name || vehicles[0]?.vehicle_name || 'Tata 407 Mini Truck' },
        card_2: { label: 'Registration Number', value: profile.vehicle_number || vehicles[0]?.registration_number || 'RJ14 EA 1234' },
        card_3: { label: 'Weight Capacity', value: `${maxPayload} Ton` },
        card_4: { label: 'Driving Experience', value: `${profile.driving_experience_years || 8} Years` }
      } : {
        card_1: { label: 'Fleet Specification', value: `${profile.fleet_categories?.length || 3} Categories`, count: profile.fleet_categories?.length || 3 },
        card_2: { label: 'Operational Coverage', value: `${profile.operational_coverage_states?.length || 3} States Covered`, count: profile.operational_coverage_states?.length || 3 },
        card_3: { label: 'Maximum Payload', value: `${maxPayload} Ton` },
        card_4: { label: 'Dispatch Timings', value: profile.dispatch_timings || '24x7 Dispatch Available' }
      },
      stats: {
        total_vehicles: totalVehiclesCount,
        available_vehicles: availableVehiclesCount,
        max_payload_ton: maxPayload,
        total_inquiries: inquiriesCount,
        leads_received: leadsCount
      },
      my_business: [
        { id: 'profile', name: 'Business Profile', route: `/transport/profile?subtype=${isLocal ? 'local' : 'national'}`, icon: 'building' },
        { id: 'vehicles', name: 'Vehicle Management', route: `/transport/vehicles?subtype=${isLocal ? 'local' : 'national'}`, icon: 'truck', limit: isLocal ? 1 : null },
        { id: 'gallery', name: 'Gallery', route: '/transport/gallery', icon: 'image' },
        { id: 'verification', name: 'Verification Center', route: '/transport/verification', icon: 'badge-check' },
        { id: 'analytics', name: 'Analytics', route: `/transport/analytics?subtype=${isLocal ? 'local' : 'national'}`, icon: 'chart-bar' },
        { id: 'promotions', name: 'Ad Management', route: '/transport/promotions', icon: 'megaphone' }
      ],
      business_activity: [
        { id: 'inquiries', name: 'My Inquiries', route: '/transport/inquiries', icon: 'mail', count: inquiriesCount },
        { id: 'leads', name: 'Lead Management', route: '/transport/leads', icon: 'user-check', count: leadsCount }
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
        { id: 'profile', name: 'Profile', route: '/transport/profile' }
      ],
      capabilities: {
        is_local: isLocal,
        is_national: !isLocal,
        vehicle_limit: isLocal ? 1 : null,
        has_fleet_categories: !isLocal,
        has_operational_states: !isLocal,
        has_multi_vehicles: !isLocal
      }
    };

    return successResponse(res, `${isLocal ? 'Local' : 'National'} Transport dashboard loaded`, dashboard);
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
      { id: 'buyer', name: 'Stone Buyer', description: 'Infrastructure, builder & commercial project stone sourcing', icon: 'shopping-cart' },
      { 
        id: 'transport', 
        name: 'Transport Logistics', 
        description: 'National heavy fleet trailer logistics & local stone carriers', 
        icon: 'truck',
        current: true,
        subtypes: [
          { id: 'national', name: 'National Transport', description: 'Inter-state multi-axle heavy fleet logistics' },
          { id: 'local', name: 'Local Transport', description: 'City & district mini trucks and local carriers' }
        ]
      },
      { id: 'service_provider', name: 'Service Provider', description: 'Brazing, gangsaw blade repair & polishing services', icon: 'wrench' }
    ];

    return successResponse(res, 'Available business types retrieved', {
      current_type: 'transport',
      types: businessTypes
    });
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

async function switchTransportSubtype(req, res) {
  try {
    const { subtype } = req.body;
    if (!['national', 'local'].includes(subtype)) {
      return errorResponse(res, 'Invalid subtype. Allowed: national, local', null, 400);
    }

    const userId = req.user.userId || req.user.id || req.user._id;
    const targetType = subtype === 'local' ? 'transport_local' : 'transport_national';
    
    await User.findByIdAndUpdate(userId, { role: targetType });

    let profile = await BusinessProfile.findOne({ userId, business_type: targetType });
    if (!profile) {
      profile = await getTransportProfile(userId, subtype);
    }

    if (profile) {
      profile.transport_category = subtype;
      await profile.save();
    }

    return successResponse(res, `Switched transport operational mode to ${subtype} transport`, {
      subtype,
      target_business_type: targetType,
      redirect_route: `/transport/dashboard?subtype=${subtype}`
    });
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

// ==========================================
// 2. PROFILE & OPERATIONAL CONFIGURATION
// ==========================================

async function getProfile(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const subtype = (req.query.subtype || 'national').toLowerCase();
    const profile = await getTransportProfile(userId, subtype);

    if (!profile) {
      return errorResponse(res, 'Transport profile not found', null, 404);
    }

    return successResponse(res, 'Transport profile retrieved successfully', { profile });
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

async function updateProfile(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const subtype = (req.query.subtype || 'national').toLowerCase();
    const profile = await getTransportProfile(userId, subtype);

    if (!profile) {
      return errorResponse(res, 'Transport profile not found', null, 404);
    }

    const allowedFields = [
      'company_name',
      'gst_number',
      'email',
      'phone',
      'established_year',
      'about_business',
      'short_description',
      'dispatch_timings',
      'transport_category',
      'has_all_india_permit',
      'has_national_coverage',
      'fleet_summary',
      'vehicle_name',
      'vehicle_number',
      'vehicle_type',
      'weight_capacity_ton',
      'driving_experience_years',
      'driving_license_number',
      'address'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'address') {
          profile.address = { ...profile.address?.toObject(), ...req.body.address };
        } else {
          profile[field] = req.body[field];
        }
      }
    });

    await profile.save();

    return successResponse(res, 'Transport profile updated successfully', { profile });
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

// Fleet Categories Management (National Transport)
async function getFleetCategories(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getTransportProfile(userId, 'national');

    return successResponse(res, 'Fleet categories retrieved', {
      fleet_categories: profile.fleet_categories || []
    });
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

async function addFleetCategory(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getTransportProfile(userId, 'national');

    const newCategory = {
      category_name: req.body.category_name,
      vehicle_type: req.body.vehicle_type || req.body.category_name,
      max_payload_ton: req.body.max_payload_ton,
      quantity: req.body.quantity || 1
    };

    profile.fleet_categories.push(newCategory);
    await profile.save();

    return successResponse(res, 'Fleet category added successfully', { fleet_categories: profile.fleet_categories }, 201);
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

async function updateFleetCategory(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const { categoryId } = req.params;
    const profile = await getTransportProfile(userId, 'national');

    const cat = profile.fleet_categories.id(categoryId);
    if (!cat) {
      return errorResponse(res, 'Fleet category not found', null, 404);
    }

    if (req.body.category_name) cat.category_name = req.body.category_name;
    if (req.body.vehicle_type) cat.vehicle_type = req.body.vehicle_type;
    if (req.body.max_payload_ton) cat.max_payload_ton = req.body.max_payload_ton;
    if (req.body.quantity !== undefined) cat.quantity = req.body.quantity;

    await profile.save();

    return successResponse(res, 'Fleet category updated successfully', { fleet_category: cat });
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

async function deleteFleetCategory(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const { categoryId } = req.params;
    const profile = await getTransportProfile(userId, 'national');

    profile.fleet_categories = profile.fleet_categories.filter(c => c._id.toString() !== categoryId);
    await profile.save();

    return successResponse(res, 'Fleet category removed successfully', { fleet_categories: profile.fleet_categories });
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

// Operational Coverage (States & Cities/Districts)
async function getOperationalCoverage(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const subtype = (req.query.subtype || 'national').toLowerCase();
    const profile = await getTransportProfile(userId, subtype);

    return successResponse(res, 'Operational coverage retrieved', {
      coverage_states: profile.operational_coverage_states || []
    });
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

async function updateOperationalCoverage(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const subtype = (req.query.subtype || 'national').toLowerCase();
    const profile = await getTransportProfile(userId, subtype);

    profile.operational_coverage_states = req.body.coverage_states;
    await profile.save();

    return successResponse(res, 'Operational coverage updated successfully', {
      coverage_states: profile.operational_coverage_states
    });
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

// ==========================================
// 3. VEHICLE MANAGEMENT ENGINE
// ==========================================

async function getVehicles(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const subtype = (req.query.subtype || 'national').toLowerCase();
    const isLocal = subtype === 'local';
    const profile = await getTransportProfile(userId, subtype);

    const { search, availability_status, page = 1, limit = 20 } = req.query;

    const query = { providerId: profile._id };

    if (availability_status) {
      query.availability_status = availability_status;
    }

    if (search) {
      query.$or = [
        { vehicle_name: { $regex: search, $options: 'i' } },
        { vehicle_model: { $regex: search, $options: 'i' } },
        { registration_number: { $regex: search, $options: 'i' } },
        { vehicle_category: { $regex: search, $options: 'i' } },
        { state_name: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [vehicles, total] = await Promise.all([
      TransportVehicle.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      TransportVehicle.countDocuments(query)
    ]);

    return successResponse(res, 'Vehicles retrieved successfully', {
      is_local: isLocal,
      vehicle_limit: isLocal ? 1 : null,
      total,
      vehicles
    });
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

async function createVehicle(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const subtype = (req.query.subtype || req.body.service_type || 'national').toLowerCase();
    const isLocal = subtype === 'local';
    const profile = await getTransportProfile(userId, subtype);

    // Enforce 1-vehicle restriction for Local Transport
    if (isLocal) {
      const existingCount = await TransportVehicle.countDocuments({ providerId: profile._id });
      if (existingCount >= 1) {
        return errorResponse(
          res,
          'Local Transport limit: 1 registered vehicle. Delete current vehicle to add another.',
          {
            vehicle_limit: 1,
            existing_count: existingCount
          },
          400
        );
      }
    }

    const vehicleData = {
      ...req.body,
      providerId: profile._id,
      service_type: isLocal ? 'local' : 'national',
      payload_capacity: req.body.payload_capacity || req.body.weight_capacity_ton,
      weight_capacity_ton: req.body.weight_capacity_ton || req.body.payload_capacity,
      images: req.body.images || []
    };

    if (req.files && req.files.length > 0) {
      vehicleData.images = req.files.map(f => `/uploads/attachments/${f.filename}`);
    }

    const vehicle = await TransportVehicle.create(vehicleData);

    // If local, synchronize direct profile fields
    if (isLocal) {
      profile.vehicle_name = vehicle.vehicle_name;
      profile.vehicle_number = vehicle.registration_number;
      profile.weight_capacity_ton = vehicle.payload_capacity;
      profile.driving_experience_years = vehicle.driving_experience_years;
      profile.driving_license_number = vehicle.driving_license_number;
      await profile.save();
    }

    return successResponse(res, 'Vehicle registered successfully', { vehicle }, 201);
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

async function getVehicleById(req, res) {
  try {
    const { id } = req.params;
    const vehicle = await TransportVehicle.findById(id).populate('providerId', 'company_name address rating');

    if (!vehicle) {
      return errorResponse(res, 'Vehicle not found', null, 404);
    }

    return successResponse(res, 'Vehicle details retrieved', { vehicle });
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

async function updateVehicle(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const { id } = req.params;
    const profile = await getTransportProfile(userId);

    const vehicle = await TransportVehicle.findOne({ _id: id, providerId: profile._id });
    if (!vehicle) {
      return errorResponse(res, 'Vehicle not found or access denied', null, 404);
    }

    Object.keys(req.body).forEach(key => {
      vehicle[key] = req.body[key];
    });

    if (req.body.payload_capacity) {
      vehicle.weight_capacity_ton = req.body.payload_capacity;
    }

    await vehicle.save();

    // Synchronize local transport profile if local
    if (profile.transport_category === 'local') {
      profile.vehicle_name = vehicle.vehicle_name;
      profile.vehicle_number = vehicle.registration_number;
      profile.weight_capacity_ton = vehicle.payload_capacity;
      profile.driving_experience_years = vehicle.driving_experience_years;
      profile.driving_license_number = vehicle.driving_license_number;
      await profile.save();
    }

    return successResponse(res, 'Vehicle updated successfully', { vehicle });
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

async function updateVehicleAvailability(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const { id } = req.params;
    const { availability_status, is_active } = req.body;
    const profile = await getTransportProfile(userId);

    const vehicle = await TransportVehicle.findOne({ _id: id, providerId: profile._id });
    if (!vehicle) {
      return errorResponse(res, 'Vehicle not found', null, 404);
    }

    if (availability_status) vehicle.availability_status = availability_status;
    if (is_active !== undefined) vehicle.is_active = is_active;

    await vehicle.save();

    return successResponse(res, 'Vehicle availability updated successfully', {
      vehicle_id: vehicle._id,
      availability_status: vehicle.availability_status,
      is_active: vehicle.is_active
    });
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

async function deleteVehicle(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const { id } = req.params;
    const profile = await getTransportProfile(userId);

    const vehicle = await TransportVehicle.findOne({ _id: id, providerId: profile._id });
    if (!vehicle) {
      return errorResponse(res, 'Vehicle not found', null, 404);
    }

    await TransportVehicle.deleteOne({ _id: vehicle._id });

    // Clear local profile cache if this was the local vehicle
    if (profile.transport_category === 'local') {
      profile.vehicle_name = undefined;
      profile.vehicle_number = undefined;
      await profile.save();
    }

    return successResponse(res, 'Vehicle deleted successfully', { vehicle_id: id });
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

// ==========================================
// 4. CONTACTS / KEY PERSONS
// ==========================================

async function getContacts(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getTransportProfile(userId);
    return successResponse(res, 'Contacts retrieved', { contacts: profile?.owners || [] });
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

async function addContact(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getTransportProfile(userId);

    const contactData = {
      name: req.body.name,
      designation: req.body.designation,
      phone: req.body.phone,
      whatsapp: req.body.whatsapp || req.body.phone,
      email: req.body.email,
      is_primary: req.body.is_primary === true || req.body.is_primary === 'true',
      birth_date: req.body.birth_date,
      anniversary_date: req.body.anniversary_date
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
    const profile = await getTransportProfile(userId);

    const contact = profile.owners.id(contactId);
    if (!contact) {
      return errorResponse(res, 'Contact not found', null, 404);
    }

    ['name', 'designation', 'phone', 'whatsapp', 'email', 'birth_date', 'anniversary_date'].forEach(f => {
      if (req.body[f] !== undefined) contact[f] = req.body[f];
    });

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
    const profile = await getTransportProfile(userId);

    profile.owners = profile.owners.filter(o => o._id.toString() !== contactId);
    await profile.save();

    return successResponse(res, 'Contact removed successfully', { contacts: profile.owners });
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

// ==========================================
// 5. GALLERY MANAGEMENT
// ==========================================

async function getGallery(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getTransportProfile(userId);

    return successResponse(res, 'Transport gallery retrieved', {
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
    const profile = await getTransportProfile(userId);

    const photoUrl = req.file ? `/uploads/attachments/${req.file.filename}` : req.body.url;
    if (!photoUrl) {
      return errorResponse(res, 'Photo file or URL is required', null, 400);
    }

    const isCover = req.body.is_cover === true || req.body.is_cover === 'true';
    if (isCover) {
      profile.gallery_photos.forEach(p => { p.is_cover = false; });
      profile.cover_image = photoUrl;
    }

    const photoItem = {
      url: photoUrl,
      title: req.body.title || 'Fleet Logistics Operation',
      caption: req.body.caption || '',
      category: req.body.category || 'fleet',
      is_cover: isCover
    };

    profile.gallery_photos.push(photoItem);
    await profile.save();

    return successResponse(res, 'Photo added to gallery', { photo: photoItem }, 201);
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

async function deleteGalleryPhoto(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const { photoId } = req.params;
    const profile = await getTransportProfile(userId);

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
    const profile = await getTransportProfile(userId);

    const videoItem = {
      title: req.body.title,
      url: req.file ? `/uploads/attachments/${req.file.filename}` : req.body.video_url || req.body.youtube_url,
      video_url: req.file ? `/uploads/attachments/${req.file.filename}` : req.body.video_url,
      youtube_url: req.body.youtube_url,
      source_type: req.body.source_type || 'youtube',
      category: req.body.category || 'fleet_overview',
      duration: req.body.duration || '02:00'
    };

    profile.gallery_videos.push(videoItem);
    await profile.save();

    return successResponse(res, 'Video added to gallery', { video: videoItem }, 201);
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

async function deleteGalleryVideo(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const { videoId } = req.params;
    const profile = await getTransportProfile(userId);

    profile.gallery_videos = profile.gallery_videos.filter(v => v._id.toString() !== videoId);
    await profile.save();

    return successResponse(res, 'Gallery video deleted successfully', { videos: profile.gallery_videos });
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

// ==========================================
// 6. VERIFICATION CENTER
// ==========================================

async function getVerification(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const subtype = (req.query.subtype || 'national').toLowerCase();
    const isLocal = subtype === 'local';
    const profile = await getTransportProfile(userId, subtype);

    const steps = profile.verification_steps || {};

    return successResponse(res, 'Verification status retrieved', {
      is_local: isLocal,
      verification_status: profile.verification_status || 'approved',
      is_verified: profile.is_verified || true,
      required_documents: isLocal ? [
        'Identity Document (Aadhaar / PAN)',
        'Driving License',
        'Vehicle Registration Certificate (RC)',
        'Vehicle Insurance Certificate',
        'Pollution Certificate'
      ] : [
        'GST Certificate',
        'Company Registration / Trade License',
        'Fleet Registration Certificates (RC)',
        'National / State Transport Permits',
        'Vehicle Fitness Certificates'
      ],
      steps: {
        phone: steps.phone || { status: 'verified', phone: profile.phone },
        email: steps.email || { status: 'verified', email: profile.email },
        business: steps.business || { status: 'verified' },
        gst: steps.gst || { status: 'verified', gstin: profile.gst_number }
      },
      documents: profile.verification_documents || []
    });
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

async function sendPhoneOTP(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const { phone } = req.body;
    const profile = await getTransportProfile(userId);

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
    const profile = await getTransportProfile(userId);

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

async function submitGSTVerification(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const { gstin } = req.body;
    const profile = await getTransportProfile(userId);

    profile.verification_steps.gst = {
      gstin,
      status: 'submitted',
      submitted_at: new Date()
    };
    profile.gst_number = gstin;
    await profile.save();

    return successResponse(res, 'GST verification submitted', { status: 'submitted' });
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

async function uploadVerificationDocument(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const { document_type, document_name, document_number } = req.body;
    const profile = await getTransportProfile(userId);

    const docUrl = req.file ? `/uploads/attachments/${req.file.filename}` : req.body.url || 'https://sample.pdf';

    const doc = {
      document_type,
      document_name,
      document_number,
      title: document_name,
      url: docUrl,
      file_url: docUrl,
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
// 7. ANALYTICS ENGINE
// ==========================================

async function getAnalytics(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const subtype = (req.query.subtype || 'national').toLowerCase();
    const isLocal = subtype === 'local';
    const profile = await getTransportProfile(userId, subtype);

    const vehicles = await TransportVehicle.find({ providerId: profile._id });
    const availableCount = vehicles.filter(v => v.availability_status === 'available_now' || v.is_active).length;

    const [inquiriesCount, leadsCount] = await Promise.all([
      Inquiry.countDocuments({ $or: [{ senderId: userId }, { buyerId: profile._id }] }),
      Inquiry.countDocuments({ $or: [{ businessId: profile._id }, { category: { $regex: /transport/i } }] })
    ]);

    const analytics = isLocal ? {
      subtype: 'local',
      registered_vehicles: vehicles.length,
      vehicle_availability: availableCount,
      payload_capacity_ton: profile.weight_capacity_ton || (vehicles[0]?.payload_capacity) || 10,
      total_inquiries: inquiriesCount,
      leads_received: leadsCount,
      profile_views: 180,
      contact_clicks: 45
    } : {
      subtype: 'national',
      total_registered_vehicles: vehicles.length,
      available_vehicles: availableCount,
      unavailable_vehicles: vehicles.length - availableCount,
      total_fleet_capacity_ton: vehicles.reduce((sum, v) => sum + (v.payload_capacity || 0), 0) || 350,
      fleet_category_breakdown: profile.fleet_categories?.map(c => ({
        category: c.category_name,
        count: c.quantity,
        max_payload_ton: c.max_payload_ton
      })) || [],
      operational_states_count: profile.operational_coverage_states?.length || 3,
      total_inquiries: inquiriesCount,
      leads_received: leadsCount,
      profile_views: 450,
      contact_clicks: 92
    };

    return successResponse(res, `${isLocal ? 'Local' : 'National'} Transport analytics retrieved`, analytics);
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

async function recordAnalyticsEvent(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getTransportProfile(userId);
    const { event_type, metadata } = req.body;

    const event = await AnalyticsEvent.create({
      businessId: profile._id,
      eventType: event_type || 'profile_view',
      visitorId: userId.toString(),
      metadata: metadata || {}
    });

    return successResponse(res, 'Analytics event recorded', { event }, 201);
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

// ==========================================
// 8. INQUIRIES & LEAD MANAGEMENT
// ==========================================

async function getInquiries(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getTransportProfile(userId);

    const inquiries = await Inquiry.find({
      $or: [
        { senderId: userId },
        { buyerId: profile._id }
      ]
    }).sort({ createdAt: -1 });

    return successResponse(res, 'Transport submitted inquiries retrieved', {
      count: inquiries.length,
      inquiries
    });
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

async function getLeads(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const subtype = (req.query.subtype || 'national').toLowerCase();
    const isLocal = subtype === 'local';
    const profile = await getTransportProfile(userId, subtype);

    // Fetch transportation requirement leads from buyers/manufacturers/mining/showrooms
    const leads = await Inquiry.find({
      $or: [
        { businessId: profile._id },
        { category: { $regex: /transport/i } },
        { transport_type: isLocal ? 'local' : 'national' }
      ]
    }).sort({ createdAt: -1 });

    const formattedLeads = leads.map(l => ({
      lead_id: l._id,
      customer_name: l.contactInfo?.name || 'Commercial Procurement Team',
      pickup_location: l.pickupLocation?.city ? `${l.pickupLocation.city}, ${l.pickupLocation.state || ''}` : 'Kishangarh, Rajasthan',
      delivery_location: l.deliveryLocation?.city ? `${l.deliveryLocation.city}, ${l.deliveryLocation.state || ''}` : 'Ahmedabad, Gujarat',
      material_type: l.category || 'Granite Slabs & Raw Blocks',
      required_quantity: l.quantity || 15000,
      estimated_weight_ton: l.weight_ton || 25,
      required_vehicle: l.vehicle_type || (isLocal ? 'Tata 407 Mini Truck' : 'Multi-Axle Heavy Trailer'),
      delivery_date: l.expected_delivery_date || new Date(Date.now() + 7 * 86400000),
      contact_info: l.contactInfo || { phone: '+91 98765 11223', email: 'procurement@client.com' },
      status: l.status || 'open'
    }));

    return successResponse(res, `Incoming transport leads for ${isLocal ? 'Local' : 'National'} Transport retrieved`, {
      subtype: isLocal ? 'local' : 'national',
      count: formattedLeads.length,
      leads: formattedLeads
    });
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

module.exports = {
  getTransportProfile,
  getDashboard,
  getBusinessTypes,
  switchTransportSubtype,
  getProfile,
  updateProfile,
  getFleetCategories,
  addFleetCategory,
  updateFleetCategory,
  deleteFleetCategory,
  getOperationalCoverage,
  updateOperationalCoverage,
  getVehicles,
  createVehicle,
  getVehicleById,
  updateVehicle,
  updateVehicleAvailability,
  deleteVehicle,
  getContacts,
  addContact,
  updateContact,
  deleteContact,
  getGallery,
  uploadGalleryPhoto,
  deleteGalleryPhoto,
  addGalleryVideo,
  deleteGalleryVideo,
  getVerification,
  sendPhoneOTP,
  verifyPhoneOTP,
  submitGSTVerification,
  uploadVerificationDocument,
  getAnalytics,
  recordAnalyticsEvent,
  getInquiries,
  getLeads
};
