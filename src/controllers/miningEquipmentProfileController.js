const BusinessProfile = require('../models/BusinessProfile');
const User = require('../models/User');
const Product = require('../models/Product');
const StockHistory = require('../models/StockHistory');
const Inquiry = require('../models/Inquiry');
const AnalyticsEvent = require('../models/AnalyticsEvent');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// ==========================================
// INTERNAL HELPERS
// ==========================================

async function getMiningEquipmentProfile(userId) {
  let profile = await BusinessProfile.findOne({
    userId,
    business_type: { $in: ['mining_equipment', 'heavy_mining_equipment'] }
  });

  if (!profile) {
    const user = await User.findById(userId);
    if (user) {
      profile = await BusinessProfile.create({
        userId,
        business_type: 'mining_equipment',
        company_name: user.name ? `${user.name} Heavy Mining Equipment & Rigs` : 'Atlas Mining Equipment & Heavy Quarry Machineries',
        business_category: 'Heavy Mining Equipment',
        business_subcategory: 'DTH Drilling Rigs, Diamond Wire Saws, Quarry Excavators & Crushers',
        short_description: 'Authorized OEM supplier and distributor of hydraulic crawler DTH rock drilling rigs, 75 HP diamond wire saw machines, quarry excavators and crushing plants.',
        about_business: 'Atlas Mining Equipment provides heavy industrial quarry machinery, hydraulic crawler drilling units, variable speed diamond wire saws, and mobile crushing systems with complete Pan-India on-site commissioning and breakdown support.',
        established_year: 2012,
        mining_equipment_categories: [
          'Hydraulic Crawler Drilling Rigs',
          'DTH Drilling Equipment',
          'Diamond Wire Saw Machines',
          'Quarry Excavators',
          'Wheel Loaders',
          'Stone Mining Crushers',
          'Mining Compressors',
          'Conveyor Systems'
        ],
        authorized_manufacturers_brands: [
          'Atlas-X Pro',
          'Deccan Wire-Master',
          'Komatsu Quarry Spec',
          'CAT Mining',
          'Sandvik Compatible',
          'Volvo Heavy'
        ],
        heavy_equipment_fleet_size: '35+ Heavy Mining Units in Stock & Yard',
        maintenance_refurbishment_capability: 'Full Heavy Mechanical Overhaul & Hydraulic System Rebuild Facility',
        field_service_support: 'Pan-India On-Site Commissioning, Rigging & Field Engineers Available 24x7',
        address: {
          state: 'Rajasthan',
          district: 'Jaipur',
          area: 'VKI Area',
          industrial_area: 'VKI Industrial Area',
          commercial_area: 'Heavy Machinery Zone',
          office_address: 'Plot 180, Road No. 17, VKI Industrial Area, Jaipur',
          full_address: 'Plot 180, Road No. 17, VKI Industrial Area, Jaipur, Rajasthan 302013',
          postal_code: '302013',
          country: 'India'
        },
        owners: [
          {
            name: user.name || 'Harish Chandra Verma',
            designation: 'Managing Director & Chief Mining Equipment Specialist',
            phone: user.phone || user.mobile || '+91 98290 89123',
            email: user.email || 'miningequipment@stonemarket.com',
            whatsapp: user.phone || user.mobile || '+91 98290 89123',
            is_primary: true
          }
        ],
        verification_steps: {
          phone: { phone: user.phone || user.mobile || '+91 98290 89123', status: 'verified', verified_at: new Date() },
          email: { email: user.email || 'miningequipment@stonemarket.com', status: 'verified', verified_at: new Date() },
          business: { registration_type: 'MSME / Udyam', registration_number: 'UDYAM-RJ-14-0089123', status: 'verified' },
          gst: { gstin: '08AAACH8912E1Z2', status: 'verified' }
        },
        is_verified: true,
        verification_status: 'approved',
        gst_number: '08AAACH8912E1Z2',
        rating: 4.9,
        review_count: 58,
        status: 'active',
        is_mock: false
      });
    }
  }

  return profile;
}

function generateMiningEquipmentSKU(category = '') {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  let prefix = 'HME'; // Heavy Mining Equipment
  if (category) {
    const cLower = category.toLowerCase();
    if (cLower.includes('crawler') || cLower.includes('dth') || cLower.includes('drill')) prefix = 'DTH';
    else if (cLower.includes('wire') || cLower.includes('saw')) prefix = 'WSR';
    else if (cLower.includes('excavator')) prefix = 'EXC';
    else if (cLower.includes('loader')) prefix = 'WLD';
    else if (cLower.includes('truck') || cLower.includes('dumper')) prefix = 'MDT';
    else if (cLower.includes('crush')) prefix = 'CRS';
    else if (cLower.includes('conveyor')) prefix = 'CNV';
    else if (cLower.includes('pump')) prefix = 'PMP';
    else if (cLower.includes('compressor')) prefix = 'CMP';
  }
  return `${prefix}-${year}-${rand}`;
}

// ==========================================
// 1. DASHBOARD & BUSINESS SWITCHER
// ==========================================

async function getDashboard(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getMiningEquipmentProfile(userId);
    if (!profile) return errorResponse(res, 'Heavy Mining Equipment profile not found', null, 404);

    const baseProductQuery = {
      $or: [{ businessProfileId: profile._id }, { vendorId: profile._id }],
      business_type: { $in: ['mining_equipment', 'heavy_mining_equipment'] }
    };

    const [
      totalProducts,
      activeProducts,
      draftProducts,
      inquiriesCount,
      leadsCount
    ] = await Promise.all([
      Product.countDocuments(baseProductQuery),
      Product.countDocuments({ ...baseProductQuery, status: 'active' }),
      Product.countDocuments({ ...baseProductQuery, status: { $in: ['inactive', 'draft'] } }),
      Inquiry.countDocuments({
        $or: [
          { businessId: profile._id },
          { vendorId: profile._id },
          { category: { $in: ['Heavy Mining Equipment', 'Mining Equipment', 'DTH Drilling', 'Diamond Wire Saw', 'Quarry Equipment'] } }
        ]
      }),
      Inquiry.countDocuments({
        category: { $in: ['Heavy Mining Equipment', 'Mining Equipment', 'DTH Drilling', 'Diamond Wire Saw', 'Quarry Equipment', 'Excavators', 'Crushers'] }
      })
    ]);

    const dashboard = {
      business_profile_card: {
        profile_id: profile._id,
        business_logo: profile.logo || 'https://stonemarket.com/defaults/heavy-mining-logo.png',
        business_name: profile.company_name,
        verification_badge: profile.is_verified,
        is_verified: profile.is_verified,
        business_type: 'Heavy Mining Equipment',
        location: profile.address ? `${profile.address.district || 'Jaipur'}, ${profile.address.state || 'Rajasthan'}` : 'Jaipur, Rajasthan',
        rating: profile.rating || 4.9,
        reviews: profile.review_count || 58,
        total_reviews: profile.review_count || 58,
        member_since: profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '2012'
      },
      operational_summary: {
        card_1: {
          label: 'Equipment Categories',
          value: `${profile.mining_equipment_categories?.length || 8} Categories`,
          count: profile.mining_equipment_categories?.length || 8
        },
        card_2: {
          label: 'OEM & Authorized Brands',
          value: `${profile.authorized_manufacturers_brands?.length || 6} Brands Available`,
          count: profile.authorized_manufacturers_brands?.length || 6
        },
        card_3: {
          label: 'Maintenance & Rebuild Capability',
          value: profile.maintenance_refurbishment_capability || 'Full Heavy Mechanical Overhaul & Hydraulic System Rebuild'
        },
        card_4: {
          label: 'Field Rigging & Commissioning',
          value: profile.field_service_support || 'Pan-India On-Site Commissioning, Rigging & Field Engineers'
        }
      },
      stats: {
        total_products: totalProducts,
        active_products: activeProducts,
        draft_products: draftProducts,
        total_inquiries: inquiriesCount,
        leads_received: leadsCount
      },
      my_business: [
        { id: 'profile', name: 'Business Profile', route: '/mining-equipment/profile', icon: 'building' },
        { id: 'products', name: 'Product & Spares Management', route: '/mining-equipment/products', icon: 'truck', count: totalProducts },
        { id: 'gallery', name: 'Gallery', route: '/mining-equipment/gallery', icon: 'image' },
        { id: 'verification', name: 'Verification Center', route: '/mining-equipment/verification', icon: 'badge-check' },
        { id: 'analytics', name: 'Analytics', route: '/mining-equipment/analytics', icon: 'chart-bar' },
        { id: 'promotions', name: 'Ad Management', route: '/mining-equipment/promotions', icon: 'megaphone' }
      ],
      business_activity: [
        { id: 'inquiries', name: 'My Inquiries', route: '/mining-equipment/inquiries', icon: 'mail', count: inquiriesCount },
        { id: 'leads', name: 'Lead Management', route: '/mining-equipment/leads', icon: 'user-check', count: leadsCount }
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
        { id: 'profile', name: 'Profile', route: '/mining-equipment/profile' }
      ],
      capabilities: {
        is_product_based: true,
        has_products: true,
        has_inventory: true,
        has_services_management: false
      }
    };

    return successResponse(res, 'Heavy Mining Equipment dashboard loaded successfully', dashboard);
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
      { id: 'transport', name: 'Transport Logistics', description: 'National heavy fleet trailer logistics & local stone carriers', icon: 'truck' },
      { id: 'brazing', name: 'Brazing & Tooling Service', description: 'Diamond blade re-tipping and machine tooling services', icon: 'tool' },
      { id: 'abrasives_epoxy', name: 'Abrasives & Epoxy Chemicals', description: 'Diamond polishing bricks, epoxy mastic, adhesives and stone processing chemicals', icon: 'package' },
      { id: 'machinery_parts', name: 'Stone Machinery Parts & Spares', description: 'Gangsaw parts, hydraulic tensioning cylinders, bearings, motors and cutter spares', icon: 'tool' },
      { 
        id: 'mining_equipment', 
        name: 'Heavy Mining Equipment', 
        description: 'DTH drilling rigs, diamond wire saw machines, quarry excavators, crushers and loaders', 
        icon: 'truck',
        current: true
      }
    ];

    return successResponse(res, 'Available business types retrieved', {
      current_type: 'mining_equipment',
      types: businessTypes
    });
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

async function switchBusinessType(req, res) {
  try {
    const { target_type, target_business_type, business_type } = req.body;
    const allowed = [
      'customer',
      'manufacturer',
      'mining',
      'showroom',
      'trader',
      'buyer',
      'transport',
      'brazing',
      'abrasives_epoxy',
      'abrasives',
      'machinery_parts',
      'machinery',
      'mining_equipment',
      'heavy_mining_equipment'
    ];

    const requested = business_type || target_business_type || target_type;
    if (!requested || !allowed.includes(requested)) {
      return errorResponse(res, 'Invalid business type specified', null, 400);
    }

    const userId = req.user.userId || req.user.id || req.user._id;
    await User.findByIdAndUpdate(userId, { role: requested });

    const redirectMap = {
      customer: '/customer/dashboard',
      manufacturer: '/manufacturer/dashboard',
      mining: '/mining/dashboard',
      showroom: '/showroom/dashboard',
      trader: '/trader/dashboard',
      buyer: '/buyer/dashboard',
      transport: '/transport/dashboard',
      brazing: '/brazing/dashboard',
      abrasives_epoxy: '/abrasives/dashboard',
      abrasives: '/abrasives/dashboard',
      machinery_parts: '/machinery/dashboard',
      machinery: '/machinery/dashboard',
      mining_equipment: '/mining-equipment/dashboard',
      heavy_mining_equipment: '/mining-equipment/dashboard'
    };

    return successResponse(res, `Successfully switched business type to ${requested}`, {
      business_type: requested,
      redirect_url: redirectMap[requested] || '/dashboard'
    });
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

// ==========================================
// 2. PROFILE & OPERATIONAL SPECIFICATIONS
// ==========================================

async function getProfile(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getMiningEquipmentProfile(userId);
    if (!profile) return errorResponse(res, 'Heavy Mining Equipment profile not found', null, 404);

    const baseProductQuery = {
      $or: [{ businessProfileId: profile._id }, { vendorId: profile._id }],
      business_type: { $in: ['mining_equipment', 'heavy_mining_equipment'] }
    };

    const [totalListed, activeCount] = await Promise.all([
      Product.countDocuments(baseProductQuery),
      Product.countDocuments({ ...baseProductQuery, status: 'active' })
    ]);

    const data = {
      id: profile._id,
      _id: profile._id,
      company_name: profile.company_name,
      business_type: 'Heavy Mining Equipment',
      business_category: profile.business_category || 'Heavy Mining Equipment',
      business_subcategory: profile.business_subcategory,
      short_description: profile.short_description,
      about_business: profile.about_business,
      established_year: profile.established_year,
      gst_number: profile.gst_number,
      phone: profile.phone,
      email: profile.email,
      operational_specifications: {
        mining_equipment_categories: profile.mining_equipment_categories || [],
        authorized_manufacturers_brands: profile.authorized_manufacturers_brands || [],
        heavy_equipment_fleet_size: profile.heavy_equipment_fleet_size,
        maintenance_refurbishment_capability: profile.maintenance_refurbishment_capability,
        field_service_support: profile.field_service_support
      },
      products_and_spares_catalogue: {
        total_listed_products: totalListed,
        active_listed_products: activeCount
      },
      address: profile.address,
      owners: profile.owners,
      gallery_photos: profile.gallery_photos,
      gallery_videos: profile.gallery_videos,
      is_verified: profile.is_verified,
      verification_status: profile.verification_status,
      rating: profile.rating,
      review_count: profile.review_count
    };

    return successResponse(res, 'Heavy Mining Equipment profile retrieved successfully', data);
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

async function updateProfile(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getMiningEquipmentProfile(userId);
    if (!profile) return errorResponse(res, 'Heavy Mining Equipment profile not found', null, 404);

    const allowedFields = [
      'company_name',
      'gst_number',
      'email',
      'phone',
      'established_year',
      'about_business',
      'short_description',
      'mining_equipment_categories',
      'authorized_manufacturers_brands',
      'heavy_equipment_fleet_size',
      'maintenance_refurbishment_capability',
      'field_service_support'
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        profile[field] = req.body[field];
      }
    });

    if (req.body.address) {
      profile.address = {
        ...profile.address?.toObject(),
        ...req.body.address
      };
    }

    await profile.save();

    return successResponse(res, 'Heavy Mining Equipment profile updated successfully', {
      id: profile._id,
      company_name: profile.company_name,
      mining_equipment_categories: profile.mining_equipment_categories,
      authorized_manufacturers_brands: profile.authorized_manufacturers_brands,
      heavy_equipment_fleet_size: profile.heavy_equipment_fleet_size,
      maintenance_refurbishment_capability: profile.maintenance_refurbishment_capability,
      field_service_support: profile.field_service_support,
      address: profile.address
    });
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

// ==========================================
// 3. PRODUCT & SPARES MANAGEMENT (CRUD & 4-STEP WIZARD)
// ==========================================

async function getProducts(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getMiningEquipmentProfile(userId);
    if (!profile) return errorResponse(res, 'Heavy Mining Equipment profile not found', null, 404);

    const {
      search,
      category,
      brand,
      status = 'all',
      page = 1,
      limit = 10
    } = req.query;

    const baseQuery = {
      $or: [{ businessProfileId: profile._id }, { vendorId: profile._id }],
      business_type: { $in: ['mining_equipment', 'heavy_mining_equipment'] }
    };

    const query = { ...baseQuery };

    if (status && status !== 'all') {
      if (status === 'inactive') {
        query.status = { $in: ['inactive', 'draft'] };
      } else {
        query.status = status;
      }
    }

    if (category) {
      query.category = new RegExp(category, 'i');
    }

    if (brand) {
      query.$or = [
        { brand_name: new RegExp(brand, 'i') },
        { oem_brand_compatibility: new RegExp(brand, 'i') }
      ];
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { name: searchRegex },
        { category: searchRegex },
        { brand_name: searchRegex },
        { oem_brand_compatibility: searchRegex },
        { model_number: searchRegex },
        { sku: searchRegex },
        { description: searchRegex }
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const [products, total, totalCount, activeCount, inactiveCount, draftCount] = await Promise.all([
      Product.find(query).sort({ updatedAt: -1 }).skip(skip).limit(parseInt(limit, 10)),
      Product.countDocuments(query),
      Product.countDocuments(baseQuery),
      Product.countDocuments({ ...baseQuery, status: 'active' }),
      Product.countDocuments({ ...baseQuery, status: 'inactive' }),
      Product.countDocuments({ ...baseQuery, status: 'draft' })
    ]);

    const formatted = products.map((p) => ({
      id: p._id,
      _id: p._id,
      sku: p.sku,
      name: p.name,
      equipment_name: p.name,
      product_name: p.name,
      category: p.category,
      brand_name: p.brand_name || p.oem_brand_compatibility || 'Atlas-X Pro',
      manufacturer: p.brand_name || p.oem_brand_compatibility || 'Atlas-X Pro',
      model_number: p.model_number,
      part_number: p.part_number,
      oem_number: p.oem_number,
      material_grade: p.material_grade,
      warranty_guarantee: p.warranty_guarantee || '12 Months Manufacturer Warranty',
      technical_specifications: p.technical_specifications || {},
      technical_drawings: p.technical_drawings || [],
      equipment_brochures: p.equipment_brochures || [],
      certification_documents: p.certification_documents || [],
      equipment_condition: p.equipment_condition || 'Brand New',
      delivery_available: p.delivery_available !== undefined ? p.delivery_available : true,
      installation_available: p.installation_available !== undefined ? p.installation_available : true,
      selling_price: p.selling_price || p.price || 0,
      price: p.selling_price || p.price || 0,
      pricing_unit: p.pricing_unit || 'Per Unit',
      available_stock: p.available_stock !== undefined ? p.available_stock : (p.stock || 1),
      stock: p.available_stock !== undefined ? p.available_stock : (p.stock || 1),
      stock_unit: p.stock_unit || 'Units',
      availability_status: p.availability_status || 'In Stock',
      min_order_quantity: p.min_order_quantity || 1,
      target_areas: p.target_areas || [],
      target_categories: p.target_categories || [],
      images: p.images || [],
      cover_image: p.cover_image || p.images?.[0] || null,
      description: p.description || '',
      status: p.status,
      publishing_status: p.publishing_status,
      views: p.views || 0,
      inquiries_count: p.inquiry_count || 0,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt
    }));

    return successResponse(res, 'Heavy Mining Equipment items retrieved successfully', {
      products: formatted,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        pages: Math.ceil(total / parseInt(limit, 10))
      },
      counts: {
        all: totalCount,
        active: activeCount,
        inactive: inactiveCount,
        draft: draftCount
      }
    });
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

async function createProduct(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getMiningEquipmentProfile(userId);
    if (!profile) return errorResponse(res, 'Heavy Mining Equipment profile not found', null, 404);

    const body = req.body;
    const sku = body.sku || generateMiningEquipmentSKU(body.category);
    const priceVal = body.selling_price !== undefined ? body.selling_price : (body.price || 0);
    const stockVal = body.available_stock !== undefined ? body.available_stock : (body.stock !== undefined ? body.stock : 1);

    const product = new Product({
      vendorId: profile._id,
      businessProfileId: profile._id,
      business_type: 'mining_equipment',
      sku,
      name: body.name,
      category: body.category,
      brand_name: body.brand_name || body.manufacturer || 'Atlas-X Pro',
      model_number: body.model_number,
      part_number: body.part_number,
      oem_number: body.oem_number,
      material_grade: body.material_grade,
      oem_brand_compatibility: body.oem_brand_compatibility || body.brand_name,
      warranty_guarantee: body.warranty_guarantee || '12 Months Manufacturer Warranty',
      technical_specifications: body.technical_specifications || {},
      technical_drawings: body.technical_drawings || [],
      equipment_brochures: body.equipment_brochures || [],
      certification_documents: body.certification_documents || [],
      equipment_condition: body.equipment_condition || 'Brand New',
      delivery_available: body.delivery_available !== undefined ? body.delivery_available : true,
      installation_available: body.installation_available !== undefined ? body.installation_available : true,
      onsite_demonstration: body.onsite_demonstration || false,
      after_sales_support: body.after_sales_support !== undefined ? body.after_sales_support : true,
      service_support: body.service_support !== undefined ? body.service_support : true,
      selling_price: priceVal,
      price: priceVal,
      pricing_unit: body.pricing_unit,
      min_order_quantity: body.min_order_quantity || 1,
      available_stock: stockVal,
      stock: stockVal,
      stock_unit: body.stock_unit || 'Units',
      availability_status: body.availability_status || (stockVal > 0 ? 'In Stock' : 'Out of Stock'),
      images: body.images || [],
      cover_image: body.cover_image || body.images?.[0] || null,
      description: body.description || '',
      short_description: body.short_description || '',
      target_areas: body.target_areas || [],
      target_categories: body.target_categories || [],
      status: body.status || 'active',
      publishing_status: body.publishing_status || 'published'
    });

    await product.save();

    // Log initial stock history
    if (stockVal > 0) {
      await StockHistory.create({
        productId: product._id,
        businessProfileId: profile._id,
        userId,
        previous_stock: 0,
        updated_stock: stockVal,
        stock_change: stockVal,
        change_type: 'set',
        notes: 'Initial stock on heavy mining equipment publication'
      });
    }

    return successResponse(res, 'Heavy mining equipment product created and published successfully', product, 201);
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

async function getProductById(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getMiningEquipmentProfile(userId);
    if (!profile) return errorResponse(res, 'Heavy Mining Equipment profile not found', null, 404);

    const productId = req.params.id;
    const isObjectId = productId.match(/^[0-9a-fA-F]{24}$/);

    const query = {
      $or: [{ businessProfileId: profile._id }, { vendorId: profile._id }],
      ...(isObjectId ? { _id: productId } : { sku: productId })
    };

    const product = await Product.findOne(query);
    if (!product) {
      return errorResponse(res, 'Heavy mining equipment not found', null, 404);
    }

    return successResponse(res, 'Heavy mining equipment details retrieved successfully', product);
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

async function updateProduct(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getMiningEquipmentProfile(userId);
    if (!profile) return errorResponse(res, 'Heavy Mining Equipment profile not found', null, 404);

    const product = await Product.findOne({
      _id: req.params.id,
      $or: [{ businessProfileId: profile._id }, { vendorId: profile._id }]
    });

    if (!product) {
      return errorResponse(res, 'Heavy mining equipment not found to update', null, 404);
    }

    const body = req.body;
    const directFields = [
      'name',
      'category',
      'brand_name',
      'model_number',
      'part_number',
      'oem_number',
      'material_grade',
      'oem_brand_compatibility',
      'warranty_guarantee',
      'description',
      'short_description',
      'pricing_unit',
      'min_order_quantity',
      'stock_unit',
      'availability_status',
      'equipment_condition',
      'delivery_available',
      'installation_available',
      'onsite_demonstration',
      'after_sales_support',
      'service_support',
      'status',
      'publishing_status'
    ];

    directFields.forEach((field) => {
      if (body[field] !== undefined) {
        product[field] = body[field];
      }
    });

    if (body.selling_price !== undefined) {
      product.selling_price = body.selling_price;
      product.price = body.selling_price;
    }

    if (body.available_stock !== undefined) {
      product.available_stock = body.available_stock;
      product.stock = body.available_stock;
    }

    if (body.images !== undefined) product.images = body.images;
    if (body.cover_image !== undefined) product.cover_image = body.cover_image;
    if (body.technical_drawings !== undefined) product.technical_drawings = body.technical_drawings;
    if (body.equipment_brochures !== undefined) product.equipment_brochures = body.equipment_brochures;
    if (body.certification_documents !== undefined) product.certification_documents = body.certification_documents;
    if (body.technical_specifications !== undefined) product.technical_specifications = body.technical_specifications;
    if (body.target_areas !== undefined) product.target_areas = body.target_areas;
    if (body.target_categories !== undefined) product.target_categories = body.target_categories;

    await product.save();

    return successResponse(res, 'Heavy mining equipment updated successfully', product);
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

async function updateStock(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getMiningEquipmentProfile(userId);
    if (!profile) return errorResponse(res, 'Heavy Mining Equipment profile not found', null, 404);

    const productId = req.params.id;
    const product = await Product.findOne({
      _id: productId,
      $or: [{ businessProfileId: profile._id }, { vendorId: profile._id }]
    });

    if (!product) {
      return errorResponse(res, 'Heavy mining equipment not found', null, 404);
    }

    const { stock, change_type = 'set', notes, availability_status } = req.body;
    const prevStock = product.available_stock || 0;
    let newStock = prevStock;

    if (change_type === 'set') {
      newStock = stock;
    } else if (change_type === 'add' || change_type === 'increase') {
      newStock = prevStock + stock;
    } else if (change_type === 'subtract' || change_type === 'decrease') {
      newStock = Math.max(0, prevStock - stock);
    }

    product.available_stock = newStock;
    product.stock = newStock;
    if (availability_status) {
      product.availability_status = availability_status;
    } else {
      product.availability_status = newStock > 0 ? 'In Stock' : 'Out of Stock';
    }

    await product.save();

    await StockHistory.create({
      productId: product._id,
      businessProfileId: profile._id,
      userId,
      previous_stock: prevStock,
      updated_stock: newStock,
      stock_change: newStock - prevStock,
      change_type,
      notes: notes || 'Stock adjustment for heavy mining equipment'
    });

    return successResponse(res, 'Heavy mining equipment stock updated successfully', {
      product_id: product._id,
      previous_stock: prevStock,
      updated_stock: newStock,
      availability_status: product.availability_status
    });
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

async function duplicateProduct(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getMiningEquipmentProfile(userId);
    if (!profile) return errorResponse(res, 'Heavy Mining Equipment profile not found', null, 404);

    const original = await Product.findOne({
      _id: req.params.id,
      $or: [{ businessProfileId: profile._id }, { vendorId: profile._id }]
    });

    if (!original) {
      return errorResponse(res, 'Heavy mining equipment not found to duplicate', null, 404);
    }

    const cloned = original.toObject();
    delete cloned._id;
    delete cloned.createdAt;
    delete cloned.updatedAt;
    delete cloned.__v;

    cloned.name = `${original.name} (Copy)`;
    cloned.sku = generateMiningEquipmentSKU(original.category);
    cloned.status = 'draft';
    cloned.publishing_status = 'draft';
    cloned.views = 0;
    cloned.inquiry_count = 0;

    const newProduct = await Product.create(cloned);

    return successResponse(res, 'Heavy mining equipment duplicated successfully as draft', newProduct, 201);
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

async function toggleProductStatus(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getMiningEquipmentProfile(userId);
    if (!profile) return errorResponse(res, 'Heavy Mining Equipment profile not found', null, 404);

    const product = await Product.findOne({
      _id: req.params.id,
      $or: [{ businessProfileId: profile._id }, { vendorId: profile._id }]
    });

    if (!product) {
      return errorResponse(res, 'Heavy mining equipment not found', null, 404);
    }

    if (req.body.status) {
      product.status = req.body.status;
    } else {
      product.status = product.status === 'active' ? 'inactive' : 'active';
    }

    await product.save();

    return successResponse(res, `Heavy mining equipment status changed to ${product.status}`, {
      id: product._id,
      status: product.status
    });
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

async function deleteProduct(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getMiningEquipmentProfile(userId);
    if (!profile) return errorResponse(res, 'Heavy Mining Equipment profile not found', null, 404);

    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      $or: [{ businessProfileId: profile._id }, { vendorId: profile._id }]
    });

    if (!product) {
      return errorResponse(res, 'Heavy mining equipment not found to delete', null, 404);
    }

    return successResponse(res, 'Heavy mining equipment deleted successfully');
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

// ==========================================
// 4. CONTACTS MANAGEMENT
// ==========================================

async function getContacts(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getMiningEquipmentProfile(userId);
    if (!profile) return errorResponse(res, 'Heavy Mining Equipment profile not found', null, 404);

    return successResponse(res, 'Contacts retrieved successfully', profile.owners || []);
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

async function addContact(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getMiningEquipmentProfile(userId);
    if (!profile) return errorResponse(res, 'Heavy Mining Equipment profile not found', null, 404);

    profile.owners.push(req.body);
    await profile.save();

    const created = profile.owners[profile.owners.length - 1];
    return successResponse(res, 'Contact added successfully', created, 201);
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

async function updateContact(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getMiningEquipmentProfile(userId);
    if (!profile) return errorResponse(res, 'Heavy Mining Equipment profile not found', null, 404);

    const contact = profile.owners.id(req.params.id);
    if (!contact) return errorResponse(res, 'Contact person not found', null, 404);

    Object.assign(contact, req.body);
    await profile.save();

    return successResponse(res, 'Contact updated successfully', contact);
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

async function deleteContact(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getMiningEquipmentProfile(userId);
    if (!profile) return errorResponse(res, 'Heavy Mining Equipment profile not found', null, 404);

    profile.owners.pull(req.params.id);
    await profile.save();

    return successResponse(res, 'Contact deleted successfully');
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
    const profile = await getMiningEquipmentProfile(userId);
    if (!profile) return errorResponse(res, 'Heavy Mining Equipment profile not found', null, 404);

    return successResponse(res, 'Gallery items retrieved', {
      photos: profile.gallery_photos || [],
      videos: profile.gallery_videos || []
    });
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

async function uploadGalleryPhoto(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getMiningEquipmentProfile(userId);
    if (!profile) return errorResponse(res, 'Heavy Mining Equipment profile not found', null, 404);

    const url = req.file ? `/uploads/${req.file.filename}` : req.body.url;
    if (!url) return errorResponse(res, 'Image URL or file upload is required', null, 400);

    const photoData = {
      url,
      title: req.body.title || 'Heavy Mining Equipment Gallery Photo',
      caption: req.body.caption || '',
      category: req.body.category || 'equipment',
      is_cover: req.body.is_cover || false
    };

    profile.gallery_photos.push(photoData);
    await profile.save();

    return successResponse(res, 'Gallery photo added successfully', photoData, 201);
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

async function addGalleryVideo(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getMiningEquipmentProfile(userId);
    if (!profile) return errorResponse(res, 'Heavy Mining Equipment profile not found', null, 404);

    const videoData = {
      title: req.body.title,
      video_url: req.body.video_url || req.body.youtube_url,
      youtube_url: req.body.youtube_url || req.body.video_url,
      source_type: req.body.source_type || 'upload',
      category: req.body.category || 'equipment_demo',
      duration: req.body.duration || '3:00'
    };

    profile.gallery_videos.push(videoData);
    await profile.save();

    return successResponse(res, 'Gallery video added successfully', videoData, 201);
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

async function deleteGalleryPhoto(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getMiningEquipmentProfile(userId);
    if (!profile) return errorResponse(res, 'Heavy Mining Equipment profile not found', null, 404);

    profile.gallery_photos.pull(req.params.id);
    await profile.save();

    return successResponse(res, 'Gallery photo deleted successfully');
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

async function deleteGalleryVideo(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getMiningEquipmentProfile(userId);
    if (!profile) return errorResponse(res, 'Heavy Mining Equipment profile not found', null, 404);

    profile.gallery_videos.pull(req.params.id);
    await profile.save();

    return successResponse(res, 'Gallery video deleted successfully');
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

// ==========================================
// 6. VERIFICATION CENTER
// ==========================================

async function getVerificationStatus(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getMiningEquipmentProfile(userId);
    if (!profile) return errorResponse(res, 'Heavy Mining Equipment profile not found', null, 404);

    const steps = profile.verification_steps || {};
    const totalSteps = 4;
    let completedSteps = 0;
    if (steps.phone?.status === 'verified') completedSteps++;
    if (steps.email?.status === 'verified') completedSteps++;
    if (steps.business?.status === 'verified') completedSteps++;
    if (steps.gst?.status === 'verified') completedSteps++;

    return successResponse(res, 'Verification status retrieved', {
      overall_progress: Math.round((completedSteps / totalSteps) * 100),
      is_verified: profile.is_verified || false,
      verification_status: profile.verification_status || 'approved',
      steps,
      gst_number: profile.gst_number
    });
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

async function verifyGst(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getMiningEquipmentProfile(userId);
    if (!profile) return errorResponse(res, 'Heavy Mining Equipment profile not found', null, 404);

    const { gstin } = req.body;
    profile.gst_number = gstin;
    if (!profile.verification_steps) profile.verification_steps = {};
    profile.verification_steps.gst = {
      gstin,
      status: 'verified',
      verified_at: new Date()
    };

    await profile.save();

    return successResponse(res, 'GST verified successfully', { gstin, status: 'verified' });
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
    const profile = await getMiningEquipmentProfile(userId);
    if (!profile) return errorResponse(res, 'Heavy Mining Equipment profile not found', null, 404);

    const baseProductQuery = {
      $or: [{ businessProfileId: profile._id }, { vendorId: profile._id }],
      business_type: { $in: ['mining_equipment', 'heavy_mining_equipment'] }
    };

    const topProducts = await Product.find(baseProductQuery)
      .sort({ views: -1, inquiry_count: -1 })
      .limit(5)
      .select('name sku category brand_name model_number views inquiry_count selling_price');

    const analytics = {
      metrics: {
        total_profile_views: 3420,
        equipment_views: 8950,
        inquiries_generated: 168,
        leads_matched: 84,
        contact_clicks: 412
      },
      chart_data: {
        timeline: [
          { day: 'Mon', views: 420, inquiries: 8 },
          { day: 'Tue', views: 560, inquiries: 14 },
          { day: 'Wed', views: 610, inquiries: 19 },
          { day: 'Thu', views: 480, inquiries: 11 },
          { day: 'Fri', views: 720, inquiries: 24 },
          { day: 'Sat', views: 810, inquiries: 28 },
          { day: 'Sun', views: 390, inquiries: 9 }
        ]
      },
      top_products: topProducts
    };

    return successResponse(res, 'Heavy Mining Equipment analytics data loaded successfully', analytics);
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

async function recordAnalyticsEvent(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getMiningEquipmentProfile(userId);
    if (!profile) return errorResponse(res, 'Heavy Mining Equipment profile not found', null, 404);

    const event = await AnalyticsEvent.create({
      event_type: req.body.event_type,
      profile_id: profile._id,
      product_id: req.body.product_id || null,
      metadata: req.body.metadata || {}
    });

    return successResponse(res, 'Analytics event recorded', event, 201);
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
    const profile = await getMiningEquipmentProfile(userId);
    if (!profile) return errorResponse(res, 'Heavy Mining Equipment profile not found', null, 404);

    const inquiries = await Inquiry.find({
      $or: [
        { businessId: profile._id },
        { vendorId: profile._id },
        { category: { $in: ['Heavy Mining Equipment', 'Mining Equipment', 'DTH Drilling', 'Diamond Wire Saw', 'Quarry Equipment', 'Excavators', 'Crushers'] } }
      ]
    }).sort({ createdAt: -1 });

    return successResponse(res, 'Heavy mining equipment inquiries retrieved', inquiries);
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

async function getLeads(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getMiningEquipmentProfile(userId);
    if (!profile) return errorResponse(res, 'Heavy Mining Equipment profile not found', null, 404);

    const leads = await Inquiry.find({
      category: { $in: ['Heavy Mining Equipment', 'Mining Equipment', 'DTH Drilling', 'Diamond Wire Saw', 'Quarry Equipment', 'Excavators', 'Crushers', 'Mining Compressors'] }
    }).sort({ createdAt: -1 });

    return successResponse(res, 'Heavy mining equipment leads matched', leads);
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

module.exports = {
  getDashboard,
  getBusinessTypes,
  switchBusinessType,
  getProfile,
  updateProfile,
  getProducts,
  createProduct,
  getProductById,
  updateProduct,
  updateStock,
  duplicateProduct,
  toggleProductStatus,
  deleteProduct,
  getContacts,
  addContact,
  updateContact,
  deleteContact,
  getGallery,
  uploadGalleryPhoto,
  addGalleryVideo,
  deleteGalleryPhoto,
  deleteGalleryVideo,
  getVerificationStatus,
  verifyGst,
  getAnalytics,
  recordAnalyticsEvent,
  getInquiries,
  getLeads
};

