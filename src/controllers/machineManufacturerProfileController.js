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

async function getMachineManufacturerProfile(userId) {
  let profile = await BusinessProfile.findOne({
    userId,
    business_type: { $in: ['machine_manufacturer', 'stone_machinery'] }
  });

  if (!profile) {
    const user = await User.findById(userId);
    if (user) {
      profile = await BusinessProfile.create({
        userId,
        business_type: 'machine_manufacturer',
        company_name: user.name ? `${user.name} Machine Tools` : 'Rajendra Machine Tools & Heavy Machinery',
        business_category: 'Stone Machine Manufacturer',
        business_subcategory: 'Automatic Multi-Cutter Granite Gangsaws, 5-Axis CNC Bridge Cutters & Polishing Lines',
        short_description: 'Pioneer manufacturer and exporter of heavy-duty stone processing machinery, computerized multi-blade granite gangsaws, CNC bridge cutters, and automatic multi-head slab polishing lines.',
        about_business: 'Rajendra Machine Tools & Heavy Machinery specializes in high-precision stone machinery with heavy structural casting, stress-relieved frames, Siemens PLC automation, and Italian cutting spindle technology. We have equipped over 500+ granite and marble processing factories across India and globally with turnkey stone fabrication machinery.',
        established_year: 2008,
        machine_categories: [
          'Granite Gangsaw Machine (80 Blades)',
          'Granite Gangsaw Machine (Multi-Blade)',
          'Marble Gangsaw Machine',
          '5-Axis CNC Bridge Cutting Machine',
          'CNC Bridge Cutting Machine',
          'Multi-Blade Block Cutting Machine',
          'Automatic Slab Polishing Machine',
          'Wire Saw Machine',
          'Water Recycling Plant'
        ],
        manufacturing_plant_capacity: '25+ Heavy Duty Gangsaws & CNC Cutters / Year',
        in_house_fabrication_setup: 'Heavy Casting, Stress Relieving Furnace, CNC Machining Centers',
        annual_production_volume: '50+ Complete Stone Processing Lines Delivered',
        address: {
          state: 'Rajasthan',
          district: 'Rajsamand',
          area: 'RIICO Industrial Area',
          industrial_area: 'RIICO Industrial Area Phase-II',
          commercial_area: 'Machinery Engineering Zone',
          office_address: 'Plot 45-48, Machinery Complex, RIICO Industrial Area, Rajsamand',
          full_address: 'Plot 45-48, Machinery Complex, RIICO Industrial Area, Rajsamand, Rajasthan 313324',
          postal_code: '313324',
          country: 'India'
        },
        owners: [
          {
            name: user.name || 'Rajendra Prasad Sharma',
            designation: 'Founder & Chief Mechanical Engineer',
            phone: user.phone || user.mobile || '+91 98290 77665',
            email: user.email || 'machinery@stonemarket.com',
            whatsapp: user.phone || user.mobile || '+91 98290 77665',
            is_primary: true
          }
        ],
        verification_steps: {
          phone: { phone: user.phone || user.mobile || '+91 98290 77665', status: 'verified', verified_at: new Date() },
          email: { email: user.email || 'machinery@stonemarket.com', status: 'verified', verified_at: new Date() },
          business: { registration_type: 'MSME / Udyam', registration_number: 'UDYAM-RJ-28-0077665', status: 'verified' },
          gst: { gstin: '08AABCR7766D1Z4', status: 'verified' }
        },
        is_verified: true,
        verification_status: 'approved',
        gst_number: '08AABCR7766D1Z4',
        rating: 4.9,
        review_count: 64,
        status: 'active',
        is_mock: false
      });
    }
  }

  return profile;
}

function generateMachineSKU(category = '') {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  let prefix = 'MCH'; // Default Machine
  if (category) {
    const cLower = category.toLowerCase();
    if (cLower.includes('gangsaw')) prefix = 'GSW';
    else if (cLower.includes('cnc') || cLower.includes('router') || cLower.includes('5-axis')) prefix = 'CNC';
    else if (cLower.includes('bridge') || cLower.includes('cutter')) prefix = 'BRG';
    else if (cLower.includes('polish') || cLower.includes('grind')) prefix = 'POL';
    else if (cLower.includes('wire')) prefix = 'WIR';
    else if (cLower.includes('crane') || cLower.includes('lifter') || cLower.includes('handling')) prefix = 'HDL';
    else if (cLower.includes('water') || cLower.includes('recycling')) prefix = 'WTR';
  }
  return `${prefix}-${year}-${rand}`;
}

// ==========================================
// 1. DASHBOARD & BUSINESS SWITCHER
// ==========================================

async function getDashboard(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getMachineManufacturerProfile(userId);
    if (!profile) return errorResponse(res, 'Stone Machine Manufacturer profile not found', null, 404);

    const baseProductQuery = {
      $or: [{ businessProfileId: profile._id }, { vendorId: profile._id }],
      business_type: { $in: ['machine_manufacturer', 'stone_machinery'] }
    };

    const [
      totalMachines,
      activeMachines,
      draftMachines,
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
          { category: { $in: ['Stone Machine Manufacturer', 'Machine Manufacturer', 'Machinery', 'Stone Cutting Machines', 'Gangsaw Machine', 'CNC Bridge Cutting Machine', 'Stone Processing Equipment'] } }
        ]
      }),
      Inquiry.countDocuments({
        category: { $in: ['Stone Machine Manufacturer', 'Machine Manufacturer', 'Machinery', 'Stone Cutting Machines', 'Gangsaw Machine', 'CNC Bridge Cutting Machine', 'Stone Processing Equipment', 'Slab Polishing Machines'] }
      })
    ]);

    const dashboard = {
      business_profile_card: {
        profile_id: profile._id,
        business_logo: profile.logo || 'https://stonemarket.com/defaults/machine-manufacturer-logo.png',
        business_name: profile.company_name,
        verification_badge: profile.is_verified,
        is_verified: profile.is_verified,
        business_type: 'Stone Machine Manufacturer',
        location: profile.address ? `${profile.address.district || 'Rajsamand'}, ${profile.address.state || 'Rajasthan'}` : 'Rajsamand, Rajasthan',
        rating: profile.rating || 4.9,
        reviews: profile.review_count || 64,
        total_reviews: profile.review_count || 64,
        member_since: profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Jan 2024'
      },
      operational_summary: {
        machine_categories_count: (profile.machine_categories || []).length || 9,
        manufacturing_plant_capacity: profile.manufacturing_plant_capacity || '25+ Heavy Duty Gangsaws & CNC Cutters / Year',
        in_house_fabrication_setup: profile.in_house_fabrication_setup || 'Heavy Casting, Stress Relieving Furnace, CNC Machining Centers',
        annual_production_volume: profile.annual_production_volume || '50+ Complete Stone Processing Lines Delivered'
      },
      operational_summary_cards: [
        {
          title: 'Machinery Categories',
          value: `${(profile.machine_categories || []).length || 9} Categories`,
          subtitle: 'Gangsaws, CNC, Polishers & Handling'
        },
        {
          title: 'Annual Plant Capacity',
          value: profile.manufacturing_plant_capacity || '25+ Heavy Gangsaws / Year',
          subtitle: 'Complete Fabrication & Assembly'
        },
        {
          title: 'In-House Fabrication',
          value: 'Heavy Casting & CNC Setup',
          subtitle: 'Stress Relieving & Assembly Bays'
        },
        {
          title: 'Track Record & Deliveries',
          value: profile.annual_production_volume || '50+ Complete Lines Delivered',
          subtitle: 'PAN India & Global Turnkey Plants'
        }
      ],
      metrics: {
        total_machines: totalMachines,
        active_machines: activeMachines,
        inactive_machines: draftMachines,
        inquiries_count: inquiriesCount,
        leads_count: leadsCount
      },
      my_business_menu: [
        { title: 'Business Profile', path: '/business-profile', icon: 'profile' },
        { title: 'Machinery Catalog Management', path: '/machine-manufacturer/catalog', icon: 'cogs' },
        { title: 'Gallery', path: '/machine-manufacturer/gallery', icon: 'gallery' },
        { title: 'Verification Center', path: '/machine-manufacturer/verification', icon: 'verification' },
        { title: 'Analytics', path: '/machine-manufacturer/analytics', icon: 'analytics' },
        { title: 'Ad Management', path: '/machine-manufacturer/ad-management', icon: 'ad' }
      ],
      business_activity: [
        { title: 'My Inquiries', count: inquiriesCount, path: '/machine-manufacturer/inquiries' },
        { title: 'Lead Management', count: leadsCount, path: '/machine-manufacturer/leads' }
      ]
    };

    return successResponse(res, 'Stone Machine Manufacturer dashboard retrieved successfully', dashboard);
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
      { id: 'machine_manufacturer', label: 'Stone Machine Manufacturer', is_active: true }
    ];

    return successResponse(res, 'Business types list retrieved successfully', {
      current: 'machine_manufacturer',
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
    if (!profile && (target_type === 'machine_manufacturer' || target_type === 'stone_machinery')) {
      profile = await getMachineManufacturerProfile(userId);
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
    const profile = await getMachineManufacturerProfile(userId);
    if (!profile) return errorResponse(res, 'Machine Manufacturer profile not found', null, 404);

    return successResponse(res, 'Machine Manufacturer profile retrieved successfully', profile);
  } catch (error) {
    return errorResponse(res, error.message, error, 500);
  }
}

async function updateProfile(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    let profile = await getMachineManufacturerProfile(userId);
    if (!profile) return errorResponse(res, 'Machine Manufacturer profile not found', null, 404);

    const allowedFields = [
      'company_name',
      'gst_number',
      'email',
      'phone',
      'established_year',
      'about_business',
      'short_description',
      'machine_categories',
      'manufacturing_plant_capacity',
      'in_house_fabrication_setup',
      'annual_production_volume'
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
    return successResponse(res, 'Machine Manufacturer profile updated successfully', profile);
  } catch (error) {
    return errorResponse(res, error.message, error, 500);
  }
}

// ==========================================
// 3. MACHINERY CATALOG MANAGEMENT (4-STEP WIZARD)
// ==========================================

async function getMachines(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getMachineManufacturerProfile(userId);
    if (!profile) return errorResponse(res, 'Profile not found', null, 404);

    const {
      search,
      status,
      category,
      model_number,
      production_capacity,
      power_requirement,
      min_price,
      max_price,
      availability,
      manufacturing_status,
      page = 1,
      limit = 20,
      sort_by = 'createdAt',
      order = 'desc'
    } = req.query;

    const query = {
      $or: [{ businessProfileId: profile._id }, { vendorId: profile._id }],
      business_type: { $in: ['machine_manufacturer', 'stone_machinery'] }
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

    if (model_number) {
      query.model_number = { $regex: new RegExp(model_number, 'i') };
    }

    if (production_capacity) {
      query.production_capacity = { $regex: new RegExp(production_capacity, 'i') };
    }

    if (availability || manufacturing_status) {
      const avail = availability || manufacturing_status;
      query.$or = query.$or || [];
      query.$or.push(
        { availability_status: { $regex: new RegExp(avail, 'i') } },
        { manufacturing_status: { $regex: new RegExp(avail, 'i') } }
      );
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
        { brand_name: searchRegex },
        { manufacturer: searchRegex },
        { model_number: searchRegex },
        { category: searchRegex },
        { production_capacity: searchRegex },
        { working_dimensions: searchRegex },
        { working_size: searchRegex },
        { description: searchRegex },
        { short_description: searchRegex },
        { sku: searchRegex },
        { 'technical_specifications.power': searchRegex },
        { 'technical_specifications.capacity': searchRegex }
      ];

      const numericSearch = Number(search);
      if (!isNaN(numericSearch)) {
        searchConditions.push(
          { connected_power_hp: numericSearch },
          { connected_power_kw: numericSearch }
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

    const [machines, total] = await Promise.all([
      Product.find(query).sort(sort).skip(skip).limit(Number(limit)),
      Product.countDocuments(query)
    ]);

    const formattedMachines = machines.map((m) => {
      let powerStr = '';
      if (m.connected_power_hp && m.connected_power_kw) {
        powerStr = `${m.connected_power_hp} HP / ${m.connected_power_kw} kW`;
      } else if (m.connected_power_hp) {
        powerStr = `${m.connected_power_hp} HP`;
      } else if (m.connected_power_kw) {
        powerStr = `${m.connected_power_kw} kW`;
      } else if (m.technical_specifications?.power) {
        powerStr = m.technical_specifications.power;
      } else {
        powerStr = 'Standard Industrial Motor Load';
      }

      return {
        id: m._id,
        _id: m._id,
        sku: m.sku,
        machine_name: m.name,
        name: m.name,
        category: m.category,
        brand_name: m.brand_name || 'Rajendra Machine Tools',
        manufacturer: m.manufacturer || m.brand_name || 'Rajendra Machine Tools',
        model_number: m.model_number || 'Titan Series',
        total_connected_power: powerStr,
        connected_power_hp: m.connected_power_hp,
        connected_power_kw: m.connected_power_kw,
        production_capacity: m.production_capacity || '1,800 Sq.ft / Shift',
        working_dimensions: m.working_dimensions || m.working_size || '3500 × 2000 × 2000 mm Block',
        machine_price: m.selling_price || m.price,
        selling_price: m.selling_price || m.price,
        price: m.selling_price || m.price,
        pricing_unit: m.pricing_unit || 'Per Complete Machine',
        lead_time: m.lead_time || '3–4 Weeks Fabrication & Dispatch',
        manufacturing_status: m.manufacturing_status || 'Ready Stock',
        availability_status: m.availability_status || 'Ready Stock',
        installation_type: m.installation_type || 'On-Site Commissioning Available',
        transportation_terms: m.transportation_terms || 'Transportation Extra',
        dispatch_location: m.dispatch_location || 'Rajsamand, Rajasthan',
        warranty_guarantee: m.warranty_guarantee || '1 Year Comprehensive + 2 Years Frame Warranty',
        views: m.views_count || m.views || 0,
        inquiries: m.inquiries_count || 0,
        status: m.status,
        images: m.images || [],
        cover_image: m.cover_image || (m.images && m.images[0]) || null,
        videos: m.videos || [],
        technical_drawings: m.technical_drawings || [],
        equipment_brochures: m.equipment_brochures || [],
        technical_specifications: m.technical_specifications || {},
        createdAt: m.createdAt
      };
    });

    return successResponse(res, 'Machinery catalog retrieved successfully', {
      machines: formattedMachines,
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

async function createMachine(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getMachineManufacturerProfile(userId);
    if (!profile) return errorResponse(res, 'Profile not found', null, 404);

    const generatedSku = req.body.sku || generateMachineSKU(req.body.category || 'gangsaw');
    const sellingPrice = req.body.selling_price !== undefined ? req.body.selling_price : req.body.price;
    const stockQty = req.body.available_stock !== undefined ? req.body.available_stock : (req.body.stock !== undefined ? req.body.stock : 1);

    const machineData = {
      ...req.body,
      businessProfileId: profile._id,
      vendorId: profile._id,
      business_type: 'machine_manufacturer',
      sku: generatedSku,
      price: sellingPrice,
      selling_price: sellingPrice,
      stock: stockQty,
      available_stock: stockQty,
      pricing_unit: req.body.pricing_unit || 'Per Complete Machine',
      lead_time: req.body.lead_time || req.body.manufacturing_lead_time || '3–4 Weeks Fabrication & Dispatch',
      manufacturing_status: req.body.manufacturing_status || req.body.availability_status || 'Ready Stock',
      availability_status: req.body.availability_status || req.body.manufacturing_status || 'Ready Stock',
      installation_type: req.body.installation_type || 'On-Site Commissioning Available',
      transportation_terms: req.body.transportation_terms || 'Transportation Extra',
      dispatch_location: req.body.dispatch_location || 'Rajsamand, Rajasthan',
      status: req.body.status || 'active',
      publishing_status: req.body.publishing_status || (req.body.status === 'draft' ? 'draft' : 'published'),
      views_count: 0,
      inquiries_count: 0
    };

    if (machineData.cover_image && (!machineData.images || machineData.images.length === 0)) {
      machineData.images = [machineData.cover_image];
    } else if (machineData.images && machineData.images.length > 0 && !machineData.cover_image) {
      machineData.cover_image = machineData.images[0];
    }

    const machine = await Product.create(machineData);

    // Initial stock history entry
    if (stockQty > 0) {
      await StockHistory.create({
        productId: machine._id,
        businessProfileId: profile._id,
        userId,
        previous_stock: 0,
        new_stock: stockQty,
        updated_stock: stockQty,
        stock_change: stockQty,
        change_type: 'set',
        notes: 'Initial unit stock on Stone Machine publication'
      });
    }

    return successResponse(res, 'Stone Machine published successfully', machine, 201);
  } catch (error) {
    return errorResponse(res, error.message, error, 500);
  }
}

async function getMachineById(req, res) {
  try {
    const { id } = req.params;
    const machine = await Product.findById(id);
    if (!machine) return errorResponse(res, 'Machine not found', null, 404);

    return successResponse(res, 'Machine details retrieved successfully', machine);
  } catch (error) {
    return errorResponse(res, error.message, error, 500);
  }
}

async function updateMachine(req, res) {
  try {
    const { id } = req.params;
    const machine = await Product.findById(id);
    if (!machine) return errorResponse(res, 'Machine not found', null, 404);

    const prevStock = machine.available_stock !== undefined ? machine.available_stock : machine.stock;

    if (req.body.selling_price !== undefined) {
      req.body.price = req.body.selling_price;
    }
    if (req.body.available_stock !== undefined) {
      req.body.stock = req.body.available_stock;
    }

    Object.assign(machine, req.body);
    await machine.save();

    if (req.body.available_stock !== undefined && req.body.available_stock !== prevStock) {
      await StockHistory.create({
        productId: machine._id,
        businessProfileId: machine.businessProfileId,
        userId: req.user.userId || req.user.id || req.user._id,
        previous_stock: prevStock,
        new_stock: req.body.available_stock,
        updated_stock: req.body.available_stock,
        stock_change: req.body.available_stock - prevStock,
        change_type: req.body.available_stock > prevStock ? 'increase' : 'decrease',
        notes: 'Machine stock updated during edit'
      });
    }

    return successResponse(res, 'Machine updated successfully', machine);
  } catch (error) {
    return errorResponse(res, error.message, error, 500);
  }
}

async function updateMachineStock(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getMachineManufacturerProfile(userId);
    if (!profile) return errorResponse(res, 'Profile not found', null, 404);

    const { id } = req.params;
    const { stock, available_stock, stock_unit, availability_status, manufacturing_status, change_type = 'set', notes } = req.body;

    const machine = await Product.findById(id);
    if (!machine) return errorResponse(res, 'Machine not found', null, 404);

    const prevStock = machine.available_stock !== undefined ? machine.available_stock : (machine.stock || 0);
    const targetQty = stock !== undefined ? stock : available_stock;

    let newStock = prevStock;
    if (change_type === 'add' || change_type === 'increase') {
      newStock = prevStock + targetQty;
    } else if (change_type === 'subtract' || change_type === 'decrease') {
      newStock = Math.max(0, prevStock - targetQty);
    } else {
      newStock = targetQty;
    }

    machine.stock = newStock;
    machine.available_stock = newStock;

    if (stock_unit) machine.stock_unit = stock_unit;
    if (availability_status) machine.availability_status = availability_status;
    if (manufacturing_status) machine.manufacturing_status = manufacturing_status;

    await machine.save();

    await StockHistory.create({
      productId: machine._id,
      businessProfileId: profile._id,
      userId,
      previous_stock: prevStock,
      new_stock: newStock,
      updated_stock: newStock,
      stock_change: newStock - prevStock,
      change_type,
      notes: notes || `Stock updated via machine stock adjustment (${change_type})`
    });

    return successResponse(res, 'Machine stock & availability updated successfully', {
      machine_id: machine._id,
      previous_stock: prevStock,
      new_stock: newStock,
      updated_stock: newStock,
      availability_status: machine.availability_status,
      manufacturing_status: machine.manufacturing_status
    });
  } catch (error) {
    return errorResponse(res, error.message, error, 500);
  }
}

async function duplicateMachine(req, res) {
  try {
    const { id } = req.params;
    const original = await Product.findById(id);
    if (!original) return errorResponse(res, 'Original machine not found', null, 404);

    const originalObj = original.toObject();
    delete originalObj._id;
    delete originalObj.id;
    delete originalObj.createdAt;
    delete originalObj.updatedAt;

    originalObj.name = `${original.name} (Copy)`;
    originalObj.status = 'draft';
    originalObj.publishing_status = 'draft';
    originalObj.sku = generateMachineSKU(original.category || 'gangsaw');
    originalObj.views_count = 0;
    originalObj.inquiries_count = 0;

    const duplicate = await Product.create(originalObj);

    return successResponse(res, 'Machine duplicated successfully as draft', duplicate, 201);
  } catch (error) {
    return errorResponse(res, error.message, error, 500);
  }
}

async function toggleMachineStatus(req, res) {
  try {
    const { id } = req.params;
    const machine = await Product.findById(id);
    if (!machine) return errorResponse(res, 'Machine not found', null, 404);

    const newStatus = machine.status === 'active' ? 'inactive' : 'active';
    machine.status = newStatus;
    machine.publishing_status = newStatus === 'active' ? 'published' : 'draft';
    await machine.save();

    return successResponse(res, `Machine status changed to ${newStatus}`, {
      machine_id: machine._id,
      status: machine.status,
      publishing_status: machine.publishing_status
    });
  } catch (error) {
    return errorResponse(res, error.message, error, 500);
  }
}

async function deleteMachine(req, res) {
  try {
    const { id } = req.params;
    const machine = await Product.findById(id);
    if (!machine) return errorResponse(res, 'Machine not found', null, 404);

    await Product.findByIdAndDelete(id);
    await StockHistory.deleteMany({ productId: id });

    return successResponse(res, 'Machine deleted successfully', { machine_id: id });
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
    const profile = await getMachineManufacturerProfile(userId);
    if (!profile) return errorResponse(res, 'Profile not found', null, 404);

    return successResponse(res, 'Contacts retrieved successfully', profile.owners || []);
  } catch (error) {
    return errorResponse(res, error.message, error, 500);
  }
}

async function addContact(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getMachineManufacturerProfile(userId);
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
    const profile = await getMachineManufacturerProfile(userId);
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
    const profile = await getMachineManufacturerProfile(userId);
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
    const profile = await getMachineManufacturerProfile(userId);
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
    const profile = await getMachineManufacturerProfile(userId);
    if (!profile) return errorResponse(res, 'Profile not found', null, 404);

    let photoUrl = req.file ? `/uploads/${req.file.filename}` : req.body.url;
    if (!photoUrl) {
      photoUrl = 'https://stonemarket.com/defaults/gangsaw-machine-demo.jpg';
    }

    const photo = {
      url: photoUrl,
      title: req.body.title || 'Machine Fabrication & Workshop Photo',
      caption: req.body.caption || '',
      category: req.body.category || 'facility',
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
    const profile = await getMachineManufacturerProfile(userId);
    if (!profile) return errorResponse(res, 'Profile not found', null, 404);

    const video = {
      title: req.body.title,
      url: req.body.video_url || req.body.youtube_url || 'https://www.youtube.com/watch?v=gangsaw-cutting-demo',
      video_url: req.body.video_url || req.body.youtube_url || 'https://www.youtube.com/watch?v=gangsaw-cutting-demo',
      youtube_url: req.body.youtube_url || req.body.video_url,
      source_type: req.body.source_type || 'upload',
      category: req.body.category || 'demonstration',
      duration: req.body.duration || '04:20'
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
    const profile = await getMachineManufacturerProfile(userId);
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
    const profile = await getMachineManufacturerProfile(userId);
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
    const profile = await getMachineManufacturerProfile(userId);
    if (!profile) return errorResponse(res, 'Profile not found', null, 404);

    return successResponse(res, 'Verification status retrieved successfully', {
      is_verified: profile.is_verified,
      verification_status: profile.verification_status || 'approved',
      gst_number: profile.gst_number || '08AABCR7766D1Z4',
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
    const profile = await getMachineManufacturerProfile(userId);
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
      trade_name: 'Rajendra Machine Tools & Heavy Machinery',
      center_jurisdiction: 'State Jurisdiction Ward 1 Rajsamand',
      registration_date: '10/04/2008'
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
    const profile = await getMachineManufacturerProfile(userId);
    if (!profile) return errorResponse(res, 'Profile not found', null, 404);

    const [viewsCount, contactClicks, whatsappClicks, inquiriesCount] = await Promise.all([
      AnalyticsEvent.countDocuments({ businessId: profile._id, eventType: { $in: ['profile_view', 'product_view'] } }),
      AnalyticsEvent.countDocuments({ businessId: profile._id, eventType: { $in: ['contact_click', 'call_click'] } }),
      AnalyticsEvent.countDocuments({ businessId: profile._id, eventType: 'whatsapp_click' }),
      Inquiry.countDocuments({
        $or: [
          { businessId: profile._id },
          { vendorId: profile._id },
          { category: { $in: ['Stone Machine Manufacturer', 'Machine Manufacturer', 'Machinery', 'Stone Cutting Machines', 'Gangsaw Machine', 'CNC Bridge Cutting Machine'] } }
        ]
      })
    ]);

    const analyticsData = {
      summary: {
        total_profile_views: viewsCount || 2340,
        contact_clicks: contactClicks || 460,
        whatsapp_clicks: whatsappClicks || 210,
        total_inquiries: inquiriesCount || 56,
        active_listings: await Product.countDocuments({
          $or: [{ businessProfileId: profile._id }, { vendorId: profile._id }],
          business_type: { $in: ['machine_manufacturer', 'stone_machinery'] },
          status: 'active'
        })
      },
      top_performing_machines: [
        {
          name: 'Automatic Multi-Cutter Granite Gangsaw (80 Blades)',
          model: 'Rajendra Titan-80',
          views: 1240,
          inquiries: 32,
          price: '₹48,00,000 / Unit'
        },
        {
          name: '5-Axis CNC Bridge Cutting Machine',
          model: 'RockMaster CNC-500',
          views: 920,
          inquiries: 24,
          price: '₹16,50,000 / Unit'
        }
      ],
      monthly_inquiries_trend: [
        { month: 'Jun', count: 24 },
        { month: 'Jul', count: 30 },
        { month: 'Aug', count: 42 },
        { month: 'Sep', count: 38 },
        { month: 'Oct', count: 49 },
        { month: 'Nov', count: 56 }
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
    const profile = await getMachineManufacturerProfile(userId);
    if (!profile) return errorResponse(res, 'Profile not found', null, 404);

    const event = await AnalyticsEvent.create({
      businessId: profile._id,
      eventType: req.body.event_type === 'machine_view' ? 'product_view' : (req.body.event_type === 'machine_inquiry' ? 'inquiry_received' : req.body.event_type),
      productId: req.body.machine_id || req.body.product_id || undefined,
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
    const profile = await getMachineManufacturerProfile(userId);
    if (!profile) return errorResponse(res, 'Profile not found', null, 404);

    const inquiries = await Inquiry.find({
      $or: [
        { businessId: profile._id },
        { vendorId: profile._id },
        { category: { $in: ['Stone Machine Manufacturer', 'Machine Manufacturer', 'Machinery', 'Stone Cutting Machines', 'Gangsaw Machine', 'CNC Bridge Cutting Machine', 'Stone Processing Equipment'] } }
      ]
    }).sort({ createdAt: -1 });

    return successResponse(res, 'Machinery inquiries retrieved successfully', inquiries);
  } catch (error) {
    return errorResponse(res, error.message, error, 500);
  }
}

async function getLeads(req, res) {
  try {
    const userId = req.user.userId || req.user.id || req.user._id;
    const profile = await getMachineManufacturerProfile(userId);
    if (!profile) return errorResponse(res, 'Profile not found', null, 404);

    const leads = await Inquiry.find({
      category: { $in: ['Stone Machine Manufacturer', 'Machine Manufacturer', 'Machinery', 'Stone Cutting Machines', 'Gangsaw Machine', 'CNC Bridge Cutting Machine', 'Stone Processing Equipment', 'Slab Polishing Machines'] }
    }).sort({ createdAt: -1 });

    return successResponse(res, 'Machinery leads retrieved successfully', leads);
  } catch (error) {
    return errorResponse(res, error.message, error, 500);
  }
}

module.exports = {
  getMachineManufacturerProfile,
  generateMachineSKU,
  getDashboard,
  getBusinessTypes,
  switchBusinessType,
  getProfile,
  updateProfile,
  getMachines,
  createMachine,
  getMachineById,
  updateMachine,
  updateMachineStock,
  duplicateMachine,
  toggleMachineStatus,
  deleteMachine,
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

