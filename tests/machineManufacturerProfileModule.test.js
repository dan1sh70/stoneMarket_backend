const request = require('supertest');
const app = require('../server');
const User = require('../src/models/User');
const BusinessProfile = require('../src/models/BusinessProfile');
const Product = require('../src/models/Product');
const Inquiry = require('../src/models/Inquiry');
const StockHistory = require('../src/models/StockHistory');
const jwt = require('jsonwebtoken');

describe('Stone Machine Manufacturer Module - Comprehensive Suite', () => {
  let machineUser, customerUser;
  let machineToken, customerToken;
  let machineProfile;
  let testMachineProduct;

  beforeEach(async () => {
    // 1. Stone Machine Manufacturer User & Profile
    machineUser = await User.create({
      name: 'Rajendra Prasad Sharma',
      mobile: '9829077665',
      email: 'rajendra.machines@rajendratools.com',
      password: 'password123',
      role: 'machine_manufacturer',
      status: 'active'
    });

    machineToken = jwt.sign(
      { id: machineUser._id, role: machineUser.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1h' }
    );

    machineProfile = await BusinessProfile.create({
      userId: machineUser._id,
      business_type: 'machine_manufacturer',
      company_name: 'Rajendra Machine Tools & Heavy Machinery',
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
          name: 'Rajendra Prasad Sharma',
          designation: 'Founder & Chief Mechanical Engineer',
          phone: '+91 98290 77665',
          email: 'machinery@stonemarket.com',
          whatsapp: '+91 98290 77665',
          is_primary: true
        }
      ],
      verification_steps: {
        phone: { phone: '+91 98290 77665', status: 'verified', verified_at: new Date() },
        email: { email: 'machinery@stonemarket.com', status: 'verified', verified_at: new Date() },
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

    // 2. Customer User for Inquiries
    customerUser = await User.create({
      name: 'Sunil Agarwal',
      mobile: '9829066554',
      email: 'sunil.agarwal@marblemill.com',
      password: 'password123',
      role: 'customer',
      status: 'active'
    });

    customerToken = jwt.sign(
      { id: customerUser._id, role: customerUser.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1h' }
    );

    // 3. Initial Test Machine: Example 1 - Automatic Multi-Cutter Granite Gangsaw (80 Blades)
    testMachineProduct = await Product.create({
      businessProfileId: machineProfile._id,
      vendorId: machineProfile._id,
      business_type: 'machine_manufacturer',
      sku: 'GSW-2026-8001',
      name: 'Automatic Multi-Cutter Granite Gangsaw (80 Blades)',
      category: 'Granite Gangsaw Machine (80 Blades)',
      brand_name: 'Rajendra Machine Tools',
      manufacturer: 'Rajendra Machine Tools',
      model_number: 'Rajendra Titan-80',
      connected_power_hp: 100,
      connected_power_kw: 75,
      production_capacity: '1,800 Sq.ft / Shift',
      working_dimensions: '3500 × 2000 × 2000 mm Block',
      working_size: '3500 × 2000 × 2000 mm Block',
      selling_price: 4800000,
      price: 4800000,
      pricing_unit: 'Per Complete Machine',
      lead_time: '3–4 Weeks Fabrication & Dispatch',
      manufacturing_status: 'Ready Stock',
      availability_status: 'Ready Stock',
      installation_type: 'On-Site Commissioning Available',
      transportation_terms: 'Transportation Extra',
      dispatch_location: 'Rajsamand, Rajasthan',
      warranty_guarantee: '1 Year Comprehensive + 2 Years Frame Warranty',
      min_order_quantity: 1,
      stock: 2,
      available_stock: 2,
      stock_unit: 'Units',
      target_categories: ['Manufacturer', 'Mining', 'Stone Processing Unit', 'Granite Factory'],
      target_areas: [
        { state_name: 'Rajasthan', districts: ['Rajsamand', 'Udaipur', 'Jaipur'] },
        { state_name: 'Gujarat', districts: ['Ahmedabad', 'Surat'] }
      ],
      images: ['https://stonemarket.com/defaults/gangsaw-machine.jpg'],
      cover_image: 'https://stonemarket.com/defaults/gangsaw-machine.jpg',
      status: 'active',
      publishing_status: 'published',
      views_count: 1240,
      inquiries_count: 32
    });
  });

  // ==========================================
  // 1. DASHBOARD & BUSINESS SWITCHER
  // ==========================================
  describe('1. Dashboard & Business Switcher', () => {
    it('GET /api/machine-manufacturer/dashboard - should return dashboard with profile card, operational summary, and Machinery Catalog menu', async () => {
      const res = await request(app)
        .get('/api/machine-manufacturer/dashboard')
        .set('Authorization', `Bearer ${machineToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.business_profile_card.business_name).toBe('Rajendra Machine Tools & Heavy Machinery');
      expect(res.body.data.business_profile_card.business_type).toBe('Stone Machine Manufacturer');
      expect(res.body.data.operational_summary_cards).toHaveLength(4);
      expect(res.body.data.metrics.total_machines).toBeGreaterThanOrEqual(1);

      // Verify replaced menu name: Machinery Catalog Management
      const catalogMenu = res.body.data.my_business_menu.find((m) => m.title === 'Machinery Catalog Management');
      expect(catalogMenu).toBeDefined();
      expect(catalogMenu.path).toBe('/machine-manufacturer/catalog');
    });

    it('GET /api/machine-manufacturer/business-types - should list business types with machine_manufacturer active', async () => {
      const res = await request(app)
        .get('/api/machine-manufacturer/business-types')
        .set('Authorization', `Bearer ${machineToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.current).toBe('machine_manufacturer');
      const types = res.body.data.business_types;
      const mmType = types.find((t) => t.id === 'machine_manufacturer');
      expect(mmType).toBeDefined();
      expect(mmType.is_active).toBe(true);
    });

    it('POST /api/machine-manufacturer/switch-business-type - should switch user business type to machine_manufacturer', async () => {
      const res = await request(app)
        .post('/api/machine-manufacturer/switch-business-type')
        .set('Authorization', `Bearer ${machineToken}`)
        .send({ target_type: 'machine_manufacturer' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.current_business_type).toBe('machine_manufacturer');
    });
  });

  // ==========================================
  // 2. PROFILE & OPERATIONAL CONFIGURATION
  // ==========================================
  describe('2. Business Profile Management', () => {
    it('GET /api/machine-manufacturer/profile - should return business profile details', async () => {
      const res = await request(app)
        .get('/api/machine-manufacturer/profile')
        .set('Authorization', `Bearer ${machineToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.company_name).toBe('Rajendra Machine Tools & Heavy Machinery');
      expect(res.body.data.manufacturing_plant_capacity).toBe('25+ Heavy Duty Gangsaws & CNC Cutters / Year');
    });

    it('PUT /api/machine-manufacturer/profile - should update profile specifications and capacity', async () => {
      const res = await request(app)
        .put('/api/machine-manufacturer/profile')
        .set('Authorization', `Bearer ${machineToken}`)
        .send({
          manufacturing_plant_capacity: '35+ Heavy Duty Gangsaws / Year',
          in_house_fabrication_setup: 'Heavy Casting, Stress Relieving Furnace, 5-Axis CNC Milling',
          machine_categories: [
            'Granite Gangsaw Machine (80 Blades)',
            '5-Axis CNC Bridge Cutting Machine',
            'Waterjet Cutting Machine'
          ]
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.manufacturing_plant_capacity).toBe('35+ Heavy Duty Gangsaws / Year');
      expect(res.body.data.machine_categories).toContain('Waterjet Cutting Machine');
    });
  });

  // ==========================================
  // 3. MACHINERY CATALOG MANAGEMENT (4-STEP WIZARD)
  // ==========================================
  describe('3. Machinery Catalog Management', () => {
    it('GET /api/machine-manufacturer/catalog - should return formatted machinery listing with power and capacity', async () => {
      const res = await request(app)
        .get('/api/machine-manufacturer/catalog')
        .set('Authorization', `Bearer ${machineToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.machines).toHaveLength(1);
      const item = res.body.data.machines[0];
      expect(item.machine_name).toBe('Automatic Multi-Cutter Granite Gangsaw (80 Blades)');
      expect(item.model_number).toBe('Rajendra Titan-80');
      expect(item.total_connected_power).toContain('100 HP / 75 kW');
      expect(item.production_capacity).toBe('1,800 Sq.ft / Shift');
      expect(item.working_dimensions).toBe('3500 × 2000 × 2000 mm Block');
      expect(item.machine_price).toBe(4800000);
    });

    it('GET /api/machine-manufacturer/machines - should support /machines alias for listing', async () => {
      const res = await request(app)
        .get('/api/machine-manufacturer/machines')
        .set('Authorization', `Bearer ${machineToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.machines).toBeDefined();
    });

    it('POST /api/machine-manufacturer/catalog - should create 5-Axis CNC Bridge Cutting Machine with Step 1-4 fields', async () => {
      const cncMachineData = {
        name: '5-Axis CNC Bridge Cutting Machine',
        category: 'CNC Bridge Cutting Machine',
        brand_name: 'RockMaster CNC-500',
        manufacturer: 'RockMaster CNC-500',
        model_number: 'RockMaster CNC-500',
        connected_power_hp: 25,
        connected_power_kw: 18.5,
        production_capacity: '550 Sq.ft / Shift',
        working_dimensions: '3200 × 2000 mm Bed Size',
        working_size: '3200 × 2000 mm Bed Size',
        selling_price: 1650000,
        pricing_unit: 'Per Unit',
        lead_time: '2–3 Weeks Fabrication & Dispatch',
        manufacturing_status: 'Ready Stock',
        availability_status: 'Ready Stock',
        installation_type: 'On-Site Commissioning Available',
        transportation_terms: 'Transportation Extra',
        dispatch_location: 'Rajsamand, Rajasthan',
        warranty_guarantee: '1 Year Comprehensive Warranty with Italian Spindle Support',
        min_order_quantity: 1,
        available_stock: 1,
        stock_unit: 'Units',
        target_categories: ['Manufacturer', 'Marble Factory', 'Granite Factory'],
        target_areas: [{ state_name: 'Rajasthan', districts: ['Kishangarh', 'Jaipur'] }],
        images: ['https://stonemarket.com/defaults/cnc-bridge-saw.jpg'],
        cover_image: 'https://stonemarket.com/defaults/cnc-bridge-saw.jpg',
        videos: ['https://youtube.com/watch?v=cnc-cutting-demo'],
        status: 'active'
      };

      const res = await request(app)
        .post('/api/machine-manufacturer/catalog')
        .set('Authorization', `Bearer ${machineToken}`)
        .send(cncMachineData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('5-Axis CNC Bridge Cutting Machine');
      expect(res.body.data.sku).toMatch(/^CNC-/);
      expect(res.body.data.connected_power_hp).toBe(25);
      expect(res.body.data.selling_price).toBe(1650000);
    });

    it('GET /api/machine-manufacturer/catalog/:id - should get single machine details', async () => {
      const res = await request(app)
        .get(`/api/machine-manufacturer/catalog/${testMachineProduct._id}`)
        .set('Authorization', `Bearer ${machineToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Automatic Multi-Cutter Granite Gangsaw (80 Blades)');
    });

    it('PUT /api/machine-manufacturer/catalog/:id - should update machine specifications and price', async () => {
      const res = await request(app)
        .put(`/api/machine-manufacturer/catalog/${testMachineProduct._id}`)
        .set('Authorization', `Bearer ${machineToken}`)
        .send({
          selling_price: 4950000,
          lead_time: '2 Weeks Quick Dispatch'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.selling_price).toBe(4950000);
      expect(res.body.data.lead_time).toBe('2 Weeks Quick Dispatch');
    });

    it('PATCH /api/machine-manufacturer/catalog/:id/stock - should adjust availability status and log StockHistory', async () => {
      const res = await request(app)
        .patch(`/api/machine-manufacturer/catalog/${testMachineProduct._id}/stock`)
        .set('Authorization', `Bearer ${machineToken}`)
        .send({
          stock: 3,
          availability_status: 'Under Manufacturing',
          manufacturing_status: 'Under Manufacturing',
          change_type: 'set',
          notes: 'New gangsaw batch framed in workshop'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.new_stock).toBe(3);
      expect(res.body.data.manufacturing_status).toBe('Under Manufacturing');

      const history = await StockHistory.findOne({ productId: testMachineProduct._id, change_type: 'set' });
      expect(history).toBeDefined();
      expect(history.new_stock).toBe(3);
    });

    it('POST /api/machine-manufacturer/catalog/:id/duplicate - should duplicate machine as draft with (Copy) suffix', async () => {
      const res = await request(app)
        .post(`/api/machine-manufacturer/catalog/${testMachineProduct._id}/duplicate`)
        .set('Authorization', `Bearer ${machineToken}`);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Automatic Multi-Cutter Granite Gangsaw (80 Blades) (Copy)');
      expect(res.body.data.status).toBe('draft');
      expect(res.body.data.publishing_status).toBe('draft');
    });

    it('PATCH /api/machine-manufacturer/catalog/:id/status - should toggle status between active and inactive', async () => {
      const res = await request(app)
        .patch(`/api/machine-manufacturer/catalog/${testMachineProduct._id}/status`)
        .set('Authorization', `Bearer ${machineToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('inactive');

      // Toggle back
      const res2 = await request(app)
        .patch(`/api/machine-manufacturer/catalog/${testMachineProduct._id}/status`)
        .set('Authorization', `Bearer ${machineToken}`);

      expect(res2.status).toBe(200);
      expect(res2.body.data.status).toBe('active');
    });

    it('DELETE /api/machine-manufacturer/catalog/:id - should delete machine and related stock history', async () => {
      const res = await request(app)
        .delete(`/api/machine-manufacturer/catalog/${testMachineProduct._id}`)
        .set('Authorization', `Bearer ${machineToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const deleted = await Product.findById(testMachineProduct._id);
      expect(deleted).toBeNull();
    });

    it('GET /api/machine-manufacturer/catalog?search=Titan - should filter machines by search keyword', async () => {
      const res = await request(app)
        .get('/api/machine-manufacturer/catalog?search=Titan')
        .set('Authorization', `Bearer ${machineToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.machines.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ==========================================
  // 4. CONTACTS / OWNERS MANAGEMENT
  // ==========================================
  describe('4. Contacts Management', () => {
    it('GET /api/machine-manufacturer/contacts - should list contacts', async () => {
      const res = await request(app)
        .get('/api/machine-manufacturer/contacts')
        .set('Authorization', `Bearer ${machineToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data[0].name).toBe('Rajendra Prasad Sharma');
    });

    it('POST /api/machine-manufacturer/contacts - should add a new machine sales & project engineer contact', async () => {
      const newContact = {
        name: 'Mahesh Kumawat',
        designation: 'Senior Project Engineer & Erection Lead',
        phone: '+91 98290 44332',
        whatsapp: '+91 98290 44332',
        email: 'mahesh.projects@rajendratools.com',
        is_primary: false
      };

      const res = await request(app)
        .post('/api/machine-manufacturer/contacts')
        .set('Authorization', `Bearer ${machineToken}`)
        .send(newContact);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.some((c) => c.name === 'Mahesh Kumawat')).toBe(true);
    });
  });

  // ==========================================
  // 5. GALLERY MANAGEMENT
  // ==========================================
  describe('5. Gallery Management', () => {
    it('GET /api/machine-manufacturer/gallery - should retrieve gallery photos and videos', async () => {
      const res = await request(app)
        .get('/api/machine-manufacturer/gallery')
        .set('Authorization', `Bearer ${machineToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.photos).toBeDefined();
      expect(res.body.data.videos).toBeDefined();
    });

    it('POST /api/machine-manufacturer/gallery/photos - should add photo to gallery', async () => {
      const res = await request(app)
        .post('/api/machine-manufacturer/gallery/photos')
        .set('Authorization', `Bearer ${machineToken}`)
        .send({
          url: 'https://stonemarket.com/gallery/gangsaw-assembly-bay.jpg',
          title: 'Heavy Gangsaw Machine Assembly Bay',
          category: 'facility',
          is_cover: true
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Heavy Gangsaw Machine Assembly Bay');
    });

    it('POST /api/machine-manufacturer/gallery/videos - should add video demo to gallery', async () => {
      const res = await request(app)
        .post('/api/machine-manufacturer/gallery/videos')
        .set('Authorization', `Bearer ${machineToken}`)
        .send({
          title: '80-Blade Granite Gangsaw Live Cutting 1800 Sqft/Shift',
          video_url: 'https://youtube.com/watch?v=titan-80-cutting-demo',
          source_type: 'youtube',
          category: 'demonstration',
          duration: '05:40'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('80-Blade Granite Gangsaw Live Cutting 1800 Sqft/Shift');
    });
  });

  // ==========================================
  // 6. VERIFICATION CENTER
  // ==========================================
  describe('6. Verification Center', () => {
    it('GET /api/machine-manufacturer/verification - should get verification status', async () => {
      const res = await request(app)
        .get('/api/machine-manufacturer/verification')
        .set('Authorization', `Bearer ${machineToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.is_verified).toBe(true);
      expect(res.body.data.gst_number).toBe('08AABCR7766D1Z4');
    });

    it('POST /api/machine-manufacturer/verification/gst - should verify GSTIN', async () => {
      const res = await request(app)
        .post('/api/machine-manufacturer/verification/gst')
        .set('Authorization', `Bearer ${machineToken}`)
        .send({ gstin: '08AABCR7766D1Z4' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('verified');
      expect(res.body.data.gstin).toBe('08AABCR7766D1Z4');
    });
  });

  // ==========================================
  // 7. ANALYTICS ENGINE
  // ==========================================
  describe('7. Analytics Engine', () => {
    it('GET /api/machine-manufacturer/analytics - should return summary, top machines, and monthly trends', async () => {
      const res = await request(app)
        .get('/api/machine-manufacturer/analytics')
        .set('Authorization', `Bearer ${machineToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.summary.total_profile_views).toBeDefined();
      expect(res.body.data.top_performing_machines.length).toBeGreaterThan(0);
    });

    it('POST /api/machine-manufacturer/analytics/event - should record machine view event', async () => {
      const res = await request(app)
        .post('/api/machine-manufacturer/analytics/event')
        .set('Authorization', `Bearer ${machineToken}`)
        .send({
          event_type: 'machine_view',
          machine_id: testMachineProduct._id.toString(),
          metadata: { source: 'mobile_catalog', filter: 'gangsaw' }
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.event_type).toBe('machine_view');
    });
  });

  // ==========================================
  // 8. INQUIRIES & LEAD MANAGEMENT
  // ==========================================
  describe('8. Inquiries & Lead Management', () => {
    beforeEach(async () => {
      await Inquiry.create({
        businessId: machineProfile._id,
        vendorId: machineProfile._id,
        senderId: customerUser._id,
        category: 'Stone Machine Manufacturer',
        subject: 'Quotation for 80 Blades Gangsaw Machine with Erection',
        message: 'Looking for a complete gangsaw turnkey setup for a new granite processing factory in Rajsamand.',
        status: 'pending',
        inquiry_type: 'quotation',
        preferred_contact_method: 'phone'
      });
    });

    it('GET /api/machine-manufacturer/inquiries - should return machinery inquiries', async () => {
      const res = await request(app)
        .get('/api/machine-manufacturer/inquiries')
        .set('Authorization', `Bearer ${machineToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data[0].subject).toContain('80 Blades Gangsaw');
    });

    it('GET /api/machine-manufacturer/leads - should return relevant machinery leads', async () => {
      const res = await request(app)
        .get('/api/machine-manufacturer/leads')
        .set('Authorization', `Bearer ${machineToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ==========================================
  // 9. SHARED MODULES INTEGRATION
  // ==========================================
  describe('9. Shared Modules Integration (Settings, Promotions, Invoices)', () => {
    it('GET /api/machine-manufacturer/settings - should access account settings for machine_manufacturer', async () => {
      const res = await request(app)
        .get('/api/machine-manufacturer/settings')
        .set('Authorization', `Bearer ${machineToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.business_profile_card).toBeDefined();
      expect(res.body.data.business_profile_card.company_name).toBe('Rajendra Machine Tools & Heavy Machinery');
    });

    it('GET /api/machine-manufacturer/promotions - should access promotions for machine_manufacturer', async () => {
      const res = await request(app)
        .get('/api/machine-manufacturer/promotions')
        .set('Authorization', `Bearer ${machineToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('GET /api/machine-manufacturer/invoices - should access promotion invoices for machine_manufacturer', async () => {
      const res = await request(app)
        .get('/api/machine-manufacturer/invoices')
        .set('Authorization', `Bearer ${machineToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});

