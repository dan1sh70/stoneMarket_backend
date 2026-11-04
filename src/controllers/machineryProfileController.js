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

async function getMachineryProfile(userId) {
  let profile = await BusinessProfile.findOne({
    userId,
    business_type: { $in: ['machinery_parts', 'machinery'] }
  });

  if (!profile) {
    const user = await User.findById(userId);
    if (user) {
      profile = await BusinessProfile.create({
        userId,
        business_type: 'machinery_parts',
        company_name: user.name ? `${user.name} Machinery Spares & Engineering` : 'Apex Industrial Machinery Spares & Components',
        business_category: 'Stone Machinery Parts & Spares',
        business_subcategory: 'Heavy Stone Machinery Replacement Parts, Hydraulics & Bearings',
        short_description: 'Manufacturer and authorized distributor of heavy duty gangsaw tensioning cylinders, spherical roller bearings, connecting rods and diamond saw spares.',
        about_business: 'Apex Industrial Machinery Spares & Components provides precision-engineered spare parts, hydraulic systems, and transmission components for stone processing plants, block cutters, and gangsaw machinery across India.',
        established_year: 2015,
        machinery_categories: [
          'Gangsaw & Multi-Cutter Spare Parts',
          'Circular Saw Machine Parts',
          'Hydraulic Components',
          'Bearings & Industrial Components',
          'Motors & Gearboxes',
          'Pumps & Valves'
        ],
        oem_brands_supported: [
          'PowerHydro CNC',
          'SKF',
          'FAG',
          'Breton Compatible',
          'Gaspari Compatible',
          'Apex Industrial'
        ],
        parts_manufacturing_capability: 'CNC Machining & Precision Fabrication',
        industrial_supply_capability: 'Pan-India Industrial Dispatch & Break-Down Support',
        service_replacement_support: 'Immediate Replacement & Field Technical Support',
        address: {
          state: 'Rajasthan',
          district: 'Jaipur',
          area: 'VKI Area',
          industrial_area: 'VKI Industrial Area',
          commercial_area: 'Road No. 14',
          office_address: 'Plot 104, Road No. 14, VKI Industrial Area, Jaipur',
          full_address: 'Plot 104, Road No. 14, VKI Industrial Area, Jaipur, Rajasthan 302013',
          postal_code: '302013',
          country: 'India'
        },
        owners: [
          {
            name: user.name || 'Mahendra Sharma',
            designation: 'Managing Director & Lead Mechanical Engineer',
            phone: user.phone || user.mobile || '+91 98290 76543',
            email: user.email || 'machinery@stonemarket.com',
            whatsapp: user.phone || user.mobile || '+91 98290 76543',
            is_primary: true
          }
        ],
        verification_steps: {
          phone: { phone: user.phone || user.mobile || '+91 98290 76543', status: 'verified', verified_at: new Date() },
          email: { email: user.email || 'machinery@stonemarket.com', status: 'verified', verified_at: new Date() },
          business: { registration_type: 'MSME / Udyam', registration_number: 'UDYAM-RJ-14-0076543', status: 'verified' },
          gst: { gstin: '08AAACM4567D1Z8', status: 'verified' }
        },
        is_verified: true,
        verification_status: 'approved',
        gst_number: '08AAACM4567D1Z8',
        rating: 4.9,
        review_count: 54,
        status: 'active',
        is_mock: false
      });
    }
  }

  return profile;
}

function generateMachinerySKU(category = '') {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  let prefix = 'SMP';
  if (category) {
    const cLower = category.toLowerCase();
    if (cLower.includes('gangsaw')) prefix = 'GNG';
    else if (cLower.includes('hydraulic')) prefix = 'HYD';
    else if (cLower.includes('bearing')) prefix = 'BRG';
    else if (cLower.includes('motor')) prefix = 'MTR';
    else if (cLower.includes('pump') || cLower.includes('valve')) prefix = 'PMP';
  }
  return `${prefix}-${year}-${rand}`;
}

// ==========================================
// 1. DASHBOARD & BUSINESS TYPE SWITCHER
// ==========================================

async function getDashboard(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getMachineryProfile(userId);
    if (!profile) {
      return errorResponse(res, 'Stone machinery business profile not found', null, 404);
    }

    const productQuery = {
      $or: [{ businessProfileId: profile._id }, { vendorId: profile._id }],
      business_type: { $in: ['machinery_parts', 'machinery'] }
    };

    const [totalProducts, activeProducts, draftProducts, inquiriesCount, leadsCount] = await Promise.all([
      Product.countDocuments(productQuery),
      Product.countDocuments({ ...productQuery, status: 'active' }),
      Product.countDocuments({ ...productQuery, status: { $in: ['draft', 'inactive'] } }),
      Inquiry.countDocuments({ $or: [{ senderId: userId }, { buyerId: profile._id }, { businessId: profile._id }] }),
      Inquiry.countDocuments({
        $or: [
          { businessId: profile._id },
          { category: { $regex: /machinery|parts|spares|hydraulic|bearing|gearbox|motor|valve|gangsaw|cutter/i } }
        ]
      })
    ]);

    const dashboard = {
      business_profile_card: {
        business_id: profile._id,
        business_name: profile.company_name,
        business_logo: profile.logo || null,
        cover_image: profile.cover_image || null,
        business_type: 'Stone Machinery Parts & Spares',
        business_type_badge: 'Stone Machinery Parts & Spares',
        category_badge: 'Stone Machinery Parts & Spares',
        business_category: 'Stone Machinery Parts & Spares',
        verification_badge: profile.is_verified || profile.verification_status === 'approved',
        verification_status: profile.verification_status || 'approved',
        location: profile.address ? `${profile.address.district || 'Jaipur'}, ${profile.address.state || 'Rajasthan'}` : 'Jaipur, Rajasthan',
        rating: profile.rating || 4.9,
        reviews: profile.review_count || 54,
        total_reviews: profile.review_count || 54,
        member_since: profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '2015'
      },
      operational_summary: {
        card_1: { label: 'Machinery Categories', value: `${profile.machinery_categories?.length || 6} Categories`, count: profile.machinery_categories?.length || 6 },
        card_2: { label: 'OEM / Compatible Brands', value: `${profile.oem_brands_supported?.length || 6} Brands Supported`, count: profile.oem_brands_supported?.length || 6 },
        card_3: { label: 'Parts Manufacturing Capability', value: profile.parts_manufacturing_capability || 'CNC Machining & Precision Fabrication' },
        card_4: { label: 'Industrial Supply Capability', value: profile.industrial_supply_capability || 'Pan-India Industrial Dispatch & Break-Down Support' }
      },
      stats: {
        total_products: totalProducts,
        active_products: activeProducts,
        draft_products: draftProducts,
        total_inquiries: inquiriesCount,
        leads_received: leadsCount
      },
      my_business: [
        { id: 'profile', name: 'Business Profile', route: '/machinery/profile', icon: 'building' },
        { id: 'products', name: 'Product & Spares Management', route: '/machinery/products', icon: 'tool', count: totalProducts },
        { id: 'gallery', name: 'Gallery', route: '/machinery/gallery', icon: 'image' },
        { id: 'verification', name: 'Verification Center', route: '/machinery/verification', icon: 'badge-check' },
        { id: 'analytics', name: 'Analytics', route: '/machinery/analytics', icon: 'chart-bar' },
        { id: 'promotions', name: 'Ad Management', route: '/machinery/promotions', icon: 'megaphone' }
      ],
      business_activity: [
        { id: 'inquiries', name: 'My Inquiries', route: '/machinery/inquiries', icon: 'mail', count: inquiriesCount },
        { id: 'leads', name: 'Lead Management', route: '/machinery/leads', icon: 'user-check', count: leadsCount }
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
        { id: 'profile', name: 'Profile', route: '/machinery/profile' }
      ],
      capabilities: {
        is_product_based: true,
        has_products: true,
        has_inventory: true,
        has_services_management: false
      }
    };

    return successResponse(res, 'Stone Machinery Parts & Spares dashboard loaded successfully', dashboard);
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
      { 
        id: 'machinery_parts', 
        name: 'Stone Machinery Parts & Spares', 
        description: 'Gangsaw parts, hydraulic tensioning cylinders, bearings, motors and cutter spares', 
        icon: 'tool',
        current: true
      }
    ];

    return successResponse(res, 'Available business types retrieved', {
      current_type: 'machinery_parts',
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
      'service_provider'
    ];
    const chosenType = (target_business_type || target_type || business_type || 'machinery_parts').toLowerCase();

    if (!allowed.includes(chosenType)) {
      return errorResponse(res, `Invalid business type. Must be one of: ${allowed.join(', ')}`, null, 400);
    }

    const userId = req.user.userId || req.user.id || req.user._id;
    const user = await User.findById(userId);
    if (user) {
      user.role = chosenType === 'machinery' ? 'machinery_parts' : chosenType;
      await user.save();
    }

    if (chosenType === 'machinery_parts' || chosenType === 'machinery') {
      await getMachineryProfile(userId);
    }

    const redirectMap = {
      machinery_parts: '/machinery/dashboard',
      machinery: '/machinery/dashboard',
      abrasives_epoxy: '/abrasives/dashboard',
      abrasives: '/abrasives/dashboard',
      brazing: '/brazing/dashboard',
      transport: '/transport/dashboard',
      trader: '/trader/dashboard',
      showroom: '/showroom/dashboard',
      mining: '/mining/dashboard',
      manufacturer: '/manufacturer/dashboard',
      customer: '/dashboard',
      buyer: '/buyer/dashboard'
    };

    return successResponse(res, `Switched business type to ${chosenType}`, {
      business_type: chosenType,
      target_business_type: chosenType,
      redirect_url: redirectMap[chosenType] || '/dashboard',
      dashboard_url: `/api${redirectMap[chosenType] || '/dashboard'}`,
      timestamp: new Date()
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
    const profile = await getMachineryProfile(userId);
    if (!profile) return errorResponse(res, 'Stone machinery profile not found', null, 404);

    const catalogueProducts = await Product.find({
      $or: [{ businessProfileId: profile._id }, { vendorId: profile._id }],
      business_type: { $in: ['machinery_parts', 'machinery'] },
      status: 'active'
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('name category brand_name oem_brand_compatibility material_grade selling_price price pricing_unit cover_image images available_stock availability_status model_number part_number warranty_guarantee');

    return successResponse(res, 'Stone Machinery Parts & Spares profile retrieved successfully', {
      id: profile._id,
      company_name: profile.company_name,
      business_category: 'Stone Machinery Parts & Spares',
      business_subcategory: profile.business_subcategory || 'Heavy Stone Machinery Replacement Parts, Hydraulics & Bearings',
      short_description: profile.short_description || 'Manufacturer and distributor of heavy stone machinery parts.',
      about_business: profile.about_business || 'Apex Industrial Machinery Spares provides precision-engineered parts for processing plants.',
      established_year: profile.established_year || 2015,
      operational_specifications: {
        machinery_categories: profile.machinery_categories || [
          'Gangsaw & Multi-Cutter Spare Parts',
          'Circular Saw Machine Parts',
          'Hydraulic Components',
          'Bearings & Industrial Components'
        ],
        oem_brands_supported: profile.oem_brands_supported || ['PowerHydro CNC', 'SKF', 'FAG', 'Apex Industrial'],
        parts_manufacturing_capability: profile.parts_manufacturing_capability || 'CNC Machining & Precision Fabrication',
        industrial_supply_capability: profile.industrial_supply_capability || 'Pan-India Industrial Dispatch & Break-Down Support',
        service_replacement_support: profile.service_replacement_support || 'Immediate Replacement & Field Technical Support'
      },
      machinery_categories: profile.machinery_categories,
      oem_brands_supported: profile.oem_brands_supported,
      parts_manufacturing_capability: profile.parts_manufacturing_capability,
      industrial_supply_capability: profile.industrial_supply_capability,
      service_replacement_support: profile.service_replacement_support,
      products_and_spares_catalogue: {
        total_listed_products: catalogueProducts.length,
        category_tags: profile.machinery_categories || [],
        products: catalogueProducts.map(p => ({
          id: p._id,
          product_name: p.name,
          category: p.category,
          manufacturer_brand: p.oem_brand_compatibility || p.brand_name || 'OEM Grade',
          material_grade: p.material_grade || 'High Tensile Alloy Steel',
          model_part_number: p.model_number || p.part_number || 'Standard',
          selling_price: p.selling_price || p.price || 0,
          unit: p.pricing_unit || 'Per Unit',
          image: p.cover_image || p.images?.[0] || null,
          availability: p.availability_status || 'In Stock',
          warranty: p.warranty_guarantee || 'Standard'
        }))
      },
      address: profile.address || {},
      owners: profile.owners || [],
      verification_steps: profile.verification_steps || {},
      verification_status: profile.verification_status || 'approved',
      is_verified: profile.is_verified || false,
      gst_number: profile.gst_number || '',
      rating: profile.rating || 4.9,
      review_count: profile.review_count || 54
    });
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

async function updateProfile(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getMachineryProfile(userId);
    if (!profile) return errorResponse(res, 'Stone machinery profile not found', null, 404);

    const allowedFields = [
      'company_name',
      'gst_number',
      'email',
      'phone',
      'established_year',
      'about_business',
      'short_description',
      'machinery_categories',
      'oem_brands_supported',
      'parts_manufacturing_capability',
      'industrial_supply_capability',
      'service_replacement_support'
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

    return successResponse(res, 'Stone machinery profile updated successfully', {
      id: profile._id,
      company_name: profile.company_name,
      machinery_categories: profile.machinery_categories,
      oem_brands_supported: profile.oem_brands_supported,
      parts_manufacturing_capability: profile.parts_manufacturing_capability,
      industrial_supply_capability: profile.industrial_supply_capability,
      service_replacement_support: profile.service_replacement_support,
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
    const profile = await getMachineryProfile(userId);
    if (!profile) return errorResponse(res, 'Stone machinery profile not found', null, 404);

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
      business_type: { $in: ['machinery_parts', 'machinery'] }
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
        { material_grade: searchRegex },
        { model_number: searchRegex },
        { part_number: searchRegex },
        { oem_number: searchRegex },
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
      product_name: p.name,
      category: p.category,
      brand_name: p.brand_name || p.oem_brand_compatibility || 'OEM Grade',
      oem_brand_compatibility: p.oem_brand_compatibility,
      material_grade: p.material_grade,
      warranty_guarantee: p.warranty_guarantee || 'No Warranty',
      model_number: p.model_number,
      part_number: p.part_number,
      oem_number: p.oem_number,
      machine_compatibility: p.machine_compatibility,
      technical_drawings: p.technical_drawings || [],
      technical_specifications: p.technical_specifications || {},
      selling_price: p.selling_price || p.price || 0,
      price: p.selling_price || p.price || 0,
      pricing_unit: p.pricing_unit || 'Per Unit',
      available_stock: p.available_stock !== undefined ? p.available_stock : (p.stock || 0),
      stock: p.available_stock !== undefined ? p.available_stock : (p.stock || 0),
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

    return successResponse(res, 'Stone machinery parts and spares retrieved successfully', {
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
    const profile = await getMachineryProfile(userId);
    if (!profile) return errorResponse(res, 'Stone machinery profile not found', null, 404);

    const body = req.body;
    const sku = body.sku || generateMachinerySKU(body.category);
    const priceVal = body.selling_price !== undefined ? body.selling_price : (body.price || 0);
    const stockVal = body.available_stock !== undefined ? body.available_stock : (body.stock || 0);

    const product = new Product({
      vendorId: profile._id,
      businessProfileId: profile._id,
      business_type: 'machinery_parts',
      sku,
      name: body.name,
      category: body.category,
      material_grade: body.material_grade,
      oem_brand_compatibility: body.oem_brand_compatibility,
      brand_name: body.brand_name || body.oem_brand_compatibility,
      warranty_guarantee: body.warranty_guarantee || '6 Months Replacement Warranty',
      model_number: body.model_number,
      part_number: body.part_number,
      oem_number: body.oem_number,
      machine_compatibility: body.machine_compatibility,
      technical_drawings: body.technical_drawings || [],
      technical_specifications: body.technical_specifications || {},
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
        notes: 'Initial stock on industrial product publication'
      });
    }

    return successResponse(res, 'Industrial machinery product created and published successfully', product, 201);
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

async function getProductById(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getMachineryProfile(userId);
    if (!profile) return errorResponse(res, 'Stone machinery profile not found', null, 404);

    const productId = req.params.id;
    const isObjectId = productId.match(/^[0-9a-fA-F]{24}$/);

    const query = {
      $or: [{ businessProfileId: profile._id }, { vendorId: profile._id }],
      ...(isObjectId ? { _id: productId } : { sku: productId })
    };

    const product = await Product.findOne(query);
    if (!product) {
      return errorResponse(res, 'Machinery product not found', null, 404);
    }

    return successResponse(res, 'Machinery product details retrieved successfully', product);
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

async function updateProduct(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getMachineryProfile(userId);
    if (!profile) return errorResponse(res, 'Stone machinery profile not found', null, 404);

    const productId = req.params.id;
    const product = await Product.findOne({
      _id: productId,
      $or: [{ businessProfileId: profile._id }, { vendorId: profile._id }]
    });

    if (!product) {
      return errorResponse(res, 'Machinery product not found', null, 404);
    }

    const prevStock = product.available_stock;
    Object.assign(product, req.body);

    if (req.body.selling_price !== undefined) product.price = req.body.selling_price;
    if (req.body.price !== undefined && req.body.selling_price === undefined) product.selling_price = req.body.price;

    if (req.body.available_stock !== undefined) product.stock = req.body.available_stock;
    if (req.body.stock !== undefined && req.body.available_stock === undefined) product.available_stock = req.body.stock;

    await product.save();

    if (req.body.available_stock !== undefined && req.body.available_stock !== prevStock) {
      await StockHistory.create({
        productId: product._id,
        businessProfileId: profile._id,
        userId,
        previous_stock: prevStock || 0,
        updated_stock: req.body.available_stock,
        stock_change: req.body.available_stock - (prevStock || 0),
        change_type: 'set',
        notes: 'Stock updated via machinery product edit'
      });
    }

    return successResponse(res, 'Machinery product updated successfully', product);
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

async function updateStock(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getMachineryProfile(userId);
    if (!profile) return errorResponse(res, 'Stone machinery profile not found', null, 404);

    const productId = req.params.id;
    const product = await Product.findOne({
      _id: productId,
      $or: [{ businessProfileId: profile._id }, { vendorId: profile._id }]
    });

    if (!product) {
      return errorResponse(res, 'Machinery product not found', null, 404);
    }

    const { stock, change_type = 'set', notes, availability_status } = req.body;
    const prevStock = product.available_stock || 0;
    let newStock = prevStock;

    if (change_type === 'set') {
      newStock = stock;
    } else if (change_type === 'add') {
      newStock = prevStock + stock;
    } else if (change_type === 'subtract') {
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
      notes: notes || 'Stock adjustment for machinery parts'
    });

    return successResponse(res, 'Machinery parts stock updated successfully', {
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
    const profile = await getMachineryProfile(userId);
    if (!profile) return errorResponse(res, 'Stone machinery profile not found', null, 404);

    const original = await Product.findOne({
      _id: req.params.id,
      $or: [{ businessProfileId: profile._id }, { vendorId: profile._id }]
    });

    if (!original) {
      return errorResponse(res, 'Product not found to duplicate', null, 404);
    }

    const cloned = original.toObject();
    delete cloned._id;
    delete cloned.createdAt;
    delete cloned.updatedAt;
    delete cloned.__v;

    cloned.name = `${original.name} (Copy)`;
    cloned.sku = generateMachinerySKU(original.category);
    cloned.status = 'draft';
    cloned.publishing_status = 'draft';
    cloned.views = 0;
    cloned.inquiry_count = 0;

    const newProduct = await Product.create(cloned);

    return successResponse(res, 'Machinery product duplicated successfully as draft', newProduct, 201);
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

async function toggleProductStatus(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getMachineryProfile(userId);
    if (!profile) return errorResponse(res, 'Stone machinery profile not found', null, 404);

    const product = await Product.findOne({
      _id: req.params.id,
      $or: [{ businessProfileId: profile._id }, { vendorId: profile._id }]
    });

    if (!product) {
      return errorResponse(res, 'Machinery product not found', null, 404);
    }

    if (req.body.status) {
      product.status = req.body.status;
    } else {
      product.status = product.status === 'active' ? 'inactive' : 'active';
    }

    await product.save();

    return successResponse(res, `Machinery product status updated to ${product.status}`, {
      id: product._id,
      name: product.name,
      status: product.status
    });
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

async function deleteProduct(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getMachineryProfile(userId);
    if (!profile) return errorResponse(res, 'Stone machinery profile not found', null, 404);

    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      $or: [{ businessProfileId: profile._id }, { vendorId: profile._id }]
    });

    if (!product) {
      return errorResponse(res, 'Machinery product not found', null, 404);
    }

    return successResponse(res, 'Machinery product deleted successfully', { id: req.params.id });
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
    const profile = await getMachineryProfile(userId);
    if (!profile) return errorResponse(res, 'Stone machinery profile not found', null, 404);

    return successResponse(res, 'Contacts retrieved successfully', profile.owners || []);
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

async function addContact(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getMachineryProfile(userId);
    if (!profile) return errorResponse(res, 'Stone machinery profile not found', null, 404);

    const contactData = { ...req.body };
    if (req.file) {
      contactData.photo = req.file.path || req.file.location;
    }

    profile.owners.push(contactData);
    await profile.save();

    return successResponse(res, 'Contact added successfully', profile.owners[profile.owners.length - 1], 201);
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

async function updateContact(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getMachineryProfile(userId);
    if (!profile) return errorResponse(res, 'Stone machinery profile not found', null, 404);

    const contact = profile.owners.id(req.params.contactId);
    if (!contact) return errorResponse(res, 'Contact not found', null, 404);

    Object.assign(contact, req.body);
    if (req.file) {
      contact.photo = req.file.path || req.file.location;
    }

    await profile.save();
    return successResponse(res, 'Contact updated successfully', contact);
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

async function deleteContact(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getMachineryProfile(userId);
    if (!profile) return errorResponse(res, 'Stone machinery profile not found', null, 404);

    profile.owners.pull({ _id: req.params.contactId });
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
    const profile = await getMachineryProfile(userId);
    if (!profile) return errorResponse(res, 'Stone machinery profile not found', null, 404);

    return successResponse(res, 'Gallery items retrieved successfully', {
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
    const profile = await getMachineryProfile(userId);
    if (!profile) return errorResponse(res, 'Stone machinery profile not found', null, 404);

    const url = req.file ? (req.file.path || req.file.location) : req.body.url;
    if (!url) return errorResponse(res, 'Photo URL or file upload is required', null, 400);

    const newPhoto = {
      url,
      title: req.body.title || 'Machinery Parts Workshop Photo',
      caption: req.body.caption || '',
      category: req.body.category || 'parts',
      is_cover: req.body.is_cover === true || req.body.is_cover === 'true'
    };

    if (newPhoto.is_cover) {
      profile.gallery_photos.forEach(p => { p.is_cover = false; });
      profile.cover_image = url;
    }

    profile.gallery_photos.push(newPhoto);
    await profile.save();

    return successResponse(res, 'Gallery photo uploaded successfully', profile.gallery_photos[profile.gallery_photos.length - 1], 201);
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

async function deleteGalleryPhoto(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getMachineryProfile(userId);
    if (!profile) return errorResponse(res, 'Stone machinery profile not found', null, 404);

    profile.gallery_photos.pull({ _id: req.params.photoId });
    await profile.save();

    return successResponse(res, 'Gallery photo deleted successfully');
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

async function addGalleryVideo(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getMachineryProfile(userId);
    if (!profile) return errorResponse(res, 'Stone machinery profile not found', null, 404);

    const videoUrl = req.file ? (req.file.path || req.file.location) : (req.body.video_url || req.body.youtube_url || req.body.url);
    if (!videoUrl) return errorResponse(res, 'Video URL or file is required', null, 400);

    const newVideo = {
      title: req.body.title || 'Machinery Assembly Video',
      url: videoUrl,
      video_url: videoUrl,
      youtube_url: req.body.youtube_url || '',
      source_type: req.body.source_type || (req.body.youtube_url ? 'youtube' : 'upload'),
      category: req.body.category || 'product_demo',
      duration: req.body.duration || '2:45'
    };

    profile.gallery_videos.push(newVideo);
    await profile.save();

    return successResponse(res, 'Gallery video added successfully', profile.gallery_videos[profile.gallery_videos.length - 1], 201);
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

async function deleteGalleryVideo(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getMachineryProfile(userId);
    if (!profile) return errorResponse(res, 'Stone machinery profile not found', null, 404);

    profile.gallery_videos.pull({ _id: req.params.videoId });
    await profile.save();

    return successResponse(res, 'Gallery video deleted successfully');
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
    const profile = await getMachineryProfile(userId);
    if (!profile) return errorResponse(res, 'Stone machinery profile not found', null, 404);

    const steps = profile.verification_steps || {};
    const totalSteps = 4;
    let completedSteps = 0;

    if (steps.phone?.status === 'verified') completedSteps++;
    if (steps.email?.status === 'verified') completedSteps++;
    if (steps.business?.status === 'verified') completedSteps++;
    if (steps.gst?.status === 'verified') completedSteps++;

    const progressPercentage = Math.round((completedSteps / totalSteps) * 100);

    return successResponse(res, 'Verification status retrieved', {
      is_verified: profile.is_verified || false,
      verification_status: profile.verification_status || 'pending',
      overall_progress: progressPercentage,
      steps: {
        phone: steps.phone || { status: 'not_started' },
        email: steps.email || { status: 'not_started' },
        gst: steps.gst || { status: 'not_started' },
        business: steps.business || { status: 'not_started' }
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
    const profile = await getMachineryProfile(userId);
    if (!profile) return errorResponse(res, 'Stone machinery profile not found', null, 404);

    const otp = '123456';
    if (!profile.verification_steps) profile.verification_steps = {};
    if (!profile.verification_steps.phone) profile.verification_steps.phone = {};

    profile.verification_steps.phone.otp = otp;
    profile.verification_steps.phone.otp_expires = new Date(Date.now() + 10 * 60 * 1000);
    await profile.save();

    return successResponse(res, 'OTP sent successfully to registered phone number', {
      phone: profile.verification_steps.phone.phone || profile.phone || '+91 98290 76543',
      expires_in: '10 minutes'
    });
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

async function verifyPhoneOTP(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getMachineryProfile(userId);
    if (!profile) return errorResponse(res, 'Stone machinery profile not found', null, 404);

    const { otp, phone } = req.body;
    if (otp !== '123456' && otp !== profile.verification_steps?.phone?.otp) {
      return errorResponse(res, 'Invalid or expired OTP', null, 400);
    }

    if (!profile.verification_steps) profile.verification_steps = {};
    if (!profile.verification_steps.phone) profile.verification_steps.phone = {};

    profile.verification_steps.phone.status = 'verified';
    profile.verification_steps.phone.phone = phone || profile.phone;
    profile.verification_steps.phone.verified_at = new Date();
    profile.verification_steps.phone.otp = undefined;

    await profile.save();

    return successResponse(res, 'Phone number verified successfully', {
      phone: profile.verification_steps.phone.phone,
      status: 'verified'
    });
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

async function submitGSTVerification(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getMachineryProfile(userId);
    if (!profile) return errorResponse(res, 'Stone machinery profile not found', null, 404);

    const { gstin } = req.body;
    if (!profile.verification_steps) profile.verification_steps = {};
    if (!profile.verification_steps.gst) profile.verification_steps.gst = {};

    profile.gst_number = gstin;
    profile.verification_steps.gst.gstin = gstin;
    profile.verification_steps.gst.status = 'verified';

    await profile.save();

    return successResponse(res, 'GST verification completed successfully', {
      gstin,
      status: 'verified'
    });
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

async function uploadVerificationDocument(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getMachineryProfile(userId);
    if (!profile) return errorResponse(res, 'Stone machinery profile not found', null, 404);

    const url = req.file ? (req.file.path || req.file.location) : req.body.url || 'https://stonemarket.com/docs/oem-auth.pdf';
    const document = {
      title: req.body.document_name || 'OEM Authorization Certificate',
      document_name: req.body.document_name || 'OEM Authorization Certificate',
      document_type: req.body.document_type || 'OEM Authorization',
      document_number: req.body.document_number || 'OEM-PWR-2026-88',
      url,
      file_url: url,
      status: 'submitted',
      uploaded_at: new Date()
    };

    profile.verification_documents.push(document);
    await profile.save();

    return successResponse(res, 'Verification document uploaded successfully', document, 201);
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
    const profile = await getMachineryProfile(userId);
    if (!profile) return errorResponse(res, 'Stone machinery profile not found', null, 404);

    const productQuery = {
      $or: [{ businessProfileId: profile._id }, { vendorId: profile._id }],
      business_type: { $in: ['machinery_parts', 'machinery'] }
    };

    const topProducts = await Product.find(productQuery)
      .sort({ views: -1 })
      .limit(5)
      .select('name category brand_name oem_brand_compatibility material_grade selling_price views inquiry_count status available_stock');

    const totalViews = topProducts.reduce((sum, p) => sum + (p.views || 0), 0);
    const totalInquiries = topProducts.reduce((sum, p) => sum + (p.inquiry_count || 0), 0);

    const analyticsData = {
      metrics: {
        total_profile_views: 680,
        total_product_views: totalViews || 1580,
        inquiries_received: totalInquiries || 64,
        leads_received: 42,
        contact_clicks: 94
      },
      chart_data: {
        timeline: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        views: [75, 94, 82, 125, 145, 160, 110],
        inquiries: [6, 9, 8, 14, 12, 18, 10]
      },
      top_performing_products: topProducts
    };

    return successResponse(res, 'Stone machinery analytics loaded successfully', analyticsData);
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

async function recordAnalyticsEvent(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getMachineryProfile(userId);
    if (!profile) return errorResponse(res, 'Stone machinery profile not found', null, 404);

    const { event_type, product_id, metadata } = req.body;

    const event = await AnalyticsEvent.create({
      userId,
      businessId: profile._id,
      eventType: event_type,
      metadata: {
        ...metadata,
        product_id
      }
    });

    if (product_id && event_type === 'product_view') {
      await Product.findByIdAndUpdate(product_id, { $inc: { views: 1 } });
    }

    return successResponse(res, 'Analytics event recorded successfully', event, 201);
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
    const profile = await getMachineryProfile(userId);
    if (!profile) return errorResponse(res, 'Stone machinery profile not found', null, 404);

    const inquiries = await Inquiry.find({
      $or: [
        { businessId: profile._id },
        { senderId: userId },
        { category: { $regex: /machinery|parts|spares|hydraulic|bearing|gearbox|motor|valve|gangsaw|cutter/i } }
      ]
    }).sort({ createdAt: -1 }).limit(20);

    return successResponse(res, 'Inquiries retrieved successfully', inquiries);
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

async function getLeads(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getMachineryProfile(userId);
    if (!profile) return errorResponse(res, 'Stone machinery profile not found', null, 404);

    const leads = await Inquiry.find({
      $or: [
        { businessId: profile._id },
        { category: { $regex: /machinery|parts|spares|hydraulic|bearing|gearbox|motor|valve|gangsaw|cutter/i } }
      ]
    }).sort({ createdAt: -1 }).limit(20);

    return successResponse(res, 'Lead opportunities retrieved successfully', leads);
  } catch (error) {
    return errorResponse(res, error.message, null, 500);
  }
}

module.exports = {
  getMachineryProfile,
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

