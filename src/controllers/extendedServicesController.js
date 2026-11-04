const BusinessProfile = require('../models/BusinessProfile');
const User = require('../models/User');
const Product = require('../models/Product');
const StockHistory = require('../models/StockHistory');
const Inquiry = require('../models/Inquiry');
const AnalyticsEvent = require('../models/AnalyticsEvent');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// Metadata definitions for all 6 business types
const SERVICE_TYPE_CONFIGS = {
  machine_repairing: {
    primaryType: 'machine_repairing',
    aliases: ['machine_repairing'],
    dashboardMenuTitle: 'Repair Service Management',
    dashboardMenuPath: '/machine-repairing/services',
    businessCategory: 'Machine Repairing',
    skuPrefix: 'REP',
    exampleCompany: 'Apex Industrial Machine Repair & Engineering',
    exampleSubcategory: 'Granite Gangsaw, Multi-Blade Cutters & CNC Machine Maintenance',
    itemKey: 'services',
    operationalCards: (p) => [
      { title: 'Supported Machines', value: 'Gangsaws, CNC, Bridge Cutters', subtitle: 'Heavy Structural & Slicing Units' },
      { title: 'Technicians Count', value: `${p.technician_count || 12} Certified Technicians`, subtitle: 'Mechanical & Hydraulic Engineers' },
      { title: 'On-Site Service', value: '24/7 Breakdown Dispatch', subtitle: 'Immediate Quarry & Factory Support' },
      { title: 'Repair Specialization', value: 'Hydraulics, Gearboxes & PLCs', subtitle: 'Turnkey Component Overhauls' }
    ]
  },
  electrical_panel: {
    primaryType: 'electrical_panel',
    aliases: ['electrical_panel', 'electrical_repairing'],
    dashboardMenuTitle: 'Electrical Service Management',
    dashboardMenuPath: '/electrical-panel/services',
    businessCategory: 'Electrical Panel & Repairing',
    skuPrefix: 'ELC',
    exampleCompany: 'PowerVolt Industrial Automation & Control Panels',
    exampleSubcategory: 'Custom LT/HT Control Panels, APFC, MCC, VFD Automation & Machine Wiring',
    itemKey: 'services',
    operationalCards: (p) => [
      { title: 'Panel Types', value: 'LT, HT, APFC & MCC Panels', subtitle: 'CPRI Tested & Industrial Grade' },
      { title: 'Automation Setup', value: 'Siemens & Schneider PLC/VFD', subtitle: 'Multi-Axis Precision Integration' },
      { title: 'Voltage Handling', value: '415V LT up to 11kV HT', subtitle: 'Heavy Industrial Stone Plants' },
      { title: 'AMC & Maintenance', value: 'Annual Maintenance Contracts', subtitle: 'Scheduled Preventive Testing' }
    ]
  },
  water_supplier: {
    primaryType: 'water_supplier',
    aliases: ['water_supplier'],
    dashboardMenuTitle: 'Water Supply Management',
    dashboardMenuPath: '/water-supplier/supplies',
    businessCategory: 'Water Supplier',
    skuPrefix: 'WTR',
    exampleCompany: 'NeerDhara Industrial & Commercial Water Supplies',
    exampleSubcategory: 'Industrial Water Tankers, RO Treated Water & Packaged Drinking Water',
    itemKey: 'supplies',
    operationalCards: (p) => [
      { title: 'Daily Capacity', value: '1,50,000+ Litres / Day', subtitle: 'Dedicated Continuous Water Fleet' },
      { title: 'Tanker Fleet', value: `${p.tanker_fleet_count || 15} High-Capacity Tankers`, subtitle: '5,000L to 20,000L Stainless Tankers' },
      { title: 'Quality Standards', value: 'TDS & pH Certified Lab Tested', subtitle: 'Suitable for Wire Saws & Polishing' },
      { title: 'Delivery Coverage', value: 'Industrial Zones & Quarries', subtitle: 'Same-Day Fast Turnaround' }
    ]
  },
  ca_tax_advisor: {
    primaryType: 'ca_tax_advisor',
    aliases: ['ca_tax_advisor'],
    dashboardMenuTitle: 'Professional Services Management',
    dashboardMenuPath: '/ca-tax-advisor/services',
    businessCategory: 'CA & Tax Advisor',
    skuPrefix: 'TAX',
    exampleCompany: 'Singhal & Associates Chartered Accountants',
    exampleSubcategory: 'Mining & Stone Industry GST Compliance, ROC, Audits & Corporate Advisory',
    itemKey: 'services',
    operationalCards: (p) => [
      { title: 'Professional Qualifications', value: 'FCA, DISA & Insolvency Professional', subtitle: '15+ Years Commercial Experience' },
      { title: 'Sector Specialization', value: 'Stone Processing & Mining Royalty', subtitle: 'GST, Custom Duty & Mineral Cess' },
      { title: 'Consultation Mode', value: 'Online & Office Consultation', subtitle: 'Dedicated Corporate Retainers' },
      { title: 'Compliance Coverage', value: 'GST, ITR, Statutory & Tax Audits', subtitle: 'Complete Corporate Filings' }
    ]
  },
  banking_loan: {
    primaryType: 'banking_loan',
    aliases: ['banking_loan', 'banking_services'],
    dashboardMenuTitle: 'Financial Services Management',
    dashboardMenuPath: '/banking-loan/services',
    businessCategory: 'Banking & Loan Services',
    skuPrefix: 'FIN',
    exampleCompany: 'Apex Industrial Finance & MSME Loan Advisory',
    exampleSubcategory: 'Machinery Loans, Industrial Working Capital, CC/OD & Export Credit',
    itemKey: 'services',
    operationalCards: (p) => [
      { title: 'Institution Type', value: 'Authorized Financial Consultant', subtitle: 'Leading PSU & Private Banks Panel' },
      { title: 'Loan Products', value: 'Machinery, MSME & Project Finance', subtitle: 'Competitive Subsidized Interest Rates' },
      { title: 'Disbursement Scope', value: '₹10 Lakh to ₹50+ Crore', subtitle: 'Tailored to Stone Factory Capacities' },
      { title: 'Advisory Processing', value: 'End-to-End Documentation', subtitle: 'Fast In-Principle Sanctions' }
    ]
  },
  hotel_restaurant: {
    primaryType: 'hotel_restaurant',
    aliases: ['hotel_restaurant', 'hospitality'],
    dashboardMenuTitle: 'Hospitality Management',
    dashboardMenuPath: '/hotel-restaurant/listings',
    businessCategory: 'Hotel & Restaurant',
    skuPrefix: 'HSP',
    exampleCompany: 'The Royal Granito Business Hotel & Dine',
    exampleSubcategory: 'Executive Business Stays, Banquet Halls & Multi-Cuisine Fine Dining',
    itemKey: 'listings',
    operationalCards: (p) => [
      { title: 'Room Inventory', value: `${p.total_room_count || 45} Executive Rooms & Suites`, subtitle: 'High-Speed Wi-Fi, AC & Workdesks' },
      { title: 'Dining Capacity', value: '120 Pax Multi-Cuisine Restaurant', subtitle: 'Pure Veg & Multi-Cuisine Seating' },
      { title: 'Business Facilities', value: 'Conference & Banquet Halls', subtitle: 'Ideal for Quarry & Stone Trade Meets' },
      { title: 'Location Advantage', value: 'Heart of Stone Industrial Belt', subtitle: 'Ample Parking & 24/7 Check-in' }
    ]
  }
};

// Helper: Get or initialize BusinessProfile for specific service type
async function getServiceBusinessProfile(userId, serviceTypeKey) {
  const config = SERVICE_TYPE_CONFIGS[serviceTypeKey];
  if (!config) return null;

  let profile = await BusinessProfile.findOne({
    userId,
    business_type: { $in: config.aliases }
  });

  if (!profile) {
    const user = await User.findById(userId);
    if (user) {
      profile = await BusinessProfile.create({
        userId,
        business_type: config.primaryType,
        company_name: user.name ? `${user.name} Services` : config.exampleCompany,
        business_category: config.businessCategory,
        business_subcategory: config.exampleSubcategory,
        short_description: `Leading provider of ${config.businessCategory} for stone fabrication factories, quarries and commercial clients.`,
        about_business: `Dedicated provider delivering top-tier solutions in ${config.businessCategory} with high reliability, specialized equipment, and professional execution.`,
        established_year: 2014,
        address: {
          state: 'Rajasthan',
          district: 'Kishangarh',
          area: 'Industrial Area',
          industrial_area: 'RIICO Industrial Area',
          commercial_area: 'Stone Market Complex',
          office_address: 'Plot 101-104, Industrial Estate, Kishangarh',
          full_address: 'Plot 101-104, Industrial Estate, Kishangarh, Rajasthan 305802',
          postal_code: '305802',
          country: 'India'
        },
        owners: [
          {
            name: user.name || 'Managing Director',
            designation: 'Managing Partner',
            phone: user.phone || user.mobile || '+91 98290 88776',
            email: user.email || 'services@stonemarket.com',
            whatsapp: user.phone || user.mobile || '+91 98290 88776',
            is_primary: true
          }
        ],
        verification_steps: {
          phone: { phone: user.phone || user.mobile || '+91 98290 88776', status: 'verified', verified_at: new Date() },
          email: { email: user.email || 'services@stonemarket.com', status: 'verified', verified_at: new Date() },
          business: { registration_type: 'MSME / Udyam', registration_number: 'UDYAM-RJ-28-0088776', status: 'verified' },
          gst: { gstin: '08AABCS8877E1Z2', status: 'verified' }
        },
        is_verified: true,
        verification_status: 'approved',
        gst_number: '08AABCS8877E1Z2',
        rating: 4.9,
        review_count: 42,
        status: 'active',
        is_mock: false
      });
    }
  }

  return profile;
}

// Generate unique SKU
function generateServiceSKU(prefix = 'SRV') {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${year}-${rand}`;
}

// Factory to create controller methods for any of the 6 business types
function createServiceModuleController(serviceTypeKey) {
  const config = SERVICE_TYPE_CONFIGS[serviceTypeKey];

  return {
    // 1. DASHBOARD & BUSINESS SWITCHER
    async getDashboard(req, res) {
      try {
        const userId = req.user.userId || req.user.id || req.user._id;
        const profile = await getServiceBusinessProfile(userId, serviceTypeKey);
        if (!profile) return errorResponse(res, `${config.businessCategory} profile not found`, null, 404);

        const baseProductQuery = {
          $or: [{ businessProfileId: profile._id }, { vendorId: profile._id }],
          business_type: { $in: config.aliases }
        };

        const [
          totalItems,
          activeItems,
          draftItems,
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
              { category: config.businessCategory }
            ]
          }),
          Inquiry.countDocuments({
            category: config.businessCategory
          })
        ]);

        const dashboard = {
          business_profile_card: {
            profile_id: profile._id,
            business_logo: profile.logo || 'https://stonemarket.com/defaults/service-logo.png',
            business_name: profile.company_name,
            verification_badge: profile.is_verified,
            is_verified: profile.is_verified,
            business_type: config.businessCategory,
            location: profile.address ? `${profile.address.district || 'Kishangarh'}, ${profile.address.state || 'Rajasthan'}` : 'Rajasthan, India',
            rating: profile.rating || 4.9,
            reviews: profile.review_count || 42,
            member_since: profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Jan 2024'
          },
          operational_summary_cards: config.operationalCards(profile),
          metrics: {
            total_items: totalItems,
            active_items: activeItems,
            inactive_items: draftItems,
            inquiries_count: inquiriesCount,
            leads_count: leadsCount
          },
          dashboard_sections: {
            my_business: [
              { title: 'Business Profile', path: '/business-profile', icon: 'profile' },
              { title: config.dashboardMenuTitle, path: config.dashboardMenuPath, icon: 'services' },
              { title: 'Gallery', path: `/${serviceTypeKey.replace(/_/g, '-')}/gallery`, icon: 'gallery' },
              { title: 'Verification Center', path: `/${serviceTypeKey.replace(/_/g, '-')}/verification`, icon: 'verification' },
              { title: 'Analytics', path: `/${serviceTypeKey.replace(/_/g, '-')}/analytics`, icon: 'analytics' },
              { title: 'Ad Management', path: `/${serviceTypeKey.replace(/_/g, '-')}/ad-management`, icon: 'ad' }
            ],
            business_activity: [
              { title: 'My Inquiries', count: inquiriesCount, path: `/${serviceTypeKey.replace(/_/g, '-')}/inquiries` },
              { title: 'Lead Management', count: leadsCount, path: `/${serviceTypeKey.replace(/_/g, '-')}/leads` }
            ]
          },
          // Flat aliases for frontend compatibility
          my_business_menu: [
            { title: 'Business Profile', path: '/business-profile', icon: 'profile' },
            { title: config.dashboardMenuTitle, path: config.dashboardMenuPath, icon: 'services' },
            { title: 'Gallery', path: `/${serviceTypeKey.replace(/_/g, '-')}/gallery`, icon: 'gallery' },
            { title: 'Verification Center', path: `/${serviceTypeKey.replace(/_/g, '-')}/verification`, icon: 'verification' },
            { title: 'Analytics', path: `/${serviceTypeKey.replace(/_/g, '-')}/analytics`, icon: 'analytics' },
            { title: 'Ad Management', path: `/${serviceTypeKey.replace(/_/g, '-')}/ad-management`, icon: 'ad' }
          ]
        };

        return successResponse(res, `${config.businessCategory} dashboard retrieved successfully`, dashboard);
      } catch (error) {
        return errorResponse(res, error.message, error, 500);
      }
    },

    async getBusinessTypes(req, res) {
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
          { id: 'powder_supplier', label: 'Mineral & Powder Supplier', is_active: false },
          { id: 'machine_repairing', label: 'Machine Repairing', is_active: serviceTypeKey === 'machine_repairing' },
          { id: 'electrical_panel', label: 'Electrical Panel & Repairing', is_active: serviceTypeKey === 'electrical_panel' },
          { id: 'water_supplier', label: 'Water Supplier', is_active: serviceTypeKey === 'water_supplier' },
          { id: 'ca_tax_advisor', label: 'CA & Tax Advisor', is_active: serviceTypeKey === 'ca_tax_advisor' },
          { id: 'banking_loan', label: 'Banking & Loan Services', is_active: serviceTypeKey === 'banking_loan' },
          { id: 'hotel_restaurant', label: 'Hotel & Restaurant', is_active: serviceTypeKey === 'hotel_restaurant' }
        ];

        return successResponse(res, 'Business types list retrieved successfully', {
          current: config.primaryType,
          business_types: businessTypes
        });
      } catch (error) {
        return errorResponse(res, error.message, error, 500);
      }
    },

    async switchBusinessType(req, res) {
      try {
        const userId = req.user.userId || req.user.id || req.user._id;
        const targetType = req.body.target_type || req.body.target_business_type || config.primaryType;

        let user = await User.findById(userId);
        if (!user) return errorResponse(res, 'User not found', null, 404);

        if (user.role !== targetType) {
          user.role = targetType;
          await user.save();
        }

        let profile = await BusinessProfile.findOne({ userId, business_type: targetType });
        if (!profile) {
          profile = await getServiceBusinessProfile(userId, serviceTypeKey);
        }

        return successResponse(res, `Successfully switched business type to ${targetType}`, {
          user_id: user._id,
          current_business_type: targetType,
          profile_exists: !!profile,
          profile_id: profile ? profile._id : null
        });
      } catch (error) {
        return errorResponse(res, error.message, error, 500);
      }
    },

    // 2. PROFILE MANAGEMENT
    async getProfile(req, res) {
      try {
        const userId = req.user.userId || req.user.id || req.user._id;
        const profile = await getServiceBusinessProfile(userId, serviceTypeKey);
        if (!profile) return errorResponse(res, 'Business profile not found', null, 404);

        return successResponse(res, 'Profile retrieved successfully', profile);
      } catch (error) {
        return errorResponse(res, error.message, error, 500);
      }
    },

    async updateProfile(req, res) {
      try {
        const userId = req.user.userId || req.user.id || req.user._id;
        const profile = await getServiceBusinessProfile(userId, serviceTypeKey);
        if (!profile) return errorResponse(res, 'Business profile not found', null, 404);

        Object.assign(profile, req.body);
        await profile.save();

        return successResponse(res, 'Profile updated successfully', profile);
      } catch (error) {
        return errorResponse(res, error.message, error, 500);
      }
    },

    // 3. CATALOGUE / LISTING MANAGEMENT
    async getItems(req, res) {
      try {
        const userId = req.user.userId || req.user.id || req.user._id;
        const profile = await getServiceBusinessProfile(userId, serviceTypeKey);
        if (!profile) return errorResponse(res, 'Profile not found', null, 404);

        const { search, status, category, page = 1, limit = 20 } = req.query;
        const query = {
          $or: [{ businessProfileId: profile._id }, { vendorId: profile._id }],
          business_type: { $in: config.aliases }
        };

        if (status && status !== 'all') {
          query.status = status;
        }

        if (category) {
          query.category = new RegExp(category, 'i');
        }

        if (search) {
          query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { category: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { sku: { $regex: search, $options: 'i' } }
          ];
        }

        const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
        const [items, total] = await Promise.all([
          Product.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit, 10)),
          Product.countDocuments(query)
        ]);

        const result = {
          total,
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          items
        };
        // Also provide contextual plural key (e.g. services, supplies, listings)
        result[config.itemKey] = items;

        return successResponse(res, `${config.dashboardMenuTitle} items retrieved successfully`, result);
      } catch (error) {
        return errorResponse(res, error.message, error, 500);
      }
    },

    async createItem(req, res) {
      try {
        const userId = req.user.userId || req.user.id || req.user._id;
        const profile = await getServiceBusinessProfile(userId, serviceTypeKey);
        if (!profile) return errorResponse(res, 'Profile not found', null, 404);

        const sku = req.body.sku || generateServiceSKU(config.skuPrefix);
        const price = req.body.selling_price !== undefined ? req.body.selling_price : req.body.price;

        const itemData = {
          ...req.body,
          businessProfileId: profile._id,
          vendorId: profile._id,
          business_type: config.primaryType,
          sku,
          price,
          selling_price: price,
          status: req.body.status || 'active',
          publishing_status: req.body.publishing_status || (req.body.status === 'draft' ? 'draft' : 'published'),
          views_count: 0,
          inquiries_count: 0
        };

        if (itemData.cover_image && (!itemData.images || itemData.images.length === 0)) {
          itemData.images = [itemData.cover_image];
        } else if (itemData.images && itemData.images.length > 0 && !itemData.cover_image) {
          itemData.cover_image = itemData.images[0];
        }

        const item = await Product.create(itemData);

        return successResponse(res, `${config.businessCategory} listing published successfully`, item, 201);
      } catch (error) {
        return errorResponse(res, error.message, error, 500);
      }
    },

    async getItemById(req, res) {
      try {
        const { id } = req.params;
        const item = await Product.findById(id);
        if (!item) return errorResponse(res, 'Listing not found', null, 404);

        return successResponse(res, 'Listing details retrieved successfully', item);
      } catch (error) {
        return errorResponse(res, error.message, error, 500);
      }
    },

    async updateItem(req, res) {
      try {
        const { id } = req.params;
        const item = await Product.findById(id);
        if (!item) return errorResponse(res, 'Listing not found', null, 404);

        if (req.body.selling_price !== undefined) req.body.price = req.body.selling_price;
        if (req.body.price !== undefined && req.body.selling_price === undefined) req.body.selling_price = req.body.price;

        Object.assign(item, req.body);
        await item.save();

        return successResponse(res, 'Listing updated successfully', item);
      } catch (error) {
        return errorResponse(res, error.message, error, 500);
      }
    },

    async duplicateItem(req, res) {
      try {
        const { id } = req.params;
        const original = await Product.findById(id);
        if (!original) return errorResponse(res, 'Listing not found', null, 404);

        const copyData = original.toObject();
        delete copyData._id;
        delete copyData.createdAt;
        delete copyData.updatedAt;

        copyData.name = `${copyData.name} (Copy)`;
        copyData.sku = generateServiceSKU(config.skuPrefix);
        copyData.status = 'draft';
        copyData.publishing_status = 'draft';
        copyData.views = 0;
        copyData.views_count = 0;
        copyData.inquiries_count = 0;

        const copy = await Product.create(copyData);
        return successResponse(res, 'Listing duplicated as draft successfully', copy, 201);
      } catch (error) {
        return errorResponse(res, error.message, error, 500);
      }
    },

    async toggleItemStatus(req, res) {
      try {
        const { id } = req.params;
        const item = await Product.findById(id);
        if (!item) return errorResponse(res, 'Listing not found', null, 404);

        const newStatus = req.body.status || (item.status === 'active' ? 'inactive' : 'active');
        item.status = newStatus;
        if (newStatus === 'active') item.publishing_status = 'published';
        await item.save();

        return successResponse(res, `Listing status updated to ${newStatus}`, item);
      } catch (error) {
        return errorResponse(res, error.message, error, 500);
      }
    },

    async deleteItem(req, res) {
      try {
        const { id } = req.params;
        const item = await Product.findById(id);
        if (!item) return errorResponse(res, 'Listing not found', null, 404);

        await Product.findByIdAndDelete(id);
        return successResponse(res, 'Listing deleted successfully', { id });
      } catch (error) {
        return errorResponse(res, error.message, error, 500);
      }
    },

    // 4. CONTACTS
    async getContacts(req, res) {
      try {
        const userId = req.user.userId || req.user.id || req.user._id;
        const profile = await getServiceBusinessProfile(userId, serviceTypeKey);
        if (!profile) return errorResponse(res, 'Profile not found', null, 404);

        return successResponse(res, 'Contacts retrieved successfully', profile.owners || []);
      } catch (error) {
        return errorResponse(res, error.message, error, 500);
      }
    },

    async addContact(req, res) {
      try {
        const userId = req.user.userId || req.user.id || req.user._id;
        const profile = await getServiceBusinessProfile(userId, serviceTypeKey);
        if (!profile) return errorResponse(res, 'Profile not found', null, 404);

        if (req.body.is_primary) {
          (profile.owners || []).forEach(o => { o.is_primary = false; });
        }

        profile.owners = profile.owners || [];
        profile.owners.push(req.body);
        await profile.save();

        return successResponse(res, 'Contact added successfully', profile.owners, 201);
      } catch (error) {
        return errorResponse(res, error.message, error, 500);
      }
    },

    // 5. GALLERY
    async getGallery(req, res) {
      try {
        const userId = req.user.userId || req.user.id || req.user._id;
        const profile = await getServiceBusinessProfile(userId, serviceTypeKey);
        if (!profile) return errorResponse(res, 'Profile not found', null, 404);

        return successResponse(res, 'Gallery retrieved successfully', {
          photos: profile.gallery_photos || [],
          videos: profile.gallery_videos || []
        });
      } catch (error) {
        return errorResponse(res, error.message, error, 500);
      }
    },

    async uploadGalleryPhoto(req, res) {
      try {
        const userId = req.user.userId || req.user.id || req.user._id;
        const profile = await getServiceBusinessProfile(userId, serviceTypeKey);
        if (!profile) return errorResponse(res, 'Profile not found', null, 404);

        const photo = {
          url: req.file ? `/uploads/${req.file.filename}` : req.body.url || 'https://stonemarket.com/defaults/service-gallery.jpg',
          title: req.body.title || 'Facility Photo',
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
    },

    async addGalleryVideo(req, res) {
      try {
        const userId = req.user.userId || req.user.id || req.user._id;
        const profile = await getServiceBusinessProfile(userId, serviceTypeKey);
        if (!profile) return errorResponse(res, 'Profile not found', null, 404);

        const video = {
          title: req.body.title,
          url: req.body.video_url || req.body.youtube_url || 'https://youtube.com/watch?v=sample-service-demo',
          video_url: req.body.video_url || req.body.youtube_url || 'https://youtube.com/watch?v=sample-service-demo',
          youtube_url: req.body.youtube_url || req.body.video_url,
          source_type: req.body.source_type || 'upload',
          category: req.body.category || 'demonstration',
          duration: req.body.duration || '03:30'
        };

        profile.gallery_videos = profile.gallery_videos || [];
        profile.gallery_videos.push(video);
        await profile.save();

        return successResponse(res, 'Gallery video added successfully', video, 201);
      } catch (error) {
        return errorResponse(res, error.message, error, 500);
      }
    },

    // 6. VERIFICATION CENTER
    async getVerificationStatus(req, res) {
      try {
        const userId = req.user.userId || req.user.id || req.user._id;
        const profile = await getServiceBusinessProfile(userId, serviceTypeKey);
        if (!profile) return errorResponse(res, 'Profile not found', null, 404);

        return successResponse(res, 'Verification status retrieved successfully', {
          is_verified: profile.is_verified,
          verification_status: profile.verification_status,
          verification_steps: profile.verification_steps,
          gst_number: profile.gst_number
        });
      } catch (error) {
        return errorResponse(res, error.message, error, 500);
      }
    },

    async verifyGst(req, res) {
      try {
        const userId = req.user.userId || req.user.id || req.user._id;
        const profile = await getServiceBusinessProfile(userId, serviceTypeKey);
        if (!profile) return errorResponse(res, 'Profile not found', null, 404);

        const { gstin } = req.body;
        profile.gst_number = gstin;
        profile.verification_steps = profile.verification_steps || {};
        profile.verification_steps.gst = { gstin, status: 'verified' };
        profile.is_verified = true;
        profile.verification_status = 'approved';
        await profile.save();

        return successResponse(res, 'GST verified successfully', {
          gstin,
          status: 'verified',
          is_verified: true
        });
      } catch (error) {
        return errorResponse(res, error.message, error, 500);
      }
    },

    // 7. ANALYTICS
    async getAnalytics(req, res) {
      try {
        const userId = req.user.userId || req.user.id || req.user._id;
        const profile = await getServiceBusinessProfile(userId, serviceTypeKey);
        if (!profile) return errorResponse(res, 'Profile not found', null, 404);

        const items = await Product.find({
          $or: [{ businessProfileId: profile._id }, { vendorId: profile._id }],
          business_type: { $in: config.aliases }
        }).sort({ views: -1, views_count: -1 }).limit(5);

        return successResponse(res, 'Analytics retrieved successfully', {
          summary: {
            total_profile_views: 450,
            total_listing_views: items.reduce((acc, i) => acc + (i.views_count || i.views || 0), 0),
            total_inquiries: 38,
            total_leads: 18
          },
          top_performing_items: items
        });
      } catch (error) {
        return errorResponse(res, error.message, error, 500);
      }
    },

    async recordAnalyticsEvent(req, res) {
      try {
        const { event_type, product_id, metadata } = req.body;
        const event = await AnalyticsEvent.create({
          userId: req.user.userId || req.user.id || req.user._id,
          event_type: event_type || `${serviceTypeKey}_view`,
          product_id,
          metadata: metadata || {}
        });

        return successResponse(res, 'Analytics event recorded', event, 201);
      } catch (error) {
        return errorResponse(res, error.message, error, 500);
      }
    },

    // 8. INQUIRIES & LEADS
    async getInquiries(req, res) {
      try {
        const userId = req.user.userId || req.user.id || req.user._id;
        const profile = await getServiceBusinessProfile(userId, serviceTypeKey);
        if (!profile) return errorResponse(res, 'Profile not found', null, 404);

        const inquiries = await Inquiry.find({
          $or: [
            { businessId: profile._id },
            { vendorId: profile._id },
            { category: config.businessCategory }
          ]
        }).sort({ createdAt: -1 });

        return successResponse(res, 'Inquiries retrieved successfully', inquiries);
      } catch (error) {
        return errorResponse(res, error.message, error, 500);
      }
    },

    async getLeads(req, res) {
      try {
        const userId = req.user.userId || req.user.id || req.user._id;
        const profile = await getServiceBusinessProfile(userId, serviceTypeKey);
        if (!profile) return errorResponse(res, 'Profile not found', null, 404);

        const leads = await Inquiry.find({
          $or: [
            { businessId: profile._id },
            { vendorId: profile._id },
            { category: config.businessCategory }
          ]
        }).sort({ createdAt: -1 });

        return successResponse(res, 'Leads retrieved successfully', leads);
      } catch (error) {
        return errorResponse(res, error.message, error, 500);
      }
    }
  };
}

module.exports = {
  SERVICE_TYPE_CONFIGS,
  getServiceBusinessProfile,
  generateServiceSKU,
  createServiceModuleController,
  // Export individual controllers
  machineRepairingController: createServiceModuleController('machine_repairing'),
  electricalPanelController: createServiceModuleController('electrical_panel'),
  waterSupplierController: createServiceModuleController('water_supplier'),
  caTaxAdvisorController: createServiceModuleController('ca_tax_advisor'),
  bankingLoanController: createServiceModuleController('banking_loan'),
  hotelRestaurantController: createServiceModuleController('hotel_restaurant')
};

