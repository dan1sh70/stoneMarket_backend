const request = require('supertest');
const app = require('../server');
const User = require('../src/models/User');
const BusinessProfile = require('../src/models/BusinessProfile');
const Product = require('../src/models/Product');
const StockHistory = require('../src/models/StockHistory');
const Inquiry = require('../src/models/Inquiry');
const Lead = require('../src/models/Lead');
const AnalyticsEvent = require('../src/models/AnalyticsEvent');
const jwt = require('jsonwebtoken');

describe('Showroom Profile & Business Module (Phase 1)', () => {
  let showroomUser;
  let showroomToken;
  let showroomProfile;

  beforeEach(async () => {
    // 1. Create Showroom User & Token
    showroomUser = await User.create({
      name: 'Suresh Sharma',
      mobile: '9829012345',
      email: 'suresh.showroom@mockstonemarket.com',
      password: 'password123',
      role: 'showroom',
      status: 'active'
    });

    showroomToken = jwt.sign(
      { id: showroomUser._id, role: showroomUser.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1h' }
    );

    // 2. Create Business Profile for Showroom
    showroomProfile = await BusinessProfile.create({
      userId: showroomUser._id,
      business_type: 'showroom',
      company_name: 'Royal Stone Gallery & Godown',
      business_category: 'Godown & Showrooms',
      business_subcategory: 'Granite & Marble Showroom',
      short_description: 'Premier stone gallery with massive live displays and warehouse stock.',
      about_business: 'Wholesale and retail natural stone surfaces, granite slabs and imported marbles.',
      established_year: 2018,
      showroom_type: 'Retail & Wholesale',
      total_display_area: 15000,
      display_area_unit: 'Sq.ft',
      total_storage_capacity: 60000,
      storage_capacity_unit: 'Sq.ft',
      stone_categories_available: [
        'Granite',
        'Marble',
        'Sandstone',
        'Limestone',
        'Quartzite',
        'Tiles',
        'Other Natural Stones'
      ],
      gst_number: '08AAAAA0000A1Z5',
      business_registration_number: 'REG-RJ-2018-7821',
      monthly_capacity: 50000,
      capacity_unit: 'Sq.Ft',
      rating: 4.8,
      review_count: 18,
      status: 'active',
      is_mock: false,
      address: {
        full_address: 'E-210, Mansarovar Industrial Area, Jaipur, Rajasthan',
        showroom_address: 'E-210, Mansarovar Industrial Area, Jaipur, Rajasthan',
        commercial_area: 'Mansarovar Commercial Stone Hub',
        industrial_area: 'Mansarovar Industrial Area',
        district: 'Jaipur',
        state: 'Rajasthan',
        country: 'India',
        postal_code: '302020',
        google_map_location: 'https://maps.google.com/?q=26.8532,75.7675',
        latitude: 26.8532,
        longitude: 75.7675
      },
      owners: [
        {
          name: 'Suresh Sharma',
          designation: 'Managing Partner & Director',
          phone: '9829012345',
          email: 'suresh.showroom@mockstonemarket.com',
          is_primary: true
        }
      ]
    });
  });

  // ==========================================
  // 1. BUSINESS TYPE SWITCHING
  // ==========================================
  describe('Business Type Switching', () => {
    it('GET /api/showroom/business-types - lists business types with current selection', async () => {
      const res = await request(app)
        .get('/api/showroom/business-types')
        .set('Authorization', `Bearer ${showroomToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.current_business_type).toBe('showroom');
      expect(Array.isArray(res.body.data.available_types)).toBe(true);
      const showroomType = res.body.data.available_types.find(t => t.id === 'showroom');
      expect(showroomType).toBeDefined();
      expect(showroomType.name).toBe('Godown & Showrooms');
      expect(showroomType.is_current).toBe(true);
    });

    it('POST /api/showroom/switch-business-type - successfully switches role and returns target redirect', async () => {
      const res = await request(app)
        .post('/api/showroom/switch-business-type')
        .set('Authorization', `Bearer ${showroomToken}`)
        .send({ target_type: 'showroom' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.business_type).toBe('showroom');
      expect(res.body.data.redirect_url).toBe('/showroom/dashboard');
    });

    it('POST /api/showroom/switch-business-type - validates invalid business type', async () => {
      const res = await request(app)
        .post('/api/showroom/switch-business-type')
        .set('Authorization', `Bearer ${showroomToken}`)
        .send({ target_type: 'invalid_type_xyz' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // ==========================================
  // 2. SHOWROOM DASHBOARD
  // ==========================================
  describe('Showroom Dashboard', () => {
    it('GET /api/showroom/dashboard - returns profile card, quick stats and navigation menus', async () => {
      // Seed a product for this showroom
      await Product.create({
        vendorId: showroomProfile._id,
        businessProfileId: showroomProfile._id,
        business_type: 'showroom',
        name: 'Black Galaxy Granite Slabs',
        material: 'Granite',
        selling_price: 180,
        price: 180,
        pricing_unit: 'Per Sq.ft',
        available_stock: 4500,
        stock: 4500,
        stock_unit: 'Sq.ft',
        status: 'active'
      });

      const res = await request(app)
        .get('/api/showroom/dashboard')
        .set('Authorization', `Bearer ${showroomToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      const data = res.body.data;

      // Profile Card
      expect(data.business_profile_card.company_name).toBe('Royal Stone Gallery & Godown');
      expect(data.business_profile_card.business_category).toBe('Godown & Showrooms');
      expect(data.business_profile_card.showroom_type).toBe('Retail & Wholesale');
      expect(data.business_profile_card.location).toContain('Jaipur');

      // Quick Stats
      expect(data.quick_stats.total_products).toBeGreaterThanOrEqual(1);
      expect(data.quick_stats.active_products).toBeGreaterThanOrEqual(1);
      expect(data.quick_stats.total_available_stock).toBeGreaterThanOrEqual(4500);

      // Menus
      expect(Array.isArray(data.my_business)).toBe(true);
      expect(Array.isArray(data.business_activity)).toBe(true);
      expect(Array.isArray(data.account_support)).toBe(true);
      expect(Array.isArray(data.bottom_navigation)).toBe(true);
    });
  });

  // ==========================================
  // 3. SHOWROOM PROFILE & SPECIFICATIONS
  // ==========================================
  describe('Showroom Profile & Specifications', () => {
    it('GET /api/showroom/profile - retrieves comprehensive showroom profile with specifications', async () => {
      const res = await request(app)
        .get('/api/showroom/profile')
        .set('Authorization', `Bearer ${showroomToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      const data = res.body.data;

      expect(data.business_information.company_name).toBe('Royal Stone Gallery & Godown');
      expect(data.business_information.business_category).toBe('Godown & Showrooms');
      expect(data.showroom_specifications.showroom_type).toBe('Retail & Wholesale');
      expect(data.showroom_specifications.total_display_area).toBe(15000);
      expect(data.showroom_specifications.total_storage_capacity).toBe(60000);
      expect(Array.isArray(data.stone_categories_available)).toBe(true);
      expect(data.enterprise_tax.gstin).toBe('08AAAAA0000A1Z5');
      expect(data.registered_address.district).toBe('Jaipur');
    });

    it('PUT /api/showroom/profile - updates general showroom business details', async () => {
      const res = await request(app)
        .put('/api/showroom/profile')
        .set('Authorization', `Bearer ${showroomToken}`)
        .send({
          company_name: 'Royal Stone Gallery, Godown & Studios',
          short_description: 'Updated leading stone gallery in Jaipur Rajasthan',
          showroom_type: 'Distribution Centre'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.company_name).toBe('Royal Stone Gallery, Godown & Studios');
      expect(res.body.data.short_description).toBe('Updated leading stone gallery in Jaipur Rajasthan');
      expect(res.body.data.showroom_type).toBe('Distribution Centre');
    });

    it('PUT /api/showroom/specs - updates showroom operational specs and stone categories', async () => {
      const res = await request(app)
        .put('/api/showroom/specs')
        .set('Authorization', `Bearer ${showroomToken}`)
        .send({
          showroom_type: 'Wholesale Godown',
          total_display_area: 18000,
          display_area_unit: 'Sq.ft',
          total_storage_capacity: 75000,
          storage_capacity_unit: 'Sq.ft',
          stone_categories_available: ['Granite', 'Marble', 'Engineered Stone', 'Tiles'],
          factory_timings: '08:30 AM - 08:30 PM'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.showroom_type).toBe('Wholesale Godown');
      expect(res.body.data.total_display_area).toBe(18000);
      expect(res.body.data.total_storage_capacity).toBe(75000);
      expect(res.body.data.stone_categories_available).toHaveLength(4);
    });
  });

  // ==========================================
  // 4. OWNERSHIP & KEY CONTACTS
  // ==========================================
  describe('Ownership & Key Contacts Management', () => {
    it('GET /api/showroom/contacts - retrieves showroom contacts', async () => {
      const res = await request(app)
        .get('/api/showroom/contacts')
        .set('Authorization', `Bearer ${showroomToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data[0].name).toBe('Suresh Sharma');
    });

    it('POST /api/showroom/contacts - adds a new partner/director', async () => {
      const res = await request(app)
        .post('/api/showroom/contacts')
        .set('Authorization', `Bearer ${showroomToken}`)
        .send({
          name: 'Vikas Sharma',
          designation: 'Operations Director',
          phone: '9829099887',
          email: 'vikas.sharma@mockstonemarket.com',
          is_primary: false
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Vikas Sharma');
      expect(res.body.data.designation).toBe('Operations Director');
    });

    it('PUT & DELETE /api/showroom/contacts/:id - modifies and deletes contact', async () => {
      // Create contact to test update & delete
      const addRes = await request(app)
        .post('/api/showroom/contacts')
        .set('Authorization', `Bearer ${showroomToken}`)
        .send({
          name: 'Temporary Contact',
          designation: 'Showroom Assistant',
          phone: '9829000000'
        });

      const contactId = addRes.body.data._id;

      // Update
      const updateRes = await request(app)
        .put(`/api/showroom/contacts/${contactId}`)
        .set('Authorization', `Bearer ${showroomToken}`)
        .send({
          designation: 'Senior Showroom Manager'
        });

      expect(updateRes.statusCode).toBe(200);
      expect(updateRes.body.data.designation).toBe('Senior Showroom Manager');

      // Delete
      const deleteRes = await request(app)
        .delete(`/api/showroom/contacts/${contactId}`)
        .set('Authorization', `Bearer ${showroomToken}`);

      expect(deleteRes.statusCode).toBe(200);
      expect(deleteRes.body.success).toBe(true);
    });
  });

  // ==========================================
  // 5. SHOWROOM PRODUCT MANAGEMENT & 4-STEP WIZARD
  // ==========================================
  describe('Showroom Product Management & 4-Step Wizard', () => {
    it('POST /api/showroom/products - creates product through 4-step wizard with auto-generated SKU and StockHistory', async () => {
      const wizardPayload = {
        // Step 1: Basic & Media
        name: 'Alaska White Granite Slabs',
        material: 'Granite',
        short_description: 'Exquisite Alaska White Granite polished slabs for luxury interiors and kitchen islands.',
        description: 'Premium grade Alaska White Granite with crystalline quartz patterns.',
        product_origin: 'Rajasthan, India',
        images: ['https://example.com/alaska1.jpg', 'https://example.com/alaska2.jpg'],
        cover_image: 'https://example.com/alaska1.jpg',

        // Step 2: Specifications
        pattern: 'Natural Pattern',
        finish: 'High Gloss Polished',
        size: '10 × 6 ft',
        thickness: '20 mm',
        quality: 'Premium',
        application: 'Flooring, Kitchen Tops, Countertops',
        approx_weight: '75 Kg / Sq.m',
        country_of_origin: 'India',

        // Step 3: Pricing & Stock
        selling_price: 210,
        pricing_unit: 'Per Sq.ft',
        quantity: 5000,
        quantity_unit: 'Sq.ft',
        available_stock: 5000,
        stock_unit: 'Sq.ft',
        availability_status: 'In Stock',
        low_stock_threshold: 200,

        // Step 4: Review & Target Publishing
        target_publishing: {
          states: ['Rajasthan', 'Delhi NCR', 'Maharashtra', 'Gujarat'],
          districts: ['All India'],
          categories: ['Manufacturer', 'Showroom', 'Customer', 'Trader']
        },
        status: 'active',
        publishing_status: 'published'
      };

      const res = await request(app)
        .post('/api/showroom/products')
        .set('Authorization', `Bearer ${showroomToken}`)
        .send(wizardPayload);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      const product = res.body.data;

      expect(product.name).toBe('Alaska White Granite Slabs');
      expect(product.sku).toMatch(/^SHW-GRAN-\d{4}-\d{4}$/);
      expect(product.selling_price).toBe(210);
      expect(product.price).toBe(210);
      expect(product.available_stock).toBe(5000);
      expect(product.stock).toBe(5000);
      expect(product.is_low_stock).toBe(false);
      expect(product.is_out_of_stock).toBe(false);

      // Verify StockHistory entry created
      const history = await StockHistory.findOne({ productId: product._id });
      expect(history).toBeDefined();
      expect(history.change_type).toBe('set');
      expect(history.updated_stock).toBe(5000);
    });

    it('GET /api/showroom/products - retrieves product list with search and material filtering', async () => {
      // Create test product
      await Product.create({
        vendorId: showroomProfile._id,
        businessProfileId: showroomProfile._id,
        business_type: 'showroom',
        name: 'Makrana White Marble Tiles',
        material: 'Marble',
        short_description: 'Pure Makrana white marble tiles.',
        size: '2 × 2 ft',
        thickness: '15 mm',
        finish: 'Mirror Polished',
        selling_price: 140,
        price: 140,
        pricing_unit: 'Per Sq.ft',
        available_stock: 1200,
        stock: 1200,
        status: 'active'
      });

      const res = await request(app)
        .get('/api/showroom/products?material=Marble')
        .set('Authorization', `Bearer ${showroomToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.products.length).toBeGreaterThanOrEqual(1);
      const prod = res.body.data.products[0];
      expect(prod.material).toBe('Marble');
      expect(prod.name).toContain('Makrana White Marble');
    });

    it('GET /api/showroom/products/:id - retrieves product details with specs grid and pricing inventory', async () => {
      const product = await Product.create({
        vendorId: showroomProfile._id,
        businessProfileId: showroomProfile._id,
        business_type: 'showroom',
        sku: 'SHW-KOTA-2026-1122',
        name: 'Kota Stone Polished Tiles',
        material: 'Limestone',
        short_description: 'Naturally durable Kota Stone blue-green polished tiles.',
        pattern: 'Plain / Solid',
        finish: 'Polished',
        size: '2 × 2 ft',
        thickness: '22 mm',
        quality: 'Standard',
        selling_price: 45,
        price: 45,
        pricing_unit: 'Per Sq.ft',
        available_stock: 8000,
        stock: 8000,
        stock_unit: 'Sq.ft',
        status: 'active'
      });

      const res = await request(app)
        .get(`/api/showroom/products/${product._id}`)
        .set('Authorization', `Bearer ${showroomToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      const p = res.body.data.product;

      expect(p.name).toBe('Kota Stone Polished Tiles');
      expect(p.sku).toBe('SHW-KOTA-2026-1122');
      expect(p.specifications.finish).toBe('Polished');
      expect(p.specifications.size).toBe('2 × 2 ft');
      expect(p.pricing_inventory.selling_price).toBe(45);
      expect(p.pricing_inventory.available_stock).toBe(8000);
    });

    it('POST /api/showroom/products/:id/duplicate - clones product with new SKU and (Copy) suffix', async () => {
      const product = await Product.create({
        vendorId: showroomProfile._id,
        businessProfileId: showroomProfile._id,
        business_type: 'showroom',
        sku: 'SHW-GRAN-2026-5544',
        name: 'Black Galaxy Premium',
        material: 'Granite',
        short_description: 'Golden speckled black granite slab.',
        size: '10 × 5 ft',
        thickness: '18 mm',
        selling_price: 250,
        price: 250,
        available_stock: 600,
        stock: 600,
        status: 'active'
      });

      const res = await request(app)
        .post(`/api/showroom/products/${product._id}/duplicate`)
        .set('Authorization', `Bearer ${showroomToken}`);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Black Galaxy Premium (Copy)');
      expect(res.body.data.sku).not.toBe('SHW-GRAN-2026-5544');
      expect(res.body.data.sku).toMatch(/^SHW-GRAN-\d{4}-\d{4}$/);
      expect(res.body.data.status).toBe('draft');
    });

    it('DELETE /api/showroom/products/:id - deletes product and cleans up', async () => {
      const product = await Product.create({
        vendorId: showroomProfile._id,
        businessProfileId: showroomProfile._id,
        business_type: 'showroom',
        name: 'To Be Deleted Product',
        material: 'Granite',
        short_description: 'Temp product for deletion.',
        size: '8 × 4 ft',
        thickness: '18 mm',
        selling_price: 100,
        available_stock: 50
      });

      const res = await request(app)
        .delete(`/api/showroom/products/${product._id}`)
        .set('Authorization', `Bearer ${showroomToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);

      const check = await Product.findById(product._id);
      expect(check).toBeNull();
    });
  });

  // ==========================================
  // 6. INVENTORY MANAGEMENT & STOCK HISTORY
  // ==========================================
  describe('Showroom Inventory Management & Stock History', () => {
    it('PUT /api/showroom/products/:id/stock - adjusts stock, evaluates low stock / out of stock, and writes StockHistory', async () => {
      const product = await Product.create({
        vendorId: showroomProfile._id,
        businessProfileId: showroomProfile._id,
        business_type: 'showroom',
        name: 'Italian Botticino Marble',
        material: 'Marble',
        short_description: 'Imported beige Italian marble slabs.',
        size: '9 × 5 ft',
        thickness: '18 mm',
        selling_price: 350,
        price: 350,
        available_stock: 100,
        stock: 100,
        low_stock_threshold: 15,
        status: 'active'
      });

      // 1. Decrease stock to 10 (triggers low stock)
      const resLow = await request(app)
        .put(`/api/showroom/products/${product._id}/stock`)
        .set('Authorization', `Bearer ${showroomToken}`)
        .send({
          change_type: 'set',
          stock_value: 10,
          change_reason: 'Dispatched 90 sq.ft to villa project',
          updated_by: 'Suresh Sharma'
        });

      expect(resLow.statusCode).toBe(200);
      expect(resLow.body.success).toBe(true);
      expect(resLow.body.data.updated_stock).toBe(10);
      expect(resLow.body.data.is_low_stock).toBe(true);
      expect(resLow.body.data.is_out_of_stock).toBe(false);

      // 2. Decrease stock to 0 (triggers out of stock)
      const resOut = await request(app)
        .put(`/api/showroom/products/${product._id}/stock`)
        .set('Authorization', `Bearer ${showroomToken}`)
        .send({
          change_type: 'decrease',
          stock_value: 10,
          change_reason: 'Sold remaining 10 sq.ft sample batch'
        });

      expect(resOut.statusCode).toBe(200);
      expect(resOut.body.data.updated_stock).toBe(0);
      expect(resOut.body.data.is_out_of_stock).toBe(true);
      expect(resOut.body.data.availability_status).toBe('Out of Stock');

      // 3. Verify StockHistory entries recorded
      const histories = await StockHistory.find({ productId: product._id }).sort({ date_time: 1 });
      expect(histories.length).toBeGreaterThanOrEqual(2);
    });

    it('GET /api/showroom/inventory/overview - returns stock aggregation and category distribution', async () => {
      await Product.create([
        {
          vendorId: showroomProfile._id,
          businessProfileId: showroomProfile._id,
          business_type: 'showroom',
          name: 'Granite Item',
          material: 'Granite',
          available_stock: 3000,
          stock: 3000,
          selling_price: 120,
          status: 'active'
        },
        {
          vendorId: showroomProfile._id,
          businessProfileId: showroomProfile._id,
          business_type: 'showroom',
          name: 'Marble Item',
          material: 'Marble',
          available_stock: 2000,
          stock: 2000,
          selling_price: 220,
          status: 'active'
        }
      ]);

      const res = await request(app)
        .get('/api/showroom/inventory/overview')
        .set('Authorization', `Bearer ${showroomToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.total_available_stock).toBeGreaterThanOrEqual(5000);
      expect(res.body.data.category_distribution.Granite).toBeGreaterThanOrEqual(3000);
      expect(res.body.data.category_distribution.Marble).toBeGreaterThanOrEqual(2000);
    });

    it('GET /api/showroom/inventory/history - retrieves historical stock ledger', async () => {
      const res = await request(app)
        .get('/api/showroom/inventory/history')
        .set('Authorization', `Bearer ${showroomToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.history)).toBe(true);
    });
  });

  // ==========================================
  // 7. GALLERY MANAGEMENT
  // ==========================================
  describe('Gallery Management', () => {
    it('GET /api/showroom/gallery - retrieves photos, videos, owners', async () => {
      const res = await request(app)
        .get('/api/showroom/gallery')
        .set('Authorization', `Bearer ${showroomToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('photos');
      expect(res.body.data).toHaveProperty('videos');
      expect(res.body.data).toHaveProperty('owners');
    });

    it('POST & DELETE /api/showroom/gallery/photos - uploads photo with category and removes', async () => {
      const uploadRes = await request(app)
        .post('/api/showroom/gallery/photos')
        .set('Authorization', `Bearer ${showroomToken}`)
        .send({
          url: 'https://example.com/showroom_interior.jpg',
          title: 'Main Showroom Display Floor',
          category: 'product_display',
          is_cover: false
        });

      expect(uploadRes.statusCode).toBe(201);
      expect(uploadRes.body.success).toBe(true);

      // Verify in profile
      const prof = await BusinessProfile.findById(showroomProfile._id);
      const photo = prof.gallery_photos.find(p => p.url === 'https://example.com/showroom_interior.jpg');
      expect(photo).toBeDefined();

      // Delete photo
      const delRes = await request(app)
        .delete(`/api/showroom/gallery/photos/${photo._id}`)
        .set('Authorization', `Bearer ${showroomToken}`);

      expect(delRes.statusCode).toBe(200);
      expect(delRes.body.success).toBe(true);
    });

    it('POST & DELETE /api/showroom/gallery/videos - adds walkthrough video and removes', async () => {
      const addRes = await request(app)
        .post('/api/showroom/gallery/videos')
        .set('Authorization', `Bearer ${showroomToken}`)
        .send({
          title: 'Royal Stone Gallery Walkthrough Tour',
          youtube_url: 'https://www.youtube.com/watch?v=mockWalkthrough',
          duration: '3:45',
          video_type: 'walkthrough',
          source_type: 'youtube'
        });

      expect(addRes.statusCode).toBe(201);
      expect(addRes.body.success).toBe(true);

      const prof = await BusinessProfile.findById(showroomProfile._id);
      const video = prof.gallery_videos.find(v => v.title === 'Royal Stone Gallery Walkthrough Tour');
      expect(video).toBeDefined();

      const delRes = await request(app)
        .delete(`/api/showroom/gallery/videos/${video._id}`)
        .set('Authorization', `Bearer ${showroomToken}`);

      expect(delRes.statusCode).toBe(200);
      expect(delRes.body.success).toBe(true);
    });
  });

  // ==========================================
  // 8. VERIFICATION CENTER
  // ==========================================
  describe('Verification Center', () => {
    it('GET /api/showroom/verification - returns verification status, steps, and required documents', async () => {
      const res = await request(app)
        .get('/api/showroom/verification')
        .set('Authorization', `Bearer ${showroomToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      const data = res.body.data;

      expect(data).toHaveProperty('verification_percentage');
      expect(data).toHaveProperty('checklist');
      expect(data).toHaveProperty('required_documents');
      const docs = data.required_documents.map(d => d.type);
      expect(docs).toContain('gst_certificate');
      expect(docs).toContain('business_registration');
      expect(docs).toContain('shop_establishment');
    });

    it('Phone OTP workflow - sends and verifies OTP', async () => {
      const sendRes = await request(app)
        .post('/api/showroom/verification/phone/send-otp')
        .set('Authorization', `Bearer ${showroomToken}`)
        .send({ phone: '9829012345' });

      expect(sendRes.statusCode).toBe(200);
      expect(sendRes.body.data.otp).toBe('123456');

      const verifyRes = await request(app)
        .post('/api/showroom/verification/phone/verify-otp')
        .set('Authorization', `Bearer ${showroomToken}`)
        .send({ phone: '9829012345', otp: '123456' });

      expect(verifyRes.statusCode).toBe(200);
      expect(verifyRes.body.success).toBe(true);
    });

    it('GST & Business verification workflows', async () => {
      const gstRes = await request(app)
        .post('/api/showroom/verification/gst')
        .set('Authorization', `Bearer ${showroomToken}`)
        .send({ gstin: '08AAAAA0000A1Z5' });

      expect(gstRes.statusCode).toBe(200);
      expect(gstRes.body.data.status).toBe('verified');

      const bizRes = await request(app)
        .post('/api/showroom/verification/business')
        .set('Authorization', `Bearer ${showroomToken}`)
        .send({
          registration_type: 'Shop and Establishment Certificate',
          registration_number: 'SE-RJ-2018-8871'
        });

      expect(bizRes.statusCode).toBe(200);
      expect(bizRes.body.data.status).toBe('verified');
    });
  });

  // ==========================================
  // 9. SHOWROOM ANALYTICS ENGINE
  // ==========================================
  describe('Showroom Analytics Engine', () => {
    it('GET /api/showroom/analytics/overview - returns comprehensive overview analytics', async () => {
      const res = await request(app)
        .get('/api/showroom/analytics/overview')
        .set('Authorization', `Bearer ${showroomToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('total_profile_views');
      expect(res.body.data).toHaveProperty('total_product_views');
      expect(res.body.data).toHaveProperty('total_inquiries');
    });

    it('GET /api/showroom/analytics/inventory - returns active items, stock and category breakdown', async () => {
      const res = await request(app)
        .get('/api/showroom/analytics/inventory')
        .set('Authorization', `Bearer ${showroomToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('total_active_products');
      expect(res.body.data).toHaveProperty('total_available_stock');
      expect(res.body.data).toHaveProperty('product_category_distribution');
    });

    it('POST /api/showroom/analytics/event - records showroom analytics event', async () => {
      const res = await request(app)
        .post('/api/showroom/analytics/event')
        .set('Authorization', `Bearer ${showroomToken}`)
        .send({
          event_type: 'profile_view',
          entity_type: 'profile',
          metadata: { device: 'mobile', source: 'showroom_directory' }
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });

  // ==========================================
  // 10. INQUIRIES & LEADS SUBMODULES
  // ==========================================
  describe('Inquiries & Leads Submodules', () => {
    it('GET /api/showroom/inquiries - retrieves inquiries visible to showroom', async () => {
      await Inquiry.create({
        senderId: showroomUser._id,
        inquiry_id: 'INQ-SHW-2026-001',
        requirement_title: 'Italian White Marble Slabs',
        product_name: 'Italian White Marble Slabs',
        category: 'Marble',
        quantity: 2500,
        unit: 'Sq.ft',
        supplierType: 'showroom',
        status: 'submitted',
        vendorId: showroomProfile._id
      });

      const res = await request(app)
        .get('/api/showroom/inquiries')
        .set('Authorization', `Bearer ${showroomToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.inquiries)).toBe(true);
      expect(res.body.data.inquiries.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data.inquiries[0].requirement_title).toContain('Italian White Marble');
    });

    it('GET /api/showroom/leads - retrieves leads assigned to showroom', async () => {
      const inq = await Inquiry.create({
        senderId: showroomUser._id,
        inquiry_id: 'INQ-SHW-2026-002',
        requirement_title: 'Black Galaxy Granite Countertops',
        category: 'Granite',
        quantity: 1500,
        unit: 'Sq.ft',
        supplierType: 'showroom',
        status: 'submitted',
        vendorId: showroomProfile._id
      });

      await Lead.create({
        lead_number: 'LEAD-SHW-2026-001',
        inquiry_id: inq._id,
        manufacturer_id: showroomProfile._id,
        business_type: 'showroom',
        assigned_to: showroomProfile._id,
        lead_status: 'new',
        buyer_info: {
          name: 'Anil Agarwal',
          company: 'Jaipur Luxury Homes'
        },
        requirements: {
          product_name: 'Black Galaxy Granite Countertops',
          stone_category: 'Granite',
          quantity: 1500,
          unit: 'Sq.ft'
        }
      });

      const res = await request(app)
        .get('/api/showroom/leads')
        .set('Authorization', `Bearer ${showroomToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.leads)).toBe(true);
      expect(res.body.data.leads.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ==========================================
  // 11. SHARED SUBMODULE MOUNTINGS
  // ==========================================
  describe('Shared Submodule Mountings (/api/showroom/*)', () => {
    it('GET /api/showroom/promotions/dashboard - shared ad promotion engine routes work for showroom', async () => {
      const res = await request(app)
        .get('/api/showroom/promotions/dashboard')
        .set('Authorization', `Bearer ${showroomToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('GET /api/showroom/settings - shared account settings engine routes work for showroom', async () => {
      const res = await request(app)
        .get('/api/showroom/settings')
        .set('Authorization', `Bearer ${showroomToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
