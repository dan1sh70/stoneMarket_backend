const request = require('supertest');
const app = require('../server');
const User = require('../src/models/User');
const BusinessProfile = require('../src/models/BusinessProfile');
const Product = require('../src/models/Product');
const Inquiry = require('../src/models/Inquiry');
const StockHistory = require('../src/models/StockHistory');
const jwt = require('jsonwebtoken');

describe('Stone Heavy Mining Equipment Module - Comprehensive Suite', () => {
  let miningEquipmentUser, customerUser;
  let miningEquipmentToken, customerToken;
  let miningEquipmentProfile;
  let testEquipment;

  beforeEach(async () => {
    // 1. Heavy Mining Equipment User & Profile
    miningEquipmentUser = await User.create({
      name: 'Harish Chandra Verma',
      mobile: '9829089123',
      email: 'harish.mining@atlasheavy.com',
      password: 'password123',
      role: 'mining_equipment',
      status: 'active'
    });

    miningEquipmentToken = jwt.sign(
      { id: miningEquipmentUser._id, role: miningEquipmentUser.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1h' }
    );

    miningEquipmentProfile = await BusinessProfile.create({
      userId: miningEquipmentUser._id,
      business_type: 'mining_equipment',
      company_name: 'Atlas Mining Equipment & Heavy Quarry Machineries',
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
          name: 'Harish Chandra Verma',
          designation: 'Managing Director & Chief Mining Equipment Specialist',
          phone: '+91 98290 89123',
          email: 'miningequipment@stonemarket.com',
          whatsapp: '+91 98290 89123',
          is_primary: true
        }
      ],
      gallery_photos: [
        {
          url: 'https://stonemarket.com/uploads/mining-equipment-yard.jpg',
          title: 'Heavy Equipment Staging Yard',
          category: 'equipment',
          is_cover: true
        }
      ],
      gallery_videos: [
        {
          url: 'https://stonemarket.com/uploads/dth-quarry-action.mp4',
          title: 'Hydraulic Crawler DTH Rig in Live Quarry Bench Drilling',
          video_url: 'https://stonemarket.com/uploads/dth-quarry-action.mp4',
          source_type: 'upload',
          category: 'field_quarry_action'
        }
      ],
      verification_steps: {
        phone: { phone: '+91 98290 89123', status: 'verified', verified_at: new Date() },
        email: { email: 'miningequipment@stonemarket.com', status: 'verified', verified_at: new Date() },
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

    // 2. Customer User for Public Catalogue & Inquiries
    customerUser = await User.create({
      name: 'Praveen Quarry Owner',
      mobile: '9829012345',
      email: 'praveen.quarry@rajgranite.com',
      password: 'password123',
      role: 'buyer',
      status: 'active'
    });

    customerToken = jwt.sign(
      { id: customerUser._id, role: customerUser.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1h' }
    );

    // 3. Initial Base Equipment Product
    testEquipment = await Product.create({
      userId: miningEquipmentUser._id,
      vendorId: miningEquipmentProfile._id,
      businessProfileId: miningEquipmentProfile._id,
      business_type: 'mining_equipment',
      name: 'Hydraulic Crawler DTH Rock Drilling Rig',
      sku: 'DTH-2026-0115',
      category: 'Hydraulic Crawler Drilling Rigs',
      brand_name: 'Atlas-X Pro 115',
      model_number: 'AXP-115-CR',
      warranty_guarantee: '12 Months Manufacturer Warranty',
      selling_price: 1850000,
      price: 1850000,
      pricing_unit: 'Per Unit',
      min_order_quantity: 1,
      available_stock: 3,
      stock: 3,
      stock_unit: 'Units',
      availability_status: 'In Stock',
      equipment_condition: 'Brand New',
      delivery_available: true,
      installation_available: true,
      onsite_demonstration: true,
      after_sales_support: true,
      service_support: true,
      technical_specifications: {
        drilling_method: 'DTH Down-The-Hole Hammer',
        drilling_diameter: '4.5" – 6.5" (115mm – 165mm)',
        max_drilling_depth: '35 Meters',
        engine_power: '194 HP / 145 kW Cummins Turbo Diesel',
        hydraulic_pressure: '240 Bar Heavy Duty',
        air_consumption: '650 CFM @ 18 Bar',
        operating_weight: '7,800 kg',
        dust_collection: 'Integrated Multi-Cyclone Dry System',
        application: 'Deep bench block drilling & granite quarry development'
      },
      technical_drawings: [
        'https://stonemarket.com/uploads/blueprints/atlas-x-pro-115-rig.pdf'
      ],
      equipment_brochures: [
        'https://stonemarket.com/uploads/brochures/atlas-x-pro-specs.pdf'
      ],
      images: [
        'https://stonemarket.com/uploads/products/dth-rig-1.jpg'
      ],
      cover_image: 'https://stonemarket.com/uploads/products/dth-rig-1.jpg',
      status: 'active',
      publishing_status: 'published'
    });
  });

  // ==========================================
  // SECTION 1: DASHBOARD & BUSINESS SWITCHER
  // ==========================================
  describe('1. Dashboard & Business Switcher', () => {
    it('GET /api/mining-equipment/dashboard - should load complete dashboard and operational summary cards', async () => {
      const res = await request(app)
        .get('/api/mining-equipment/dashboard')
        .set('Authorization', `Bearer ${miningEquipmentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();

      const { business_profile_card, operational_summary, stats, my_business } = res.body.data;
      expect(business_profile_card.business_name).toBe('Atlas Mining Equipment & Heavy Quarry Machineries');
      expect(business_profile_card.business_type).toBe('Heavy Mining Equipment');
      expect(business_profile_card.rating).toBe(4.9);
      expect(business_profile_card.reviews).toBe(58);

      // 4 Operational Summary Cards
      expect(operational_summary.card_1.value).toContain('Categories');
      expect(operational_summary.card_2.value).toContain('Brands Available');
      expect(operational_summary.card_3.value).toContain('Heavy Mechanical Overhaul');
      expect(operational_summary.card_4.value).toContain('Pan-India On-Site Commissioning');

      // Stats & Menu
      expect(stats.total_products).toBeGreaterThanOrEqual(1);
      expect(my_business).toHaveLength(6);
      expect(my_business[1].name).toBe('Product & Spares Management');
    });

    it('GET /api/mining-equipment/business-types - should return available business types with Heavy Mining Equipment current', async () => {
      const res = await request(app)
        .get('/api/mining-equipment/business-types')
        .set('Authorization', `Bearer ${miningEquipmentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.current_type).toBe('mining_equipment');
      const miningEquipmentType = res.body.data.types.find(b => b.id === 'mining_equipment');
      expect(miningEquipmentType).toBeDefined();
      expect(miningEquipmentType.current).toBe(true);
      expect(miningEquipmentType.name).toBe('Heavy Mining Equipment');
    });

    it('POST /api/mining-equipment/switch-business-type - should switch user context cleanly', async () => {
      const res = await request(app)
        .post('/api/mining-equipment/switch-business-type')
        .set('Authorization', `Bearer ${miningEquipmentToken}`)
        .send({ business_type: 'machinery_parts' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.business_type).toBe('machinery_parts');

      const updatedUser = await User.findById(miningEquipmentUser._id);
      expect(updatedUser.role).toBe('machinery_parts');

      // Switch back
      const res2 = await request(app)
        .post('/api/mining-equipment/switch-business-type')
        .set('Authorization', `Bearer ${miningEquipmentToken}`)
        .send({ business_type: 'mining_equipment' });

      expect(res2.status).toBe(200);
      expect(res2.body.data.business_type).toBe('mining_equipment');
    });
  });

  // ==========================================
  // SECTION 2: PROFILE & OPERATIONAL SPECS
  // ==========================================
  describe('2. Business Profile & Operational Specifications', () => {
    it('GET /api/mining-equipment/profile - should return business profile details', async () => {
      const res = await request(app)
        .get('/api/mining-equipment/profile')
        .set('Authorization', `Bearer ${miningEquipmentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.company_name).toBe('Atlas Mining Equipment & Heavy Quarry Machineries');
      expect(res.body.data.operational_specifications.heavy_equipment_fleet_size).toBe('35+ Heavy Mining Units in Stock & Yard');
    });

    it('PUT /api/mining-equipment/profile - should update operational specifications and business metadata', async () => {
      const res = await request(app)
        .put('/api/mining-equipment/profile')
        .set('Authorization', `Bearer ${miningEquipmentToken}`)
        .send({
          company_name: 'Atlas Heavy Mining & Quarry Engineering Technologies Pvt Ltd',
          heavy_equipment_fleet_size: '50+ Heavy Mining Units & Crawler Fleet',
          maintenance_refurbishment_capability: 'Complete ISO9001 Certified Rebuild, Engine Dyno & Hydraulic Rig Testing',
          authorized_manufacturers_brands: ['Atlas-X Pro', 'Deccan Wire-Master', 'Komatsu', 'CAT Mining', 'Sandvik', 'Epiroc']
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.company_name).toBe('Atlas Heavy Mining & Quarry Engineering Technologies Pvt Ltd');
      expect(res.body.data.authorized_manufacturers_brands).toContain('Epiroc');
      expect(res.body.data.heavy_equipment_fleet_size).toContain('50+');
    });
  });

  // ==========================================
  // SECTION 3: PRODUCT & SPARES MANAGEMENT
  // ==========================================
  describe('3. Product & Spares Management (4-Step Wizard & CRUD)', () => {
    it('POST /api/mining-equipment/products - Step 1 to 4 Complete Product Creation Wizard (Example 2: Wire Saw)', async () => {
      const newProductPayload = {
        name: 'Diamond Wire Saw Quarry Cutting Machine (75 HP)',
        category: 'Diamond Wire Saw Machines',
        brand_name: 'Deccan Wire-Master',
        model_number: 'DWM-75-INV',
        warranty_guarantee: '12 Months Manufacturer Warranty',
        selling_price: 920000,
        pricing_unit: 'Per Machine',
        min_order_quantity: 1,
        available_stock: 4,
        equipment_condition: 'Brand New',
        delivery_available: true,
        installation_available: true,
        onsite_demonstration: true,
        after_sales_support: true,
        service_support: true,
        technical_specifications: {
          motor_power: '75 HP Inverter Driven',
          wire_speed: '0–40 m/s Vector Inverter Controlled',
          max_cutting_length: '50 Meters',
          wire_diameter: '8.5mm – 11mm',
          cutting_capacity: '8–14 m²/hour Granite Cutting',
          inverter_type: 'Yaskawa Heavy Duty Industrial Inverter',
          control_system: 'Dual PLC Wireless Remote Control',
          rail_length: '2x 3.0 Meter Precision Ground Steel Tracks',
          machine_weight: '2,650 kg',
          power_supply: '415V, 3 Phase, 50Hz',
          cooling_system: 'High Pressure Water Lubricated',
          application: 'Bench slicing and block squaring'
        },
        technical_drawings: [
          'https://stonemarket.com/uploads/blueprints/wire-saw-75hp.pdf'
        ],
        equipment_brochures: [
          'https://stonemarket.com/uploads/brochures/deccan-wire-master-75.pdf'
        ],
        images: [
          'https://stonemarket.com/uploads/products/wire-saw-1.jpg'
        ],
        cover_image: 'https://stonemarket.com/uploads/products/wire-saw-1.jpg',
        target_areas: [
          { state_name: 'Rajasthan', districts: ['Jaipur', 'Rajsamand', 'Jalore'] },
          { state_name: 'Gujarat', districts: ['Palanpur', 'Ahmedabad'] }
        ],
        target_categories: ['Mining', 'Quarry Equipment', 'Manufacturer']
      };

      const res = await request(app)
        .post('/api/mining-equipment/products')
        .set('Authorization', `Bearer ${miningEquipmentToken}`)
        .send(newProductPayload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Diamond Wire Saw Quarry Cutting Machine (75 HP)');
      expect(res.body.data.sku).toBeDefined();
      expect(res.body.data.sku).toMatch(/^(WSR|HME)-\d{4}-\d+/);
      expect(res.body.data.category).toBe('Diamond Wire Saw Machines');
      expect(res.body.data.brand_name).toBe('Deccan Wire-Master');
      expect(res.body.data.selling_price).toBe(920000);
      expect(res.body.data.pricing_unit).toBe('Per Machine');
      expect(res.body.data.equipment_condition).toBe('Brand New');
      expect(res.body.data.technical_specifications.motor_power).toBe('75 HP Inverter Driven');
    });

    it('POST /api/mining-equipment/products - should fail with 400 when required fields are missing', async () => {
      const res = await request(app)
        .post('/api/mining-equipment/products')
        .set('Authorization', `Bearer ${miningEquipmentToken}`)
        .send({
          name: 'Incomplete Machine'
          // missing category, brand_name, selling_price, pricing_unit
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBeDefined();
    });

    it('GET /api/mining-equipment/products - should list products with stock stats and search filters', async () => {
      const res = await request(app)
        .get('/api/mining-equipment/products?category=Hydraulic Crawler Drilling Rigs&status=active')
        .set('Authorization', `Bearer ${miningEquipmentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.products)).toBe(true);
      expect(res.body.data.counts).toBeDefined();
      expect(res.body.data.counts.all || res.body.data.counts.total).toBeGreaterThanOrEqual(1);
    });

    it('GET /api/mining-equipment/products/:id - should get single equipment details', async () => {
      const res = await request(app)
        .get(`/api/mining-equipment/products/${testEquipment._id}`)
        .set('Authorization', `Bearer ${miningEquipmentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id.toString()).toBe(testEquipment._id.toString());
      expect(res.body.data.brand_name).toBe('Atlas-X Pro 115');
      expect(res.body.data.equipment_brochures).toHaveLength(1);
    });

    it('PUT /api/mining-equipment/products/:id - should update product specifications and prices', async () => {
      const res = await request(app)
        .put(`/api/mining-equipment/products/${testEquipment._id}`)
        .set('Authorization', `Bearer ${miningEquipmentToken}`)
        .send({
          name: 'Upgraded Hydraulic Crawler DTH Rock Drilling Rig (Series II)',
          selling_price: 1950000,
          warranty_guarantee: '24 Months Complete Power Train Guarantee'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Upgraded Hydraulic Crawler DTH Rock Drilling Rig (Series II)');
      expect(res.body.data.selling_price).toBe(1950000);
      expect(res.body.data.warranty_guarantee).toBe('24 Months Complete Power Train Guarantee');
    });

    it('PATCH /api/mining-equipment/products/:id/stock - should adjust stock and log to StockHistory', async () => {
      const res = await request(app)
        .patch(`/api/mining-equipment/products/${testEquipment._id}/stock`)
        .set('Authorization', `Bearer ${miningEquipmentToken}`)
        .send({
          stock: 6,
          change_type: 'set',
          notes: 'Received shipment of 3 additional crawler units from manufacturing plant'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.updated_stock).toBe(6);

      const history = await StockHistory.findOne({
        productId: testEquipment._id,
        notes: 'Received shipment of 3 additional crawler units from manufacturing plant'
      });
      expect(history).toBeDefined();
      expect(history.updated_stock).toBe(6);
    });

    it('POST /api/mining-equipment/products/:id/duplicate - should clone equipment as draft with (Copy) suffix', async () => {
      const res = await request(app)
        .post(`/api/mining-equipment/products/${testEquipment._id}/duplicate`)
        .set('Authorization', `Bearer ${miningEquipmentToken}`);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toContain('(Copy)');
      expect(res.body.data.status).toBe('draft');
      expect(res.body.data.sku).not.toBe(testEquipment.sku);
    });

    it('PATCH /api/mining-equipment/products/:id/status - should toggle status between active and inactive', async () => {
      const res = await request(app)
        .patch(`/api/mining-equipment/products/${testEquipment._id}/status`)
        .set('Authorization', `Bearer ${miningEquipmentToken}`)
        .send({ status: 'inactive' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('inactive');
    });

    it('DELETE /api/mining-equipment/products/:id - should delete heavy mining equipment product', async () => {
      const itemToDelete = await Product.create({
        userId: miningEquipmentUser._id,
        vendorId: miningEquipmentProfile._id,
        businessProfileId: miningEquipmentProfile._id,
        business_type: 'mining_equipment',
        name: 'Temporary Quarry Sump Pump 15HP',
        category: 'Mining Pumps',
        brand_name: 'Kirloskar Mining Series',
        selling_price: 145000,
        pricing_unit: 'Per Unit'
      });

      const res = await request(app)
        .delete(`/api/mining-equipment/products/${itemToDelete._id}`)
        .set('Authorization', `Bearer ${miningEquipmentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const check = await Product.findById(itemToDelete._id);
      expect(check).toBeNull();
    });
  });

  // ==========================================
  // SECTION 4: CONTACTS MANAGEMENT
  // ==========================================
  describe('4. Contacts Management', () => {
    it('POST /api/mining-equipment/contacts - should add a new contact person', async () => {
      const res = await request(app)
        .post('/api/mining-equipment/contacts')
        .set('Authorization', `Bearer ${miningEquipmentToken}`)
        .send({
          name: 'Naveen Choudhary',
          designation: 'Quarry Field Rigging & Rig Services Lead',
          phone: '+91 94140 88990',
          email: 'fieldservice@atlasheavy.com',
          whatsapp: '+91 94140 88990',
          is_primary: false
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Naveen Choudhary');
    });

    it('GET /api/mining-equipment/contacts - should return all contacts', async () => {
      const res = await request(app)
        .get('/api/mining-equipment/contacts')
        .set('Authorization', `Bearer ${miningEquipmentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ==========================================
  // SECTION 5: GALLERY & VERIFICATION
  // ==========================================
  describe('5. Gallery & Verification Center', () => {
    it('POST /api/mining-equipment/gallery/photos - should add photo to heavy equipment gallery', async () => {
      const res = await request(app)
        .post('/api/mining-equipment/gallery/photos')
        .set('Authorization', `Bearer ${miningEquipmentToken}`)
        .send({
          url: 'https://stonemarket.com/uploads/gallery/heavy-excavator-quarry.jpg',
          title: 'Komatsu Quarry Excavator 45-Ton in Granite Pit',
          category: 'equipment',
          is_cover: false
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Komatsu Quarry Excavator 45-Ton in Granite Pit');
    });

    it('POST /api/mining-equipment/gallery/videos - should add video link to profile gallery', async () => {
      const res = await request(app)
        .post('/api/mining-equipment/gallery/videos')
        .set('Authorization', `Bearer ${miningEquipmentToken}`)
        .send({
          video_url: 'https://stonemarket.com/uploads/gallery/wire-saw-bench-demo.mp4',
          title: '75 HP Wire Saw Granite Bench Slicing',
          category: 'field_quarry_action'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('75 HP Wire Saw Granite Bench Slicing');
    });

    it('GET /api/mining-equipment/verification - should get verification center status & documents', async () => {
      const res = await request(app)
        .get('/api/mining-equipment/verification')
        .set('Authorization', `Bearer ${miningEquipmentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.overall_progress).toBe(100);
      expect(res.body.data.is_verified).toBe(true);
    });

    it('POST /api/mining-equipment/verification/gst - should verify GST number', async () => {
      const res = await request(app)
        .post('/api/mining-equipment/verification/gst')
        .set('Authorization', `Bearer ${miningEquipmentToken}`)
        .send({
          gstin: '08AAACH8912E1Z2'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.gstin).toBe('08AAACH8912E1Z2');
    });
  });

  // ==========================================
  // SECTION 6: ANALYTICS, INQUIRIES & LEADS
  // ==========================================
  describe('6. Analytics, Inquiries & Leads', () => {
    it('GET /api/mining-equipment/analytics - should return equipment views, inquiries and metrics', async () => {
      const res = await request(app)
        .get('/api/mining-equipment/analytics?timeframe=30d')
        .set('Authorization', `Bearer ${miningEquipmentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.metrics).toBeDefined();
      expect(res.body.data.metrics.total_profile_views).toBeDefined();
    });

    it('GET /api/mining-equipment/inquiries - should return incoming heavy equipment inquiries', async () => {
      // Seed an inquiry
      await Inquiry.create({
        inquiry_number: 'INQ-EQP-2026-0001',
        title: 'Requirement for 2 Nos 75 HP Wire Saw Machines',
        subject: 'Requirement for 2 Nos 75 HP Wire Saw Machines',
        category: 'Heavy Mining Equipment',
        buyer_id: customerUser._id,
        senderId: customerUser._id,
        buyer_name: 'Praveen Quarry Owner',
        buyer_phone: '9829012345',
        businessId: miningEquipmentProfile._id,
        quantity: 2,
        unit: 'Unit',
        status: 'pending'
      });

      const res = await request(app)
        .get('/api/mining-equipment/inquiries')
        .set('Authorization', `Bearer ${miningEquipmentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('GET /api/mining-equipment/leads - should return matching equipment leads', async () => {
      const res = await request(app)
        .get('/api/mining-equipment/leads')
        .set('Authorization', `Bearer ${miningEquipmentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  // ==========================================
  // SECTION 7: SHARED SETTINGS, PROMOTIONS & INVOICES
  // ==========================================
  describe('7. Shared Settings, Promotions & Invoices Routes', () => {
    it('GET /api/mining-equipment/settings - should fetch account settings for heavy mining equipment', async () => {
      const res = await request(app)
        .get('/api/mining-equipment/settings')
        .set('Authorization', `Bearer ${miningEquipmentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.business_profile_card).toBeDefined();
      expect(res.body.data.business_profile_card.company_name).toBe('Atlas Mining Equipment & Heavy Quarry Machineries');
    });

    it('GET /api/mining-equipment/promotions - should retrieve available promotion packages', async () => {
      const res = await request(app)
        .get('/api/mining-equipment/promotions')
        .set('Authorization', `Bearer ${miningEquipmentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('GET /api/mining-equipment/invoices - should retrieve promotion invoices', async () => {
      const res = await request(app)
        .get('/api/mining-equipment/invoices')
        .set('Authorization', `Bearer ${miningEquipmentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.invoices)).toBe(true);
    });
  });
});

