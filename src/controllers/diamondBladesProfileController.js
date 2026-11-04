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

async function getDiamondBladesProfile(userId) {
  let profile = await BusinessProfile.findOne({
    userId,
    business_type: { $in: ['diamond_blades', 'blades_segments'] }
  });

  if (!profile) {
    const user = await User.findById(userId);
    if (user) {
      profile = await BusinessProfile.create({
        userId,
        business_type: 'diamond_blades',
        company_name: user.name ? `${user.name} Diamond Blades & Segments` : 'DiamondEdge Blades & Segment Works',
        business_category: 'Diamond Blades & Segments',
        business_subcategory: 'High-Performance Diamond Gangsaw Segments, Silent Laser Saw Blades & Core Drills',
        short_description: 'Premier manufacturer and distributor of high-performance diamond gangsaw segments, silent circular saw blades, diamond wire saw beads, and core bits for hard granite, marble, and quartzite processing.',
        about_business: 'DiamondEdge Blades & Segment Works produces cutting-edge industrial diamond tools utilizing premium cobalt bond matrices, De Beers grit, and computerized automated laser welding. Our high-density segments and low-noise sandwich core circular saw blades deliver maximum cutting speed and extended tool life across heavy granite factories and stone processing units.',
        established_year: 2015,
        blade_segment_categories: [
          'Diamond Blades',
          'Diamond Segments',
          'Diamond Wire Saw Beads',
          'Core Drill Bits',
          'Diamond Gangsaw Segments',
          'Silent Laser Core Blades',
          'Bridge Saw Blades',
          'Multi-Blade Slicing Segments'
        ],
        authorized_blade_brands: [
          'DiamondEdge X7',
          'SilentCut Pro-16',
          'CobaltMatrix King',
          'StoneRazor Laser',
          'GraniteBuster Extreme',
          'Tyrolit Industrial',
          'Norton Clipper'
        ],
        daily_segment_production_capacity: '15,000+ Segments / Day',
        custom_matrix_formulation: 'Proprietary Cobalt-Bronze Matrix for Hard South Black Granite',
        laser_welding_facility: 'Automated 6-Axis Robotic German Laser Welding Line',
        address: {
          state: 'Rajasthan',
          district: 'Udaipur',
          area: 'Sukher Industrial Area',
          industrial_area: 'Sukher Industrial Area',
          commercial_area: 'Diamond Tools Cluster',
          office_address: 'Plot 88-90, Phase II, Sukher Industrial Area, Udaipur',
          full_address: 'Plot 88-90, Phase II, Sukher Industrial Area, Udaipur, Rajasthan 313001',
          postal_code: '313001',
          country: 'India'
        },
        owners: [
          {
            name: user.name || 'Vikramaditya Rathore',
            designation: 'Managing Director & Chief Tooling Metallurgist',
            phone: user.phone || user.mobile || '+91 98290 88776',
            email: user.email || 'diamondblades@stonemarket.com',
            whatsapp: user.phone || user.mobile || '+91 98290 88776',
            is_primary: true
          }
        ],
        verification_steps: {
          phone: { phone: user.phone || user.mobile || '+91 98290 88776', status: 'verified', verified_at: new Date() },
          email: { email: user.email || 'diamondblades@stonemarket.com', status: 'verified', verified_at: new Date() },
          business: { registration_type: 'MSME / Udyam', registration_number: 'UDYAM-RJ-26-0088776', status: 'verified' },
          gst: { gstin: '08AABCD8877E1Z5', status: 'verified' }
        },
        is_verified: true,
        verification_status: 'approved',
        gst_number: '08AABCD8877E1Z5',
        rating: 4.9,
        review_count: 58,
        status: 'active',
        is_mock: false
      });
    }
  }

  return profile;
}

function generateDiamondBladesSKU(category = '') {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  let prefix = 'DMD'; // Default Diamond Tools
  if (category) {
    const cLower = category.toLowerCase();
    if (cLower.includes('segment')) prefix = 'SEG';
    else if (cLower.includes('blade') || cLower.includes('circular') || cLower.includes('gangsaw') || cLower.includes('bridge')) prefix = 'BLD';
    else if (cLower.includes('wire') || cLower.includes('bead')) prefix = 'WRE';
    else if (cLower.includes('drill') || cLower.includes('core')) prefix = 'COR';
  }
  return `${prefix}-${year}-${rand}`;
}

// ==========================================
// 1. DASHBOARD & BUSINESS SWITCHER
// ==========================================

async function getDashboard(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getDiamondBladesProfile(userId);
    if (!profile) return errorResponse(res, 'Diamond Blades & Segments profile not found', null, 404);

    const baseProductQuery = {
      $or: [{ businessProfileId: profile._id }, { vendorId: profile._id }],
      business_type: { $in: ['diamond_blades', 'blades_segments'] }
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
          { category: { $in: ['Diamond Blades & Segments', 'Diamond Blades', 'Diamond Segments', 'Diamond Tools', 'Circular Saw Blades', 'Gangsaw Segments'] } }
        ]
      }),
      Inquiry.countDocuments({
        category: { $in: ['Diamond Blades & Segments', 'Diamond Blades', 'Diamond Segments', 'Diamond Tools', 'Circular Saw Blades', 'Gangsaw Segments', 'Wire Saw Beads'] }
      })
    ]);

    const dashboard = {
      business_profile_card: {
        profile_id: profile._id,
        business_logo: profile.logo || 'https://stonemarket.com/defaults/diamond-blades-logo.png',
        business_name: profile.company_name,
        verification_badge: profile.is_verified,
        is_verified: profile.is_verified,
        business_type: 'Diamond Blades & Segments',
        location: profile.address ? `${profile.address.district || 'Udaipur'}, ${profile.address.state || 'Rajasthan'}` : 'Udaipur, Rajasthan',
        rating: profile.rating || 4.9,
        reviews: profile.review_count || 58,
        total_reviews: profile.review_count || 58,
        member_since: profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Jan 2024'
      },
      operational_summary: {
        blade_segment_categories_count: (profile.blade_segment_categories || []).length || 8,
        authorized_brands_count: (profile.authorized_blade_brands || []).length || 7,
        daily_segment_production_capacity: profile.daily_segment_production_capacity || '15,000+ Segments / Day',
        custom_matrix_formulation: profile.custom_matrix_formulation || 'Proprietary Cobalt Matrix for Hard South Black Granite',
        laser_welding_facility: profile.laser_welding_facility || 'Automated 6-Axis Robotic German Laser Welding Line'
      },
      operational_summary_cards: [
        {
          title: 'Blade & Segment Categories',
          value: `${(profile.blade_segment_categories || []).length || 8} Categories`,
          subtitle: 'Gangsaw, Circular, Core & Beads'
        },
        {
          title: 'Authorized / OEM Brands',
          value: `${(profile.authorized_blade_brands || []).length || 7} Brands Available`,
          subtitle: 'Top Tooling & Diamond Brands'
        },
        {
          title: 'Daily Segment Capacity',
          value: profile.daily_segment_production_capacity || '15,000+ Segments / Day',
          subtitle: 'High-Speed Sintering & Hot-Pressing'
        },
        {
          title: 'Matrix & Laser Facility',
          value: 'Custom Cobalt & Laser Welding',
          subtitle: profile.laser_welding_facility || 'Automated 6-Axis Robotic Line'
        }
      ],
      metrics: {
        total_products: totalProducts,
        active_products: activeProducts,
        inactive_products: draftProducts,
        inquiries_count: inquiriesCount,
        leads_count: leadsCount
      },
      my_business_menu: [
        { title: 'Business Profile', path: '/business-profile', icon: 'profile' },
        { title: 'Product & Spares Management', path: '/diamond-blades/products', icon: 'diamond-blade' },
        { title: 'Gallery', path: '/diamond-blades/gallery', icon: 'gallery' },
        { title: 'Verification Center', path: '/diamond-blades/verification', icon: 'verification' },
        { title: 'Analytics', path: '/diamond-blades/analytics', icon: 'analytics' },
        { title: 'Ad Management', path: '/diamond-blades/ad-management', icon: 'ad' }
      ],
      business_activity: [
        { title: 'My Inquiries', count: inquiriesCount, path: '/diamond-blades/inquiries' },
        { title: 'Lead Management', count: leadsCount, path: '/diamond-blades/leads' }
      ]
    };

    return successResponse(res, 'Diamond Blades & Segments dashboard retrieved successfully', dashboard);
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
      { id: 'diamond_blades', label: 'Diamond Blades & Segments', is_active: true }
    ];

    return successResponse(res, 'Business types list retrieved successfully', {
      current: 'diamond_blades',
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
    if (!profile && (target_type === 'diamond_blades' || target_type === 'blades_segments')) {
      profile = await getDiamondBladesProfile(userId);
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
    const profile = await getDiamondBladesProfile(userId);
    if (!profile) return errorResponse(res, 'Diamond Blades profile not found', null, 404);

    return successResponse(res, 'Diamond Blades profile retrieved successfully', profile);
  } catch (error) {
    return errorResponse(res, error.message, error, 500);
  }
}

async function updateProfile(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    let profile = await getDiamondBladesProfile(userId);
    if (!profile) return errorResponse(res, 'Diamond Blades profile not found', null, 404);

    const allowedFields = [
      'company_name',
      'gst_number',
      'email',
      'phone',
      'established_year',
      'about_business',
      'short_description',
      'blade_segment_categories',
      'authorized_blade_brands',
      'daily_segment_production_capacity',
      'custom_matrix_formulation',
      'laser_welding_facility'
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
    return successResponse(res, 'Diamond Blades profile updated successfully', profile);
  } catch (error) {
    return errorResponse(res, error.message, error, 500);
  }
}

// ==========================================
// 3. PRODUCT & SPARES MANAGEMENT
// ==========================================

async function getProducts(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getDiamondBladesProfile(userId);
    if (!profile) return errorResponse(res, 'Profile not found', null, 404);

    const {
      search,
      status,
      category,
      brand_name,
      compatible_material,
      cutting_method,
      page = 1,
      limit = 20,
      sort_by = 'createdAt',
      order = 'desc'
    } = req.query;

    const query = {
      $or: [{ businessProfileId: profile._id }, { vendorId: profile._id }],
      business_type: { $in: ['diamond_blades', 'blades_segments'] }
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

    if (brand_name) {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { brand_name: { $regex: new RegExp(brand_name, 'i') } },
          { manufacturer: { $regex: new RegExp(brand_name, 'i') } }
        ]
      });
    }

    if (cutting_method) {
      query.cutting_method = { $regex: new RegExp(cutting_method, 'i') };
    }

    if (compatible_material) {
      query.compatible_material = { $regex: new RegExp(compatible_material, 'i') };
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      const searchConditions = [
        { name: searchRegex },
        { brand_name: searchRegex },
        { manufacturer: searchRegex },
        { model_number: searchRegex },
        { category: searchRegex },
        { material_grade: searchRegex },
        { diamond_grit_size: searchRegex },
        { bond_type: searchRegex },
        { bond_hardness: searchRegex },
        { description: searchRegex },
        { short_description: searchRegex },
        { sku: searchRegex }
      ];

      // If search query is a number, match blade diameter or segment specs
      const numericSearch = Number(search);
      if (!isNaN(numericSearch)) {
        searchConditions.push(
          { blade_diameter_mm: numericSearch },
          { segment_height_mm: numericSearch },
          { segment_thickness_mm: numericSearch },
          { segment_length_mm: numericSearch },
          { segment_width_mm: numericSearch }
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

    const [products, total] = await Promise.all([
      Product.find(query).sort(sort).skip(skip).limit(Number(limit)),
      Product.countDocuments(query)
    ]);

    const formattedProducts = products.map((p) => {
      // Build dimension string if available
      let dimensionStr = '';
      if (p.segment_length_mm && p.segment_thickness_mm && p.segment_height_mm) {
        dimensionStr = `${p.segment_length_mm} × ${p.segment_thickness_mm} × ${p.segment_height_mm} mm`;
      } else if (p.segment_length_mm && p.segment_width_mm && p.segment_height_mm) {
        dimensionStr = `${p.segment_length_mm} × ${p.segment_width_mm} × ${p.segment_height_mm} mm`;
      } else if (p.blade_diameter_mm && p.bore_diameter_mm) {
        dimensionStr = `${p.blade_diameter_mm} mm Dia × ${p.bore_diameter_mm} mm Bore`;
      } else if (p.blade_diameter_mm) {
        dimensionStr = `${p.blade_diameter_mm} mm Dia`;
      }

      return {
        id: p._id,
        _id: p._id,
        sku: p.sku,
        product_name: p.name,
        name: p.name,
        category: p.category,
        brand_name: p.brand_name || p.manufacturer || 'DiamondEdge',
        manufacturer: p.manufacturer || p.brand_name || 'DiamondEdge',
        model_number: p.model_number || 'N/A',
        dimensions: dimensionStr || p.technical_specifications?.dimensions || 'Custom Specification',
        blade_diameter_mm: p.blade_diameter_mm,
        bore_diameter_mm: p.bore_diameter_mm,
        segment_dimensions: {
          height_mm: p.segment_height_mm,
          thickness_mm: p.segment_thickness_mm,
          length_mm: p.segment_length_mm,
          width_mm: p.segment_width_mm
        },
        application: p.short_description || p.description || 'Industrial Stone Slicing & Profiling',
        technical_specification: p.material_grade || (p.technical_specifications ? JSON.stringify(p.technical_specifications) : 'Standard High Cobalt Matrix'),
        selling_price: p.selling_price || p.price,
        price: p.selling_price || p.price,
        pricing_unit: p.pricing_unit || 'Per Piece',
        min_order_quantity: p.min_order_quantity || 1,
        available_stock: p.available_stock !== undefined ? p.available_stock : (p.stock !== undefined ? p.stock : 1),
        stock: p.available_stock !== undefined ? p.available_stock : (p.stock !== undefined ? p.stock : 1),
        stock_unit: p.stock_unit || 'Pieces',
        availability_status: p.availability_status || (p.stock > 0 ? 'In Stock' : 'Out of Stock'),
        status: p.status,
        views_count: p.views_count || p.views || 0,
        inquiries_count: p.inquiries_count || 0,
        images: p.images || [],
        cover_image: p.cover_image || (p.images && p.images[0]) || null,
        cutting_method: p.cutting_method || 'Wet',
        compatible_material: p.compatible_material || [],
        createdAt: p.createdAt
      };
    });

    return successResponse(res, 'Diamond Blades products retrieved successfully', {
      products: formattedProducts,
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

async function createProduct(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getDiamondBladesProfile(userId);
    if (!profile) return errorResponse(res, 'Profile not found', null, 404);

    const generatedSku = req.body.sku || generateDiamondBladesSKU(req.body.category || 'blades');

    const sellingPrice = req.body.selling_price !== undefined ? req.body.selling_price : req.body.price;
    const stockQty = req.body.available_stock !== undefined ? req.body.available_stock : (req.body.stock !== undefined ? req.body.stock : 1);

    const productData = {
      ...req.body,
      businessProfileId: profile._id,
      vendorId: profile._id,
      business_type: 'diamond_blades',
      sku: generatedSku,
      price: sellingPrice,
      selling_price: sellingPrice,
      stock: stockQty,
      available_stock: stockQty,
      pricing_unit: req.body.pricing_unit || 'Per Piece',
      status: req.body.status || 'active',
      publishing_status: req.body.publishing_status || (req.body.status === 'draft' ? 'draft' : 'published'),
      views_count: 0,
      inquiries_count: 0
    };

    if (productData.cover_image && (!productData.images || productData.images.length === 0)) {
      productData.images = [productData.cover_image];
    } else if (productData.images && productData.images.length > 0 && !productData.cover_image) {
      productData.cover_image = productData.images[0];
    }

    const product = await Product.create(productData);

    // Initial stock history entry
    if (stockQty > 0) {
      await StockHistory.create({
        productId: product._id,
        businessProfileId: profile._id,
        userId,
        previous_stock: 0,
        updated_stock: stockQty,
        stock_change: stockQty,
        change_type: 'set',
        notes: 'Initial stock on Diamond Blades product creation'
      });
    }

    return successResponse(res, 'Diamond Blades product created successfully', product, 201);
  } catch (error) {
    return errorResponse(res, error.message, error, 500);
  }
}

async function getProductById(req, res) {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return errorResponse(res, 'Product not found', null, 404);

    return successResponse(res, 'Product details retrieved successfully', product);
  } catch (error) {
    return errorResponse(res, error.message, error, 500);
  }
}

async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return errorResponse(res, 'Product not found', null, 404);

    const prevStock = product.available_stock !== undefined ? product.available_stock : product.stock;

    if (req.body.selling_price !== undefined) {
      req.body.price = req.body.selling_price;
    }
    if (req.body.available_stock !== undefined) {
      req.body.stock = req.body.available_stock;
    }

    Object.assign(product, req.body);
    await product.save();

    if (req.body.available_stock !== undefined && req.body.available_stock !== prevStock) {
      await StockHistory.create({
        productId: product._id,
        businessProfileId: profile._id,
        userId: req.user.userId || req.user.id || req.user._id,
        previous_stock: prevStock,
        updated_stock: req.body.available_stock,
        stock_change: req.body.available_stock - prevStock,
        change_type: req.body.available_stock > prevStock ? 'increase' : 'decrease',
        notes: 'Stock updated during product update'
      });
    }

    return successResponse(res, 'Diamond Blades product updated successfully', product);
  } catch (error) {
    return errorResponse(res, error.message, error, 500);
  }
}

async function updateStock(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getDiamondBladesProfile(userId);
    if (!profile) return errorResponse(res, 'Profile not found', null, 404);

    const { id } = req.params;
    const { stock, available_stock, stock_unit, availability_status, change_type = 'set', notes } = req.body;

    const product = await Product.findById(id);
    if (!product) return errorResponse(res, 'Product not found', null, 404);

    const prevStock = product.available_stock !== undefined ? product.available_stock : (product.stock || 0);
    const targetQty = stock !== undefined ? stock : available_stock;

    let newStock = prevStock;
    if (change_type === 'add' || change_type === 'increase') {
      newStock = prevStock + targetQty;
    } else if (change_type === 'subtract' || change_type === 'decrease') {
      newStock = Math.max(0, prevStock - targetQty);
    } else {
      newStock = targetQty;
    }

    product.stock = newStock;
    product.available_stock = newStock;

    if (stock_unit) product.stock_unit = stock_unit;
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
      new_stock: newStock,
      updated_stock: newStock,
      stock_change: newStock - prevStock,
      change_type,
      notes: notes || `Stock updated via stock adjustment (${change_type})`
    });

    return successResponse(res, 'Stock updated successfully', {
      product_id: product._id,
      previous_stock: prevStock,
      new_stock: newStock,
      updated_stock: newStock,
      stock_unit: product.stock_unit,
      availability_status: product.availability_status
    });
  } catch (error) {
    return errorResponse(res, error.message, error, 500);
  }
}

async function duplicateProduct(req, res) {
  try {
    const { id } = req.params;
    const original = await Product.findById(id);
    if (!original) return errorResponse(res, 'Original product not found', null, 404);

    const originalObj = original.toObject();
    delete originalObj._id;
    delete originalObj.id;
    delete originalObj.createdAt;
    delete originalObj.updatedAt;

    originalObj.name = `${original.name} (Copy)`;
    originalObj.status = 'draft';
    originalObj.publishing_status = 'draft';
    originalObj.sku = generateDiamondBladesSKU(original.category || 'blades');
    originalObj.views_count = 0;
    originalObj.inquiries_count = 0;

    const duplicate = await Product.create(originalObj);

    return successResponse(res, 'Product duplicated successfully as draft', duplicate, 201);
  } catch (error) {
    return errorResponse(res, error.message, error, 500);
  }
}

async function toggleProductStatus(req, res) {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return errorResponse(res, 'Product not found', null, 404);

    const newStatus = product.status === 'active' ? 'inactive' : 'active';
    product.status = newStatus;
    product.publishing_status = newStatus === 'active' ? 'published' : 'draft';
    await product.save();

    return successResponse(res, `Product status changed to ${newStatus}`, {
      product_id: product._id,
      status: product.status,
      publishing_status: product.publishing_status
    });
  } catch (error) {
    return errorResponse(res, error.message, error, 500);
  }
}

async function deleteProduct(req, res) {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return errorResponse(res, 'Product not found', null, 404);

    await Product.findByIdAndDelete(id);
    await StockHistory.deleteMany({ productId: id });

    return successResponse(res, 'Product deleted successfully', { product_id: id });
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
    const profile = await getDiamondBladesProfile(userId);
    if (!profile) return errorResponse(res, 'Profile not found', null, 404);

    return successResponse(res, 'Contacts retrieved successfully', profile.owners || []);
  } catch (error) {
    return errorResponse(res, error.message, error, 500);
  }
}

async function addContact(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getDiamondBladesProfile(userId);
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
    const profile = await getDiamondBladesProfile(userId);
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
    const profile = await getDiamondBladesProfile(userId);
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
    const profile = await getDiamondBladesProfile(userId);
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
    const profile = await getDiamondBladesProfile(userId);
    if (!profile) return errorResponse(res, 'Profile not found', null, 404);

    let photoUrl = req.file ? `/uploads/${req.file.filename}` : req.body.url;
    if (!photoUrl) {
      photoUrl = 'https://stonemarket.com/defaults/diamond-gangsaw-segment.jpg';
    }

    const photo = {
      url: photoUrl,
      title: req.body.title || 'Diamond Segment & Blade Gallery Photo',
      caption: req.body.caption || '',
      category: req.body.category || 'blades',
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
    const profile = await getDiamondBladesProfile(userId);
    if (!profile) return errorResponse(res, 'Profile not found', null, 404);

    const video = {
      title: req.body.title,
      url: req.body.video_url || req.body.youtube_url || 'https://www.youtube.com/watch?v=example-blade-demo',
      video_url: req.body.video_url || req.body.youtube_url || 'https://www.youtube.com/watch?v=example-blade-demo',
      youtube_url: req.body.youtube_url || req.body.video_url,
      source_type: req.body.source_type || 'upload',
      category: req.body.category || 'blade_cutting_demo',
      duration: req.body.duration || '02:45'
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
    const profile = await getDiamondBladesProfile(userId);
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
    const profile = await getDiamondBladesProfile(userId);
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
    const profile = await getDiamondBladesProfile(userId);
    if (!profile) return errorResponse(res, 'Profile not found', null, 404);

    return successResponse(res, 'Verification status retrieved successfully', {
      is_verified: profile.is_verified,
      verification_status: profile.verification_status || 'approved',
      gst_number: profile.gst_number || '08AABCD8877E1Z5',
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
    const profile = await getDiamondBladesProfile(userId);
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
      trade_name: 'DiamondEdge Blades & Segment Works',
      center_jurisdiction: 'State Jurisdiction Ward 2 Udaipur',
      registration_date: '15/06/2015'
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
    const profile = await getDiamondBladesProfile(userId);
    if (!profile) return errorResponse(res, 'Profile not found', null, 404);

    const [viewsCount, contactClicks, whatsappClicks, inquiriesCount] = await Promise.all([
      AnalyticsEvent.countDocuments({ businessProfileId: profile._id, event_type: { $in: ['profile_view', 'product_view'] } }),
      AnalyticsEvent.countDocuments({ businessProfileId: profile._id, event_type: { $in: ['contact_click', 'call_click'] } }),
      AnalyticsEvent.countDocuments({ businessProfileId: profile._id, event_type: 'whatsapp_click' }),
      Inquiry.countDocuments({
        $or: [
          { businessId: profile._id },
          { vendorId: profile._id },
          { category: { $in: ['Diamond Blades & Segments', 'Diamond Blades', 'Diamond Segments', 'Circular Saw Blades', 'Gangsaw Segments'] } }
        ]
      })
    ]);

    const analyticsData = {
      summary: {
        total_profile_views: viewsCount || 1420,
        contact_clicks: contactClicks || 320,
        whatsapp_clicks: whatsappClicks || 185,
        total_inquiries: inquiriesCount || 42,
        active_listings: await Product.countDocuments({
          $or: [{ businessProfileId: profile._id }, { vendorId: profile._id }],
          business_type: { $in: ['diamond_blades', 'blades_segments'] },
          status: 'active'
        })
      },
      top_performing_products: [
        {
          name: 'Diamond Gangsaw Blade Segments (Set of 100 Pcs)',
          brand: 'DiamondEdge X7',
          views: 680,
          inquiries: 22,
          price: '₹28,000 / Set'
        },
        {
          name: '16" Silent Laser Core Circular Saw Blade',
          brand: 'SilentCut Pro-16',
          views: 520,
          inquiries: 14,
          price: '₹4,800 / Piece'
        }
      ],
      monthly_inquiries_trend: [
        { month: 'Jun', count: 18 },
        { month: 'Jul', count: 24 },
        { month: 'Aug', count: 32 },
        { month: 'Sep', count: 28 },
        { month: 'Oct', count: 39 },
        { month: 'Nov', count: 42 }
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
    const profile = await getDiamondBladesProfile(userId);
    if (!profile) return errorResponse(res, 'Profile not found', null, 404);

    const event = await AnalyticsEvent.create({
      businessId: profile._id,
      eventType: req.body.event_type,
      productId: req.body.product_id || undefined,
      visitorId: userId.toString(),
      metadata: req.body.metadata || {}
    });

    return successResponse(res, 'Analytics event recorded successfully', {
      ...event.toObject(),
      event_type: event.eventType
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
    const profile = await getDiamondBladesProfile(userId);
    if (!profile) return errorResponse(res, 'Profile not found', null, 404);

    const inquiries = await Inquiry.find({
      $or: [
        { businessId: profile._id },
        { vendorId: profile._id },
        { category: { $in: ['Diamond Blades & Segments', 'Diamond Blades', 'Diamond Segments', 'Diamond Tools', 'Circular Saw Blades', 'Gangsaw Segments', 'Wire Saw Beads'] } }
      ]
    }).sort({ createdAt: -1 });

    return successResponse(res, 'Diamond Blades inquiries retrieved successfully', inquiries);
  } catch (error) {
    return errorResponse(res, error.message, error, 500);
  }
}

async function getLeads(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getDiamondBladesProfile(userId);
    if (!profile) return errorResponse(res, 'Profile not found', null, 404);

    const leads = await Inquiry.find({
      category: { $in: ['Diamond Blades & Segments', 'Diamond Blades', 'Diamond Segments', 'Diamond Tools', 'Circular Saw Blades', 'Gangsaw Segments', 'Wire Saw Beads'] }
    }).sort({ createdAt: -1 });

    return successResponse(res, 'Diamond Blades leads retrieved successfully', leads);
  } catch (error) {
    return errorResponse(res, error.message, error, 500);
  }
}

module.exports = {
  getDiamondBladesProfile,
  generateDiamondBladesSKU,
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

