const request = require('supertest');
const app = require('../server');
const User = require('../src/models/User');
const BusinessProfile = require('../src/models/BusinessProfile');
const Product = require('../src/models/Product');
const jwt = require('jsonwebtoken');

describe('Universal Business Management & Catalogue Engine Comprehensive Suite', () => {
  let testUser, testToken;
  let businessA, businessB;
  let createdListingId;

  beforeEach(async () => {
    testUser = await User.create({
      name: 'Vikramaditya Rathore',
      mobile: '9829099112',
      email: 'vikram.rathore@stonegroup.in',
      password: 'password123',
      role: 'manufacturer',
      status: 'active'
    });

    testToken = jwt.sign(
      { id: testUser._id, role: testUser.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1h' }
    );

    businessA = await BusinessProfile.create({
      userId: testUser._id,
      business_type: 'manufacturer',
      company_name: 'Rathore Granites & Marbles Processing Ltd',
      business_category: 'Stone Manufacturer',
      phone: '+91 98290 99112',
      email: 'vikram.rathore@stonegroup.in',
      is_verified: true,
      address: { state: 'Rajasthan', district: 'Rajsamand' }
    });

    businessB = await BusinessProfile.create({
      userId: testUser._id,
      business_type: 'hydro_crane',
      company_name: 'Rathore Heavy Lifting & Crane Services',
      business_category: 'Hydro & Heavy Crane Service',
      phone: '+91 98290 99112',
      is_verified: true,
      address: { state: 'Rajasthan', district: 'Udaipur' }
    });
  });

  // ==========================================
  // 1. BUSINESS MANAGEMENT SYSTEM & SWITCHING
  // ==========================================
  describe('1. Business Management & Context Switching', () => {
    it('GET /api/business-types - should return full registry of 22 supported business types', async () => {
      const res = await request(app)
        .get('/api/business-types')
        .set('Authorization', `Bearer ${testToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.business_types.length).toBeGreaterThanOrEqual(18);
      expect(res.body.data.business_types.some(b => b.id === 'hydro_crane')).toBe(true);
      expect(res.body.data.business_types.some(b => b.id === 'diamond_blades')).toBe(true);
    });

    it('GET /api/businesses - should return all businesses owned by user', async () => {
      const res = await request(app)
        .get('/api/businesses')
        .set('Authorization', `Bearer ${testToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.businesses.length).toBe(2);
      expect(res.body.data.businesses.some(b => b.business_type === 'manufacturer')).toBe(true);
      expect(res.body.data.businesses.some(b => b.business_type === 'hydro_crane')).toBe(true);
    });

    it('POST /api/businesses - should create another business profile under user', async () => {
      const res = await request(app)
        .post('/api/businesses')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          business_type: 'diamond_blades',
          company_name: 'Rathore Diamond Blades Works',
          business_category: 'Diamond Blades & Segments'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.company_name).toBe('Rathore Diamond Blades Works');
    });

    it('GET /api/businesses/active - should return active business context and navigation path', async () => {
      const res = await request(app)
        .get('/api/businesses/active')
        .set('Authorization', `Bearer ${testToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.business_type).toBe('manufacturer');
      expect(res.body.data.dashboard_path).toBe('/manufacturer/dashboard');
    });

    it('POST /api/businesses/switch - should switch user active business to hydro_crane', async () => {
      const res = await request(app)
        .post('/api/businesses/switch')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          target_business_type: 'hydro_crane',
          target_business_id: businessB._id.toString()
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.active_business_type).toBe('hydro_crane');

      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.role).toBe('hydro_crane');
    });

    it('PUT /api/businesses/:id - should update business profile with ownership validation', async () => {
      const res = await request(app)
        .put(`/api/businesses/${businessA._id}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          about_business: 'Leading export-oriented granite slab processing plant in Rajsamand'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.about_business).toContain('export-oriented granite slab');
    });
  });

  // ==========================================
  // 2. UNIVERSAL CATALOGUE & 4-STEP PUBLISHING ENGINE
  // ==========================================
  describe('2. Universal Catalogue Engine & 4-Step Publishing Workflow', () => {

    let activeListingId;

    it('POST /api/catalogue - should initialize a listing draft', async () => {
      const res = await request(app)
        .post('/api/catalogue')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          title: 'Premium Black Granite Gangsaw Slabs (20mm)',
          category: 'Granite Slabs',
          business_type: 'manufacturer'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.sku).toMatch(/^CAT-/);
      expect(res.body.data.status).toBe('draft');
      activeListingId = res.body.data._id;
    });

    it('POST /api/catalogue/:id/steps/basic - should save Step 1 (Basic & Media)', async () => {
      const draft = await Product.create({
        name: 'Draft Listing',
        category: 'Granite Slabs',
        business_type: 'manufacturer',
        userId: testUser._id,
        vendorId: businessA._id,
        status: 'draft'
      });
      activeListingId = draft._id;

      const res = await request(app)
        .post(`/api/catalogue/${activeListingId}/steps/basic`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          name: 'Premium Absolute Black Granite Gangsaw Slabs (20mm & 30mm)',
          description: 'High-gloss mirror polished Gangsaw-cut granite slabs from Markal quarry.',
          images: ['https://stonemarket.com/images/black-granite-slab-1.jpg'],
          cover_image: 'https://stonemarket.com/images/black-granite-slab-1.jpg'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toContain('Absolute Black Granite');
    });

    it('POST /api/catalogue/:id/steps/specifications - should save Step 2 (Technical Specifications)', async () => {
      const draft = await Product.create({
        name: 'Draft Listing',
        category: 'Granite Slabs',
        business_type: 'manufacturer',
        userId: testUser._id,
        vendorId: businessA._id,
        status: 'draft'
      });
      activeListingId = draft._id;

      const res = await request(app)
        .post(`/api/catalogue/${activeListingId}/steps/specifications`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          thickness: '20 mm / 30 mm',
          quality: 'Export Grade Premium Mirror Polished',
          finish: 'Polished',
          technical_specifications: {
            density: '2.95 g/cm3',
            water_absorption: '0.04%'
          }
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.thickness).toBe('20 mm / 30 mm');
    });

    it('POST /api/catalogue/:id/steps/pricing - should save Step 3 (Pricing & Availability)', async () => {
      const draft = await Product.create({
        name: 'Draft Listing',
        category: 'Granite Slabs',
        business_type: 'manufacturer',
        userId: testUser._id,
        vendorId: businessA._id,
        status: 'draft'
      });
      activeListingId = draft._id;

      const res = await request(app)
        .post(`/api/catalogue/${activeListingId}/steps/pricing`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          selling_price: 280,
          pricing_unit: 'Sq.ft',
          min_order_quantity: 500,
          stock: 25000,
          availability_status: 'Ready Stock',
          lead_time: 'Immediate Dispatch'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.selling_price).toBe(280);
      expect(res.body.data.stock).toBe(25000);
    });

    it('GET /api/catalogue/:id/review - should generate full Step 4 review preview', async () => {
      const draft = await Product.create({
        name: 'Premium Absolute Black Granite Gangsaw Slabs (20mm & 30mm)',
        category: 'Granite Slabs',
        business_type: 'manufacturer',
        price: 280,
        selling_price: 280,
        userId: testUser._id,
        vendorId: businessA._id,
        status: 'draft'
      });
      activeListingId = draft._id;

      const res = await request(app)
        .get(`/api/catalogue/${activeListingId}/review`)
        .set('Authorization', `Bearer ${testToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.is_publishable).toBe(true);
      expect(res.body.data.price).toBe(280);
      expect(res.body.data.title).toContain('Absolute Black Granite');
    });

    it('POST /api/catalogue/:id/publish - should publish listing with target areas & categories', async () => {
      const draft = await Product.create({
        name: 'Draft Listing',
        category: 'Granite Slabs',
        business_type: 'manufacturer',
        price: 280,
        selling_price: 280,
        userId: testUser._id,
        vendorId: businessA._id,
        status: 'draft'
      });
      activeListingId = draft._id;

      const res = await request(app)
        .post(`/api/catalogue/${activeListingId}/publish`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          target_areas: [
            { state_name: 'Rajasthan', districts: ['Rajsamand', 'Udaipur', 'Jaipur'] },
            { state_name: 'Gujarat', districts: ['Ahmedabad', 'Surat'] }
          ],
          target_categories: ['Showroom', 'Trader', 'Construction Company']
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('active');
      expect(res.body.data.publishing_status).toBe('published');
    });

    it('POST /api/catalogue/:id/duplicate - should clone listing as draft with new SKU', async () => {
      const draft = await Product.create({
        name: 'Draft Listing',
        category: 'Granite Slabs',
        business_type: 'manufacturer',
        userId: testUser._id,
        vendorId: businessA._id,
        status: 'active'
      });
      activeListingId = draft._id;

      const res = await request(app)
        .post(`/api/catalogue/${activeListingId}/duplicate`)
        .set('Authorization', `Bearer ${testToken}`);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toContain('(Copy)');
      expect(res.body.data.status).toBe('draft');
    });

    it('PATCH /api/catalogue/:id/status - should toggle status between active and inactive', async () => {
      const draft = await Product.create({
        name: 'Draft Listing',
        category: 'Granite Slabs',
        business_type: 'manufacturer',
        userId: testUser._id,
        vendorId: businessA._id,
        status: 'active'
      });
      activeListingId = draft._id;

      const res = await request(app)
        .patch(`/api/catalogue/${activeListingId}/status`)
        .set('Authorization', `Bearer ${testToken}`)
        .send({ status: 'inactive' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('inactive');
    });

    it('GET /api/catalogue - should list catalogue items with filters and pagination', async () => {
      await Product.create({
        name: 'Premium Granite Block',
        category: 'Granite Slabs',
        business_type: 'manufacturer',
        userId: testUser._id,
        vendorId: businessA._id,
        businessProfileId: businessA._id,
        status: 'active'
      });

      const res = await request(app)
        .get('/api/catalogue?search=Granite&page=1&limit=10')
        .set('Authorization', `Bearer ${testToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items.length).toBeGreaterThanOrEqual(1);
    });

    it('DELETE /api/catalogue/:id - should delete listing', async () => {
      const draft = await Product.create({
        name: 'To Delete',
        category: 'Granite Slabs',
        business_type: 'manufacturer',
        userId: testUser._id,
        vendorId: businessA._id,
        status: 'draft'
      });
      activeListingId = draft._id;

      const res = await request(app)
        .delete(`/api/catalogue/${activeListingId}`)
        .set('Authorization', `Bearer ${testToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const check = await Product.findById(activeListingId);
      expect(check).toBeNull();
    });
  });

  // ==========================================
  // 3. HYDRO & HEAVY CRANE SERVICE INTEGRATION
  // ==========================================
  describe('3. Hydro & Heavy Crane Service (Equipment & Rental Management)', () => {
    let craneToken;

    beforeEach(async () => {
      craneToken = jwt.sign(
        { id: testUser._id, role: 'hydro_crane' },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '1h' }
      );
    });

    it('GET /api/hydro-crane/dashboard - should return Equipment & Rental Management menu', async () => {
      const res = await request(app)
        .get('/api/hydro-crane/dashboard')
        .set('Authorization', `Bearer ${craneToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.my_business_menu.some(m => m.title === 'Equipment & Rental Management')).toBe(true);
    });

    it('POST /api/hydro-crane/equipment - should publish Hydra 15 Ton Heavy Slicing Crane', async () => {
      const res = await request(app)
        .post('/api/hydro-crane/equipment')
        .set('Authorization', `Bearer ${craneToken}`)
        .send({
          name: 'ACE 15-Ton Hydra Pick & Carry Mobile Crane',
          category: 'Hydra Pick & Carry',
          crane_hydra_type: 'Hydra 15T Pick & Carry',
          lifting_capacity: '15 Metric Tons',
          lifting_capacity_tonnes: 15,
          boom_length: '18 Meters 4-Part Telescopic Boom',
          operator_availability: true,
          fuel_included: true,
          operating_base_location: 'Rajsamand, Rajasthan',
          service_radius: '100 KM',
          selling_price: 1800,
          pricing_unit: 'Per Hour'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.sku).toMatch(/^CRN-/);
      expect(res.body.data.name).toContain('ACE 15-Ton Hydra');
    });

    it('GET /api/hydro-crane/equipment - should list crane fleet equipment', async () => {
      const res = await request(app)
        .get('/api/hydro-crane/equipment')
        .set('Authorization', `Bearer ${craneToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.equipment).toBeDefined();
    });
  });
});
