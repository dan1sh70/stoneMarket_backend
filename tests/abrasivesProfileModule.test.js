const request = require('supertest');
const app = require('../server');
const User = require('../src/models/User');
const BusinessProfile = require('../src/models/BusinessProfile');
const Product = require('../src/models/Product');
const Inquiry = require('../src/models/Inquiry');
const StockHistory = require('../src/models/StockHistory');
const jwt = require('jsonwebtoken');

describe('Stone Abrasives & Epoxy Chemicals Module - Comprehensive Suite', () => {
  let abrasivesUser, customerUser;
  let abrasivesToken, customerToken;
  let abrasivesProfile;
  let testProduct;

  beforeEach(async () => {
    // 1. Abrasives & Epoxy Chemicals User & Profile
    abrasivesUser = await User.create({
      name: 'Suresh Agarwal',
      mobile: '9829065432',
      email: 'suresh.abrasives@apextools.com',
      password: 'password123',
      role: 'abrasives_epoxy',
      status: 'active'
    });

    abrasivesToken = jwt.sign(
      { id: abrasivesUser._id, role: abrasivesUser.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1h' }
    );

    abrasivesProfile = await BusinessProfile.create({
      userId: abrasivesUser._id,
      business_type: 'abrasives_epoxy',
      company_name: 'Apex Diamond Abrasives & Epoxy Chemicals',
      business_category: 'Abrasives & Epoxy Chemicals',
      business_subcategory: 'Industrial Stone Diamond Abrasives, Epoxy Resins & Adhesives',
      short_description: 'Authorized distributor and manufacturer of diamond abrasives, epoxy resins, and mastic adhesives for marble and granite processing.',
      about_business: 'Apex Diamond Abrasives & Epoxy Chemicals provides high-performance Frankfurt & Fickert diamond polishing bricks, ultra-clear UV resistant epoxy mastic, and stone bonding joint adhesives.',
      established_year: 2016,
      abrasive_product_categories: [
        'Diamond Abrasive Brick (Fickert/Frankfurt)',
        'Epoxy Chemical',
        'Epoxy Resin Mastic',
        'Stone Bonding Adhesive',
        'Polishing Powder'
      ],
      brands_available: ['Tenax', 'Akemi', 'Bellinzoni', 'Diamond Tech'],
      product_range: 'Industrial Diamond Abrasives & Epoxy Chemicals',
      distribution_capability: 'Pan-India Distribution & Wholesale Supply',
      address: {
        state: 'Rajasthan',
        district: 'Jaipur',
        area: 'VKI Area',
        industrial_area: 'VKI Industrial Area',
        commercial_area: 'Road No. 9',
        office_address: 'Plot 88, Road No. 9, VKI Industrial Area, Jaipur',
        full_address: 'Plot 88, Road No. 9, VKI Industrial Area, Jaipur, Rajasthan 302013',
        postal_code: '302013',
        country: 'India'
      },
      owners: [
        {
          name: 'Suresh Agarwal',
          designation: 'Managing Director & Technical Head',
          phone: '+91 98290 65432',
          email: 'abrasives@stonemarket.com',
          whatsapp: '+91 98290 65432',
          is_primary: true
        }
      ],
      gallery_photos: [
        {
          url: 'https://stonemarket.com/uploads/warehouse-1.jpg',
          title: 'Abrasives Warehouse',
          category: 'warehouse',
          is_cover: true
        }
      ],
      gallery_videos: [
        {
          title: 'Epoxy Application Demo',
          url: 'https://stonemarket.com/videos/epoxy-demo.mp4',
          video_url: 'https://stonemarket.com/videos/epoxy-demo.mp4',
          source_type: 'upload',
          category: 'product_demo',
          duration: '2:15'
        }
      ],
      verification_steps: {
        phone: { phone: '+91 98290 65432', status: 'verified', verified_at: new Date() },
        email: { email: 'abrasives@stonemarket.com', status: 'verified', verified_at: new Date() },
        business: { registration_type: 'MSME / Udyam', registration_number: 'UDYAM-RJ-14-0065432', status: 'verified' },
        gst: { gstin: '08AAACA9876E1Z5', status: 'verified' }
      },
      is_verified: true,
      verification_status: 'approved',
      gst_number: '08AAACA9876E1Z5',
      rating: 4.8,
      review_count: 42,
      status: 'active'
    });

    // Create a base product
    testProduct = await Product.create({
      vendorId: abrasivesProfile._id,
      businessProfileId: abrasivesProfile._id,
      business_type: 'abrasives_epoxy',
      sku: 'ABR-2026-1001',
      name: 'Diamond Frankfurt Polishing Abrasive Bricks',
      category: 'Diamond Abrasive Brick (Fickert/Frankfurt)',
      brand_name: 'Diamond Tech',
      grit_grade: 'Grit 60# to 1200# Lux',
      packaging_standard: 'Set of 6 Pieces',
      selling_price: 1450,
      price: 1450,
      pricing_unit: 'Per Set',
      min_order_quantity: 5,
      available_stock: 120,
      stock: 120,
      stock_unit: 'Sets',
      availability_status: 'In Stock',
      technical_specifications: {
        bond_type: 'Magnesite & Synthetic Resin Bond',
        compatible_machine: 'Automated Line Polisher & Single Head Polisher',
        compatible_stone: 'Granite & Hard Marble',
        shape_profile: 'Frankfurt Standard'
      },
      status: 'active',
      publishing_status: 'published'
    });

    // 2. Customer User
    customerUser = await User.create({
      name: 'Vikas Sharma',
      mobile: '9829011223',
      email: 'vikas.buyer@gmail.com',
      password: 'password123',
      role: 'customer',
      status: 'active'
    });

    customerToken = jwt.sign(
      { id: customerUser._id, role: customerUser.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1h' }
    );
  });

  // ==========================================
  // 1. DASHBOARD & BUSINESS SWITCHER
  // ==========================================
  describe('1. Dashboard & Business Switcher', () => {
    it('should return complete abrasives dashboard with 4 operational summary cards', async () => {
      const res = await request(app)
        .get('/api/abrasives/dashboard')
        .set('Authorization', `Bearer ${abrasivesToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const data = res.body.data;

      // Business Profile Card
      expect(data.business_profile_card).toBeDefined();
      expect(data.business_profile_card.business_name).toBe('Apex Diamond Abrasives & Epoxy Chemicals');
      expect(data.business_profile_card.business_type_badge).toBe('Abrasives & Epoxy Chemicals');
      expect(data.business_profile_card.rating).toBe(4.8);
      expect(data.business_profile_card.total_reviews).toBe(42);

      // Operational Summary Cards
      expect(data.operational_summary).toBeDefined();
      expect(data.operational_summary.card_1.label).toBe('Product Range');
      expect(data.operational_summary.card_2.label).toBe('Brands Available');
      expect(data.operational_summary.card_3.label).toBe('Product Categories');
      expect(data.operational_summary.card_4.label).toBe('Distribution Capability');

      // Stats
      expect(data.stats).toBeDefined();
      expect(data.stats.total_products).toBe(1);
      expect(data.stats.active_products).toBe(1);

      // My Business (6 items)
      expect(data.my_business).toHaveLength(6);
      expect(data.my_business.map(i => i.id)).toEqual([
        'profile',
        'products',
        'gallery',
        'verification',
        'analytics',
        'promotions'
      ]);

      // Business Activity (2 items)
      expect(data.business_activity).toHaveLength(2);
      expect(data.business_activity.map(i => i.id)).toEqual(['inquiries', 'leads']);

      // Capabilities
      expect(data.capabilities.is_product_based).toBe(true);
      expect(data.capabilities.has_products).toBe(true);
      expect(data.capabilities.has_inventory).toBe(true);
      expect(data.capabilities.has_services_management).toBe(false);
    });

    it('should retrieve available business types with abrasives marked current', async () => {
      const res = await request(app)
        .get('/api/abrasives/business-types')
        .set('Authorization', `Bearer ${abrasivesToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.current_type).toBe('abrasives_epoxy');
      const abrasivesType = res.body.data.types.find(t => t.id === 'abrasives_epoxy');
      expect(abrasivesType).toBeDefined();
      expect(abrasivesType.current).toBe(true);
      expect(abrasivesType.name).toBe('Abrasives & Epoxy Chemicals');
    });

    it('should allow switching business type to another role', async () => {
      const res = await request(app)
        .post('/api/abrasives/switch-business-type')
        .set('Authorization', `Bearer ${abrasivesToken}`)
        .send({ target_business_type: 'trader' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.business_type).toBe('trader');
      expect(res.body.data.redirect_url).toBe('/trader/dashboard');

      const updatedUser = await User.findById(abrasivesUser._id);
      expect(updatedUser.role).toBe('trader');
    });
  });

  // ==========================================
  // 2. PROFILE & OPERATIONAL SPECIFICATIONS
  // ==========================================
  describe('2. Profile & Operational Specifications', () => {
    it('should retrieve abrasives profile with operational specifications and catalogue summary', async () => {
      const res = await request(app)
        .get('/api/abrasives/profile')
        .set('Authorization', `Bearer ${abrasivesToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.company_name).toBe('Apex Diamond Abrasives & Epoxy Chemicals');
      expect(res.body.data.operational_specifications.product_range).toBe('Industrial Diamond Abrasives & Epoxy Chemicals');
      expect(res.body.data.operational_specifications.brands_available).toContain('Tenax');
      expect(res.body.data.products_and_spares_catalogue).toBeDefined();
      expect(res.body.data.products_and_spares_catalogue.total_listed_products).toBeGreaterThanOrEqual(1);
    });

    it('should update profile and operational specifications', async () => {
      const updateData = {
        company_name: 'Apex Global Diamond Tools & Chemical Technologies',
        product_range: 'High-Precision Polishing Bricks, UV Epoxies & Adhesives',
        distribution_capability: 'International Export & Pan-India Logistics',
        brands_available: ['Tenax', 'Akemi', 'Bellinzoni', 'Diamond Tech', 'Sika']
      };

      const res = await request(app)
        .put('/api/abrasives/profile')
        .set('Authorization', `Bearer ${abrasivesToken}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.company_name).toBe(updateData.company_name);
      expect(res.body.data.product_range).toBe(updateData.product_range);
      expect(res.body.data.brands_available).toContain('Sika');
    });
  });

  // ==========================================
  // 3. PRODUCT & SPARES MANAGEMENT (CRUD & 4-STEP WIZARD)
  // ==========================================
  describe('3. Product & Spares Management (4-Step Wizard & Lifecycle)', () => {
    it('should create an epoxy product via 4-step wizard with auto-generated SKU', async () => {
      const productPayload = {
        // Step 1: Basic & Media
        name: 'Epoxy Resin Mastic 3:1 Ultra Clear',
        category: 'Epoxy Resin Mastic',
        description: 'Premium transparent knife-grade epoxy mastic for filling cracks, holes and laminating granite and marble slabs.',
        images: ['https://stonemarket.com/abrasives/epoxy1.jpg'],
        cover_image: 'https://stonemarket.com/abrasives/epoxy1.jpg',

        // Step 2: Specifications
        grit_grade: 'UV Resistant Ultra Gloss Grade',
        brand_name: 'Tenax',
        packaging_standard: '20 Kg Bucket',
        technical_specifications: {
          chemical_type: 'Liquid Epoxy Resin System',
          mixing_ratio: '3:1 by Weight',
          viscosity: 'Medium Thixotropic Paste',
          curing_time: '24 Hours Full Cure (Gel time 25 mins)',
          shelf_life: '12 Months in Cool Storage'
        },

        // Step 3: Pricing & Stock
        selling_price: 380,
        pricing_unit: 'Per Kg',
        min_order_quantity: 20,
        available_stock: 500,
        stock_unit: 'Kg',
        availability_status: 'In Stock',

        // Step 4: Target Area & Target Categories
        target_areas: [
          { state_name: 'Rajasthan', districts: ['Jaipur', 'Kishangarh', 'Udaipur'] },
          { state_name: 'Gujarat', districts: ['Ahmedabad', 'Morbi'] }
        ],
        target_categories: ['Manufacturer', 'Mining', 'Showroom', 'Abrasive & Epoxy'],
        status: 'active'
      };

      const res = await request(app)
        .post('/api/abrasives/products')
        .set('Authorization', `Bearer ${abrasivesToken}`)
        .send(productPayload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe(productPayload.name);
      expect(res.body.data.sku).toMatch(/^EPX-\d{4}-\d{4}$/);
      expect(res.body.data.selling_price).toBe(380);
      expect(res.body.data.pricing_unit).toBe('Per Kg');
      expect(res.body.data.available_stock).toBe(500);
      expect(res.body.data.status).toBe('active');
    });

    it('should fail product creation when required fields are missing', async () => {
      const res = await request(app)
        .post('/api/abrasives/products')
        .set('Authorization', `Bearer ${abrasivesToken}`)
        .send({
          name: 'Incomplete Chemical'
          // missing category, grit_grade, brand_name, selling_price, pricing_unit
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBeDefined();
    });

    it('should list products with status breakdown and search filter', async () => {
      // Create second draft product
      await Product.create({
        vendorId: abrasivesProfile._id,
        businessProfileId: abrasivesProfile._id,
        business_type: 'abrasives_epoxy',
        sku: 'ABR-2026-9002',
        name: 'Tenax Fast Joint Epoxy Adhesive Paste',
        category: 'Stone Bonding Adhesive',
        brand_name: 'Tenax',
        grit_grade: 'High Tensile Structural Paste',
        packaging_standard: '1.5 Kg Tin',
        selling_price: 420,
        price: 420,
        pricing_unit: 'Per Tin',
        available_stock: 40,
        status: 'draft',
        publishing_status: 'draft'
      });

      // Get all products
      const resAll = await request(app)
        .get('/api/abrasives/products?status=all')
        .set('Authorization', `Bearer ${abrasivesToken}`);

      expect(resAll.status).toBe(200);
      expect(resAll.body.success).toBe(true);
      expect(resAll.body.data.counts.all).toBeGreaterThanOrEqual(2);
      expect(resAll.body.data.counts.active).toBeGreaterThanOrEqual(1);
      expect(resAll.body.data.counts.draft).toBeGreaterThanOrEqual(1);

      // Search by brand / keyword
      const resSearch = await request(app)
        .get('/api/abrasives/products?search=Tenax')
        .set('Authorization', `Bearer ${abrasivesToken}`);

      expect(resSearch.status).toBe(200);
      expect(resSearch.body.data.products.length).toBe(1);
      expect(resSearch.body.data.products[0].name).toContain('Tenax');
    });

    it('should get product details by id', async () => {
      const res = await request(app)
        .get(`/api/abrasives/products/${testProduct._id}`)
        .set('Authorization', `Bearer ${abrasivesToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id.toString()).toBe(testProduct._id.toString());
      expect(res.body.data.brand_name).toBe('Diamond Tech');
    });

    it('should update product details', async () => {
      const res = await request(app)
        .put(`/api/abrasives/products/${testProduct._id}`)
        .set('Authorization', `Bearer ${abrasivesToken}`)
        .send({
          selling_price: 1550,
          packaging_standard: 'Set of 6 Pieces (Reinforced Plastic Box)'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.selling_price).toBe(1550);
      expect(res.body.data.packaging_standard).toContain('Reinforced Plastic Box');
    });

    it('should update product stock and record stock history', async () => {
      const res = await request(app)
        .patch(`/api/abrasives/products/${testProduct._id}/stock`)
        .set('Authorization', `Bearer ${abrasivesToken}`)
        .send({
          stock: 250,
          change_type: 'set',
          notes: 'Received fresh consignment from factory'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.updated_stock).toBe(250);

      const history = await StockHistory.findOne({ productId: testProduct._id }).sort({ createdAt: -1 });
      expect(history).toBeDefined();
      expect(history.updated_stock).toBe(250);
    });

    it('should duplicate an existing product as draft with (Copy) suffix', async () => {
      const res = await request(app)
        .post(`/api/abrasives/products/${testProduct._id}/duplicate`)
        .set('Authorization', `Bearer ${abrasivesToken}`);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toContain('(Copy)');
      expect(res.body.data.status).toBe('draft');
      expect(res.body.data.sku).toMatch(/^(ABR|EPX)-\d{4}-\d{4}$/);
      expect(res.body.data._id.toString()).not.toBe(testProduct._id.toString());
    });

    it('should toggle product status between active and inactive', async () => {
      const resToggle = await request(app)
        .patch(`/api/abrasives/products/${testProduct._id}/status`)
        .set('Authorization', `Bearer ${abrasivesToken}`);

      expect(resToggle.status).toBe(200);
      expect(resToggle.body.success).toBe(true);
      expect(resToggle.body.data.status).toBe('inactive');

      // Toggle back to active
      const resBack = await request(app)
        .patch(`/api/abrasives/products/${testProduct._id}/status`)
        .set('Authorization', `Bearer ${abrasivesToken}`)
        .send({ status: 'active' });

      expect(resBack.status).toBe(200);
      expect(resBack.body.data.status).toBe('active');
    });

    it('should delete a product by id', async () => {
      const res = await request(app)
        .delete(`/api/abrasives/products/${testProduct._id}`)
        .set('Authorization', `Bearer ${abrasivesToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const check = await Product.findById(testProduct._id);
      expect(check).toBeNull();
    });
  });

  // ==========================================
  // 4. CONTACTS / KEY PERSONS
  // ==========================================
  describe('4. Contacts Management', () => {
    it('should add a new contact person', async () => {
      const res = await request(app)
        .post('/api/abrasives/contacts')
        .set('Authorization', `Bearer ${abrasivesToken}`)
        .send({
          name: 'Prakash Sharma',
          designation: 'Senior Chemical Application Engineer',
          phone: '+91 98290 77777',
          whatsapp: '+91 98290 77777',
          email: 'prakash@apextools.com',
          is_primary: false
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Prakash Sharma');
    });

    it('should get list of contacts', async () => {
      const res = await request(app)
        .get('/api/abrasives/contacts')
        .set('Authorization', `Bearer ${abrasivesToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('should update a contact person', async () => {
      const primaryContact = abrasivesProfile.owners[0];
      const res = await request(app)
        .put(`/api/abrasives/contacts/${primaryContact._id}`)
        .set('Authorization', `Bearer ${abrasivesToken}`)
        .send({
          designation: 'Chief Executive Officer'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.designation).toBe('Chief Executive Officer');
    });

    it('should delete a contact person', async () => {
      const primaryContact = abrasivesProfile.owners[0];
      const res = await request(app)
        .delete(`/api/abrasives/contacts/${primaryContact._id}`)
        .set('Authorization', `Bearer ${abrasivesToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ==========================================
  // 5. GALLERY MANAGEMENT
  // ==========================================
  describe('5. Gallery Management', () => {
    it('should upload a gallery photo', async () => {
      const res = await request(app)
        .post('/api/abrasives/gallery/photos')
        .set('Authorization', `Bearer ${abrasivesToken}`)
        .send({
          url: 'https://stonemarket.com/uploads/epoxy-display.jpg',
          title: 'Epoxy & Mastic Display Rack',
          caption: 'Ready stock of Tenax and Akemi products',
          category: 'epoxy',
          is_cover: false
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Epoxy & Mastic Display Rack');
    });

    it('should add a gallery video', async () => {
      const res = await request(app)
        .post('/api/abrasives/gallery/videos')
        .set('Authorization', `Bearer ${abrasivesToken}`)
        .send({
          title: 'Diamond Polishing Brick Live Test',
          video_url: 'https://stonemarket.com/videos/brick-test.mp4',
          youtube_url: 'https://youtube.com/watch?v=epoxy123',
          source_type: 'youtube',
          category: 'product_demo',
          duration: '3:45'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Diamond Polishing Brick Live Test');
    });

    it('should get gallery photos and videos', async () => {
      const res = await request(app)
        .get('/api/abrasives/gallery')
        .set('Authorization', `Bearer ${abrasivesToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.photos.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data.videos.length).toBeGreaterThanOrEqual(1);
    });

    it('should delete gallery photo and video', async () => {
      const photoId = abrasivesProfile.gallery_photos[0]._id;
      const videoId = abrasivesProfile.gallery_videos[0]._id;

      const resPhoto = await request(app)
        .delete(`/api/abrasives/gallery/photos/${photoId}`)
        .set('Authorization', `Bearer ${abrasivesToken}`);

      expect(resPhoto.status).toBe(200);

      const resVideo = await request(app)
        .delete(`/api/abrasives/gallery/videos/${videoId}`)
        .set('Authorization', `Bearer ${abrasivesToken}`);

      expect(resVideo.status).toBe(200);
    });
  });

  // ==========================================
  // 6. VERIFICATION CENTER
  // ==========================================
  describe('6. Verification Center', () => {
    it('should retrieve verification status', async () => {
      const res = await request(app)
        .get('/api/abrasives/verification')
        .set('Authorization', `Bearer ${abrasivesToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.overall_progress).toBe(100);
      expect(res.body.data.is_verified).toBe(true);
    });

    it('should send and verify phone OTP', async () => {
      const sendRes = await request(app)
        .post('/api/abrasives/verification/phone/send-otp')
        .set('Authorization', `Bearer ${abrasivesToken}`);

      expect(sendRes.status).toBe(200);

      const verifyRes = await request(app)
        .post('/api/abrasives/verification/phone/verify-otp')
        .set('Authorization', `Bearer ${abrasivesToken}`)
        .send({
          phone: '+91 98290 65432',
          otp: '123456'
        });

      expect(verifyRes.status).toBe(200);
      expect(verifyRes.body.success).toBe(true);
      expect(verifyRes.body.data.status).toBe('verified');
    });

    it('should submit GST verification', async () => {
      const res = await request(app)
        .post('/api/abrasives/verification/gst')
        .set('Authorization', `Bearer ${abrasivesToken}`)
        .send({ gstin: '08AAACA9876E1Z5' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.gstin).toBe('08AAACA9876E1Z5');
    });

    it('should upload verification document', async () => {
      const res = await request(app)
        .post('/api/abrasives/verification/documents')
        .set('Authorization', `Bearer ${abrasivesToken}`)
        .send({
          document_name: 'Tenax Brand Authorization Certificate',
          document_type: 'Brand Authorization',
          document_number: 'AUTH-TNX-2026-99'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.document_name).toBe('Tenax Brand Authorization Certificate');
    });
  });

  // ==========================================
  // 7. ANALYTICS ENGINE
  // ==========================================
  describe('7. Analytics Engine', () => {
    it('should load abrasives analytics data', async () => {
      const res = await request(app)
        .get('/api/abrasives/analytics')
        .set('Authorization', `Bearer ${abrasivesToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.metrics.total_profile_views).toBeDefined();
      expect(res.body.data.chart_data.timeline).toHaveLength(7);
    });

    it('should record an analytics event', async () => {
      const res = await request(app)
        .post('/api/abrasives/analytics/event')
        .set('Authorization', `Bearer ${abrasivesToken}`)
        .send({
          event_type: 'product_view',
          product_id: testProduct._id.toString(),
          metadata: { source: 'product_listing' }
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });

  // ==========================================
  // 8. INQUIRIES & LEAD MANAGEMENT
  // ==========================================
  describe('8. Inquiries & Lead Management', () => {
    beforeEach(async () => {
      await Inquiry.create({
        businessId: abrasivesProfile._id,
        senderId: customerUser._id,
        category: 'Abrasives & Epoxy Chemicals',
        subject: 'Requirement for 50 buckets of Epoxy Mastic (Clear)',
        message: 'Looking for bulk pricing for factory in Kishangarh.',
        status: 'pending'
      });
    });

    it('should retrieve inquiries for abrasives business', async () => {
      const res = await request(app)
        .get('/api/abrasives/inquiries')
        .set('Authorization', `Bearer ${abrasivesToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('should retrieve matching leads for abrasives business', async () => {
      const res = await request(app)
        .get('/api/abrasives/leads')
        .set('Authorization', `Bearer ${abrasivesToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ==========================================
  // 9. SHARED MODULES & CMS ALIASES
  // ==========================================
  describe('9. Shared Modules & CMS Aliases', () => {
    it('should allow abrasives business to access promotions (Ad Management)', async () => {
      const res = await request(app)
        .get('/api/abrasives/promotions')
        .set('Authorization', `Bearer ${abrasivesToken}`);

      expect(res.status).toBe(200);
    });

    it('should allow abrasives business to access account settings', async () => {
      const res = await request(app)
        .get('/api/abrasives/settings')
        .set('Authorization', `Bearer ${abrasivesToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.business_profile_card).toBeDefined();
      expect(res.body.data.business_profile_card.company_name).toBe('Apex Diamond Abrasives & Epoxy Chemicals');
    });

    it('should allow abrasives business to access invoices', async () => {
      const res = await request(app)
        .get('/api/abrasives/invoices')
        .set('Authorization', `Bearer ${abrasivesToken}`);

      expect(res.status).toBe(200);
    });

    it('should support /api/cms/abrasives/dashboard alias', async () => {
      const res = await request(app)
        .get('/api/cms/abrasives/dashboard')
        .set('Authorization', `Bearer ${abrasivesToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.business_profile_card.business_name).toBe('Apex Diamond Abrasives & Epoxy Chemicals');
    });
  });
});

