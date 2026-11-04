const request = require('supertest');
const app = require('../server');
const User = require('../src/models/User');
const BusinessProfile = require('../src/models/BusinessProfile');
const Product = require('../src/models/Product');
const Inquiry = require('../src/models/Inquiry');
const StockHistory = require('../src/models/StockHistory');
const jwt = require('jsonwebtoken');

describe('Stone Machinery Parts & Spares Module - Comprehensive Suite', () => {
  let machineryUser, customerUser;
  let machineryToken, customerToken;
  let machineryProfile;
  let testProduct;

  beforeEach(async () => {
    // 1. Machinery Parts User & Profile
    machineryUser = await User.create({
      name: 'Ramesh Patel',
      mobile: '9829077889',
      email: 'ramesh.machinery@apexspares.com',
      password: 'password123',
      role: 'machinery_parts',
      status: 'active'
    });

    machineryToken = jwt.sign(
      { id: machineryUser._id, role: machineryUser.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1h' }
    );

    machineryProfile = await BusinessProfile.create({
      userId: machineryUser._id,
      business_type: 'machinery_parts',
      company_name: 'Apex Industrial Machinery Spares & Components',
      business_category: 'Stone Machinery Parts & Spares',
      business_subcategory: 'Heavy Stone Machinery Replacement Parts, Hydraulics & Bearings',
      short_description: 'Precision engineered spare parts, hydraulic cylinders, heavy bearings, and electrical accessories for stone processing machinery.',
      about_business: 'Apex Industrial Machinery Spares & Components provides OEM-grade replacement parts, CNC precision fabrication, hydraulic systems, and emergency breakdown spares for granite gangsaw, bridge cutter, and polishing lines across India.',
      established_year: 2015,
      machinery_categories: [
        'Gangsaw & Multi-Cutter Spare Parts',
        'Circular Saw Machine Parts',
        'Bridge Cutter Spare Parts',
        'Hydraulic Components',
        'Bearings & Industrial Components',
        'Motors & Gearboxes'
      ],
      oem_brands_supported: ['Gaspari Menotti', 'Breton', 'Pedrini', 'Simec', 'Barsanti', 'Universal'],
      parts_manufacturing_capability: 'CNC Machining & Precision Fabrication',
      industrial_supply_capability: 'Pan-India Industrial Dispatch & Break-Down Support',
      service_replacement_support: 'Available on-site & express courier service',
      address: {
        state: 'Rajasthan',
        district: 'Jaipur',
        area: 'VKI Area',
        industrial_area: 'VKI Industrial Area',
        commercial_area: 'Road No. 11',
        office_address: 'Plot 42, Road No. 11, VKI Industrial Area, Jaipur',
        full_address: 'Plot 42, Road No. 11, VKI Industrial Area, Jaipur, Rajasthan 302013',
        postal_code: '302013',
        country: 'India'
      },
      owners: [
        {
          name: 'Ramesh Patel',
          designation: 'Managing Director & Spares Head',
          phone: '+91 98290 77889',
          email: 'spares@apexspares.com',
          whatsapp: '+91 98290 77889',
          is_primary: true
        }
      ],
      gallery_photos: [
        {
          url: 'https://stonemarket.com/uploads/machinery-spares-1.jpg',
          title: 'CNC Machining Section',
          category: 'machinery',
          is_cover: true
        }
      ],
      gallery_videos: [
        {
          url: 'https://stonemarket.com/uploads/spares-tour.mp4',
          title: 'Heavy Parts Production Video',
          video_url: 'https://stonemarket.com/uploads/spares-tour.mp4',
          source_type: 'upload',
          category: 'workshop_tour'
        }
      ],
      verification_steps: {
        phone: { phone: '+91 98290 77889', status: 'verified', verified_at: new Date() },
        email: { email: 'spares@apexspares.com', status: 'verified', verified_at: new Date() },
        business: { registration_type: 'MSME / Udyam', registration_number: 'UDYAM-RJ-14-0077889', status: 'verified' },
        gst: { gstin: '08AAACM4567D1Z8', status: 'verified' }
      },
      is_verified: true,
      verification_status: 'approved',
      gst_number: '08AAACM4567D1Z8',
      rating: 4.9,
      review_count: 46,
      status: 'active',
      is_mock: false
    });

    // 2. Customer User for Public Catalogue & Inquiries
    customerUser = await User.create({
      name: 'Amit Builder',
      mobile: '9876543210',
      email: 'amit.builder@buildtech.com',
      password: 'password123',
      role: 'buyer',
      status: 'active'
    });

    customerToken = jwt.sign(
      { id: customerUser._id, role: customerUser.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1h' }
    );

    // 3. Initial Product for Machinery Spares
    testProduct = await Product.create({
      userId: machineryUser._id,
      vendorId: machineryProfile._id,
      businessProfileId: machineryProfile._id,
      business_type: 'machinery_parts',
      name: 'Heavy Duty Gangsaw Connecting Rod Pin',
      sku: 'GNG-2026-0001',
      category: 'Gangsaw & Multi-Cutter Spare Parts',
      subcategory: 'Connecting Rods & Pins',
      model_number: 'CR-PIN-80',
      part_number: 'SP-CR-80-M',
      oem_number: 'GM-80-2024',
      material_grade: 'Forged EN24 / 4340 Alloy Steel',
      oem_brand_compatibility: 'Gaspari Menotti, Breton, Barsanti',
      warranty_guarantee: '12 Months Replacement Warranty',
      selling_price: 18500,
      price: 18500,
      pricing_unit: 'Per Piece',
      min_order_quantity: 2,
      available_stock: 45,
      stock: 45,
      stock_unit: 'Units',
      availability_status: 'In Stock',
      status: 'active',
      publishing_status: 'published',
      technical_specifications: {
        hardness: '58-62 HRC',
        heat_treatment: 'Induction Hardened & Tempered',
        surface_finish: 'Precision Ground Ra 0.4',
        weight: '18.5 kg'
      },
      technical_drawings: [
        'https://stonemarket.com/uploads/blueprints/cr-pin-80.pdf'
      ],
      images: [
        'https://stonemarket.com/uploads/products/cr-pin-1.jpg'
      ]
    });
  });

  // ==========================================
  // SECTION 1: DASHBOARD & BUSINESS SWITCHER
  // ==========================================
  describe('1. Dashboard & Business Switcher', () => {
    it('GET /api/machinery/dashboard - should return full dashboard metrics & profile card', async () => {
      const res = await request(app)
        .get('/api/machinery/dashboard')
        .set('Authorization', `Bearer ${machineryToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();

      const { business_profile_card, operational_summary, stats, my_business } = res.body.data;
      expect(business_profile_card.business_name).toBe('Apex Industrial Machinery Spares & Components');
      expect(business_profile_card.business_type).toBe('Stone Machinery Parts & Spares');
      expect(business_profile_card.rating).toBe(4.9);
      expect(business_profile_card.reviews).toBe(46);

      // 4 Operational Summary Cards
      expect(operational_summary.card_1.value).toContain('Categories');
      expect(operational_summary.card_2.value).toContain('Brands Supported');
      expect(operational_summary.card_3.value).toContain('CNC Machining');
      expect(operational_summary.card_4.value).toContain('Pan-India Industrial Dispatch');

      // Stats & Menu
      expect(stats.total_products).toBeGreaterThanOrEqual(1);
      expect(my_business).toHaveLength(6);
      expect(my_business[1].name).toBe('Product & Spares Management');
    });

    it('GET /api/machinery/business-types - should return all business categories with machinery selected', async () => {
      const res = await request(app)
        .get('/api/machinery/business-types')
        .set('Authorization', `Bearer ${machineryToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.current_type).toBe('machinery_parts');
      const machineryType = res.body.data.types.find(b => b.id === 'machinery_parts');
      expect(machineryType).toBeDefined();
      expect(machineryType.current).toBe(true);
      expect(machineryType.name).toBe('Stone Machinery Parts & Spares');
    });

    it('POST /api/machinery/switch-business-type - should switch user role and load/create business profile', async () => {
      const res = await request(app)
        .post('/api/machinery/switch-business-type')
        .set('Authorization', `Bearer ${machineryToken}`)
        .send({ business_type: 'showroom' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.business_type).toBe('showroom');

      // Verify user document updated
      const updatedUser = await User.findById(machineryUser._id);
      expect(updatedUser.role).toBe('showroom');

      // Switch back to machinery_parts
      const res2 = await request(app)
        .post('/api/machinery/switch-business-type')
        .set('Authorization', `Bearer ${machineryToken}`)
        .send({ business_type: 'machinery_parts' });

      expect(res2.status).toBe(200);
      expect(res2.body.data.business_type).toBe('machinery_parts');
    });
  });

  // ==========================================
  // SECTION 2: PROFILE & OPERATIONAL SPECS
  // ==========================================
  describe('2. Business Profile & Operational Specifications', () => {
    it('GET /api/machinery/profile - should return business profile details', async () => {
      const res = await request(app)
        .get('/api/machinery/profile')
        .set('Authorization', `Bearer ${machineryToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.company_name).toBe('Apex Industrial Machinery Spares & Components');
      expect(res.body.data.operational_specifications.parts_manufacturing_capability).toBe('CNC Machining & Precision Fabrication');
    });

    it('PUT /api/machinery/profile - should update operational specifications and business metadata', async () => {
      const res = await request(app)
        .put('/api/machinery/profile')
        .set('Authorization', `Bearer ${machineryToken}`)
        .send({
          company_name: 'Apex Industrial Spares & High-Tech Components Pvt Ltd',
          established_year: 2012,
          parts_manufacturing_capability: 'CNC Machining, EDM Wire-Cut & Precision Gear Hobbing',
          industrial_supply_capability: 'Pan-India 24-Hour Emergency Dispatch & Global Export',
          service_replacement_support: 'Full 100% On-Site Installation and Commissioning Available',
          oem_brands_supported: ['Gaspari Menotti', 'Breton', 'Pedrini', 'Simec', 'Barsanti', 'Universal', 'Keda']
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.company_name).toBe('Apex Industrial Spares & High-Tech Components Pvt Ltd');
      expect(res.body.data.oem_brands_supported).toContain('Keda');
      expect(res.body.data.parts_manufacturing_capability).toContain('EDM Wire-Cut');
    });
  });

  // ==========================================
  // SECTION 3: PRODUCT & SPARES MANAGEMENT
  // ==========================================
  describe('3. Product & Spares Management (4-Step Wizard & CRUD)', () => {
    it('POST /api/machinery/products - Step 1 to 4 Complete Product Creation Wizard', async () => {
      const newProductPayload = {
        name: 'High Pressure Hydraulic Cylinder for Bridge Saw',
        sku: 'HYD-2026-0045',
        category: 'Hydraulic Components',
        subcategory: 'Hydraulic Cylinders & Power Packs',
        model_number: 'HC-250-BR',
        part_number: 'SP-HYD-250',
        oem_number: 'BR-HYD-991',
        material_grade: 'Hard Chrome Plated ST52 Hone Tube',
        oem_brand_compatibility: 'Breton, Pedrini, Gaspari Menotti',
        warranty_guarantee: '18 Months Manufacturer Guarantee',
        selling_price: 32500,
        pricing_unit: 'Per Piece',
        min_order_quantity: 1,
        available_stock: 20,
        technical_specifications: {
          bore_diameter: '120 mm',
          stroke_length: '650 mm',
          max_working_pressure: '250 Bar',
          seal_kit_type: 'Parker High Temp Polyurethane'
        },
        technical_drawings: [
          'https://stonemarket.com/uploads/blueprints/hc-250-br.pdf'
        ],
        images: [
          'https://stonemarket.com/uploads/products/hyd-cyl-1.jpg'
        ]
      };

      const res = await request(app)
        .post('/api/machinery/products')
        .set('Authorization', `Bearer ${machineryToken}`)
        .send(newProductPayload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('High Pressure Hydraulic Cylinder for Bridge Saw');
      expect(res.body.data.sku).toBe('HYD-2026-0045');
      expect(res.body.data.category).toBe('Hydraulic Components');
      expect(res.body.data.material_grade).toBe('Hard Chrome Plated ST52 Hone Tube');
      expect(res.body.data.oem_brand_compatibility).toContain('Breton');
      expect(res.body.data.warranty_guarantee).toBe('18 Months Manufacturer Guarantee');
      expect(res.body.data.availability_status).toBe('In Stock');
    });

    it('POST /api/machinery/products - should auto-generate SKU if omitted', async () => {
      const res = await request(app)
        .post('/api/machinery/products')
        .set('Authorization', `Bearer ${machineryToken}`)
        .send({
          name: 'Precision Deep Groove Ball Bearing 6318 C3',
          category: 'Bearings & Industrial Components',
          material_grade: 'High Carbon Chrome Steel 100Cr6',
          oem_brand_compatibility: 'SKF, FAG, Universal',
          selling_price: 4800,
          pricing_unit: 'Per Piece',
          min_order_quantity: 4,
          available_stock: 80
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.sku).toBeDefined();
      expect(res.body.data.sku).toMatch(/^(BRG|SMP)-\d{4}-\d+/);
    });

    it('POST /api/machinery/products - should fail with 400 when required fields are missing', async () => {
      const res = await request(app)
        .post('/api/machinery/products')
        .set('Authorization', `Bearer ${machineryToken}`)
        .send({
          name: 'Incomplete Part'
          // missing category, material_grade, oem_brand_compatibility, selling_price, pricing_unit
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBeDefined();
    });

    it('GET /api/machinery/products - should list products with stock stats and search filters', async () => {
      const res = await request(app)
        .get('/api/machinery/products?category=Gangsaw & Multi-Cutter Spare Parts&status=active')
        .set('Authorization', `Bearer ${machineryToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.products)).toBe(true);
      expect(res.body.data.counts).toBeDefined();
      expect(res.body.data.counts.total || res.body.data.counts.all).toBeGreaterThanOrEqual(1);
    });

    it('GET /api/machinery/products/:id - should get single machinery product details', async () => {
      const res = await request(app)
        .get(`/api/machinery/products/${testProduct._id}`)
        .set('Authorization', `Bearer ${machineryToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id.toString()).toBe(testProduct._id.toString());
      expect(res.body.data.material_grade).toBe('Forged EN24 / 4340 Alloy Steel');
      expect(res.body.data.technical_drawings).toHaveLength(1);
    });

    it('PUT /api/machinery/products/:id - should update product specifications and prices', async () => {
      const res = await request(app)
        .put(`/api/machinery/products/${testProduct._id}`)
        .set('Authorization', `Bearer ${machineryToken}`)
        .send({
          name: 'Upgraded Heavy Duty Gangsaw Connecting Rod Pin',
          selling_price: 19500,
          warranty_guarantee: '24 Months Heavy Duty Replacement Warranty'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Upgraded Heavy Duty Gangsaw Connecting Rod Pin');
      expect(res.body.data.selling_price).toBe(19500);
      expect(res.body.data.warranty_guarantee).toBe('24 Months Heavy Duty Replacement Warranty');
    });

    it('PATCH /api/machinery/products/:id/stock - should adjust stock and log to StockHistory', async () => {
      const res = await request(app)
        .patch(`/api/machinery/products/${testProduct._id}/stock`)
        .set('Authorization', `Bearer ${machineryToken}`)
        .send({
          stock: 70,
          change_type: 'set',
          notes: 'Received shipment from CNC precision workshop'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.updated_stock).toBe(70);

      // Verify StockHistory document was logged
      const history = await StockHistory.findOne({
        productId: testProduct._id,
        notes: 'Received shipment from CNC precision workshop'
      });
      expect(history).toBeDefined();
      expect(history.updated_stock).toBe(70);
    });

    it('POST /api/machinery/products/:id/duplicate - should clone product as draft with (Copy) suffix', async () => {
      const res = await request(app)
        .post(`/api/machinery/products/${testProduct._id}/duplicate`)
        .set('Authorization', `Bearer ${machineryToken}`);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toContain('(Copy)');
      expect(res.body.data.status).toBe('draft');
      expect(res.body.data.sku).not.toBe(testProduct.sku);
    });

    it('PATCH /api/machinery/products/:id/status - should toggle status between active and inactive', async () => {
      const res = await request(app)
        .patch(`/api/machinery/products/${testProduct._id}/status`)
        .set('Authorization', `Bearer ${machineryToken}`)
        .send({ status: 'inactive' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('inactive');
    });

    it('DELETE /api/machinery/products/:id - should delete machinery product', async () => {
      const productToDelete = await Product.create({
        userId: machineryUser._id,
        vendorId: machineryProfile._id,
        businessProfileId: machineryProfile._id,
        business_type: 'machinery_parts',
        name: 'Temporary O-Ring Spares Set',
        category: 'Hydraulic Components',
        material_grade: 'Nitrile 90 Shore A',
        oem_brand_compatibility: 'Universal',
        selling_price: 850,
        pricing_unit: 'Per Set'
      });

      const res = await request(app)
        .delete(`/api/machinery/products/${productToDelete._id}`)
        .set('Authorization', `Bearer ${machineryToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const check = await Product.findById(productToDelete._id);
      expect(check).toBeNull();
    });
  });

  // ==========================================
  // SECTION 4: PUBLIC CATALOGUE & CONTACTS
  // ==========================================
  describe('4. Contacts Management', () => {
    it('POST /api/machinery/contacts - should add a new contact person', async () => {
      const res = await request(app)
        .post('/api/machinery/contacts')
        .set('Authorization', `Bearer ${machineryToken}`)
        .send({
          name: 'Manoj Sharma',
          designation: 'Technical Breakdown Lead',
          phone: '+91 94140 12345',
          email: 'service@apexspares.com',
          whatsapp: '+91 94140 12345',
          is_primary: false
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Manoj Sharma');
    });

    it('GET /api/machinery/contacts - should return all contacts', async () => {
      const res = await request(app)
        .get('/api/machinery/contacts')
        .set('Authorization', `Bearer ${machineryToken}`);

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
    it('POST /api/machinery/gallery/photos - should add photo to machinery profile gallery', async () => {
      const res = await request(app)
        .post('/api/machinery/gallery/photos')
        .set('Authorization', `Bearer ${machineryToken}`)
        .send({
          url: 'https://stonemarket.com/uploads/gallery/hydraulic-test-bench.jpg',
          title: 'High Pressure Hydraulic Test Bench',
          category: 'machinery',
          is_cover: false
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('High Pressure Hydraulic Test Bench');
    });

    it('POST /api/machinery/gallery/videos - should add video link to profile gallery', async () => {
      const res = await request(app)
        .post('/api/machinery/gallery/videos')
        .set('Authorization', `Bearer ${machineryToken}`)
        .send({
          video_url: 'https://stonemarket.com/uploads/gallery/spares-production.mp4',
          title: 'Automated CNC Pin Fabrication Line',
          category: 'workshop_tour'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Automated CNC Pin Fabrication Line');
    });

    it('GET /api/machinery/verification - should get verification center status & documents', async () => {
      const res = await request(app)
        .get('/api/machinery/verification')
        .set('Authorization', `Bearer ${machineryToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.overall_progress).toBe(100);
      expect(res.body.data.is_verified).toBe(true);
    });

    it('POST /api/machinery/verification/gst - should verify GST number', async () => {
      const res = await request(app)
        .post('/api/machinery/verification/gst')
        .set('Authorization', `Bearer ${machineryToken}`)
        .send({
          gstin: '08AAACM4567D1Z8'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.gstin).toBe('08AAACM4567D1Z8');
    });
  });

  // ==========================================
  // SECTION 6: ANALYTICS, INQUIRIES & LEADS
  // ==========================================
  describe('6. Analytics, Inquiries & Leads', () => {
    it('GET /api/machinery/analytics - should return views, inquiry rates and top spare parts', async () => {
      const res = await request(app)
        .get('/api/machinery/analytics?timeframe=30d')
        .set('Authorization', `Bearer ${machineryToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.metrics).toBeDefined();
      expect(res.body.data.metrics.total_profile_views).toBeDefined();
    });

    it('GET /api/machinery/inquiries - should return incoming machinery parts inquiries', async () => {
      // Seed an inquiry
      await Inquiry.create({
        inquiry_number: 'INQ-MCH-2026-0001',
        title: 'Requirement for 4 Nos Gangsaw Connecting Rod Pins',
        subject: 'Requirement for 4 Nos Gangsaw Connecting Rod Pins',
        category: 'Stone Machinery Parts & Spares',
        buyer_id: customerUser._id,
        senderId: customerUser._id,
        buyer_name: 'Amit Builder',
        buyer_phone: '9876543210',
        businessId: machineryProfile._id,
        quantity: 4,
        unit: 'Piece',
        status: 'pending'
      });

      const res = await request(app)
        .get('/api/machinery/inquiries')
        .set('Authorization', `Bearer ${machineryToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('GET /api/machinery/leads - should return buyer leads matching machinery parts', async () => {
      const res = await request(app)
        .get('/api/machinery/leads')
        .set('Authorization', `Bearer ${machineryToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  // ==========================================
  // SECTION 7: SHARED SETTINGS, PROMOTIONS & INVOICES
  // ==========================================
  describe('7. Shared Settings, Promotions & Invoices Routes', () => {
    it('GET /api/machinery/settings - should fetch account settings for machinery profile', async () => {
      const res = await request(app)
        .get('/api/machinery/settings')
        .set('Authorization', `Bearer ${machineryToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.business_profile_card).toBeDefined();
      expect(res.body.data.business_profile_card.company_name).toBe('Apex Industrial Machinery Spares & Components');
    });

    it('GET /api/machinery/promotions - should retrieve available promotion packages', async () => {
      const res = await request(app)
        .get('/api/machinery/promotions')
        .set('Authorization', `Bearer ${machineryToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('GET /api/machinery/invoices - should retrieve promotion invoices', async () => {
      const res = await request(app)
        .get('/api/machinery/invoices')
        .set('Authorization', `Bearer ${machineryToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.invoices)).toBe(true);
    });
  });
});
