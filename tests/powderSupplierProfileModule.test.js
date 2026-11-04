const request = require('supertest');
const app = require('../server');
const User = require('../src/models/User');
const BusinessProfile = require('../src/models/BusinessProfile');
const Product = require('../src/models/Product');
const Inquiry = require('../src/models/Inquiry');
const StockHistory = require('../src/models/StockHistory');
const jwt = require('jsonwebtoken');

describe('Mineral & Powder Supplier Module - Comprehensive Suite', () => {
  let powderUser, customerUser;
  let powderToken, customerToken;
  let powderProfile;
  let testPowderProduct;

  beforeEach(async () => {
    // 1. Mineral & Powder Supplier User & Profile
    powderUser = await User.create({
      name: 'Ghanshyam Patel',
      mobile: '9829033445',
      email: 'ghanshyam.patel@shreekrishnaminerals.com',
      password: 'password123',
      role: 'powder_supplier',
      status: 'active'
    });

    powderToken = jwt.sign(
      { id: powderUser._id, role: powderUser.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1h' }
    );

    powderProfile = await BusinessProfile.create({
      userId: powderUser._id,
      business_type: 'powder_supplier',
      company_name: 'Shree Krishna Micron Minerals & Chemicals',
      business_category: 'Mineral & Powder Supplier',
      business_subcategory: 'Super White Micronized Calcite, Surface Coated CaCO3, Dolomite & Quartz Powders',
      short_description: 'Premier manufacturer and exporter of micronized minerals, surface-treated calcite, dolomite, silica quartz powders, and micro-talc for engineered stone, plastic compounding, and paints.',
      about_business: 'Shree Krishna Micron Minerals & Chemicals operates advanced Raymond ball mills, high-efficiency air classifiers, and pin-mill micronizers in Makrana and Udaipur. Supplying ultra-pure non-metallic industrial minerals with up to 99% whiteness and mesh sizes ranging from 200 Mesh to 2 Microns (D97).',
      established_year: 2012,
      mineral_categories: [
        'Calcium Carbonate & Calcite',
        'Dolomite & Magnesium Minerals',
        'Silica & Quartz',
        'Feldspar & Industrial Minerals',
        'Industrial Stone Powders',
        'Abrasive Minerals'
      ],
      monthly_grinding_capacity: '10,000+ MT / Month',
      micronizing_facility: 'Ball Mills & Air Classifiers, 300 to 1250 Mesh Precision Grinding',
      annual_mineral_supply_volume: '1,00,000+ MT Supplied, Bulk Tankers & Jumbo Bags Fleet',
      address: {
        state: 'Rajasthan',
        district: 'Makrana',
        area: 'Industrial Area Phase-I',
        industrial_area: 'RIICO Industrial Area Makrana',
        commercial_area: 'Mineral Processing Zone',
        office_address: 'Plot 12-15, Mineral Industrial Zone, Makrana',
        full_address: 'Plot 12-15, Mineral Industrial Zone, Makrana, Rajasthan 341505',
        postal_code: '341505',
        country: 'India'
      },
      owners: [
        {
          name: 'Ghanshyam Patel',
          designation: 'Managing Director & Plant In-charge',
          phone: '+91 98290 33445',
          email: 'ghanshyam.patel@shreekrishnaminerals.com',
          whatsapp: '+91 98290 33445',
          is_primary: true
        }
      ],
      verification_steps: {
        phone: { phone: '+91 98290 33445', status: 'verified', verified_at: new Date() },
        email: { email: 'ghanshyam.patel@shreekrishnaminerals.com', status: 'verified', verified_at: new Date() },
        business: { registration_type: 'MSME / Udyam', registration_number: 'UDYAM-RJ-28-0033445', status: 'verified' },
        gst: { gstin: '08AABCS3344D1Z5', status: 'verified' }
      },
      is_verified: true,
      verification_status: 'approved',
      gst_number: '08AABCS3344D1Z5',
      rating: 4.9,
      review_count: 58,
      status: 'active',
      is_mock: false
    });

    // 2. Customer User for Inquiries & Leads
    customerUser = await User.create({
      name: 'Rameshwar Lal',
      mobile: '9829099887',
      email: 'rameshwar.lal@stonecountertops.in',
      password: 'password123',
      role: 'customer',
      status: 'active'
    });

    customerToken = jwt.sign(
      { id: customerUser._id, role: customerUser.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1h' }
    );

    // 3. Existing Mineral / Powder Product
    testPowderProduct = await Product.create({
      businessProfileId: powderProfile._id,
      vendorId: powderProfile._id,
      business_type: 'powder_supplier',
      name: '500 Mesh Natural Ground Calcium Carbonate (Calcite)',
      product_name: '500 Mesh Natural Ground Calcium Carbonate (Calcite)',
      sku: 'CAL-2026-0001',
      category: 'Calcium Carbonate & Calcite',
      mineral_type: 'Natural Calcite (Ground CaCO3)',
      chemical_name: 'Calcium Carbonate',
      chemical_formula: 'CaCO3',
      mesh_size: '500 Mesh',
      micron_rating: '25 Microns (D97)',
      whiteness_percentage: 97.5,
      brightness_percentage: 96.0,
      calcium_carbonate_purity: 98.5,
      chemical_purity: '98.5% CaCO3',
      moisture_percentage: 0.15,
      coating_type: 'Uncoated',
      packaging_type: '50 KG HDPE Bag with Liner',
      monthly_supply_capacity: '5,000 MT / Month',
      application_type: 'Engineered Quartz Countertops, Artificial Marble, Tiles',
      short_description: 'High-purity natural ground calcium carbonate powder ground from premium white crystalline calcite boulders.',
      description: 'Manufactured with high-speed air classifiers, offering uniform particle size distribution, exceptional dispersion in polymer resin matrices, and zero chemical discoloration.',
      price: 3800,
      selling_price: 3800,
      pricing_unit: 'Per Metric Ton (MT)',
      min_order_quantity: 10,
      stock: 450,
      available_stock: 450,
      stock_unit: 'MT',
      availability_status: 'Ready Stock',
      status: 'active',
      publishing_status: 'published',
      views_count: 310,
      inquiries_count: 24,
      target_categories: [
        'Engineered Stone Manufacturer',
        'Tile Manufacturer',
        'Paint & Coating',
        'Showroom'
      ],
      target_areas: [
        { state_name: 'Rajasthan', districts: ['Makrana', 'Udaipur', 'Jaipur'] },
        { state_name: 'Gujarat', districts: ['Morbi', 'Ahmedabad'] }
      ],
      images: ['https://stonemarket.com/defaults/calcite-powder-sample.jpg'],
      cover_image: 'https://stonemarket.com/defaults/calcite-powder-sample.jpg'
    });
  });

  // ==========================================
  // 1. DASHBOARD & BUSINESS TYPE SWITCHER
  // ==========================================
  describe('1. Dashboard & Business Switcher', () => {
    it('GET /api/powder-supplier/dashboard - should return dashboard with Powder Catalog Management menu and operational cards', async () => {
      const res = await request(app)
        .get('/api/powder-supplier/dashboard')
        .set('Authorization', `Bearer ${powderToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.business_profile_card).toBeDefined();
      expect(res.body.data.business_profile_card.business_name).toBe('Shree Krishna Micron Minerals & Chemicals');
      expect(res.body.data.business_profile_card.business_type).toBe('Mineral & Powder Supplier');

      // Check operational summary cards
      expect(res.body.data.operational_summary_cards).toHaveLength(4);
      expect(res.body.data.operational_summary_cards[0].title).toBe('Mineral Categories');
      expect(res.body.data.operational_summary_cards[1].title).toBe('Monthly Grinding Capacity');

      // Check menu structure has "Powder Catalog Management"
      const myBusinessMenu = res.body.data.my_business_menu;
      const powderCatalogItem = myBusinessMenu.find(item => item.title === 'Powder Catalog Management');
      expect(powderCatalogItem).toBeDefined();
      expect(powderCatalogItem.path).toBe('/powder-supplier/catalog');
    });

    it('GET /api/powder-supplier/business-types - should list available business types and current type', async () => {
      const res = await request(app)
        .get('/api/powder-supplier/business-types')
        .set('Authorization', `Bearer ${powderToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.current).toBe('powder_supplier');
      expect(res.body.data.business_types.length).toBeGreaterThan(0);
      const powderType = res.body.data.business_types.find(t => t.id === 'powder_supplier');
      expect(powderType).toBeDefined();
      expect(powderType.is_active).toBe(true);
    });

    it('POST /api/powder-supplier/switch-business-type - should switch user active business type', async () => {
      const res = await request(app)
        .post('/api/powder-supplier/switch-business-type')
        .set('Authorization', `Bearer ${powderToken}`)
        .send({ target_type: 'powder_supplier' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.current_business_type).toBe('powder_supplier');
    });
  });

  // ==========================================
  // 2. PROFILE MANAGEMENT
  // ==========================================
  describe('2. Mineral & Powder Supplier Profile Management', () => {
    it('GET /api/powder-supplier/profile - should return profile data', async () => {
      const res = await request(app)
        .get('/api/powder-supplier/profile')
        .set('Authorization', `Bearer ${powderToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.company_name).toBe('Shree Krishna Micron Minerals & Chemicals');
      expect(res.body.data.monthly_grinding_capacity).toBe('10,000+ MT / Month');
    });

    it('PUT /api/powder-supplier/profile - should update grinding and micronizing specifications', async () => {
      const res = await request(app)
        .put('/api/powder-supplier/profile')
        .set('Authorization', `Bearer ${powderToken}`)
        .send({
          monthly_grinding_capacity: '15,000+ MT / Month',
          micronizing_facility: '3x Raymond Mills + 2x Turbo Air Classifiers (Down to 1.5 Micron D97)',
          annual_mineral_supply_volume: '1,50,000+ MT Supplied Nationally & Globally'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.monthly_grinding_capacity).toBe('15,000+ MT / Month');
    });
  });

  // ==========================================
  // 3. POWDER CATALOG MANAGEMENT
  // ==========================================
  describe('3. Powder Catalog Management (/catalog & /powders)', () => {
    it('GET /api/powder-supplier/catalog - should list powder products with search & filters', async () => {
      const res = await request(app)
        .get('/api/powder-supplier/catalog')
        .set('Authorization', `Bearer ${powderToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.powders).toBeDefined();
      expect(res.body.data.powders.length).toBeGreaterThanOrEqual(1);

      const item = res.body.data.powders[0];
      expect(item.mesh_size).toBe('500 Mesh');
      expect(item.whiteness_percentage).toBe(97.5);
      expect(item.pricing_unit).toBe('Per Metric Ton (MT)');
    });

    it('GET /api/powder-supplier/powders - alias should return powder list', async () => {
      const res = await request(app)
        .get('/api/powder-supplier/powders')
        .set('Authorization', `Bearer ${powderToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.powders.length).toBeGreaterThanOrEqual(1);
    });

    it('GET /api/powder-supplier/catalog with search query - should filter by mesh size and mineral name', async () => {
      const res = await request(app)
        .get('/api/powder-supplier/catalog?search=500 Mesh')
        .set('Authorization', `Bearer ${powderToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.powders.length).toBe(1);
      expect(res.body.data.powders[0].name).toContain('500 Mesh');
    });

    it('POST /api/powder-supplier/catalog - should create new powder item via 4-step wizard', async () => {
      const newPowderData = {
        name: '800 Mesh Stearic Acid Surface-Coated Calcite Powder',
        product_name: '800 Mesh Stearic Acid Surface-Coated Calcite Powder',
        category: 'Calcium Carbonate & Calcite',
        mineral_type: 'Surface Coated Treated Calcium Carbonate',
        chemical_name: 'Calcium Carbonate (Treated)',
        chemical_formula: 'CaCO3 + C18H36O2',
        mesh_size: '800 Mesh',
        micron_rating: '15 Microns (D97)',
        whiteness_percentage: 98.0,
        brightness_percentage: 97.0,
        calcium_carbonate_purity: 99.0,
        chemical_purity: '99.0% CaCO3',
        moisture_percentage: 0.08,
        coating_type: 'Stearic Acid Coated (1.2% - 1.5%)',
        packaging_type: '25 KG HDPE Bags with inner LDPE liner',
        monthly_supply_capacity: '3,000 MT / Month',
        application_type: 'PVC Pipes, Cable Compounds, Masterbatches, Polymer Compounding',
        short_description: 'Hydrophobic surface-treated ultra-fine micronized calcite for high dispersion in polymers.',
        description: 'Coated uniformly with high-purity triple-pressed stearic acid, ensuring exceptional flowability, reduced torque in plastic extrusion, and superior filler loading.',
        price: 5200,
        selling_price: 5200,
        pricing_unit: 'Per Metric Ton (MT)',
        min_order_quantity: 15,
        stock: 300,
        available_stock: 300,
        stock_unit: 'MT',
        availability_status: 'Ready Stock',
        status: 'active',
        target_areas: [
          { state_name: 'Gujarat', districts: ['Morbi', 'Surat'] }
        ],
        target_categories: [
          'Engineered Stone Manufacturer',
          'Paint & Coating',
          'Manufacturer'
        ]
      };

      const res = await request(app)
        .post('/api/powder-supplier/catalog')
        .set('Authorization', `Bearer ${powderToken}`)
        .send(newPowderData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.sku).toMatch(/^CAL-/);
      expect(res.body.data.name).toContain('800 Mesh');
      expect(res.body.data.coating_type).toContain('Stearic Acid');
    });

    it('GET /api/powder-supplier/catalog/:id - should get powder details', async () => {
      const res = await request(app)
        .get(`/api/powder-supplier/catalog/${testPowderProduct._id}`)
        .set('Authorization', `Bearer ${powderToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id.toString()).toBe(testPowderProduct._id.toString());
      expect(res.body.data.mesh_size).toBe('500 Mesh');
    });

    it('PUT /api/powder-supplier/catalog/:id - should update powder details', async () => {
      const res = await request(app)
        .put(`/api/powder-supplier/catalog/${testPowderProduct._id}`)
        .set('Authorization', `Bearer ${powderToken}`)
        .send({
          price: 4100,
          selling_price: 4100,
          monthly_supply_capacity: '7,500 MT / Month',
          whiteness_percentage: 98.2
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.price).toBe(4100);
      expect(res.body.data.whiteness_percentage).toBe(98.2);
    });

    it('PATCH /api/powder-supplier/catalog/:id/stock - should adjust inventory stock and log history', async () => {
      const res = await request(app)
        .patch(`/api/powder-supplier/catalog/${testPowderProduct._id}/stock`)
        .set('Authorization', `Bearer ${powderToken}`)
        .send({
          change_type: 'set',
          stock: 600,
          notes: 'New production batch received from Ball Mill #3'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.new_stock).toBe(600);

      const history = await StockHistory.find({ productId: testPowderProduct._id });
      expect(history.length).toBeGreaterThanOrEqual(1);
    });

    it('POST /api/powder-supplier/catalog/:id/duplicate - should create a draft copy with (Copy) suffix', async () => {
      const res = await request(app)
        .post(`/api/powder-supplier/catalog/${testPowderProduct._id}/duplicate`)
        .set('Authorization', `Bearer ${powderToken}`);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toContain('(Copy)');
      expect(res.body.data.status).toBe('draft');
      expect(res.body.data.sku).not.toBe(testPowderProduct.sku);
    });

    it('PATCH /api/powder-supplier/catalog/:id/status - should toggle status between active and inactive', async () => {
      const res = await request(app)
        .patch(`/api/powder-supplier/catalog/${testPowderProduct._id}/status`)
        .set('Authorization', `Bearer ${powderToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('inactive');
    });

    it('DELETE /api/powder-supplier/catalog/:id - should delete powder product', async () => {
      const res = await request(app)
        .delete(`/api/powder-supplier/catalog/${testPowderProduct._id}`)
        .set('Authorization', `Bearer ${powderToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const check = await Product.findById(testPowderProduct._id);
      expect(check).toBeNull();
    });
  });

  // ==========================================
  // 4. CONTACTS MANAGEMENT
  // ==========================================
  describe('4. Contacts Management', () => {
    it('GET /api/powder-supplier/contacts - should return supplier contacts', async () => {
      const res = await request(app)
        .get('/api/powder-supplier/contacts')
        .set('Authorization', `Bearer ${powderToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data[0].name).toBe('Ghanshyam Patel');
    });

    it('POST /api/powder-supplier/contacts - should add a secondary technical contact', async () => {
      const res = await request(app)
        .post('/api/powder-supplier/contacts')
        .set('Authorization', `Bearer ${powderToken}`)
        .send({
          name: 'Mukesh Choudhary',
          designation: 'Chief Quality Control & Lab Chemist',
          phone: '+91 98290 44556',
          email: 'mukesh.qc@shreekrishnaminerals.com',
          whatsapp: '+91 98290 44556',
          is_primary: false
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.some(c => c.name === 'Mukesh Choudhary')).toBe(true);
    });
  });

  // ==========================================
  // 5. GALLERY MANAGEMENT
  // ==========================================
  describe('5. Gallery Management', () => {
    it('GET /api/powder-supplier/gallery - should retrieve plant gallery photos and videos', async () => {
      const res = await request(app)
        .get('/api/powder-supplier/gallery')
        .set('Authorization', `Bearer ${powderToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.photos).toBeDefined();
      expect(res.body.data.videos).toBeDefined();
    });

    it('POST /api/powder-supplier/gallery/photos - should add photo to gallery', async () => {
      const res = await request(app)
        .post('/api/powder-supplier/gallery/photos')
        .set('Authorization', `Bearer ${powderToken}`)
        .send({
          url: 'https://stonemarket.com/gallery/powder-ballmill-line.jpg',
          title: 'Raymond Ball Mill Grinding Line',
          category: 'facility'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Raymond Ball Mill Grinding Line');
    });

    it('POST /api/powder-supplier/gallery/videos - should add a new video', async () => {
      const res = await request(app)
        .post('/api/powder-supplier/gallery/videos')
        .set('Authorization', `Bearer ${powderToken}`)
        .send({
          title: 'Automated 50 KG Bagging Line Demo',
          video_url: 'https://youtube.com/watch?v=powderbagging999',
          source_type: 'youtube',
          category: 'demonstration',
          duration: '03:45'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Automated 50 KG Bagging Line Demo');
    });
  });

  // ==========================================
  // 6. VERIFICATION CENTER
  // ==========================================
  describe('6. Verification Center', () => {
    it('GET /api/powder-supplier/verification - should return verification status', async () => {
      const res = await request(app)
        .get('/api/powder-supplier/verification')
        .set('Authorization', `Bearer ${powderToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.is_verified).toBe(true);
      expect(res.body.data.gst_number).toBe('08AABCS3344D1Z5');
    });

    it('POST /api/powder-supplier/verification/gst - should process GST verification', async () => {
      const res = await request(app)
        .post('/api/powder-supplier/verification/gst')
        .set('Authorization', `Bearer ${powderToken}`)
        .send({
          gstin: '08AABCS3344D1Z5'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('verified');
    });
  });

  // ==========================================
  // 7. ANALYTICS ENGINE
  // ==========================================
  describe('7. Analytics Engine', () => {
    it('GET /api/powder-supplier/analytics - should return powder views, inquiries and breakdown metrics', async () => {
      const res = await request(app)
        .get('/api/powder-supplier/analytics')
        .set('Authorization', `Bearer ${powderToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.summary.total_profile_views).toBeDefined();
    });

    it('POST /api/powder-supplier/analytics/event - should record powder view or inquiry analytics event', async () => {
      const res = await request(app)
        .post('/api/powder-supplier/analytics/event')
        .set('Authorization', `Bearer ${powderToken}`)
        .send({
          event_type: 'powder_view',
          product_id: testPowderProduct._id.toString(),
          metadata: { source: 'catalog_search' }
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.event_type).toBe('powder_view');
    });
  });

  // ==========================================
  // 8. INQUIRIES & LEAD MANAGEMENT
  // ==========================================
  describe('8. Inquiries & Lead Management', () => {
    beforeEach(async () => {
      await Inquiry.create({
        businessId: powderProfile._id,
        vendorId: powderProfile._id,
        senderId: customerUser._id,
        category: 'Mineral & Powder Supplier',
        subject: 'Inquiry for 100 MT of 500 Mesh Calcite for Engineered Stone',
        message: 'Need monthly dispatch of 100 MT 500 mesh ground calcite powder to Morbi tile manufacturing unit.',
        status: 'pending',
        inquiry_type: 'quotation',
        preferred_contact_method: 'phone'
      });
    });

    it('GET /api/powder-supplier/inquiries - should return powder inquiries', async () => {
      const res = await request(app)
        .get('/api/powder-supplier/inquiries')
        .set('Authorization', `Bearer ${powderToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data[0].subject).toContain('500 Mesh Calcite');
    });

    it('GET /api/powder-supplier/leads - should return relevant powder leads', async () => {
      const res = await request(app)
        .get('/api/powder-supplier/leads')
        .set('Authorization', `Bearer ${powderToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ==========================================
  // 9. SHARED MODULES INTEGRATION
  // ==========================================
  describe('9. Shared Modules Integration (Settings, Promotions, Invoices)', () => {
    it('GET /api/powder-supplier/settings - should access account settings for powder_supplier', async () => {
      const res = await request(app)
        .get('/api/powder-supplier/settings')
        .set('Authorization', `Bearer ${powderToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.business_profile_card).toBeDefined();
      expect(res.body.data.business_profile_card.company_name).toBe('Shree Krishna Micron Minerals & Chemicals');
    });

    it('GET /api/powder-supplier/promotions - should access promotions for powder_supplier', async () => {
      const res = await request(app)
        .get('/api/powder-supplier/promotions')
        .set('Authorization', `Bearer ${powderToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('GET /api/powder-supplier/invoices - should access promotion invoices for powder_supplier', async () => {
      const res = await request(app)
        .get('/api/powder-supplier/invoices')
        .set('Authorization', `Bearer ${powderToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
