const request = require('supertest');
const app = require('../server');
const User = require('../src/models/User');
const BusinessProfile = require('../src/models/BusinessProfile');
const Product = require('../src/models/Product');
const Inquiry = require('../src/models/Inquiry');
const StockHistory = require('../src/models/StockHistory');
const jwt = require('jsonwebtoken');

describe('Stone Diamond Blades & Segments Module - Comprehensive Suite', () => {
  let bladeUser, customerUser;
  let bladeToken, customerToken;
  let bladeProfile;
  let testBladeProduct;

  beforeEach(async () => {
    // 1. Diamond Blades & Segments User & Profile
    bladeUser = await User.create({
      name: 'Vikramaditya Rathore',
      mobile: '9829088776',
      email: 'vikram.blades@diamondedge.com',
      password: 'password123',
      role: 'diamond_blades',
      status: 'active'
    });

    bladeToken = jwt.sign(
      { id: bladeUser._id, role: bladeUser.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1h' }
    );

    bladeProfile = await BusinessProfile.create({
      userId: bladeUser._id,
      business_type: 'diamond_blades',
      company_name: 'DiamondEdge Blades & Segment Works',
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
          name: 'Vikramaditya Rathore',
          designation: 'Managing Director & Chief Tooling Metallurgist',
          phone: '+91 98290 88776',
          email: 'diamondblades@stonemarket.com',
          whatsapp: '+91 98290 88776',
          is_primary: true
        }
      ],
      verification_steps: {
        phone: { phone: '+91 98290 88776', status: 'verified', verified_at: new Date() },
        email: { email: 'diamondblades@stonemarket.com', status: 'verified', verified_at: new Date() },
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

    // 2. Customer User for Inquiries
    customerUser = await User.create({
      name: 'Praveen Mehta',
      mobile: '9829011223',
      email: 'praveen.mehta@granitefactory.com',
      password: 'password123',
      role: 'customer',
      status: 'active'
    });

    customerToken = jwt.sign(
      { id: customerUser._id, role: customerUser.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1h' }
    );

    // 3. Initial Test Product: Diamond Gangsaw Blade Segments (Set of 100 Pcs)
    testBladeProduct = await Product.create({
      businessProfileId: bladeProfile._id,
      vendorId: bladeProfile._id,
      business_type: 'diamond_blades',
      sku: 'SEG-2026-1001',
      name: 'Diamond Gangsaw Blade Segments (Set of 100 Pcs)',
      category: 'Diamond Segments',
      brand_name: 'DiamondEdge X7',
      manufacturer: 'DiamondEdge X7',
      model_number: 'DE-GS-X7',
      material_grade: 'Premium Cobalt Bond Matrix with DeBeers Grit',
      segment_length_mm: 20,
      segment_thickness_mm: 5.0,
      segment_height_mm: 12,
      segment_width_mm: 5.0,
      diamond_grit_size: '40/50 US Mesh',
      diamond_concentration: '35%',
      bond_type: 'Cobalt Matrix',
      bond_hardness: 'Hard (M4)',
      cutting_method: 'Wet',
      compatible_material: ['Hard Black Granite', 'Quartzite', 'Chittoor Granite', 'Absolute Black'],
      short_description: 'Hard Black Granite & Quartzite Slicing Gangsaw Segments',
      description: 'Engineered for extreme wear resistance and fast cut rates in multi-blade gangsaw frames processing high-silica and dark hard granites.',
      price: 28000,
      selling_price: 28000,
      pricing_unit: 'Per Set',
      min_order_quantity: 1,
      stock: 40,
      available_stock: 40,
      stock_unit: 'Sets',
      availability_status: 'In Stock',
      delivery_available: true,
      after_sales_support: true,
      target_categories: ['granite factory', 'marble factory', 'stone processing unit', 'exporter'],
      target_areas: [
        { state_name: 'Rajasthan', districts: ['Udaipur', 'Rajsamand', 'Jaipur', 'Kishangarh'] },
        { state_name: 'Andhra Pradesh', districts: ['Prakasam', 'Chittoor'] }
      ],
      images: ['https://stonemarket.com/defaults/diamond-gangsaw-segment.jpg'],
      cover_image: 'https://stonemarket.com/defaults/diamond-gangsaw-segment.jpg',
      status: 'active',
      publishing_status: 'published',
      views_count: 680,
      inquiries_count: 22
    });
  });

  // ==========================================
  // 1. DASHBOARD & BUSINESS SWITCHER
  // ==========================================
  describe('1. Dashboard & Business Switcher', () => {
    it('GET /api/diamond-blades/dashboard - should return dashboard with profile card, operational summary, and metrics', async () => {
      const res = await request(app)
        .get('/api/diamond-blades/dashboard')
        .set('Authorization', `Bearer ${bladeToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.business_profile_card.business_name).toBe('DiamondEdge Blades & Segment Works');
      expect(res.body.data.business_profile_card.business_type).toBe('Diamond Blades & Segments');
      expect(res.body.data.operational_summary_cards).toHaveLength(4);
      expect(res.body.data.metrics.total_products).toBeGreaterThanOrEqual(1);
      expect(res.body.data.my_business_menu).toBeDefined();
    });

    it('GET /api/diamond-blades/business-types - should list business types with diamond_blades active', async () => {
      const res = await request(app)
        .get('/api/diamond-blades/business-types')
        .set('Authorization', `Bearer ${bladeToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.current).toBe('diamond_blades');
      const types = res.body.data.business_types;
      const dbType = types.find((t) => t.id === 'diamond_blades');
      expect(dbType).toBeDefined();
      expect(dbType.is_active).toBe(true);
    });

    it('POST /api/diamond-blades/switch-business-type - should switch user business type to diamond_blades', async () => {
      const res = await request(app)
        .post('/api/diamond-blades/switch-business-type')
        .set('Authorization', `Bearer ${bladeToken}`)
        .send({ target_type: 'diamond_blades' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.current_business_type).toBe('diamond_blades');
    });
  });

  // ==========================================
  // 2. PROFILE & OPERATIONAL CONFIGURATION
  // ==========================================
  describe('2. Business Profile Management', () => {
    it('GET /api/diamond-blades/profile - should return business profile details', async () => {
      const res = await request(app)
        .get('/api/diamond-blades/profile')
        .set('Authorization', `Bearer ${bladeToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.company_name).toBe('DiamondEdge Blades & Segment Works');
      expect(res.body.data.daily_segment_production_capacity).toBe('15,000+ Segments / Day');
    });

    it('PUT /api/diamond-blades/profile - should update profile specifications and capacity', async () => {
      const res = await request(app)
        .put('/api/diamond-blades/profile')
        .set('Authorization', `Bearer ${bladeToken}`)
        .send({
          daily_segment_production_capacity: '20,000+ Segments / Day',
          custom_matrix_formulation: 'Advanced Ultra-Cobalt Hardened Matrix for Jalore & Warangal Granite',
          authorized_blade_brands: ['DiamondEdge X7', 'SilentCut Pro-16', 'CobaltMatrix King', 'BOSCH Stone Pro']
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.daily_segment_production_capacity).toBe('20,000+ Segments / Day');
      expect(res.body.data.authorized_blade_brands).toContain('BOSCH Stone Pro');
    });
  });

  // ==========================================
  // 3. PRODUCT & SPARES MANAGEMENT (4-STEP WIZARD)
  // ==========================================
  describe('3. Product & Spares Management', () => {
    it('GET /api/diamond-blades/products - should return formatted diamond blade and segment listings', async () => {
      const res = await request(app)
        .get('/api/diamond-blades/products')
        .set('Authorization', `Bearer ${bladeToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.products).toHaveLength(1);
      const item = res.body.data.products[0];
      expect(item.name).toBe('Diamond Gangsaw Blade Segments (Set of 100 Pcs)');
      expect(item.brand_name).toBe('DiamondEdge X7');
      expect(item.dimensions).toContain('20 × 5 × 12 mm');
      expect(item.selling_price).toBe(28000);
      expect(item.pricing_unit).toBe('Per Set');
    });

    it('GET /api/diamond-blades/spares - should support /spares alias for listing', async () => {
      const res = await request(app)
        .get('/api/diamond-blades/spares')
        .set('Authorization', `Bearer ${bladeToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.products).toBeDefined();
    });

    it('POST /api/diamond-blades/products - should create circular saw blade with Step 1-4 fields (16" Silent Laser Core)', async () => {
      const circularBladeData = {
        name: '16" Silent Laser Core Circular Saw Blade',
        category: 'Diamond Blades',
        brand_name: 'SilentCut Pro-16',
        manufacturer: 'SilentCut Pro-16',
        model_number: 'SC-16-SILENT',
        material_grade: '15mm Segment Height Sandwich Core',
        blade_diameter_mm: 400,
        bore_diameter_mm: 50,
        segment_height_mm: 15,
        segment_thickness_mm: 3.6,
        segment_length_mm: 40,
        core_thickness_mm: 2.8,
        number_of_segments: 28,
        diamond_grit_size: '40/45 Mesh',
        diamond_concentration: '40%',
        bond_type: 'Sandwich Multi-Layer Bronze-Cobalt',
        bond_hardness: 'Medium-Hard',
        cutting_method: 'Wet',
        compatible_material: ['Granite', 'Quartzite', 'Sandstone', 'Engineered Quartz'],
        short_description: 'Bridge cutting and edge profiling silent saw blade',
        description: 'Laser welded high-performance 400mm circular blade featuring a sandwich sound-deadening core for silent indoor bridge cutting.',
        selling_price: 4800,
        pricing_unit: 'Per Piece',
        min_order_quantity: 1,
        available_stock: 25,
        stock_unit: 'Pieces',
        availability_status: 'In Stock',
        target_categories: ['granite factory', 'stone processing unit'],
        target_areas: [{ state_name: 'Rajasthan', districts: ['Kishangarh', 'Jaipur'] }],
        images: ['https://stonemarket.com/defaults/silent-saw-blade.jpg'],
        cover_image: 'https://stonemarket.com/defaults/silent-saw-blade.jpg',
        status: 'active'
      };

      const res = await request(app)
        .post('/api/diamond-blades/products')
        .set('Authorization', `Bearer ${bladeToken}`)
        .send(circularBladeData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('16" Silent Laser Core Circular Saw Blade');
      expect(res.body.data.sku).toMatch(/^BLD-/);
      expect(res.body.data.blade_diameter_mm).toBe(400);
      expect(res.body.data.selling_price).toBe(4800);
    });

    it('GET /api/diamond-blades/products/:id - should get single product details', async () => {
      const res = await request(app)
        .get(`/api/diamond-blades/products/${testBladeProduct._id}`)
        .set('Authorization', `Bearer ${bladeToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Diamond Gangsaw Blade Segments (Set of 100 Pcs)');
    });

    it('PUT /api/diamond-blades/products/:id - should update product specifications and price', async () => {
      const res = await request(app)
        .put(`/api/diamond-blades/products/${testBladeProduct._id}`)
        .set('Authorization', `Bearer ${bladeToken}`)
        .send({
          selling_price: 29500,
          description: 'Updated premium cobalt matrix segments for even higher speed slicing.'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.selling_price).toBe(29500);
    });

    it('PATCH /api/diamond-blades/products/:id/stock - should adjust stock and write StockHistory entry', async () => {
      const res = await request(app)
        .patch(`/api/diamond-blades/products/${testBladeProduct._id}/stock`)
        .set('Authorization', `Bearer ${bladeToken}`)
        .send({
          stock: 60,
          change_type: 'set',
          notes: 'New production batch received from sintering furnace'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.new_stock).toBe(60);

      const history = await StockHistory.findOne({ productId: testBladeProduct._id, change_type: 'set' });
      expect(history).toBeDefined();
      expect(history.new_stock).toBe(60);
    });

    it('POST /api/diamond-blades/products/:id/duplicate - should duplicate product as draft with (Copy) suffix', async () => {
      const res = await request(app)
        .post(`/api/diamond-blades/products/${testBladeProduct._id}/duplicate`)
        .set('Authorization', `Bearer ${bladeToken}`);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Diamond Gangsaw Blade Segments (Set of 100 Pcs) (Copy)');
      expect(res.body.data.status).toBe('draft');
      expect(res.body.data.publishing_status).toBe('draft');
    });

    it('PATCH /api/diamond-blades/products/:id/status - should toggle status between active and inactive', async () => {
      const res = await request(app)
        .patch(`/api/diamond-blades/products/${testBladeProduct._id}/status`)
        .set('Authorization', `Bearer ${bladeToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('inactive');

      // Toggle back
      const res2 = await request(app)
        .patch(`/api/diamond-blades/products/${testBladeProduct._id}/status`)
        .set('Authorization', `Bearer ${bladeToken}`);

      expect(res2.status).toBe(200);
      expect(res2.body.data.status).toBe('active');
    });

    it('DELETE /api/diamond-blades/products/:id - should delete product and related stock history', async () => {
      const res = await request(app)
        .delete(`/api/diamond-blades/products/${testBladeProduct._id}`)
        .set('Authorization', `Bearer ${bladeToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const deleted = await Product.findById(testBladeProduct._id);
      expect(deleted).toBeNull();
    });

    it('GET /api/diamond-blades/products?search=Gangsaw - should filter products by keyword', async () => {
      const res = await request(app)
        .get('/api/diamond-blades/products?search=Gangsaw')
        .set('Authorization', `Bearer ${bladeToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.products.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ==========================================
  // 4. CONTACTS / OWNERS MANAGEMENT
  // ==========================================
  describe('4. Contacts Management', () => {
    it('GET /api/diamond-blades/contacts - should list contacts', async () => {
      const res = await request(app)
        .get('/api/diamond-blades/contacts')
        .set('Authorization', `Bearer ${bladeToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data[0].name).toBe('Vikramaditya Rathore');
    });

    it('POST /api/diamond-blades/contacts - should add a new tooling sales manager contact', async () => {
      const newContact = {
        name: 'Rajesh Sharma',
        designation: 'Head of Sales & Field Support',
        phone: '+91 98290 55443',
        whatsapp: '+91 98290 55443',
        email: 'rajesh.sales@diamondedge.com',
        is_primary: false
      };

      const res = await request(app)
        .post('/api/diamond-blades/contacts')
        .set('Authorization', `Bearer ${bladeToken}`)
        .send(newContact);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.some((c) => c.name === 'Rajesh Sharma')).toBe(true);
    });
  });

  // ==========================================
  // 5. GALLERY MANAGEMENT
  // ==========================================
  describe('5. Gallery Management', () => {
    it('GET /api/diamond-blades/gallery - should retrieve gallery photos and videos', async () => {
      const res = await request(app)
        .get('/api/diamond-blades/gallery')
        .set('Authorization', `Bearer ${bladeToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.photos).toBeDefined();
      expect(res.body.data.videos).toBeDefined();
    });

    it('POST /api/diamond-blades/gallery/photos - should add photo to gallery', async () => {
      const res = await request(app)
        .post('/api/diamond-blades/gallery/photos')
        .set('Authorization', `Bearer ${bladeToken}`)
        .send({
          url: 'https://stonemarket.com/gallery/gangsaw-cutting-demo.jpg',
          title: 'High-Speed Gangsaw Cutting Demo',
          category: 'cutting_demo',
          is_cover: true
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('High-Speed Gangsaw Cutting Demo');
    });

    it('POST /api/diamond-blades/gallery/videos - should add video demo to gallery', async () => {
      const res = await request(app)
        .post('/api/diamond-blades/gallery/videos')
        .set('Authorization', `Bearer ${bladeToken}`)
        .send({
          title: 'Automated Laser Blade Welding in Action',
          video_url: 'https://youtube.com/watch?v=laser-welding-demo',
          source_type: 'youtube',
          category: 'segment_brazing',
          duration: '03:15'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Automated Laser Blade Welding in Action');
    });
  });

  // ==========================================
  // 6. VERIFICATION CENTER
  // ==========================================
  describe('6. Verification Center', () => {
    it('GET /api/diamond-blades/verification - should get verification status', async () => {
      const res = await request(app)
        .get('/api/diamond-blades/verification')
        .set('Authorization', `Bearer ${bladeToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.is_verified).toBe(true);
      expect(res.body.data.gst_number).toBe('08AABCD8877E1Z5');
    });

    it('POST /api/diamond-blades/verification/gst - should verify GSTIN', async () => {
      const res = await request(app)
        .post('/api/diamond-blades/verification/gst')
        .set('Authorization', `Bearer ${bladeToken}`)
        .send({ gstin: '08AABCD8877E1Z5' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('verified');
      expect(res.body.data.gstin).toBe('08AABCD8877E1Z5');
    });
  });

  // ==========================================
  // 7. ANALYTICS ENGINE
  // ==========================================
  describe('7. Analytics Engine', () => {
    it('GET /api/diamond-blades/analytics - should return summary, top products, and monthly trends', async () => {
      const res = await request(app)
        .get('/api/diamond-blades/analytics')
        .set('Authorization', `Bearer ${bladeToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.summary.total_profile_views).toBeDefined();
      expect(res.body.data.top_performing_products.length).toBeGreaterThan(0);
    });

    it('POST /api/diamond-blades/analytics/event - should record product inquiry or view event', async () => {
      const res = await request(app)
        .post('/api/diamond-blades/analytics/event')
        .set('Authorization', `Bearer ${bladeToken}`)
        .send({
          event_type: 'product_view',
          product_id: testBladeProduct._id.toString(),
          metadata: { source: 'mobile_app', filter: 'diamond_segments' }
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.event_type).toBe('product_view');
    });
  });

  // ==========================================
  // 8. INQUIRIES & LEAD MANAGEMENT
  // ==========================================
  describe('8. Inquiries & Lead Management', () => {
    beforeEach(async () => {
      await Inquiry.create({
        businessId: bladeProfile._id,
        vendorId: bladeProfile._id,
        senderId: customerUser._id,
        category: 'Diamond Blades & Segments',
        subject: 'Quotation for 500 Pcs Diamond Gangsaw Segments',
        message: 'Looking for 500 Pcs Cobalt matrix segments compatible with Black Galaxy granite.',
        status: 'pending',
        inquiry_type: 'quotation',
        preferred_contact_method: 'phone'
      });
    });

    it('GET /api/diamond-blades/inquiries - should return business inquiries', async () => {
      const res = await request(app)
        .get('/api/diamond-blades/inquiries')
        .set('Authorization', `Bearer ${bladeToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data[0].subject).toContain('Diamond Gangsaw Segments');
    });

    it('GET /api/diamond-blades/leads - should return relevant diamond blades leads', async () => {
      const res = await request(app)
        .get('/api/diamond-blades/leads')
        .set('Authorization', `Bearer ${bladeToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ==========================================
  // 9. SHARED MODULES INTEGRATION
  // ==========================================
  describe('9. Shared Modules Integration (Settings, Promotions, Invoices)', () => {
    it('GET /api/diamond-blades/settings - should access account settings for diamond_blades', async () => {
      const res = await request(app)
        .get('/api/diamond-blades/settings')
        .set('Authorization', `Bearer ${bladeToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.business_profile_card).toBeDefined();
      expect(res.body.data.business_profile_card.company_name).toBe('DiamondEdge Blades & Segment Works');
    });

    it('GET /api/diamond-blades/promotions - should access promotions for diamond_blades', async () => {
      const res = await request(app)
        .get('/api/diamond-blades/promotions')
        .set('Authorization', `Bearer ${bladeToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('GET /api/diamond-blades/invoices - should access promotion invoices for diamond_blades', async () => {
      const res = await request(app)
        .get('/api/diamond-blades/invoices')
        .set('Authorization', `Bearer ${bladeToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});

