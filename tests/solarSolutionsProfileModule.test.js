const request = require('supertest');
const app = require('../server');
const User = require('../src/models/User');
const BusinessProfile = require('../src/models/BusinessProfile');
const Product = require('../src/models/Product');
const Inquiry = require('../src/models/Inquiry');
const StockHistory = require('../src/models/StockHistory');
const jwt = require('jsonwebtoken');

describe('Stone Industrial Solar Solutions Module - Comprehensive Suite', () => {
  let solarUser, customerUser;
  let solarToken, customerToken;
  let solarProfile;
  let testSolarSystem;

  beforeEach(async () => {
    // 1. Industrial Solar Solutions User & Profile
    solarUser = await User.create({
      name: 'Aditya Pratap Singh',
      mobile: '9829099887',
      email: 'aditya.solar@sunstone.com',
      password: 'password123',
      role: 'solar_solutions',
      status: 'active'
    });

    solarToken = jwt.sign(
      { id: solarUser._id, role: solarUser.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1h' }
    );

    solarProfile = await BusinessProfile.create({
      userId: solarUser._id,
      business_type: 'solar_solutions',
      company_name: 'SunStone Industrial Solar EPC',
      business_category: 'Industrial Solar Solutions',
      business_subcategory: 'Industrial Rooftop Solar, Captive Plants for Stone Factories & High-Capacity EPC',
      short_description: 'Premier turnkey industrial solar EPC specializing in 100kW – 5MW rooftop solar and captive power plants for heavy granite and marble processing factories.',
      about_business: 'SunStone Industrial Solar EPC delivers end-to-end industrial solar power plants, Tier-1 Mono PERC bi-facial modules, high-efficiency string inverters, and DISCOM net-metering synchronization specifically engineered for stone manufacturing continuous electrical loads.',
      established_year: 2016,
      solar_solution_categories: [
        'Industrial Rooftop Solar Systems',
        'Captive Solar Power Plants',
        'Ground-Mounted Solar Systems',
        'Solar Power Plants for Stone Factories',
        'Mono PERC Solar Panels',
        'TOPCon Solar Panels',
        'Solar Inverters',
        'Solar EPC Projects'
      ],
      authorized_solar_brands: [
        'SunStone Tier-1',
        'SunStone MegaPower',
        'Sungrow',
        'Huawei Solar',
        'Waaree',
        'Adani Solar',
        'Growatt'
      ],
      solar_epc_experience: '50+ MW Cumulative Industrial & Captive Installations',
      grid_approval_support: 'End-to-End DISCOM Net-Metering & CEIG Clearances',
      operation_and_maintenance_scope: '25 Years Performance Ratio (PR) & SCADA Telemetry Support',
      address: {
        state: 'Rajasthan',
        district: 'Jaipur',
        area: 'VKI Area',
        industrial_area: 'VKI Industrial Area',
        commercial_area: 'Green Energy Complex',
        office_address: 'Plot 240, Road No. 12, VKI Industrial Area, Jaipur',
        full_address: 'Plot 240, Road No. 12, VKI Industrial Area, Jaipur, Rajasthan 302013',
        postal_code: '302013',
        country: 'India'
      },
      owners: [
        {
          name: 'Aditya Pratap Singh',
          designation: 'Managing Director & Principal Solar EPC Consultant',
          phone: '+91 98290 99887',
          email: 'solar@stonemarket.com',
          whatsapp: '+91 98290 99887',
          is_primary: true
        }
      ],
      gallery_photos: [
        {
          url: 'https://stonemarket.com/uploads/solar-granite-factory-roof.jpg',
          title: '500 kW Captive Rooftop Solar Plant on Kishangarh Granite Shed',
          category: 'rooftop',
          is_cover: true
        }
      ],
      gallery_videos: [
        {
          url: 'https://stonemarket.com/uploads/solar-epc-drone.mp4',
          title: 'Turnkey 1 MW Industrial Solar Plant Drone Inspection',
          video_url: 'https://stonemarket.com/uploads/solar-epc-drone.mp4',
          source_type: 'upload',
          category: 'drone_footage'
        }
      ],
      verification_steps: {
        phone: { phone: '+91 98290 99887', status: 'verified', verified_at: new Date() },
        email: { email: 'solar@stonemarket.com', status: 'verified', verified_at: new Date() },
        business: { registration_type: 'MSME / Udyam', registration_number: 'UDYAM-RJ-14-0099887', status: 'verified' },
        gst: { gstin: '08AAACS9988F1Z9', status: 'verified' }
      },
      is_verified: true,
      verification_status: 'approved',
      gst_number: '08AAACS9988F1Z9',
      rating: 4.9,
      review_count: 62,
      status: 'active',
      is_mock: false
    });

    // 2. Customer User for Public Catalogue & Inquiries
    customerUser = await User.create({
      name: 'Ramesh Marble Processing',
      mobile: '9829054321',
      email: 'ramesh.factory@kishangarhmarbles.com',
      password: 'password123',
      role: 'buyer',
      status: 'active'
    });

    customerToken = jwt.sign(
      { id: customerUser._id, role: customerUser.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1h' }
    );

    // 3. Initial Base Solar System Product (Example 1: 100 kW Rooftop)
    testSolarSystem = await Product.create({
      userId: solarUser._id,
      vendorId: solarProfile._id,
      businessProfileId: solarProfile._id,
      business_type: 'solar_solutions',
      name: '100 kW Industrial Rooftop Solar Power Plant',
      sku: 'RFT-2026-0100',
      category: 'Industrial Rooftop Solar Systems',
      brand_name: 'SunStone Tier-1',
      model_number: 'SS-IND-100K',
      warranty_guarantee: '25 Years Panel Performance Warranty',
      panel_warranty: '25 Years Linear Performance Warranty',
      inverter_warranty: '10 Years Standard Inverter Warranty',
      workmanship_warranty: '5 Years Turnkey Installation Warranty',
      selling_price: 3800000,
      price: 3800000,
      pricing_unit: 'Turnkey',
      min_order_quantity: 1,
      available_stock: 5,
      stock: 5,
      stock_unit: 'Systems',
      availability_status: 'In Stock',
      delivery_available: true,
      installation_available: true,
      epc_services_available: true,
      site_survey_available: true,
      engineering_design_available: true,
      grid_connection_support: true,
      om_support_available: true,
      after_sales_support: true,
      service_support: true,
      technical_specifications: {
        installed_capacity: '100 kW Grid-Tied System',
        panel_technology: '550W Mono PERC Bi-Facial Panels, IP66',
        number_of_panels: 182,
        individual_panel_wattage: '550W',
        total_dc_capacity: '100.1 kWp',
        ac_capacity: '100 kW',
        inverter_capacity: '100 kW Sungrow Multi-MPPT Industrial Inverter',
        grid_connection_type: '415V Three-Phase LT Synchronization with Discom Net-Metering',
        mounting_structure: 'Hot Dip Galvanized Heavy Aluminum Structure 80 Micron',
        roof_type: 'Industrial Metal Shed & Concrete Rooftop',
        roof_area_required: '8,500 Sq.ft',
        estimated_daily_generation: '450–500 Units (kWh) / Day',
        estimated_annual_generation: '1,65,000 Units (kWh) / Year',
        monitoring_system: 'SCADA Remote Cloud IoT Monitoring with Mobile App',
        application: 'Factory power cost reduction & captive stone processing load offset'
      },
      technical_drawings: [
        'https://stonemarket.com/uploads/blueprints/100kw-rooftop-sld.pdf'
      ],
      system_layout_drawings: [
        'https://stonemarket.com/uploads/drawings/100kw-shed-layout.pdf'
      ],
      product_datasheets: [
        'https://stonemarket.com/uploads/datasheets/sunstone-550w-bifacial.pdf'
      ],
      images: [
        'https://stonemarket.com/uploads/products/solar-100kw-roof.jpg'
      ],
      cover_image: 'https://stonemarket.com/uploads/products/solar-100kw-roof.jpg',
      status: 'active',
      publishing_status: 'published'
    });
  });

  // ==========================================
  // SECTION 1: DASHBOARD & BUSINESS SWITCHER
  // ==========================================
  describe('1. Dashboard & Business Switcher', () => {
    it('GET /api/solar/dashboard - should load complete solar dashboard and operational summary cards', async () => {
      const res = await request(app)
        .get('/api/solar/dashboard')
        .set('Authorization', `Bearer ${solarToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();

      const { business_profile_card, operational_summary, stats, my_business } = res.body.data;
      expect(business_profile_card.business_name).toBe('SunStone Industrial Solar EPC');
      expect(business_profile_card.business_type).toBe('Industrial Solar Solutions');
      expect(business_profile_card.rating).toBe(4.9);
      expect(business_profile_card.reviews).toBe(62);

      // 4 Operational Summary Cards
      expect(operational_summary.card_1.value).toContain('Categories');
      expect(operational_summary.card_2.value).toContain('Brands Available');
      expect(operational_summary.card_3.value).toContain('50+ MW Cumulative');
      expect(operational_summary.card_4.value).toContain('DISCOM Net-Metering');

      // Stats & Menu
      expect(stats.total_products).toBeGreaterThanOrEqual(1);
      expect(my_business).toHaveLength(6);
      expect(my_business[1].name).toBe('Product & Spares Management');
    });

    it('GET /api/solar/business-types - should return available business types with Industrial Solar current', async () => {
      const res = await request(app)
        .get('/api/solar/business-types')
        .set('Authorization', `Bearer ${solarToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.current_type).toBe('solar_solutions');
      const solarType = res.body.data.types.find(b => b.id === 'solar_solutions');
      expect(solarType).toBeDefined();
      expect(solarType.current).toBe(true);
      expect(solarType.name).toBe('Industrial Solar Solutions');
    });

    it('POST /api/solar/switch-business-type - should switch user context cleanly', async () => {
      const res = await request(app)
        .post('/api/solar/switch-business-type')
        .set('Authorization', `Bearer ${solarToken}`)
        .send({ business_type: 'mining_equipment' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.business_type).toBe('mining_equipment');

      const updatedUser = await User.findById(solarUser._id);
      expect(updatedUser.role).toBe('mining_equipment');

      // Switch back
      const res2 = await request(app)
        .post('/api/solar/switch-business-type')
        .set('Authorization', `Bearer ${solarToken}`)
        .send({ business_type: 'solar_solutions' });

      expect(res2.status).toBe(200);
      expect(res2.body.data.business_type).toBe('solar_solutions');
    });
  });

  // ==========================================
  // SECTION 2: PROFILE & OPERATIONAL SPECS
  // ==========================================
  describe('2. Business Profile & Operational Specifications', () => {
    it('GET /api/solar/profile - should return business profile details', async () => {
      const res = await request(app)
        .get('/api/solar/profile')
        .set('Authorization', `Bearer ${solarToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.company_name).toBe('SunStone Industrial Solar EPC');
      expect(res.body.data.operational_specifications.solar_epc_experience).toBe('50+ MW Cumulative Industrial & Captive Installations');
    });

    it('PUT /api/solar/profile - should update operational specifications and business metadata', async () => {
      const res = await request(app)
        .put('/api/solar/profile')
        .set('Authorization', `Bearer ${solarToken}`)
        .send({
          company_name: 'SunStone MegaPower Solar Technologies Pvt Ltd',
          solar_epc_experience: '100+ MW Cumulative Turnkey Solar Projects Commissioned',
          grid_approval_support: 'Comprehensive Turnkey Discom, CEIG & State Solar Policy Approvals',
          authorized_solar_brands: ['SunStone Tier-1', 'SunStone MegaPower', 'Sungrow', 'Huawei', 'Adani Solar', 'Waaree', 'Vikram Solar']
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.company_name).toBe('SunStone MegaPower Solar Technologies Pvt Ltd');
      expect(res.body.data.authorized_solar_brands).toContain('Vikram Solar');
      expect(res.body.data.solar_epc_experience).toContain('100+ MW');
    });
  });

  // ==========================================
  // SECTION 3: PRODUCT & SPARES MANAGEMENT
  // ==========================================
  describe('3. Product & Spares Management (4-Step Wizard & CRUD)', () => {
    it('POST /api/solar/products - Step 1 to 4 Complete Product Creation Wizard (Example 2: 500 kW Captive Plant)', async () => {
      const newProductPayload = {
        name: '500 kW Captive Solar Plant for Gangsaw Factories',
        category: 'Captive Solar Power Plants',
        brand_name: 'SunStone MegaPower',
        model_number: 'SS-CPT-500K',
        warranty_guarantee: '25 Years Module Performance Warranty',
        panel_warranty: '25 Years Linear Degradation Guarantee',
        inverter_warranty: '10 Years Sungrow OEM Warranty',
        workmanship_warranty: '5 Years Comprehensive Turnkey EPC Warranty',
        selling_price: 18500000,
        pricing_unit: 'Turnkey',
        min_order_quantity: 1,
        available_stock: 2,
        delivery_available: true,
        installation_available: true,
        epc_services_available: true,
        site_survey_available: true,
        engineering_design_available: true,
        grid_connection_support: true,
        om_support_available: true,
        technical_specifications: {
          installed_capacity: '500 kW System',
          total_dc_capacity: '550 kWp Tier-1 TOPCon Bi-Facial Modules',
          inverter_type: 'Sungrow Multi-MPPT 125kW x 4 Units with Smart Combiner',
          energy_generation_capacity: '2,200–2,400 Units / Day (8.5 Lakh Units Annual)',
          grid_synchronization: '11kV HT Yard Interconnection with Net-Metering',
          load_compatibility: 'Continuous 24x7 heavy granite gangsaw motor loads',
          monitoring_system: 'Cloud-Based SCADA with Weather Station & Pyranometer',
          application: 'Heavy granite factory continuous load & maximum peak tariff shaving'
        },
        system_layout_drawings: [
          'https://stonemarket.com/uploads/drawings/500kw-captive-layout.pdf'
        ],
        single_line_diagrams: [
          'https://stonemarket.com/uploads/drawings/500kw-ht-sld.pdf'
        ],
        images: [
          'https://stonemarket.com/uploads/products/solar-500kw-plant.jpg'
        ],
        cover_image: 'https://stonemarket.com/uploads/products/solar-500kw-plant.jpg',
        target_areas: [
          { state_name: 'Rajasthan', districts: ['Jaipur', 'Ajmer', 'Kishangarh', 'Rajsamand'] },
          { state_name: 'Gujarat', districts: ['Morbi', 'Mehsana'] }
        ],
        target_categories: ['Manufacturer', 'Mining', 'Industrial Factory', 'Solar EPC']
      };

      const res = await request(app)
        .post('/api/solar/products')
        .set('Authorization', `Bearer ${solarToken}`)
        .send(newProductPayload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('500 kW Captive Solar Plant for Gangsaw Factories');
      expect(res.body.data.sku).toBeDefined();
      expect(res.body.data.sku).toMatch(/^(CPT|SLR)-\d{4}-\d+/);
      expect(res.body.data.category).toBe('Captive Solar Power Plants');
      expect(res.body.data.brand_name).toBe('SunStone MegaPower');
      expect(res.body.data.selling_price).toBe(18500000);
      expect(res.body.data.pricing_unit).toBe('Turnkey');
      expect(res.body.data.technical_specifications.installed_capacity).toBe('500 kW System');
    });

    it('POST /api/solar/products - should fail with 400 when required fields are missing', async () => {
      const res = await request(app)
        .post('/api/solar/products')
        .set('Authorization', `Bearer ${solarToken}`)
        .send({
          name: 'Incomplete Solar System'
          // missing category, brand_name, selling_price
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBeDefined();
    });

    it('GET /api/solar/products - should list products with stock stats and search filters', async () => {
      const res = await request(app)
        .get('/api/solar/products?category=Industrial Rooftop Solar Systems&status=active')
        .set('Authorization', `Bearer ${solarToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.products)).toBe(true);
      expect(res.body.data.counts).toBeDefined();
      expect(res.body.data.counts.all || res.body.data.counts.total).toBeGreaterThanOrEqual(1);
    });

    it('GET /api/solar/products/:id - should get single solar product details', async () => {
      const res = await request(app)
        .get(`/api/solar/products/${testSolarSystem._id}`)
        .set('Authorization', `Bearer ${solarToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id.toString()).toBe(testSolarSystem._id.toString());
      expect(res.body.data.brand_name).toBe('SunStone Tier-1');
      expect(res.body.data.technical_drawings).toHaveLength(1);
    });

    it('PUT /api/solar/products/:id - should update product specifications and prices', async () => {
      const res = await request(app)
        .put(`/api/solar/products/${testSolarSystem._id}`)
        .set('Authorization', `Bearer ${solarToken}`)
        .send({
          name: '100 kW Industrial Rooftop Solar Power Plant (High-Yield Bi-Facial Edition)',
          selling_price: 3950000,
          inverter_warranty: '12 Years Extended Sungrow Warranty'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('100 kW Industrial Rooftop Solar Power Plant (High-Yield Bi-Facial Edition)');
      expect(res.body.data.selling_price).toBe(3950000);
      expect(res.body.data.inverter_warranty).toBe('12 Years Extended Sungrow Warranty');
    });

    it('PATCH /api/solar/products/:id/stock - should adjust stock and log to StockHistory', async () => {
      const res = await request(app)
        .patch(`/api/solar/products/${testSolarSystem._id}/stock`)
        .set('Authorization', `Bearer ${solarToken}`)
        .send({
          stock: 8,
          change_type: 'set',
          notes: 'Added allocation for 3 turnkey projects in Kishangarh zone'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.updated_stock).toBe(8);

      const history = await StockHistory.findOne({
        productId: testSolarSystem._id,
        notes: 'Added allocation for 3 turnkey projects in Kishangarh zone'
      });
      expect(history).toBeDefined();
      expect(history.updated_stock).toBe(8);
    });

    it('POST /api/solar/products/:id/duplicate - should clone solar system as draft with (Copy) suffix', async () => {
      const res = await request(app)
        .post(`/api/solar/products/${testSolarSystem._id}/duplicate`)
        .set('Authorization', `Bearer ${solarToken}`);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toContain('(Copy)');
      expect(res.body.data.status).toBe('draft');
      expect(res.body.data.sku).not.toBe(testSolarSystem.sku);
    });

    it('PATCH /api/solar/products/:id/status - should toggle status between active and inactive', async () => {
      const res = await request(app)
        .patch(`/api/solar/products/${testSolarSystem._id}/status`)
        .set('Authorization', `Bearer ${solarToken}`)
        .send({ status: 'inactive' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('inactive');
    });

    it('DELETE /api/solar/products/:id - should delete solar solution product', async () => {
      const itemToDelete = await Product.create({
        userId: solarUser._id,
        vendorId: solarProfile._id,
        businessProfileId: solarProfile._id,
        business_type: 'solar_solutions',
        name: 'Temporary 5 kW Solar Water Pump',
        category: 'Solar Water Pumps',
        brand_name: 'Shakti Solar Pumps',
        selling_price: 245000,
        pricing_unit: 'Per Set'
      });

      const res = await request(app)
        .delete(`/api/solar/products/${itemToDelete._id}`)
        .set('Authorization', `Bearer ${solarToken}`);

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
    it('POST /api/solar/contacts - should add a new contact person', async () => {
      const res = await request(app)
        .post('/api/solar/contacts')
        .set('Authorization', `Bearer ${solarToken}`)
        .send({
          name: 'Er. Rajesh Mathur',
          designation: 'Chief Solar Electrical Engineer & Grid Net-Metering Head',
          phone: '+91 94140 77889',
          email: 'engineering@sunstone.com',
          whatsapp: '+91 94140 77889',
          is_primary: false
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Er. Rajesh Mathur');
    });

    it('GET /api/solar/contacts - should return all contacts', async () => {
      const res = await request(app)
        .get('/api/solar/contacts')
        .set('Authorization', `Bearer ${solarToken}`);

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
    it('POST /api/solar/gallery/photos - should add photo to solar projects gallery', async () => {
      const res = await request(app)
        .post('/api/solar/gallery/photos')
        .set('Authorization', `Bearer ${solarToken}`)
        .send({
          url: 'https://stonemarket.com/uploads/gallery/1mw-ground-mounted-solar.jpg',
          title: '1 MW Ground-Mounted Solar Plant for Gangsaw Cluster',
          category: 'ground_mounted',
          is_cover: false
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('1 MW Ground-Mounted Solar Plant for Gangsaw Cluster');
    });

    it('POST /api/solar/gallery/videos - should add video link to profile gallery', async () => {
      const res = await request(app)
        .post('/api/solar/gallery/videos')
        .set('Authorization', `Bearer ${solarToken}`)
        .send({
          video_url: 'https://stonemarket.com/uploads/gallery/solar-factory-timelapse.mp4',
          title: 'Factory Rooftop Solar Installation Time-Lapse',
          category: 'installation_demo'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Factory Rooftop Solar Installation Time-Lapse');
    });

    it('GET /api/solar/verification - should get verification center status & documents', async () => {
      const res = await request(app)
        .get('/api/solar/verification')
        .set('Authorization', `Bearer ${solarToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.overall_progress).toBe(100);
      expect(res.body.data.is_verified).toBe(true);
    });

    it('POST /api/solar/verification/gst - should verify GST number', async () => {
      const res = await request(app)
        .post('/api/solar/verification/gst')
        .set('Authorization', `Bearer ${solarToken}`)
        .send({
          gstin: '08AAACS9988F1Z9'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.gstin).toBe('08AAACS9988F1Z9');
    });
  });

  // ==========================================
  // SECTION 6: ANALYTICS, INQUIRIES & LEADS
  // ==========================================
  describe('6. Analytics, Inquiries & Leads', () => {
    it('GET /api/solar/analytics - should return solar system views, inquiries and metrics', async () => {
      const res = await request(app)
        .get('/api/solar/analytics?timeframe=30d')
        .set('Authorization', `Bearer ${solarToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.metrics).toBeDefined();
      expect(res.body.data.metrics.total_profile_views).toBeDefined();
    });

    it('GET /api/solar/inquiries - should return incoming solar plant inquiries', async () => {
      // Seed an inquiry
      await Inquiry.create({
        inquiry_number: 'INQ-SLR-2026-0001',
        title: 'Requirement for 300 kW Rooftop Solar for Granite Unit',
        subject: 'Requirement for 300 kW Rooftop Solar for Granite Unit',
        category: 'Industrial Solar Solutions',
        buyer_id: customerUser._id,
        senderId: customerUser._id,
        buyer_name: 'Ramesh Marble Processing',
        buyer_phone: '9829054321',
        businessId: solarProfile._id,
        quantity: 1,
        unit: 'Turnkey',
        status: 'pending'
      });

      const res = await request(app)
        .get('/api/solar/inquiries')
        .set('Authorization', `Bearer ${solarToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('GET /api/solar/leads - should return matching solar leads', async () => {
      const res = await request(app)
        .get('/api/solar/leads')
        .set('Authorization', `Bearer ${solarToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  // ==========================================
  // SECTION 7: SHARED SETTINGS, PROMOTIONS & INVOICES
  // ==========================================
  describe('7. Shared Settings, Promotions & Invoices Routes', () => {
    it('GET /api/solar/settings - should fetch account settings for industrial solar profile', async () => {
      const res = await request(app)
        .get('/api/solar/settings')
        .set('Authorization', `Bearer ${solarToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.business_profile_card).toBeDefined();
      expect(res.body.data.business_profile_card.company_name).toBe('SunStone Industrial Solar EPC');
    });

    it('GET /api/solar/promotions - should retrieve available promotion packages', async () => {
      const res = await request(app)
        .get('/api/solar/promotions')
        .set('Authorization', `Bearer ${solarToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('GET /api/solar/invoices - should retrieve promotion invoices', async () => {
      const res = await request(app)
        .get('/api/solar/invoices')
        .set('Authorization', `Bearer ${solarToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.invoices)).toBe(true);
    });
  });
});

