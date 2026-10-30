const request = require('supertest');
const app = require('../server');
const User = require('../src/models/User');
const BusinessProfile = require('../src/models/BusinessProfile');
const Product = require('../src/models/Product');
const Inquiry = require('../src/models/Inquiry');
const QuoteRequest = require('../src/models/QuoteRequest');
const GraniteColor = require('../src/models/GraniteColor');
const AnalyticsEvent = require('../src/models/AnalyticsEvent');
const jwt = require('jsonwebtoken');

describe('Manufacturer Profile Module (Phase 1)', () => {
  let manufacturerUser;
  let manufacturerToken;
  let manufacturerProfile;
  let testGraniteColor;

  beforeEach(async () => {
    // 1. Create Manufacturer User & Token
    manufacturerUser = await User.create({
      name: 'Suresh Sharma',
      mobile: '9111111104',
      email: 'suresh.mfg@mockstonemarket.com',
      password: 'password123',
      role: 'manufacturer',
      status: 'active'
    });

    manufacturerToken = jwt.sign(
      { id: manufacturerUser._id, role: manufacturerUser.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1h' }
    );

    // 2. Create Granite Color
    testGraniteColor = await GraniteColor.create({
      name: 'Rajasthan Black',
      image: 'https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?auto=format&fit=crop&w=800&q=80'
    });

    // 3. Create Business Profile for Manufacturer
    manufacturerProfile = await BusinessProfile.create({
      userId: manufacturerUser._id,
      business_type: 'manufacturer',
      company_name: 'Royal Rajasthan Granite Factory',
      gst_number: '08AAACR9988C1Z3',
      established_year: 2015,
      monthly_capacity: 250000,
      capacity_unit: 'Sq.Ft',
      premises_status: 'owned',
      factory_type: 'owned',
      unit_status: 'export',
      is_export_unit: true,
      iec_number: '0512034918',
      company_details: 'Export-oriented modern granite processing factory with gangsaw and multi-head line polishers.',
      granite_colors: [testGraniteColor._id],
      machines: [
        { machine_name: 'Multi-Blade Gangsaw', quantity: 4, category: 'Cutting', description: 'Heavy gangsaw for raw blocks' },
        { machine_name: '16-Head Line Polisher', quantity: 2, category: 'Polishing', description: 'Automatic slab polisher' }
      ],
      owners: [
        {
          name: 'Suresh Sharma',
          designation: 'Managing Director',
          phone: '9111111104',
          whatsapp: '9111111104',
          email: 'suresh.mfg@mockstonemarket.com',
          is_primary: true
        }
      ],
      address: {
        state: 'Rajasthan',
        district: 'Jalore',
        area: 'RIICO Phase 1',
        industrial_area: 'RIICO Industrial Area',
        full_address: 'F-142, RIICO Industrial Area Phase 1, Jalore, Rajasthan 343001',
        postal_code: '343001',
        country: 'India'
      },
      rating: 4.8,
      review_count: 24,
      status: 'active'
    });
  });

  // ==========================================
  // 1. DASHBOARD & BUSINESS TYPE SWITCHER
  // ==========================================
  describe('Manufacturer Dashboard & Switcher', () => {
    it('should fetch manufacturer dashboard data with KPIs, quick stats and navigation', async () => {
      const res = await request(app)
        .get('/api/manufacturer/dashboard')
        .set('Authorization', `Bearer ${manufacturerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.business_info.company_name).toBe('Royal Rajasthan Granite Factory');
      expect(res.body.data.business_info.business_type).toBe('Manufacturer');
      expect(res.body.data.quick_stats).toBeDefined();
      expect(res.body.data.navigation_menu.length).toBeGreaterThanOrEqual(6);
      expect(res.body.data.business_switcher.current_business_type).toBe('manufacturer');
    });

    it('should fetch available business types for user', async () => {
      const res = await request(app)
        .get('/api/manufacturer/business-types')
        .set('Authorization', `Bearer ${manufacturerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      const mfgType = res.body.data.find(t => t.key === 'manufacturer');
      expect(mfgType.has_profile).toBe(true);
      expect(mfgType.is_current).toBe(true);
    });

    it('should switch business type when profile exists or reject when missing', async () => {
      const res = await request(app)
        .post('/api/manufacturer/switch-business-type')
        .set('Authorization', `Bearer ${manufacturerToken}`)
        .send({ target_business_type: 'mining' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  // ==========================================
  // 2. BUSINESS PROFILE MANAGEMENT
  // ==========================================
  describe('Business Profile Management', () => {
    it('should get full manufacturer profile', async () => {
      const res = await request(app)
        .get('/api/manufacturer/profile')
        .set('Authorization', `Bearer ${manufacturerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.company_name).toBe('Royal Rajasthan Granite Factory');
      expect(res.body.data.verification_metrics).toBeDefined();
    });

    it('should update business profile details', async () => {
      const res = await request(app)
        .put('/api/manufacturer/profile')
        .set('Authorization', `Bearer ${manufacturerToken}`)
        .send({
          company_name: 'Royal Rajasthan Granite & Marble Ltd',
          about_business: 'Premier manufacturer and exporter of Indian granites',
          factory_timings: '08:00 AM - 08:00 PM',
          address: {
            full_address: 'Survey No. 50, Jalore Industrial Area',
            district: 'Jalore',
            state: 'Rajasthan',
            postal_code: '343002'
          }
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.company_name).toBe('Royal Rajasthan Granite & Marble Ltd');
      expect(res.body.data.about_business).toContain('Premier manufacturer');
    });

    it('should update operational factory specifications', async () => {
      const res = await request(app)
        .put('/api/manufacturer/factory-specs')
        .set('Authorization', `Bearer ${manufacturerToken}`)
        .send({
          monthly_capacity: 350000,
          capacity_unit: 'Sq.Ft',
          unit_status: 'both',
          iec_number: '0512034918',
          factory_type: 'owned',
          factory_timings: '24 Hours Operational',
          export_countries: ['USA', 'UAE', 'Germany', 'Australia', 'Japan']
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.monthly_capacity).toBe(350000);
      expect(res.body.data.unit_status).toBe('both');
      expect(res.body.data.is_export_unit).toBe(true);
    });

    // Machinery Setup
    it('should add, get, update, and delete factory machinery', async () => {
      // Add machine
      const addRes = await request(app)
        .post('/api/manufacturer/machinery')
        .set('Authorization', `Bearer ${manufacturerToken}`)
        .send({
          machine_name: '5-Axis CNC Bridge Saw',
          quantity: 2,
          category: 'Cutting',
          description: 'High precision profile cutter'
        });

      expect(addRes.status).toBe(201);
      expect(addRes.body.data.length).toBe(3);
      const newMachineId = addRes.body.data[2]._id;

      // Get machinery
      const getRes = await request(app)
        .get('/api/manufacturer/machinery')
        .set('Authorization', `Bearer ${manufacturerToken}`);

      expect(getRes.status).toBe(200);
      expect(getRes.body.data.length).toBe(3);

      // Update machine
      const updateRes = await request(app)
        .put(`/api/manufacturer/machinery/${newMachineId}`)
        .set('Authorization', `Bearer ${manufacturerToken}`)
        .send({ quantity: 3, description: 'Updated CNC machine description' });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.quantity).toBe(3);

      // Delete machine
      const delRes = await request(app)
        .delete(`/api/manufacturer/machinery/${newMachineId}`)
        .set('Authorization', `Bearer ${manufacturerToken}`);

      expect(delRes.status).toBe(200);
      expect(delRes.body.data.length).toBe(2);
    });

    // Stone Varieties
    it('should manage stone varieties catalogue', async () => {
      // Add custom variety
      const addRes = await request(app)
        .post('/api/manufacturer/stone-varieties')
        .set('Authorization', `Bearer ${manufacturerToken}`)
        .send({
          name: 'Alaska White Granite',
          category: 'White Granite',
          finish: 'Polished'
        });

      expect(addRes.status).toBe(201);
      expect(addRes.body.data.custom_varieties.length).toBe(1);
      const varietyId = addRes.body.data.custom_varieties[0]._id;

      // Get varieties
      const getRes = await request(app)
        .get('/api/manufacturer/stone-varieties')
        .set('Authorization', `Bearer ${manufacturerToken}`);

      expect(getRes.status).toBe(200);
      expect(getRes.body.data.selected_master_varieties.length).toBe(1);
      expect(getRes.body.data.custom_varieties.length).toBe(1);

      // Delete variety
      const delRes = await request(app)
        .delete(`/api/manufacturer/stone-varieties/${varietyId}`)
        .set('Authorization', `Bearer ${manufacturerToken}`);

      expect(delRes.status).toBe(200);
    });

    // Contacts & Owners
    it('should manage multiple business contacts & owners', async () => {
      // Add contact
      const addRes = await request(app)
        .post('/api/manufacturer/contacts')
        .set('Authorization', `Bearer ${manufacturerToken}`)
        .send({
          name: 'Rajesh Sharma',
          designation: 'Operations Director',
          phone: '9111111122',
          email: 'rajesh@mockstonemarket.com',
          is_primary: false
        });

      expect(addRes.status).toBe(201);
      expect(addRes.body.data.name).toBe('Rajesh Sharma');
      const contactId = addRes.body.data._id;

      // List contacts
      const listRes = await request(app)
        .get('/api/manufacturer/contacts')
        .set('Authorization', `Bearer ${manufacturerToken}`);

      expect(listRes.status).toBe(200);
      expect(listRes.body.data.length).toBe(2);

      // Update contact
      const updateRes = await request(app)
        .put(`/api/manufacturer/contacts/${contactId}`)
        .set('Authorization', `Bearer ${manufacturerToken}`)
        .send({ designation: 'Executive Partner' });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.designation).toBe('Executive Partner');

      // Delete contact
      const delRes = await request(app)
        .delete(`/api/manufacturer/contacts/${contactId}`)
        .set('Authorization', `Bearer ${manufacturerToken}`);

      expect(delRes.status).toBe(200);
      expect(delRes.body.data.length).toBe(1);
    });
  });

  // ==========================================
  // 3. PRODUCT MANAGEMENT & 4-STEP WIZARD
  // ==========================================
  describe('Product Management (4-Step Wizard & Publishing)', () => {
    let testProductId;

    it('should create product as draft using 4-step wizard attributes', async () => {
      const res = await request(app)
        .post('/api/manufacturer/products')
        .set('Authorization', `Bearer ${manufacturerToken}`)
        .send({
          name: 'Black Galaxy Premium Gangsaw Slab',
          material: 'Granite',
          description: 'Deep black granite with golden bronze specks for luxury interiors and export.',
          images: [
            'https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1590402494587-44b71d7772f6?auto=format&fit=crop&w=800&q=80'
          ],
          cover_image: 'https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?auto=format&fit=crop&w=800&q=80',
          pattern: 'Speckled Golden Flecks',
          finish: 'High Gloss Polished',
          size: '10ft x 6ft (Gangsaw)',
          thickness: '20mm',
          quality: 'Premium First Choice',
          approx_weight: '75 kg/sq.m',
          country_of_origin: 'India',
          applications: ['Countertops', 'Flooring', 'Wall Cladding'],
          selling_price: 185,
          pricing_unit: 'Sq.ft',
          quantity: 25000,
          quantity_unit: 'Sq.ft',
          available_stock: 12000,
          stock_unit: 'Sq.ft',
          availability_status: 'in_stock',
          target_publishing: {
            states: ['Rajasthan', 'Gujarat', 'Maharashtra', 'Karnataka'],
            districts: ['Jaipur', 'Kishangarh', 'Ahmedabad', 'Mumbai'],
            categories: ['Granite Manufacturer', 'Showroom']
          },
          publishing_status: 'draft'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Black Galaxy Premium Gangsaw Slab');
      expect(res.body.data.publishing_status).toBe('draft');
      expect(res.body.data.status).toBe('draft');
      testProductId = res.body.data._id;
    });

    it('should list manufacturer products with search and status filters', async () => {
      // Create one active product
      await Product.create({
        vendorId: manufacturerProfile._id,
        businessProfileId: manufacturerProfile._id,
        name: 'Steel Grey Flamed Outdoor Tiles',
        material: 'Granite',
        description: 'Hard-wearing non-slip flamed tiles',
        selling_price: 65,
        pricing_unit: 'Sq.ft',
        status: 'active',
        publishing_status: 'published'
      });

      const res = await request(app)
        .get('/api/manufacturer/products?status_tab=active')
        .set('Authorization', `Bearer ${manufacturerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.products.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data.products[0].name).toBe('Steel Grey Flamed Outdoor Tiles');
    });

    it('should publish a draft product to active status', async () => {
      const draftProd = await Product.create({
        vendorId: manufacturerProfile._id,
        businessProfileId: manufacturerProfile._id,
        name: 'Alaska White Polished Slabs',
        material: 'Granite',
        description: 'Warm white granite with silver quartz veins',
        selling_price: 140,
        pricing_unit: 'Sq.ft',
        status: 'draft',
        publishing_status: 'draft'
      });

      const res = await request(app)
        .post(`/api/manufacturer/products/${draftProd._id}/publish`)
        .set('Authorization', `Bearer ${manufacturerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('active');
      expect(res.body.data.publishing_status).toBe('published');
    });

    it('should upload and delete product images', async () => {
      const prod = await Product.create({
        vendorId: manufacturerProfile._id,
        businessProfileId: manufacturerProfile._id,
        name: 'Test Image Product',
        material: 'Granite',
        description: 'Test product for image handling',
        images: ['https://example.com/img1.jpg']
      });

      // Upload image URL
      const uploadRes = await request(app)
        .post(`/api/manufacturer/products/${prod._id}/images`)
        .set('Authorization', `Bearer ${manufacturerToken}`)
        .send({ url: 'https://example.com/img2.jpg' });

      expect(uploadRes.status).toBe(200);
      expect(uploadRes.body.data.images.length).toBe(2);

      // Delete image
      const delRes = await request(app)
        .delete(`/api/manufacturer/products/${prod._id}/images/0`)
        .set('Authorization', `Bearer ${manufacturerToken}`);

      expect(delRes.status).toBe(200);
      expect(delRes.body.data.images.length).toBe(1);
    });

    it('should enforce max 5 images per product limit', async () => {
      const prod = await Product.create({
        vendorId: manufacturerProfile._id,
        businessProfileId: manufacturerProfile._id,
        name: 'Full Images Product',
        material: 'Granite',
        description: 'Product with 5 images',
        images: ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg']
      });

      const res = await request(app)
        .post(`/api/manufacturer/products/${prod._id}/images`)
        .set('Authorization', `Bearer ${manufacturerToken}`)
        .send({ url: '6.jpg' });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Maximum 5 images allowed');
    });
  });

  // ==========================================
  // 4. GALLERY MANAGEMENT
  // ==========================================
  describe('Gallery Management (Photos, Videos, Owners)', () => {
    it('should upload photo, set as cover, and retrieve gallery with counts', async () => {
      // Add photo 1
      const photo1Res = await request(app)
        .post('/api/manufacturer/gallery/photos')
        .set('Authorization', `Bearer ${manufacturerToken}`)
        .send({
          url: 'https://example.com/factory-front.jpg',
          title: 'Factory Front Elevation',
          is_cover: true
        });

      expect(photo1Res.status).toBe(201);
      expect(photo1Res.body.data.length).toBe(1);
      expect(photo1Res.body.data[0].is_cover).toBe(true);

      // Add photo 2
      const photo2Res = await request(app)
        .post('/api/manufacturer/gallery/photos')
        .set('Authorization', `Bearer ${manufacturerToken}`)
        .send({
          url: 'https://example.com/gangsaw-line.jpg',
          title: 'Gangsaw Production Line',
          is_cover: false
        });

      expect(photo2Res.status).toBe(201);
      expect(photo2Res.body.data.length).toBe(2);

      // Add video
      const videoRes = await request(app)
        .post('/api/manufacturer/gallery/videos')
        .set('Authorization', `Bearer ${manufacturerToken}`)
        .send({
          title: 'Factory Tour & Gangsaw Slicing in Action',
          youtube_url: 'https://www.youtube.com/watch?v=mock-tour',
          duration: '3:45',
          thumbnail: 'https://example.com/video-thumb.jpg'
        });

      expect(videoRes.status).toBe(201);
      expect(videoRes.body.data.length).toBe(1);

      // Get full gallery
      const galleryRes = await request(app)
        .get('/api/manufacturer/gallery')
        .set('Authorization', `Bearer ${manufacturerToken}`);

      expect(galleryRes.status).toBe(200);
      expect(galleryRes.body.data.counts.photos_count).toBe(2);
      expect(galleryRes.body.data.counts.videos_count).toBe(1);
      expect(galleryRes.body.data.counts.owners_count).toBe(1);
    });

    it('should update owner photo from gallery module', async () => {
      const ownerId = manufacturerProfile.owners[0]._id;

      const res = await request(app)
        .post(`/api/manufacturer/gallery/owners/${ownerId}/photo`)
        .set('Authorization', `Bearer ${manufacturerToken}`)
        .send({
          photo_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80'
        });

      expect(res.status).toBe(200);
      expect(res.body.data.photo).toContain('images.unsplash.com');
    });
  });

  // ==========================================
  // 5. VERIFICATION CENTER
  // ==========================================
  describe('Verification Center & Dynamic Checklist', () => {
    it('should get initial verification status with 0% completion and benefits', async () => {
      const res = await request(app)
        .get('/api/manufacturer/verification')
        .set('Authorization', `Bearer ${manufacturerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.percentage).toBe(0);
      expect(res.body.data.checklist.length).toBe(5);
      expect(res.body.data.benefits.length).toBeGreaterThanOrEqual(4);
    });

    it('should dispatch phone OTP and verify phone successfully', async () => {
      // Send OTP
      const sendRes = await request(app)
        .post('/api/manufacturer/verification/phone/send-otp')
        .set('Authorization', `Bearer ${manufacturerToken}`)
        .send({ phone: '9111111104' });

      expect(sendRes.status).toBe(200);
      expect(sendRes.body.success).toBe(true);

      // Verify OTP
      const verifyRes = await request(app)
        .post('/api/manufacturer/verification/phone/verify-otp')
        .set('Authorization', `Bearer ${manufacturerToken}`)
        .send({ otp: '123456' });

      expect(verifyRes.status).toBe(200);
      expect(verifyRes.body.data.percentage).toBe(20); // 1 of 5 = 20%
    });

    it('should submit business, GST and bank verification details', async () => {
      // Business verification
      const bRes = await request(app)
        .post('/api/manufacturer/verification/business')
        .set('Authorization', `Bearer ${manufacturerToken}`)
        .send({
          registration_type: 'Private Limited',
          registration_number: 'U14101RJ2015PTC048991',
          document_url: 'https://example.com/cin.pdf'
        });
      expect(bRes.status).toBe(200);
      expect(bRes.body.data.status).toBe('pending_review');

      // GST verification
      const gstRes = await request(app)
        .post('/api/manufacturer/verification/gst')
        .set('Authorization', `Bearer ${manufacturerToken}`)
        .send({
          gstin: '08AAACR9988C1Z3',
          certificate_url: 'https://example.com/gst-cert.pdf'
        });
      expect(gstRes.status).toBe(200);
      expect(gstRes.body.data.status).toBe('pending_review');

      // Bank verification
      const bankRes = await request(app)
        .post('/api/manufacturer/verification/bank')
        .set('Authorization', `Bearer ${manufacturerToken}`)
        .send({
          account_holder_name: 'Royal Rajasthan Granite Factory',
          bank_name: 'State Bank of India',
          account_number: '38192837491',
          ifsc_code: 'SBIN0001234',
          cheque_document_url: 'https://example.com/cheque.jpg'
        });
      expect(bankRes.status).toBe(200);
      expect(bankRes.body.data.status).toBe('pending_review');
    });

    it('should upload and fetch required documents', async () => {
      const uploadRes = await request(app)
        .post('/api/manufacturer/verification/documents')
        .set('Authorization', `Bearer ${manufacturerToken}`)
        .send({
          document_type: 'gst_certificate',
          title: 'Official GST Certificate',
          url: 'https://example.com/gst.pdf'
        });

      expect(uploadRes.status).toBe(201);
      expect(uploadRes.body.data.title).toBe('Official GST Certificate');

      const docsRes = await request(app)
        .get('/api/manufacturer/verification/documents')
        .set('Authorization', `Bearer ${manufacturerToken}`);

      expect(docsRes.status).toBe(200);
      expect(docsRes.body.data.length).toBe(1);
    });
  });

  // ==========================================
  // 6. MANUFACTURER ANALYTICS
  // ==========================================
  describe('Manufacturer Analytics (Overview, Leads, Profile)', () => {
    beforeEach(async () => {
      // Seed real analytics events for this manufacturer
      await AnalyticsEvent.create([
        {
          businessId: manufacturerProfile._id,
          eventType: 'profile_view',
          source: 'Marketplace Search',
          location: { city: 'Jaipur', state: 'Rajasthan' },
          timestamp: new Date()
        },
        {
          businessId: manufacturerProfile._id,
          eventType: 'product_view',
          source: 'Category Pages',
          location: { city: 'Ahmedabad', state: 'Gujarat' },
          timestamp: new Date()
        },
        {
          businessId: manufacturerProfile._id,
          eventType: 'contact_click',
          source: 'Service Detail',
          location: { city: 'Kishangarh', state: 'Rajasthan' },
          timestamp: new Date()
        }
      ]);

      // Seed an inquiry
      await Inquiry.create({
        senderId: manufacturerUser._id,
        businessId: manufacturerProfile._id,
        category: 'Granite Manufacturer',
        subject: 'Inquiry for 10,000 sqft Black Galaxy',
        quantity: 10000,
        unit: 'Sq.Ft'
      });
    });

    it('should get overview analytics with KPIs, daily views, doughnut sources and locations', async () => {
      const res = await request(app)
        .get('/api/manufacturer/analytics/overview?timeframe=this_week')
        .set('Authorization', `Bearer ${manufacturerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.kpis.total_views).toBeDefined();
      expect(res.body.data.views_over_time.length).toBe(7);
      expect(res.body.data.inquiry_sources.sources.length).toBeGreaterThanOrEqual(4);
      expect(res.body.data.audience_locations.length).toBeGreaterThanOrEqual(1);
    });

    it('should get lead analytics with KPIs and source breakdown', async () => {
      const res = await request(app)
        .get('/api/manufacturer/analytics/leads')
        .set('Authorization', `Bearer ${manufacturerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.kpis.total_leads).toBeDefined();
      expect(res.body.data.leads_by_source.length).toBe(5);
      expect(res.body.data.boost_your_leads).toBeDefined();
    });

    it('should get profile analytics with visitor insights and engagement', async () => {
      const res = await request(app)
        .get('/api/manufacturer/analytics/profile')
        .set('Authorization', `Bearer ${manufacturerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.kpis.profile_views).toBeDefined();
      expect(res.body.data.visitor_insights).toBeDefined();
      expect(res.body.data.profile_engagement.average_time_on_profile_seconds).toBeGreaterThan(0);
      expect(res.body.data.follower_growth).toBeDefined();
    });

    it('should record an analytics event from frontend interaction', async () => {
      const res = await request(app)
        .post('/api/manufacturer/analytics/event')
        .set('Authorization', `Bearer ${manufacturerToken}`)
        .send({
          eventType: 'profile_view',
          source: 'Marketplace Search',
          location: { city: 'Bengaluru', state: 'Karnataka' },
          metadata: { duration_seconds: 45 }
        });

      expect(res.status).toBe(201);
      expect(res.body.data.eventType).toBe('profile_view');
    });
  });

  // ==========================================
  // 7. INQUIRIES & LEADS
  // ==========================================
  describe('Business Inquiries & Leads', () => {
    it('should list manufacturer inquiries', async () => {
      await Inquiry.create({
        senderId: manufacturerUser._id,
        businessId: manufacturerProfile._id,
        category: 'Granite Manufacturer',
        subject: 'Requirement for 5000 sqft Alaska White slabs',
        quantity: 5000,
        unit: 'Sq.Ft'
      });

      const res = await request(app)
        .get('/api/manufacturer/inquiries')
        .set('Authorization', `Bearer ${manufacturerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.inquiries.length).toBeGreaterThanOrEqual(1);
    });

    it('should list manufacturer leads from quote requests', async () => {
      await QuoteRequest.create({
        userId: manufacturerUser._id,
        businessId: manufacturerProfile._id,
        quantity: 15000,
        unit: 'Sq.Ft',
        message: 'Direct quotation request for commercial airport terminal flooring'
      });

      const res = await request(app)
        .get('/api/manufacturer/leads')
        .set('Authorization', `Bearer ${manufacturerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.leads.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ==========================================
  // 8. SECURITY & AUTHORIZATION
  // ==========================================
  describe('Security & Authorization', () => {
    it('should reject unauthenticated request with 401', async () => {
      const res = await request(app).get('/api/manufacturer/dashboard');
      expect(res.status).toBe(401);
    });
  });
});
