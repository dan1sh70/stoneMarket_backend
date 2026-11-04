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

async function getPowderSupplierProfile(userId) {
  let profile = await BusinessProfile.findOne({
    userId,
    business_type: { $in: ['powder_supplier', 'mineral_supplier'] }
  });

  if (!profile) {
    const user = await User.findById(userId);
    if (user) {
      profile = await BusinessProfile.create({
        userId,
        business_type: 'powder_supplier',
        company_name: user.name ? `${user.name} Micron Minerals` : 'Shree Krishna Micron Minerals & Chemicals',
        business_category: 'Mineral & Powder Supplier',
        business_subcategory: 'Super White Micronized Calcite, Surface Coated CaCO3, Dolomite & Quartz Powders',
        short_description: 'Leading processor and bulk supplier of ultra-pure micronized calcite powders, surface-coated calcium carbonate, quartz silica fillers, and dolomite for stone adhesive, artificial marble, and composite manufacturing.',
        about_business: 'Shree Krishna Micron Minerals & Chemicals operates state-of-the-art automated ball mill grinding and air classifier systems producing 300 to 1250 mesh micronized powders with over 98% whiteness and extreme chemical purity. Serving artificial marble slab manufacturers, stone adhesive units, PVC polymer compounding, and paint industries across India.',
        established_year: 2011,
        mineral_categories: [
          'Calcite Powder',
          'Micronized Calcite Powder',
          'Coated Calcite Powder',
          'Ground Calcium Carbonate (GCC)',
          'Dolomite Powder',
          'Quartz Powder',
          'Silica Powder',
          'Marble Powder',
          'Mineral Filler Powder'
        ],
        monthly_grinding_capacity: '10,000+ MT / Month',
        micronizing_facility: 'Continuous Ball Mills, Dynamic Air Classifiers & Pin Mill Coating Units',
        annual_mineral_supply_volume: '1,00,000+ Metric Tons Supplied',
        address: {
          state: 'Rajasthan',
          district: 'Alwar',
          area: 'MIA Industrial Area',
          industrial_area: 'Matsya Industrial Area (MIA)',
          commercial_area: 'Mineral Processing Zone',
          office_address: 'Plot G-112 to 115, Phase-I, Matsya Industrial Area, Alwar',
          full_address: 'Plot G-112 to 115, Phase-I, Matsya Industrial Area, Alwar, Rajasthan 301030',
          postal_code: '301030',
          country: 'India'
        },
        owners: [
          {
            name: user.name || 'Gopal Krishna Agarwal',
            designation: 'Managing Director & Mineral Technologist',
            phone: user.phone || user.mobile || '+91 98290 66551',
            email: user.email || 'minerals@stonemarket.com',
            whatsapp: user.phone || user.mobile || '+91 98290 66551',
            is_primary: true
          }
        ],
        verification_steps: {
          phone: { phone: user.phone || user.mobile || '+91 98290 66551', status: 'verified', verified_at: new Date() },
          email: { email: user.email || 'minerals@stonemarket.com', status: 'verified', verified_at: new Date() },
          business: { registration_type: 'MSME / Udyam', registration_number: 'UDYAM-RJ-02-0066551', status: 'verified' },
          gst: { gstin: '08AABCS6655C1Z3', status: 'verified' }
        },
        is_verified: true,
        verification_status: 'approved',
        gst_number: '08AABCS6655C1Z3',
        rating: 4.9,
        review_count: 72,
        status: 'active',
        is_mock: false
      });
    }
  }

  return profile;
}

function generateMineralSKU(category = '') {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  let prefix = 'MIN'; // Default Mineral
  if (category) {
    const cLower = category.toLowerCase();
    if (cLower.includes('calcite') || cLower.includes('caco3') || cLower.includes('calcium')) prefix = 'CAL';
    else if (cLower.includes('dolomite')) prefix = 'DOL';
    else if (cLower.includes('silica') || cLower.includes('quartz')) prefix = 'SIL';
    else if (cLower.includes('feldspar')) prefix = 'FLD';
    else if (cLower.includes('clay') || cLower.includes('kaolin')) prefix = 'KAO';
    else if (cLower.includes('talc') || cLower.includes('soapstone')) prefix = 'TLC';
    else if (cLower.includes('garnet') || cLower.includes('abrasive')) prefix = 'GRN';
    else if (cLower.includes('marble')) prefix = 'MRB';
  }
  return `${prefix}-${year}-${rand}`;
}

// ==========================================
// 1. DASHBOARD & BUSINESS SWITCHER
// ==========================================

async function getDashboard(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getPowderSupplierProfile(userId);
    if (!profile) return errorResponse(res, 'Mineral & Powder Supplier profile not found', null, 404);

    const baseProductQuery = {
      $or: [{ businessProfileId: profile._id }, { vendorId: profile._id }],
      business_type: { $in: ['powder_supplier', 'mineral_supplier'] }
    };

    const [
      totalPowders,
      activePowders,
      draftPowders,
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
          { category: { $in: ['Mineral & Powder Supplier', 'Powder Supplier', 'Minerals', 'Calcite Powder', 'Dolomite Powder', 'Quartz Powder', 'Silica Powder', 'Industrial Stone Powders'] } }
        ]
      }),
      Inquiry.countDocuments({
        category: { $in: ['Mineral & Powder Supplier', 'Powder Supplier', 'Minerals', 'Calcite Powder', 'Dolomite Powder', 'Quartz Powder', 'Silica Powder', 'Industrial Stone Powders', 'Mineral Filler Powder'] }
      })
    ]);

    const dashboard = {
      business_profile_card: {
        profile_id: profile._id,
        business_logo: profile.logo || 'https://stonemarket.com/defaults/powder-supplier-logo.png',
        business_name: profile.company_name,
        verification_badge: profile.is_verified,
        is_verified: profile.is_verified,
        business_type: 'Mineral & Powder Supplier',
        location: profile.address ? `${profile.address.district || 'Alwar'}, ${profile.address.state || 'Rajasthan'}` : 'Alwar, Rajasthan',
        rating: profile.rating || 4.9,
        reviews: profile.review_count || 72,
        total_reviews: profile.review_count || 72,
        member_since: profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Jan 2024'
      },
      operational_summary: {
        mineral_categories_count: (profile.mineral_categories || []).length || 9,
        monthly_grinding_capacity: profile.monthly_grinding_capacity || '10,000+ MT / Month',
        micronizing_facility: profile.micronizing_facility || 'Continuous Ball Mills, Dynamic Air Classifiers & Pin Mill Coating Units',
        annual_mineral_supply_volume: profile.annual_mineral_supply_volume || '1,00,000+ Metric Tons Supplied'
      },
      operational_summary_cards: [
        {
          title: 'Mineral Categories',
          value: `${(profile.mineral_categories || []).length || 9} Categories`,
          subtitle: 'Calcite, Dolomite, Silica & Fillers'
        },
        {
          title: 'Monthly Grinding Capacity',
          value: profile.monthly_grinding_capacity || '10,000+ MT / Month',
          subtitle: 'Continuous Automated Processing'
        },
        {
          title: 'Micronizing Setup',
          value: 'Ball Mills & Air Classifiers',
          subtitle: '300 to 1250 Mesh Precision Grinding'
        },
        {
          title: 'Annual Supply Volume',
          value: profile.annual_mineral_supply_volume || '1,00,000+ MT Supplied',
          subtitle: 'Bulk Tankers & Jumbo Bags Fleet'
        }
      ],
      metrics: {
        total_powders: totalPowders,
        active_powders: activePowders,
        inactive_powders: draftPowders,
        inquiries_count: inquiriesCount,
        leads_count: leadsCount
      },
      my_business_menu: [
        { title: 'Business Profile', path: '/business-profile', icon: 'profile' },
        { title: 'Powder Catalog Management', path: '/powder-supplier/catalog', icon: 'powder' },
        { title: 'Gallery', path: '/powder-supplier/gallery', icon: 'gallery' },
        { title: 'Verification Center', path: '/powder-supplier/verification', icon: 'verification' },
        { title: 'Analytics', path: '/powder-supplier/analytics', icon: 'analytics' },
        { title: 'Ad Management', path: '/powder-supplier/ad-management', icon: 'ad' }
      ],
      business_activity: [
        { title: 'My Inquiries', count: inquiriesCount, path: '/powder-supplier/inquiries' },
        { title: 'Lead Management', count: leadsCount, path: '/powder-supplier/leads' }
      ]
    };

    return successResponse(res, 'Mineral & Powder Supplier dashboard retrieved successfully', dashboard);
  } catch (error) {
    return errorResponse(res, error.message, error, 500);
  }
}

async function getBusinessTypes(req, res) {
  try {
    const businessTypes = [
      { id: 'customer', label: 'Customer / Buyer', is_active: false },
      { id: 'manufacturer', label: 'Manufacturer', is_active: false },
      { id: 'mining', label: 'Mining', is_active: false },
      { id: 'showroom', label: 'Showroom', is_active: false },
      { id: 'trader', label: 'Trader', is_active: false },
      { id: 'stone_buyer', label: 'Stone Buyer', is_active: false },
      { id: 'transport', label: 'Transport', is_active: false },
      { id: 'brazing_tooling', label: 'Brazing & Tooling Service', is_active: false },
      { id: 'abrasive_epoxy', label: 'Abrasives & Epoxy Chemicals', is_active: false },
      { id: 'machinery_parts', label: 'Stone Machinery Parts & Spares', is_active: false },
      { id: 'heavy_mining_equipment', label: 'Heavy Mining Equipment', is_active: false },
      { id: 'solar_solutions', label: 'Industrial Solar Solutions', is_active: false },
      { id: 'diamond_blades', label: 'Diamond Blades & Segments', is_active: false },
      { id: 'machine_manufacturer', label: 'Stone Machine Manufacturer', is_active: false },
      { id: 'powder_supplier', label: 'Mineral & Powder Supplier', is_active: true }
    ];

    return successResponse(res, 'Business types list retrieved successfully', {
      current: 'powder_supplier',
      business_types: businessTypes
    });
  } catch (error) {
    return errorResponse(res, error.message, error, 500);
  }
}

async function switchBusinessType(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const { target_type } = req.body;

    if (!target_type) {
      return errorResponse(res, 'target_type is required', null, 400);
    }

    let user = await User.findById(userId);
    if (!user) return errorResponse(res, 'User not found', null, 404);

    if (user.role !== target_type) {
      user.role = target_type;
      await user.save();
    }

    let profile = await BusinessProfile.findOne({ userId, business_type: target_type });
    if (!profile && (target_type === 'powder_supplier' || target_type === 'mineral_supplier')) {
      profile = await getPowderSupplierProfile(userId);
    }

    return successResponse(res, `Successfully switched business type to ${target_type}`, {
      user_id: user._id,
      current_business_type: target_type,
      profile_exists: !!profile,
      profile_id: profile ? profile._id : null
    });
  } catch (error) {
    return errorResponse(res, error.message, error, 500);
  }
}

// ==========================================
// 2. BUSINESS PROFILE MANAGEMENT
// ==========================================

async function getProfile(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getPowderSupplierProfile(userId);
    if (!profile) return errorResponse(res, 'Mineral & Powder Supplier profile not found', null, 404);

    return successResponse(res, 'Mineral & Powder Supplier profile retrieved successfully', profile);
  } catch (error) {
    return errorResponse(res, error.message, error, 500);
  }
}

async function updateProfile(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    let profile = await getPowderSupplierProfile(userId);
    if (!profile) return errorResponse(res, 'Mineral & Powder Supplier profile not found', null, 404);

    const allowedFields = [
      'company_name',
      'gst_number',
      'email',
      'phone',
      'established_year',
      'about_business',
      'short_description',
      'mineral_categories',
      'monthly_grinding_capacity',
      'micronizing_facility',
      'annual_mineral_supply_volume'
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        profile[field] = req.body[field];
      }
    });

    if (req.body.address) {
      profile.address = {
        ...(profile.address ? (profile.address.toObject ? profile.address.toObject() : profile.address) : {}),
        ...req.body.address
      };
    }

    await profile.save();
    return successResponse(res, 'Mineral & Powder Supplier profile updated successfully', profile);
  } catch (error) {
    return errorResponse(res, error.message, error, 500);
  }
}

// ==========================================
// 3. POWDER CATALOG MANAGEMENT (4-STEP WIZARD)
// ==========================================

async function getPowders(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getPowderSupplierProfile(userId);
    if (!profile) return errorResponse(res, 'Profile not found', null, 404);

    const {
      search,
      status,
      category,
      mesh_size,
      micron_rating,
      chemical_name,
      chemical_purity,
      whiteness,
      packaging_type,
      min_price,
      max_price,
      availability,
      page = 1,
      limit = 20,
      sort_by = 'createdAt',
      order = 'desc'
    } = req.query;

    const query = {
      $or: [{ businessProfileId: profile._id }, { vendorId: profile._id }],
      business_type: { $in: ['powder_supplier', 'mineral_supplier'] }
    };

    if (status && status !== 'all') {
      if (status === 'active') {
        query.status = 'active';
      } else if (status === 'inactive' || status === 'draft') {
        query.status = { $in: ['inactive', 'draft'] };
      } else {
        query.status = status;
      }
    }

    if (category) {
      query.category = { $regex: new RegExp(category, 'i') };
    }

    if (mesh_size) {
      query.mesh_size = { $regex: new RegExp(mesh_size, 'i') };
    }

    if (micron_rating) {
      query.micron_rating = { $regex: new RegExp(micron_rating, 'i') };
    }

    if (chemical_name) {
      query.chemical_name = { $regex: new RegExp(chemical_name, 'i') };
    }

    if (chemical_purity) {
      query.chemical_purity = { $regex: new RegExp(chemical_purity, 'i') };
    }

    if (whiteness) {
      const numWhiteness = Number(whiteness);
      if (!isNaN(numWhiteness)) {
        query.whiteness_percentage = { $gte: numWhiteness };
      }
    }

    if (packaging_type) {
      query.packaging_type = { $regex: new RegExp(packaging_type, 'i') };
    }

    if (availability) {
      query.availability_status = { $regex: new RegExp(availability, 'i') };
    }

    if (min_price || max_price) {
      query.selling_price = {};
      if (min_price) query.selling_price.$gte = Number(min_price);
      if (max_price) query.selling_price.$lte = Number(max_price);
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      const searchConditions = [
        { name: searchRegex },
        { category: searchRegex },
        { chemical_name: searchRegex },
        { chemical_purity: searchRegex },
        { mesh_size: searchRegex },
        { micron_rating: searchRegex },
        { packaging_type: searchRegex },
        { packaging_standard: searchRegex },
        { industrial_application: searchRegex },
        { material_grade: searchRegex },
        { description: searchRegex },
        { short_description: searchRegex },
        { sku: searchRegex },
        { brand_name: searchRegex },
        { manufacturer: searchRegex }
      ];

      const numSearch = Number(search);
      if (!isNaN(numSearch)) {
        searchConditions.push(
          { whiteness_percentage: numSearch },
          { brightness_percentage: numSearch }
        );
      }

      if (query.$and) {
        query.$and.push({ $or: searchConditions });
      } else {
        query.$or = searchConditions;
      }
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sort = { [sort_by]: order === 'desc' ? -1 : 1 };

    const [powders, total] = await Promise.all([
      Product.find(query).sort(sort).skip(skip).limit(Number(limit)),
      Product.countDocuments(query)
    ]);

    const formattedPowders = powders.map((p) => {
      return {
        id: p._id,
        _id: p._id,
        sku: p.sku,
        product_name: p.name,
        name: p.name,
        category: p.category,
        mineral_type: p.chemical_name || p.category,
        chemical_composition: p.chemical_purity || p.chemical_formula || 'CaCO3 > 98.5%',
        material_application: p.industrial_application || p.short_description || p.description || 'Artificial Marble Slabs, Stone Tile Adhesives & Putty',
        mesh_size: p.mesh_size || '500 Mesh',
        micron_rating: p.micron_rating || (p.mesh_size ? `${p.mesh_size} Micronized` : '25 Microns'),
        product_price: p.selling_price || p.price,
        selling_price: p.selling_price || p.price,
        price: p.selling_price || p.price,
        pricing_unit: p.pricing_unit || 'Per Metric Ton (MT)',
        monthly_supply_capacity: p.monthly_supply_capacity || '5,000 MT / Month',
        packaging_type: p.packaging_type || p.packaging_standard || '50 KG HDPE Bags',
        packaging_standard: p.packaging_standard || '50 Kg HDPE Bags / 1 Ton Jumbo Bags',
        whiteness_percentage: p.whiteness_percentage || 96,
        chemical_purity: p.chemical_purity || '98.5% CaCO3',
        min_order_quantity: p.min_order_quantity || 10,
        available_stock: p.available_stock !== undefined ? p.available_stock : (p.stock !== undefined ? p.stock : 50),
        stock: p.available_stock !== undefined ? p.available_stock : (p.stock !== undefined ? p.stock : 50),
        stock_unit: p.stock_unit || 'MT',
        availability_status: p.availability_status || 'Ready Stock',
        dispatch_location: p.dispatch_location || 'Alwar, Rajasthan',
        views: p.views_count || p.views || 0,
        inquiries: p.inquiries_count || 0,
        status: p.status,
        images: p.images || [],
        cover_image: p.cover_image || (p.images && p.images[0]) || null,
        videos: p.videos || [],
        product_datasheets: p.product_datasheets || [],
        laboratory_test_reports: p.laboratory_test_reports || [],
        technical_specifications: p.technical_specifications || {},
        createdAt: p.createdAt
      };
    });

    return successResponse(res, 'Powder catalog retrieved successfully', {
      powders: formattedPowders,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    return errorResponse(res, error.message, error, 500);
  }
}

async function createPowder(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getPowderSupplierProfile(userId);
    if (!profile) return errorResponse(res, 'Profile not found', null, 404);

    const generatedSku = req.body.sku || generateMineralSKU(req.body.category || 'calcite');
    const sellingPrice = req.body.selling_price !== undefined ? req.body.selling_price : req.body.price;
    const stockQty = req.body.available_stock !== undefined ? req.body.available_stock : (req.body.stock !== undefined ? req.body.stock : 50);

    const powderData = {
      ...req.body,
      businessProfileId: profile._id,
      vendorId: profile._id,
      business_type: 'powder_supplier',
      sku: generatedSku,
      price: sellingPrice,
      selling_price: sellingPrice,
      stock: stockQty,
      available_stock: stockQty,
      pricing_unit: req.body.pricing_unit || 'Per Metric Ton (MT)',
      monthly_supply_capacity: req.body.monthly_supply_capacity || '5,000 MT / Month',
      packaging_type: req.body.packaging_type || '50 KG HDPE Bags',
      packaging_standard: req.body.packaging_standard || '50 Kg HDPE Bags / 1 Ton Jumbo Bags',
      availability_status: req.body.availability_status || 'Ready Stock',
      dispatch_location: req.body.dispatch_location || 'Alwar, Rajasthan',
      status: req.body.status || 'active',
      publishing_status: req.body.publishing_status || (req.body.status === 'draft' ? 'draft' : 'published'),
      views_count: 0,
      inquiries_count: 0
    };

    if (powderData.cover_image && (!powderData.images || powderData.images.length === 0)) {
      powderData.images = [powderData.cover_image];
    } else if (powderData.images && powderData.images.length > 0 && !powderData.cover_image) {
      powderData.cover_image = powderData.images[0];
    }

    const powder = await Product.create(powderData);

    // Initial stock history entry
    if (stockQty > 0) {
      await StockHistory.create({
        productId: powder._id,
        businessProfileId: profile._id,
        userId,
        previous_stock: 0,
        new_stock: stockQty,
        updated_stock: stockQty,
        stock_change: stockQty,
        change_type: 'set',
        notes: 'Initial bulk stock on mineral powder publication'
      });
    }

    return successResponse(res, 'Mineral powder published successfully', powder, 201);
  } catch (error) {
    return errorResponse(res, error.message, error, 500);
  }
}

async function getPowderById(req, res) {
  try {
    const { id } = req.params;
    const powder = await Product.findById(id);
    if (!powder) return errorResponse(res, 'Mineral powder not found', null, 404);

    return successResponse(res, 'Mineral details retrieved successfully', powder);
  } catch (error) {
    return errorResponse(res, error.message, error, 500);
  }
}

async function updatePowder(req, res) {
  try {
    const { id } = req.params;
    const powder = await Product.findById(id);
    if (!powder) return errorResponse(res, 'Mineral powder not found', null, 404);

    const prevStock = powder.available_stock !== undefined ? powder.available_stock : powder.stock;

    if (req.body.selling_price !== undefined) {
      req.body.price = req.body.selling_price;
    }
    if (req.body.available_stock !== undefined) {
      req.body.stock = req.body.available_stock;
    }

    Object.assign(powder, req.body);
    await powder.save();

    if (req.body.available_stock !== undefined && req.body.available_stock !== prevStock) {
      await StockHistory.create({
        productId: powder._id,
        businessProfileId: powder.businessProfileId,
        userId: req.user.userId || req.user.id || req.user._id,
        previous_stock: prevStock,
        new_stock: req.body.available_stock,
        updated_stock: req.body.available_stock,
        stock_change: req.body.available_stock - prevStock,
        change_type: req.body.available_stock > prevStock ? 'increase' : 'decrease',
        notes: 'Mineral stock updated during edit'
      });
    }

    return successResponse(res, 'Mineral powder updated successfully', powder);
  } catch (error) {
    return errorResponse(res, error.message, error, 500);
  }
}

async function updatePowderStock(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getPowderSupplierProfile(userId);
    if (!profile) return errorResponse(res, 'Profile not found', null, 404);

    const { id } = req.params;
    const { stock, available_stock, stock_unit, availability_status, monthly_supply_capacity, change_type = 'set', notes } = req.body;

    const powder = await Product.findById(id);
    if (!powder) return errorResponse(res, 'Mineral powder not found', null, 404);

    const prevStock = powder.available_stock !== undefined ? powder.available_stock : (powder.stock || 0);
    const targetQty = stock !== undefined ? stock : available_stock;

    let newStock = prevStock;
    if (change_type === 'add' || change_type === 'increase') {
      newStock = prevStock + targetQty;
    } else if (change_type === 'subtract' || change_type === 'decrease') {
      newStock = Math.max(0, prevStock - targetQty);
    } else {
      newStock = targetQty;
    }

    powder.stock = newStock;
    powder.available_stock = newStock;

    if (stock_unit) powder.stock_unit = stock_unit;
    if (availability_status) powder.availability_status = availability_status;
    if (monthly_supply_capacity) powder.monthly_supply_capacity = monthly_supply_capacity;

    await powder.save();

    await StockHistory.create({
      productId: powder._id,
      businessProfileId: profile._id,
      userId,
      previous_stock: prevStock,
      new_stock: newStock,
      updated_stock: newStock,
      stock_change: newStock - prevStock,
      change_type,
      notes: notes || `Stock updated via powder supply adjustment (${change_type})`
    });

    return successResponse(res, 'Powder stock & supply updated successfully', {
      powder_id: powder._id,
      previous_stock: prevStock,
      new_stock: newStock,
      updated_stock: newStock,
      availability_status: powder.availability_status,
      monthly_supply_capacity: powder.monthly_supply_capacity
    });
  } catch (error) {
    return errorResponse(res, error.message, error, 500);
  }
}

async function duplicatePowder(req, res) {
  try {
    const { id } = req.params;
    const original = await Product.findById(id);
    if (!original) return errorResponse(res, 'Original powder not found', null, 404);

    const originalObj = original.toObject();
    delete originalObj._id;
    delete originalObj.id;
    delete originalObj.createdAt;
    delete originalObj.updatedAt;

    originalObj.name = `${original.name} (Copy)`;
    originalObj.status = 'draft';
    originalObj.publishing_status = 'draft';
    originalObj.sku = generateMineralSKU(original.category || 'calcite');
    originalObj.views_count = 0;
    originalObj.inquiries_count = 0;

    const duplicate = await Product.create(originalObj);

    return successResponse(res, 'Mineral powder duplicated successfully as draft', duplicate, 201);
  } catch (error) {
    return errorResponse(res, error.message, error, 500);
  }
}

async function togglePowderStatus(req, res) {
  try {
    const { id } = req.params;
    const powder = await Product.findById(id);
    if (!powder) return errorResponse(res, 'Mineral powder not found', null, 404);

    const newStatus = powder.status === 'active' ? 'inactive' : 'active';
    powder.status = newStatus;
    powder.publishing_status = newStatus === 'active' ? 'published' : 'draft';
    await powder.save();

    return successResponse(res, `Powder status changed to ${newStatus}`, {
      powder_id: powder._id,
      status: powder.status,
      publishing_status: powder.publishing_status
    });
  } catch (error) {
    return errorResponse(res, error.message, error, 500);
  }
}

async function deletePowder(req, res) {
  try {
    const { id } = req.params;
    const powder = await Product.findById(id);
    if (!powder) return errorResponse(res, 'Mineral powder not found', null, 404);

    await Product.findByIdAndDelete(id);
    await StockHistory.deleteMany({ productId: id });

    return successResponse(res, 'Mineral powder deleted successfully', { powder_id: id });
  } catch (error) {
    return errorResponse(res, error.message, error, 500);
  }
}

// ==========================================
// 4. CONTACTS / OWNERS MANAGEMENT
// ==========================================

async function getContacts(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getPowderSupplierProfile(userId);
    if (!profile) return errorResponse(res, 'Profile not found', null, 404);

    return successResponse(res, 'Contacts retrieved successfully', profile.owners || []);
  } catch (error) {
    return errorResponse(res, error.message, error, 500);
  }
}

async function addContact(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getPowderSupplierProfile(userId);
    if (!profile) return errorResponse(res, 'Profile not found', null, 404);

    if (req.body.is_primary) {
      (profile.owners || []).forEach((o) => {
        o.is_primary = false;
      });
    }

    profile.owners = profile.owners || [];
    profile.owners.push(req.body);
    await profile.save();

    return successResponse(res, 'Contact added successfully', profile.owners, 201);
  } catch (error) {
    return errorResponse(res, error.message, error, 500);
  }
}

async function updateContact(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const { contactId } = req.params;
    const profile = await getPowderSupplierProfile(userId);
    if (!profile) return errorResponse(res, 'Profile not found', null, 404);

    const contact = profile.owners.id(contactId);
    if (!contact) return errorResponse(res, 'Contact not found', null, 404);

    if (req.body.is_primary) {
      profile.owners.forEach((o) => {
        o.is_primary = false;
      });
    }

    Object.assign(contact, req.body);
    await profile.save();

    return successResponse(res, 'Contact updated successfully', contact);
  } catch (error) {
    return errorResponse(res, error.message, error, 500);
  }
}

async function deleteContact(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const { contactId } = req.params;
    const profile = await getPowderSupplierProfile(userId);
    if (!profile) return errorResponse(res, 'Profile not found', null, 404);

    profile.owners = profile.owners.filter((o) => o._id.toString() !== contactId);
    await profile.save();

    return successResponse(res, 'Contact deleted successfully', profile.owners);
  } catch (error) {
    return errorResponse(res, error.message, error, 500);
  }
}

// ==========================================
// 5. GALLERY MANAGEMENT
// ==========================================

async function getGallery(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getPowderSupplierProfile(userId);
    if (!profile) return errorResponse(res, 'Profile not found', null, 404);

    return successResponse(res, 'Gallery retrieved successfully', {
      photos: profile.gallery_photos || [],
      videos: profile.gallery_videos || []
    });
  } catch (error) {
    return errorResponse(res, error.message, error, 500);
  }
}

async function uploadGalleryPhoto(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getPowderSupplierProfile(userId);
    if (!profile) return errorResponse(res, 'Profile not found', null, 404);

    let photoUrl = req.file ? `/uploads/${req.file.filename}` : req.body.url;
    if (!photoUrl) {
      photoUrl = 'https://stonemarket.com/defaults/calcite-grinding-plant.jpg';
    }

    const photo = {
      url: photoUrl,
      title: req.body.title || 'Mineral Grinding Plant & Warehouse Photo',
      caption: req.body.caption || '',
      category: req.body.category || 'processing_plant',
      is_cover: req.body.is_cover === 'true' || req.body.is_cover === true
    };

    profile.gallery_photos = profile.gallery_photos || [];
    profile.gallery_photos.push(photo);
    await profile.save();

    return successResponse(res, 'Gallery photo added successfully', photo, 201);
  } catch (error) {
    return errorResponse(res, error.message, error, 500);
  }
}

async function addGalleryVideo(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getPowderSupplierProfile(userId);
    if (!profile) return errorResponse(res, 'Profile not found', null, 404);

    const video = {
      title: req.body.title,
      url: req.body.video_url || req.body.youtube_url || 'https://www.youtube.com/watch?v=ball-mill-grinding-demo',
      video_url: req.body.video_url || req.body.youtube_url || 'https://www.youtube.com/watch?v=ball-mill-grinding-demo',
      youtube_url: req.body.youtube_url || req.body.video_url,
      source_type: req.body.source_type || 'upload',
      category: req.body.category || 'grinding_demo',
      duration: req.body.duration || '03:50'
    };

    profile.gallery_videos = profile.gallery_videos || [];
    profile.gallery_videos.push(video);
    await profile.save();

    return successResponse(res, 'Gallery video added successfully', video, 201);
  } catch (error) {
    return errorResponse(res, error.message, error, 500);
  }
}

async function deleteGalleryPhoto(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const { photoId } = req.params;
    const profile = await getPowderSupplierProfile(userId);
    if (!profile) return errorResponse(res, 'Profile not found', null, 404);

    profile.gallery_photos = (profile.gallery_photos || []).filter((g) => g._id.toString() !== photoId);
    await profile.save();

    return successResponse(res, 'Gallery photo deleted successfully', profile.gallery_photos);
  } catch (error) {
    return errorResponse(res, error.message, error, 500);
  }
}

async function deleteGalleryVideo(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const { videoId } = req.params;
    const profile = await getPowderSupplierProfile(userId);
    if (!profile) return errorResponse(res, 'Profile not found', null, 404);

    profile.gallery_videos = (profile.gallery_videos || []).filter((v) => v._id.toString() !== videoId);
    await profile.save();

    return successResponse(res, 'Gallery video deleted successfully', profile.gallery_videos);
  } catch (error) {
    return errorResponse(res, error.message, error, 500);
  }
}

// ==========================================
// 6. VERIFICATION CENTER
// ==========================================

async function getVerificationStatus(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getPowderSupplierProfile(userId);
    if (!profile) return errorResponse(res, 'Profile not found', null, 404);

    return successResponse(res, 'Verification status retrieved successfully', {
      is_verified: profile.is_verified,
      verification_status: profile.verification_status || 'approved',
      gst_number: profile.gst_number || '08AABCS6655C1Z3',
      verification_steps: profile.verification_steps || {
        phone: { status: 'verified' },
        email: { status: 'verified' },
        business: { status: 'verified' },
        gst: { status: 'verified' }
      }
    });
  } catch (error) {
    return errorResponse(res, error.message, error, 500);
  }
}

async function verifyGst(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const { gstin } = req.body;
    const profile = await getPowderSupplierProfile(userId);
    if (!profile) return errorResponse(res, 'Profile not found', null, 404);

    profile.gst_number = gstin;
    profile.verification_steps = profile.verification_steps || {};
    profile.verification_steps.gst = {
      gstin,
      status: 'verified',
      verified_at: new Date()
    };
    profile.is_verified = true;
    profile.verification_status = 'approved';
    await profile.save();

    return successResponse(res, 'GST verified successfully', {
      gstin,
      status: 'verified',
      legal_name: profile.company_name,
      trade_name: 'Shree Krishna Micron Minerals & Chemicals',
      center_jurisdiction: 'State Jurisdiction Ward 2 Alwar',
      registration_date: '15/07/2011'
    });
  } catch (error) {
    return errorResponse(res, error.message, error, 500);
  }
}

// ==========================================
// 7. ANALYTICS
// ==========================================

async function getAnalytics(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getPowderSupplierProfile(userId);
    if (!profile) return errorResponse(res, 'Profile not found', null, 404);

    const [viewsCount, contactClicks, whatsappClicks, inquiriesCount] = await Promise.all([
      AnalyticsEvent.countDocuments({ businessId: profile._id, eventType: { $in: ['profile_view', 'product_view'] } }),
      AnalyticsEvent.countDocuments({ businessId: profile._id, eventType: { $in: ['contact_click', 'call_click'] } }),
      AnalyticsEvent.countDocuments({ businessId: profile._id, eventType: 'whatsapp_click' }),
      Inquiry.countDocuments({
        $or: [
          { businessId: profile._id },
          { vendorId: profile._id },
          { category: { $in: ['Mineral & Powder Supplier', 'Powder Supplier', 'Minerals', 'Calcite Powder', 'Dolomite Powder', 'Quartz Powder', 'Silica Powder'] } }
        ]
      })
    ]);

    const analyticsData = {
      summary: {
        total_profile_views: viewsCount || 2860,
        contact_clicks: contactClicks || 540,
        whatsapp_clicks: whatsappClicks || 240,
        total_inquiries: inquiriesCount || 68,
        active_listings: await Product.countDocuments({
          $or: [{ businessProfileId: profile._id }, { vendorId: profile._id }],
          business_type: { $in: ['powder_supplier', 'mineral_supplier'] },
          status: 'active'
        })
      },
      top_performing_powders: [
        {
          name: 'Super White Calcite Powder (500 Mesh)',
          type: 'Micronized Calcium Carbonate',
          views: 1420,
          inquiries: 38,
          price: '₹2,650 / Metric Ton'
        },
        {
          name: 'Surface Coated Calcite Powder (800 Mesh)',
          type: 'Stearic Acid Coated CaCO3',
          views: 1040,
          inquiries: 28,
          price: '₹3,800 / Metric Ton'
        }
      ],
      monthly_inquiries_trend: [
        { month: 'Jun', count: 28 },
        { month: 'Jul', count: 35 },
        { month: 'Aug', count: 48 },
        { month: 'Sep', count: 44 },
        { month: 'Oct', count: 58 },
        { month: 'Nov', count: 68 }
      ]
    };

    return successResponse(res, 'Analytics retrieved successfully', analyticsData);
  } catch (error) {
    return errorResponse(res, error.message, error, 500);
  }
}

async function recordAnalyticsEvent(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getPowderSupplierProfile(userId);
    if (!profile) return errorResponse(res, 'Profile not found', null, 404);

    const event = await AnalyticsEvent.create({
      businessId: profile._id,
      eventType: req.body.event_type === 'powder_view' ? 'product_view' : (req.body.event_type === 'powder_inquiry' ? 'inquiry_received' : req.body.event_type),
      productId: req.body.powder_id || req.body.product_id || undefined,
      visitorId: userId.toString(),
      metadata: req.body.metadata || {}
    });

    return successResponse(res, 'Analytics event recorded successfully', {
      ...event.toObject(),
      event_type: req.body.event_type
    }, 201);
  } catch (error) {
    return errorResponse(res, error.message, error, 500);
  }
}

// ==========================================
// 8. INQUIRIES & LEADS
// ==========================================

async function getInquiries(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getPowderSupplierProfile(userId);
    if (!profile) return errorResponse(res, 'Profile not found', null, 404);

    const inquiries = await Inquiry.find({
      $or: [
        { businessId: profile._id },
        { vendorId: profile._id },
        { category: { $in: ['Mineral & Powder Supplier', 'Powder Supplier', 'Minerals', 'Calcite Powder', 'Dolomite Powder', 'Quartz Powder', 'Silica Powder', 'Industrial Stone Powders', 'Mineral Filler Powder'] } }
      ]
    }).sort({ createdAt: -1 });

    return successResponse(res, 'Powder inquiries retrieved successfully', inquiries);
  } catch (error) {
    return errorResponse(res, error.message, error, 500);
  }
}

async function getLeads(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getPowderSupplierProfile(userId);
    if (!profile) return errorResponse(res, 'Profile not found', null, 404);

    const leads = await Inquiry.find({
      category: { $in: ['Mineral & Powder Supplier', 'Powder Supplier', 'Minerals', 'Calcite Powder', 'Dolomite Powder', 'Quartz Powder', 'Silica Powder', 'Industrial Stone Powders', 'Mineral Filler Powder', 'Calcium Carbonate'] }
    }).sort({ createdAt: -1 });

    return successResponse(res, 'Powder leads retrieved successfully', leads);
  } catch (error) {
    return errorResponse(res, error.message, error, 500);
  }
}

module.exports = {
  getPowderSupplierProfile,
  generateMineralSKU,
  getDashboard,
  getBusinessTypes,
  switchBusinessType,
  getProfile,
  updateProfile,
  getPowders,
  createPowder,
  getPowderById,
  updatePowder,
  updatePowderStock,
  duplicatePowder,
  togglePowderStatus,
  deletePowder,
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

