const request = require('supertest');
const app = require('../server');
const User = require('../src/models/User');
const BusinessProfile = require('../src/models/BusinessProfile');
const Product = require('../src/models/Product');
const Inquiry = require('../src/models/Inquiry');
const Lead = require('../src/models/Lead');
const AnalyticsEvent = require('../src/models/AnalyticsEvent');
const jwt = require('jsonwebtoken');

describe('Mining Profile & Business Module (Phase 1)', () => {
  let miningUser;
  let miningToken;
  let miningProfile;

  beforeEach(async () => {
    // 1. Create Mining User & Token
    miningUser = await User.create({
      name: 'Ramesh Patel',
      mobile: '9829011223',
      email: 'ramesh.mining@mockstonemarket.com',
      password: 'password123',
      role: 'mining',
      status: 'active'
    });

    miningToken = jwt.sign(
      { id: miningUser._id, role: miningUser.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1h' }
    );

    // 2. Create Business Profile for Mining
    miningProfile = await BusinessProfile.create({
      userId: miningUser._id,
      business_type: 'mining',
      company_name: 'Aravalli Granites & Stone Mines',
      gst_number: '08AABCA1234F1Z8',
      established_year: 2017,
      monthly_capacity: 6500,
      capacity_unit: 'Ton',
      ec_number: 'EC-RAJ-2018-9942',
      ec_clearance_status: 'Clearance Granted',
      mining_lease_number: 'ML-78/2018',
      mining_permit_number: 'MP-2022-4410',
      quarry_specialties: ['Rajasthan Black', 'Black Galaxy', 'Makrana White'],
      unit_status: 'both',
      premises_status: 'owned',
      rating: 4.8,
      review_count: 16,
      about_business: 'Leading quarry operator and raw granite block supplier from Jalore mining zone.',
      company_details: 'Specializing in premium natural rough blocks extracted using wire saw technology.',
      address: {
        full_address: 'Khasra No. 412, Jalore Mining Cluster, Jalore District',
        industrial_area: 'Jalore Granite Mining Cluster',
        district: 'Jalore',
        state: 'Rajasthan',
        country: 'India',
        postal_code: '343001'
      },
      machines: [
        {
          machine_name: 'Diamond Wire Saw Machine',
          quantity: 4,
          category: 'Cutting',
          description: 'High-speed quarry block cutting wire saw',
          operational_status: 'Operational'
        },
        {
          machine_name: 'Hydraulic Mining Excavator',
          quantity: 2,
          category: 'Excavation',
          description: 'Heavy 35-ton crawler excavator',
          operational_status: 'Operational'
        }
      ],
      custom_stone_varieties: [
        {
          name: 'Rajasthan Black Granite Block',
          color: 'Deep Black',
          stone_type: 'Granite',
          description: 'Solid dark black granite blocks suitable for monument and gangsaw processing',
          available_quantity: '1,500 Tons'
        }
      ],
      owners: [
        {
          name: 'Ramesh Patel',
          designation: 'Quarry Lease Holder & Managing Director',
          phone: '9829011223',
          email: 'ramesh.mining@mockstonemarket.com',
          is_primary: true
        }
      ]
    });
  });

  // ==========================================
  // 1. BUSINESS TYPE SWITCHING
  // ==========================================
  describe('Business Type Switching', () => {
    test('GET /api/mining/business-types should return available business types with current selection', async () => {
      const res = await request(app)
        .get('/api/mining/business-types')
        .set('Authorization', `Bearer ${miningToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.current_type).toBe('mining');
      expect(res.body.data.available_types).toBeInstanceOf(Array);
      
      const miningType = res.body.data.available_types.find(t => t.id === 'mining');
      expect(miningType).toBeDefined();
      expect(miningType.is_current).toBe(true);
      expect(miningType.name).toBe('Mining / Quarry');
    });

    test('POST /api/mining/switch-business-type should allow switching to manufacturer and back to mining', async () => {
      // Switch to manufacturer
      const res1 = await request(app)
        .post('/api/mining/switch-business-type')
        .set('Authorization', `Bearer ${miningToken}`)
        .send({ target_business_type: 'manufacturer' });

      expect(res1.statusCode).toBe(200);
      expect(res1.body.success).toBe(true);
      expect(res1.body.data.active_business_type).toBe('manufacturer');
      expect(res1.body.data.dashboard_route).toBe('/manufacturer/dashboard');

      // Switch back to mining
      const res2 = await request(app)
        .post('/api/mining/switch-business-type')
        .set('Authorization', `Bearer ${miningToken}`)
        .send({ target_business_type: 'mining' });

      expect(res2.statusCode).toBe(200);
      expect(res2.body.success).toBe(true);
      expect(res2.body.data.active_business_type).toBe('mining');
      expect(res2.body.data.dashboard_route).toBe('/mining/dashboard');
    });
  });

  // ==========================================
  // 2. MINING BUSINESS DASHBOARD
  // ==========================================
  describe('Mining Business Dashboard', () => {
    test('GET /api/mining/dashboard should return profile summary card, quick stats and navigation menus', async () => {
      // Create a test product
      await Product.create({
        name: 'Rajasthan Black Raw Block',
        vendorId: miningUser._id,
        businessProfileId: miningProfile._id,
        business_type: 'mining',
        material: 'Granite',
        category: 'Raw Stone Blocks',
        price: 4500,
        pricing_unit: 'TON',
        stock: 350,
        status: 'active'
      });

      const res = await request(app)
        .get('/api/mining/dashboard')
        .set('Authorization', `Bearer ${miningToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      
      const { summary_card, quick_stats, menus } = res.body.data;
      expect(summary_card.business_name).toBe('Aravalli Granites & Stone Mines');
      expect(summary_card.business_category).toBe('Mines & Quarries');
      expect(summary_card.rating).toBe(4.8);
      expect(summary_card.monthly_output_formatted).toContain('6,500');

      expect(quick_stats.total_products).toBeGreaterThanOrEqual(1);
      expect(quick_stats.monthly_extraction_tons).toBe(6500);

      expect(menus.my_business).toHaveLength(6);
      expect(menus.business_activity).toHaveLength(2);
      expect(menus.account_support).toHaveLength(3);
      expect(menus.bottom_navigation).toHaveLength(5);
    });
  });

  // ==========================================
  // 3. MINING BUSINESS PROFILE & OPERATIONAL SPECS
  // ==========================================
  describe('Mining Business Profile & Operational Specifications', () => {
    test('GET /api/mining/profile should return complete mining profile details', async () => {
      const res = await request(app)
        .get('/api/mining/profile')
        .set('Authorization', `Bearer ${miningToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.company_name).toBe('Aravalli Granites & Stone Mines');
      expect(res.body.data.ec_number).toBe('EC-RAJ-2018-9942');
      expect(res.body.data.mining_lease_number).toBe('ML-78/2018');
    });

    test('PUT /api/mining/profile should update enterprise and identity info', async () => {
      const res = await request(app)
        .put('/api/mining/profile')
        .set('Authorization', `Bearer ${miningToken}`)
        .send({
          company_name: 'Aravalli Granites & Stone Mines Pvt Ltd',
          gst_number: '08AABCA1234F1Z8',
          mining_permit_number: 'MP-2023-8899',
          about_business: 'Premier granite extraction unit in Western Rajasthan.'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.company_name).toBe('Aravalli Granites & Stone Mines Pvt Ltd');
      expect(res.body.data.mining_permit_number).toBe('MP-2023-8899');
    });

    test('PUT /api/mining/operational-specs should update mining capacity, EC clearance, quarry specialty and timings', async () => {
      const res = await request(app)
        .put('/api/mining/operational-specs')
        .set('Authorization', `Bearer ${miningToken}`)
        .send({
          monthly_capacity: 8000,
          capacity_unit: 'Ton',
          ec_number: 'EC-RAJ-2020-0012',
          ec_clearance_status: 'Clearance Granted',
          quarry_specialties: ['Rajasthan Black', 'Black Galaxy', 'Makrana White', 'Desert Gold'],
          factory_timings: '07:00 AM - 06:00 PM (Mon-Sat)'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.monthly_capacity).toBe(8000);
      expect(res.body.data.quarry_specialties).toContain('Desert Gold');
      expect(res.body.data.factory_timings).toBe('07:00 AM - 06:00 PM (Mon-Sat)');
    });
  });

  // ==========================================
  // 4. MINING MACHINERY MANAGEMENT
  // ==========================================
  describe('Mining Machinery Management', () => {
    test('POST /api/mining/machinery should add new mining equipment with operational status', async () => {
      const res = await request(app)
        .post('/api/mining/machinery')
        .set('Authorization', `Bearer ${miningToken}`)
        .send({
          machine_name: 'Heavy Mining Loader',
          quantity: 3,
          category: 'Material Handling',
          description: 'Front wheel heavy stone loader 40-ton capacity',
          operational_status: 'Operational'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.machine_name).toBe('Heavy Mining Loader');
      expect(res.body.data.operational_status).toBe('Operational');
    });

    test('GET /api/mining/machinery should list all machinery', async () => {
      const res = await request(app)
        .get('/api/mining/machinery')
        .set('Authorization', `Bearer ${miningToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
    });

    test('PUT /api/mining/machinery/:id should update equipment details', async () => {
      const machineId = miningProfile.machines[0]._id;
      const res = await request(app)
        .put(`/api/mining/machinery/${machineId}`)
        .set('Authorization', `Bearer ${miningToken}`)
        .send({
          operational_status: 'Maintenance',
          quantity: 5
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.operational_status).toBe('Maintenance');
      expect(res.body.data.quantity).toBe(5);
    });

    test('DELETE /api/mining/machinery/:id should delete equipment record', async () => {
      const machineId = miningProfile.machines[0]._id;
      const res = await request(app)
        .delete(`/api/mining/machinery/${machineId}`)
        .set('Authorization', `Bearer ${miningToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ==========================================
  // 5. EXCAVATED STONE VARIETIES
  // ==========================================
  describe('Excavated Stone Varieties Management', () => {
    test('POST /api/mining/stone-varieties should add excavated stone variety', async () => {
      const res = await request(app)
        .post('/api/mining/stone-varieties')
        .set('Authorization', `Bearer ${miningToken}`)
        .send({
          name: 'Black Galaxy Raw Block',
          color: 'Black with Golden Flecks',
          stone_type: 'Granite',
          description: 'Finest rough blocks extracted directly from quarry face',
          available_quantity: '850 Tons'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Black Galaxy Raw Block');
      expect(res.body.data.color).toBe('Black with Golden Flecks');
    });

    test('GET /api/mining/stone-varieties should list excavated varieties', async () => {
      const res = await request(app)
        .get('/api/mining/stone-varieties')
        .set('Authorization', `Bearer ${miningToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    test('DELETE /api/mining/stone-varieties/:id should remove stone variety', async () => {
      const varietyId = miningProfile.custom_stone_varieties[0]._id;
      const res = await request(app)
        .delete(`/api/mining/stone-varieties/${varietyId}`)
        .set('Authorization', `Bearer ${miningToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ==========================================
  // 6. OWNERSHIP & KEY CONTACTS
  // ==========================================
  describe('Key Contacts & Owners Management', () => {
    test('POST /api/mining/contacts should add owner/partner contact', async () => {
      const res = await request(app)
        .post('/api/mining/contacts')
        .set('Authorization', `Bearer ${miningToken}`)
        .send({
          name: 'Prakash Choudhary',
          designation: 'Quarry Operations Partner',
          phone: '9414011223',
          email: 'prakash@aravallimines.com',
          is_primary: false
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Prakash Choudhary');
    });

    test('GET /api/mining/contacts should list contacts', async () => {
      const res = await request(app)
        .get('/api/mining/contacts')
        .set('Authorization', `Bearer ${miningToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    test('PUT /api/mining/contacts/:id should update contact details', async () => {
      const contactId = miningProfile.owners[0]._id;
      const res = await request(app)
        .put(`/api/mining/contacts/${contactId}`)
        .set('Authorization', `Bearer ${miningToken}`)
        .send({
          designation: 'Senior Mining Partner & General Manager'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.designation).toBe('Senior Mining Partner & General Manager');
    });

    test('DELETE /api/mining/contacts/:id should remove contact', async () => {
      const contactId = miningProfile.owners[0]._id;
      const res = await request(app)
        .delete(`/api/mining/contacts/${contactId}`)
        .set('Authorization', `Bearer ${miningToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ==========================================
  // 7. MINING PRODUCT MANAGEMENT & 4-STEP WIZARD
  // ==========================================
  describe('Mining Product Management & 4-Step Wizard', () => {
    test('POST /api/mining/products should create raw stone block with dimensions & calculate volume CBM in FEET', async () => {
      // Dimensions: 10 ft x 5 ft x 5 ft = 250 cubic feet * 0.0283168 = 7.079 CBM
      const res = await request(app)
        .post('/api/mining/products')
        .set('Authorization', `Bearer ${miningToken}`)
        .send({
          name: 'Rajasthan Black Raw Granite Block #01',
          color_name: 'Rajasthan Black',
          material: 'Granite',
          description: 'Uniform textured block cut using wire saw. Gangsaw size block.',
          price: 45000,
          pricing_unit: 'CU.MTR',
          block_dimensions: {
            length: 10,
            width: 5,
            height: 5,
            dimension_unit: 'FEET'
          },
          additional_sizes: [
            {
              length: 12,
              width: 6,
              height: 5,
              dimension_unit: 'FEET'
            }
          ],
          finish: 'Natural Block',
          quality: 'Export Grade',
          pattern: 'Natural Pattern',
          available_stock: 40,
          stock_unit: 'BLOCK',
          weight: 22,
          weight_unit: 'TON',
          country_of_origin: 'India',
          min_order_quantity: 1,
          target_publishing: {
            states: ['Rajasthan', 'Gujarat'],
            districts: ['Jalore', 'Udaipur'],
            categories: ['Raw Stone Blocks', 'Granite Blocks']
          },
          categories: ['Raw Stone Blocks', 'Granite Blocks', 'Mining']
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.sku).toMatch(/^MINE-GRAN-/);
      expect(res.body.data.volume_cbm).toBe(7.079);
      expect(res.body.data.business_type).toBe('mining');
      expect(res.body.data.finish).toBe('Natural Block');
      expect(res.body.data.quality).toBe('Export Grade');
    });

    test('POST /api/mining/products should accurately compute CBM for METER, CM, and MM units', async () => {
      // 1. METER: 3 x 2 x 1.5 = 9 CBM
      const resMeter = await request(app)
        .post('/api/mining/products')
        .set('Authorization', `Bearer ${miningToken}`)
        .send({
          name: 'Makrana White Marble Block Mtr',
          material: 'Marble',
          pricing_unit: 'CU.MTR',
          price: 65000,
          block_dimensions: {
            length: 3,
            width: 2,
            height: 1.5,
            dimension_unit: 'METER'
          }
        });
      expect(resMeter.statusCode).toBe(201);
      expect(resMeter.body.data.volume_cbm).toBe(9);

      // 2. CM: 300 x 200 x 150 = 9 CBM
      const resCm = await request(app)
        .post('/api/mining/products')
        .set('Authorization', `Bearer ${miningToken}`)
        .send({
          name: 'Makrana White Marble Block CM',
          material: 'Marble',
          pricing_unit: 'CU.MTR',
          price: 65000,
          block_dimensions: {
            length: 300,
            width: 200,
            height: 150,
            dimension_unit: 'CM'
          }
        });
      expect(resCm.statusCode).toBe(201);
      expect(resCm.body.data.volume_cbm).toBe(9);
    });

    test('GET /api/mining/products should return filtered and paginated product list', async () => {
      await Product.create({
        name: 'Rajasthan Black Raw Block',
        vendorId: miningUser._id,
        businessProfileId: miningProfile._id,
        business_type: 'mining',
        material: 'Granite',
        price: 45000,
        pricing_unit: 'CU.MTR',
        stock: 30,
        status: 'active'
      });

      const res = await request(app)
        .get('/api/mining/products?material=Granite')
        .set('Authorization', `Bearer ${miningToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.products).toBeInstanceOf(Array);
      expect(res.body.data.pagination).toBeDefined();
    });

    test('GET /api/mining/products/:id should return complete product details', async () => {
      const product = await Product.create({
        name: 'Rajasthan Black Raw Block Detail',
        vendorId: miningUser._id,
        businessProfileId: miningProfile._id,
        business_type: 'mining',
        material: 'Granite',
        sku: 'MINE-GRAN-2026-9999',
        price: 45000,
        pricing_unit: 'CU.MTR',
        block_dimensions: { length: 10, width: 5, height: 5, dimension_unit: 'FEET' },
        volume_cbm: 7.079,
        stock: 30,
        status: 'active'
      });

      const res = await request(app)
        .get(`/api/mining/products/${product._id}`)
        .set('Authorization', `Bearer ${miningToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Rajasthan Black Raw Block Detail');
      expect(res.body.data.block_dimensions).toBeDefined();
      expect(res.body.data.volume_cbm).toBe(7.079);
    });

    test('PUT /api/mining/products/:id should update block specs and recalculate volume', async () => {
      const product = await Product.create({
        name: 'Block to Update',
        vendorId: miningUser._id,
        businessProfileId: miningProfile._id,
        business_type: 'mining',
        material: 'Granite',
        price: 40000,
        pricing_unit: 'CU.MTR',
        block_dimensions: { length: 10, width: 5, height: 5, dimension_unit: 'FEET' },
        volume_cbm: 7.079,
        stock: 30,
        status: 'active'
      });

      const res = await request(app)
        .put(`/api/mining/products/${product._id}`)
        .set('Authorization', `Bearer ${miningToken}`)
        .send({
          price: 48000,
          block_dimensions: {
            length: 12,
            width: 5,
            height: 5,
            dimension_unit: 'FEET'
          }
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.price).toBe(48000);
      // 12 x 5 x 5 = 300 cu.ft * 0.0283168 = 8.495 CBM
      expect(res.body.data.volume_cbm).toBe(8.495);
    });

    test('POST /api/mining/products/:id/duplicate should clone block product with new SKU', async () => {
      const product = await Product.create({
        name: 'Block to Duplicate',
        vendorId: miningUser._id,
        businessProfileId: miningProfile._id,
        business_type: 'mining',
        material: 'Granite',
        sku: 'MINE-GRAN-2026-ORIG',
        price: 42000,
        pricing_unit: 'CU.MTR',
        stock: 25,
        status: 'active'
      });

      const res = await request(app)
        .post(`/api/mining/products/${product._id}/duplicate`)
        .set('Authorization', `Bearer ${miningToken}`);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toContain('(Copy)');
      expect(res.body.data.sku).not.toBe('MINE-GRAN-2026-ORIG');
      expect(res.body.data.status).toBe('draft');
    });

    test('PUT /api/mining/products/:id/stock should update stock count', async () => {
      const product = await Product.create({
        name: 'Block for Stock Update',
        vendorId: miningUser._id,
        businessProfileId: miningProfile._id,
        business_type: 'mining',
        material: 'Granite',
        available_stock: 20,
        stock: 20,
        status: 'active'
      });

      const res = await request(app)
        .put(`/api/mining/products/${product._id}/stock`)
        .set('Authorization', `Bearer ${miningToken}`)
        .send({
          available_stock: 55,
          availability_status: 'in_stock'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.stock).toBe(55);
    });

    test('DELETE /api/mining/products/:id should delete product', async () => {
      const product = await Product.create({
        name: 'Block to Delete',
        vendorId: miningUser._id,
        businessProfileId: miningProfile._id,
        business_type: 'mining',
        material: 'Granite',
        status: 'active'
      });

      const res = await request(app)
        .delete(`/api/mining/products/${product._id}`)
        .set('Authorization', `Bearer ${miningToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ==========================================
  // 8. GALLERY MANAGEMENT
  // ==========================================
  describe('Gallery Management', () => {
    test('POST /api/mining/gallery/photos should add a gallery photo', async () => {
      const res = await request(app)
        .post('/api/mining/gallery/photos')
        .set('Authorization', `Bearer ${miningToken}`)
        .send({
          url: 'https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70',
          title: 'Quarry Face Excavation Wire Saw Work',
          is_cover: true
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
    });

    test('GET /api/mining/gallery should return photos, videos, and owners', async () => {
      // Add photo to profile
      miningProfile.gallery_photos.push({
        url: 'https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70',
        title: 'Quarry Face Excavation'
      });
      await miningProfile.save();

      const res = await request(app)
        .get('/api/mining/gallery')
        .set('Authorization', `Bearer ${miningToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.photos).toBeInstanceOf(Array);
      expect(res.body.data.counts.photos_count).toBeGreaterThanOrEqual(1);
    });

    test('POST /api/mining/gallery/videos should add a mining operations video', async () => {
      const res = await request(app)
        .post('/api/mining/gallery/videos')
        .set('Authorization', `Bearer ${miningToken}`)
        .send({
          title: 'Heavy Block Extraction using Diamond Wire Saw',
          youtube_url: 'https://www.youtube.com/watch?v=mockQuarryVideo',
          source_type: 'youtube',
          duration: '04:15'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Heavy Block Extraction using Diamond Wire Saw');
    });

    test('DELETE /api/mining/gallery/photos/:id should delete photo', async () => {
      miningProfile.gallery_photos.push({
        url: 'https://images.unsplash.com/photo-to-delete',
        title: 'To Delete'
      });
      await miningProfile.save();

      const photoId = miningProfile.gallery_photos[0]._id;
      const res = await request(app)
        .delete(`/api/mining/gallery/photos/${photoId}`)
        .set('Authorization', `Bearer ${miningToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    test('DELETE /api/mining/gallery/videos/:id should delete video', async () => {
      miningProfile.gallery_videos.push({
        title: 'Video to delete',
        url: 'https://example.com/video.mp4'
      });
      await miningProfile.save();

      const videoId = miningProfile.gallery_videos[0]._id;
      const res = await request(app)
        .delete(`/api/mining/gallery/videos/${videoId}`)
        .set('Authorization', `Bearer ${miningToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ==========================================
  // 9. VERIFICATION CENTER
  // ==========================================
  describe('Verification Center', () => {
    test('GET /api/mining/verification should return checklist with mining specific documents', async () => {
      const res = await request(app)
        .get('/api/mining/verification')
        .set('Authorization', `Bearer ${miningToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.checklist).toBeInstanceOf(Array);
      expect(res.body.data.required_documents).toContain('Mining Lease Document');
      expect(res.body.data.required_documents).toContain('Environment Clearance Certificate');
    });

    test('POST /api/mining/verification/phone/send-otp & verify-otp', async () => {
      // Send OTP
      const resSend = await request(app)
        .post('/api/mining/verification/phone/send-otp')
        .set('Authorization', `Bearer ${miningToken}`)
        .send({ phone: '9829011223' });

      expect(resSend.statusCode).toBe(200);
      const otp = resSend.body.data.otp;
      expect(otp).toBe('123456');

      // Verify OTP
      const resVerify = await request(app)
        .post('/api/mining/verification/phone/verify-otp')
        .set('Authorization', `Bearer ${miningToken}`)
        .send({ phone: '9829011223', otp });

      expect(resVerify.statusCode).toBe(200);
      expect(resVerify.body.success).toBe(true);
    });

    test('POST /api/mining/verification/gst should submit GST verification', async () => {
      const res = await request(app)
        .post('/api/mining/verification/gst')
        .set('Authorization', `Bearer ${miningToken}`)
        .send({ gstin: '08AABCA1234F1Z8' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('submitted');
    });

    test('POST /api/mining/verification/documents should upload mining lease document', async () => {
      const res = await request(app)
        .post('/api/mining/verification/documents')
        .set('Authorization', `Bearer ${miningToken}`)
        .send({
          title: 'Government Mining Lease Deed ML-78/2018',
          document_type: 'mining_lease',
          document_url: 'https://example.com/mining-lease.pdf'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Government Mining Lease Deed ML-78/2018');
      expect(res.body.data.file_type).toBe('mining_lease');
    });
  });

  // ==========================================
  // 10. MINING ANALYTICS
  // ==========================================
  describe('Mining Analytics', () => {
    test('GET /api/mining/analytics/overview should return mining KPIs and views over time', async () => {
      const res = await request(app)
        .get('/api/mining/analytics/overview')
        .set('Authorization', `Bearer ${miningToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.kpis.monthly_extraction_tons).toBe(6500);
      expect(res.body.data.views_over_time).toBeInstanceOf(Array);
      expect(res.body.data.top_performing_products).toBeInstanceOf(Array);
    });

    test('GET /api/mining/analytics/leads should return lead metrics', async () => {
      const res = await request(app)
        .get('/api/mining/analytics/leads')
        .set('Authorization', `Bearer ${miningToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.leads_by_source).toBeInstanceOf(Array);
    });

    test('GET /api/mining/analytics/profile should return visitor & save metrics', async () => {
      const res = await request(app)
        .get('/api/mining/analytics/profile')
        .set('Authorization', `Bearer ${miningToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.profile_views).toBeDefined();
    });

    test('POST /api/mining/analytics/event should record custom event', async () => {
      const res = await request(app)
        .post('/api/mining/analytics/event')
        .set('Authorization', `Bearer ${miningToken}`)
        .send({
          event_type: 'product_view',
          entity_type: 'profile',
          metadata: { block_name: 'Rajasthan Black Raw Block' }
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });

  // ==========================================
  // 11. INTEGRATION WITH SHARED MODULES
  // ==========================================
  describe('Integration with Shared Modules (Ads, Inquiries, Leads, Settings)', () => {
    test('GET /api/mining/inquiries should retrieve mining inquiries', async () => {
      const res = await request(app)
        .get('/api/mining/inquiries')
        .set('Authorization', `Bearer ${miningToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.inquiries).toBeInstanceOf(Array);
    });

    test('GET /api/mining/leads should retrieve mining leads', async () => {
      const res = await request(app)
        .get('/api/mining/leads')
        .set('Authorization', `Bearer ${miningToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.leads).toBeInstanceOf(Array);
    });

    test('GET /api/mining/settings should access shared settings engine', async () => {
      const res = await request(app)
        .get('/api/mining/settings')
        .set('Authorization', `Bearer ${miningToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.notification_preferences).toBeDefined();
    });

    test('GET /api/mining/promotions/packages should access shared promotions engine', async () => {
      const res = await request(app)
        .get('/api/mining/promotions/packages')
        .set('Authorization', `Bearer ${miningToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.packages).toBeInstanceOf(Array);
    });
  });
});
