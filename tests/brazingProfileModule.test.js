const request = require('supertest');
const app = require('../server');
const User = require('../src/models/User');
const BusinessProfile = require('../src/models/BusinessProfile');
const BrazingService = require('../src/models/BrazingService');
const Inquiry = require('../src/models/Inquiry');
const jwt = require('jsonwebtoken');

describe('Stone Brazing & Tooling Service Module - Comprehensive Suite', () => {
  let brazingUser, customerUser;
  let brazingToken, customerToken;
  let brazingProfile;
  let testService;

  beforeEach(async () => {
    // 1. Brazing Service Provider User & Profile
    brazingUser = await User.create({
      name: 'Ramesh Kumar Saini',
      mobile: '9829054321',
      email: 'ramesh.brazing@apexbrazing.com',
      password: 'password123',
      role: 'brazing',
      status: 'active'
    });

    brazingToken = jwt.sign(
      { id: brazingUser._id, role: brazingUser.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1h' }
    );

    brazingProfile = await BusinessProfile.create({
      userId: brazingUser._id,
      business_type: 'brazing',
      company_name: 'Apex Diamond Brazing & Retipping Works',
      business_category: 'Brazing & Tooling Service',
      business_subcategory: 'Diamond Blade Retipping & Induction Brazing',
      short_description: 'Precision diamond blade brazing, re-tipping and segment tooling services for granite and marble cutting.',
      about_business: 'Apex Diamond Brazing & Retipping Works is a specialized tooling center providing high-frequency automated induction brazing, gangsaw blade re-tipping, and circular diamond saw segment services.',
      established_year: 2018,
      daily_brazing_capacity: '150 Blades / Day',
      blade_size_coverage: '14" – 72" (350mm – 1800mm)',
      brazing_technology: 'Automatic Induction Heating',
      service_pricing_range: '₹350 – ₹1,200 per Blade',
      silver_solder_alloy_grade: 'High Silver (49% Ag) Alloy & Flux',
      brazing_machine_model: 'Automated High-Frequency Induction Machine',
      address: {
        state: 'Rajasthan',
        district: 'Jaipur',
        area: 'VKI Area',
        industrial_area: 'VKI Industrial Area',
        commercial_area: 'Road No. 5',
        office_address: 'Plot 12-A, Road No. 5, VKI Industrial Area, Jaipur',
        full_address: 'Plot 12-A, Road No. 5, VKI Industrial Area, Jaipur, Rajasthan 302013',
        postal_code: '302013',
        country: 'India'
      },
      owners: [
        {
          name: 'Ramesh Kumar Saini',
          designation: 'Managing Director & Chief Technician',
          phone: '+91 98290 54321',
          email: 'brazing@stonemarket.com',
          whatsapp: '+91 98290 54321',
          is_primary: true
        }
      ],
      gallery_photos: [
        {
          url: 'https://stonemarket.com/uploads/workshop-1.jpg',
          title: 'Workshop Front',
          category: 'workshop',
          is_cover: true
        }
      ],
      gallery_videos: [
        {
          title: 'Workshop Overview',
          url: 'https://stonemarket.com/videos/workshop.mp4',
          video_url: 'https://stonemarket.com/videos/workshop.mp4',
          source_type: 'upload',
          category: 'walkthrough',
          duration: '1:45'
        }
      ],
      verification_steps: {
        phone: { phone: '+91 98290 54321', status: 'verified', verified_at: new Date() },
        email: { email: 'brazing@stonemarket.com', status: 'verified', verified_at: new Date() },
        business: { registration_type: 'MSME / Udyam', registration_number: 'UDYAM-RJ-14-0012345', status: 'verified' },
        gst: { gstin: '08AABCB1234F1Z9', status: 'verified' }
      },
      is_verified: true,
      verification_status: 'approved',
      gst_number: '08AABCB1234F1Z9',
      rating: 4.9,
      review_count: 38,
      status: 'active'
    });

    testService = await BrazingService.create({
      providerId: brazingProfile._id,
      userId: brazingUser._id,
      service_id: 'BRZ-2026-1001',
      service_name: 'Gangsaw Blade Segment Brazing',
      brazing_service_type: 'Gangsaw Blade Brazing',
      blade_size_supported: '14" – 72" (350mm – 1800mm)',
      daily_brazing_capacity: '150 Blades / Day',
      service_price: 450,
      pricing_unit: 'Per Blade',
      status: 'active'
    });

    // 2. Customer / External User
    customerUser = await User.create({
      name: 'Amit Sharma',
      mobile: '9829099999',
      email: 'amit.customer@gmail.com',
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
  describe('1. Brazing Dashboard & Business Switcher', () => {
    it('should return complete brazing dashboard structure with 4 operational summary cards', async () => {
      const res = await request(app)
        .get('/api/brazing/dashboard')
        .set('Authorization', `Bearer ${brazingToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const data = res.body.data;

      // Business Profile Card
      expect(data.business_profile_card).toBeDefined();
      expect(data.business_profile_card.business_name).toBe('Apex Diamond Brazing & Retipping Works');
      expect(data.business_profile_card.brazing_service_badge).toBe('Brazing & Tooling Service');
      expect(data.business_profile_card.rating).toBe(4.9);
      expect(data.business_profile_card.total_reviews).toBe(38);

      // 4 Operational Summary Cards
      expect(data.operational_summary).toBeDefined();
      expect(data.operational_summary.card_1.label).toBe('Daily Brazing Capacity');
      expect(data.operational_summary.card_1.value).toBe('150 Blades / Day');
      expect(data.operational_summary.card_2.label).toBe('Blade Size Coverage');
      expect(data.operational_summary.card_2.value).toBe('14" – 72" (350mm – 1800mm)');
      expect(data.operational_summary.card_3.label).toBe('Brazing Technology');
      expect(data.operational_summary.card_3.value).toBe('Automatic Induction Heating');
      expect(data.operational_summary.card_4.label).toBe('Service Pricing');
      expect(data.operational_summary.card_4.value).toBe('₹350 – ₹1,200 per Blade');

      // Stats
      expect(data.stats).toBeDefined();
      expect(data.stats.total_services).toBe(1);
      expect(data.stats.active_services).toBe(1);

      // My Business (6 items)
      expect(data.my_business).toHaveLength(6);
      expect(data.my_business.map(i => i.id)).toEqual([
        'profile',
        'services',
        'gallery',
        'verification',
        'analytics',
        'promotions'
      ]);

      // Business Activity (2 items)
      expect(data.business_activity).toHaveLength(2);
      expect(data.business_activity.map(i => i.id)).toEqual(['inquiries', 'leads']);

      // Capabilities
      expect(data.capabilities.is_service_based).toBe(true);
      expect(data.capabilities.has_inventory).toBe(false);
      expect(data.capabilities.has_products).toBe(false);
      expect(data.capabilities.has_services_management).toBe(true);
    });

    it('should retrieve available business types with brazing marked current', async () => {
      const res = await request(app)
        .get('/api/brazing/business-types')
        .set('Authorization', `Bearer ${brazingToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.current_type).toBe('brazing');
      const brazingType = res.body.data.types.find(t => t.id === 'brazing');
      expect(brazingType).toBeDefined();
      expect(brazingType.current).toBe(true);
      expect(brazingType.name).toBe('Brazing & Tooling Service');
    });

    it('should allow switching business type to/from brazing', async () => {
      const res = await request(app)
        .post('/api/brazing/switch-business-type')
        .set('Authorization', `Bearer ${brazingToken}`)
        .send({ target_business_type: 'trader' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.business_type).toBe('trader');
      expect(res.body.data.redirect_url).toBe('/trader/dashboard');

      const updatedUser = await User.findById(brazingUser._id);
      expect(updatedUser.role).toBe('trader');
    });
  });

  // ==========================================
  // 2. PRODUCT MANAGEMENT DISABLED ENFORCEMENT
  // ==========================================
  describe('2. Product Management Disabled (403 Forbidden)', () => {
    it('should block /api/brazing/products with 403 Forbidden', async () => {
      const resGet = await request(app)
        .get('/api/brazing/products')
        .set('Authorization', `Bearer ${brazingToken}`);

      expect(resGet.status).toBe(403);
      expect(resGet.body.success).toBe(false);
      expect(resGet.body.message).toContain('Product & Inventory Management is not available');

      const resPost = await request(app)
        .post('/api/brazing/products')
        .set('Authorization', `Bearer ${brazingToken}`)
        .send({ name: 'Diamond Blade' });

      expect(resPost.status).toBe(403);
    });

    it('should block /api/brazing/inventory with 403 Forbidden', async () => {
      const res = await request(app)
        .get('/api/brazing/inventory')
        .set('Authorization', `Bearer ${brazingToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  // ==========================================
  // 3. BRAZING BUSINESS PROFILE & OPERATIONAL SPECS
  // ==========================================
  describe('3. Profile & Operational Specifications', () => {
    it('should retrieve brazing profile with operational specifications', async () => {
      const res = await request(app)
        .get('/api/brazing/profile')
        .set('Authorization', `Bearer ${brazingToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.company_name).toBe('Apex Diamond Brazing & Retipping Works');
      expect(res.body.data.operational_specifications.daily_brazing_capacity).toBe('150 Blades / Day');
      expect(res.body.data.operational_specifications.blade_size_coverage).toBe('14" – 72" (350mm – 1800mm)');
      expect(res.body.data.operational_specifications.brazing_technology).toBe('Automatic Induction Heating');
      expect(res.body.data.operational_specifications.service_pricing_range).toBe('₹350 – ₹1,200 per Blade');
    });

    it('should update profile and operational specifications', async () => {
      const updateData = {
        company_name: 'Apex Precision Diamond Tooling & Brazing',
        daily_brazing_capacity: '200 Blades / Day',
        blade_size_coverage: '12" – 84" (300mm – 2100mm)',
        brazing_technology: 'CNC Automated Multi-Frequency Induction',
        service_pricing_range: '₹400 – ₹1,500 per Blade',
        silver_solder_alloy_grade: 'Premium Silver (56% Ag) Alloy'
      };

      const res = await request(app)
        .put('/api/brazing/profile')
        .set('Authorization', `Bearer ${brazingToken}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.company_name).toBe(updateData.company_name);
      expect(res.body.data.daily_brazing_capacity).toBe('200 Blades / Day');
      expect(res.body.data.blade_size_coverage).toBe('12" – 84" (300mm – 2100mm)');
      expect(res.body.data.brazing_technology).toBe('CNC Automated Multi-Frequency Induction');
    });
  });

  // ==========================================
  // 4. BRAZING SERVICES MANAGEMENT (CRUD & 4-STEP WIZARD)
  // ==========================================
  describe('4. Brazing Services Management (4-Step Wizard & Lifecycle)', () => {
    it('should create a service via 4-step wizard with auto-generated service_id', async () => {
      const servicePayload = {
        // Step 1: Basic & Media
        service_name: 'Circular Multi-Blade Retipping & Brazing',
        brazing_service_type: 'Circular Blade Brazing',
        description: 'Complete inspection, silver alloy brazing, and tension balance alignment for circular gangsaw and block cutter blades.',
        images: ['https://stonemarket.com/brazing/img1.jpg', 'https://stonemarket.com/brazing/img2.jpg'],
        cover_image: 'https://stonemarket.com/brazing/img1.jpg',

        // Step 2: Specifications
        blade_size_supported: '24" – 48" (600mm – 1200mm)',
        daily_brazing_capacity: '80 Blades / Day',
        silver_solder_grade: 'High Silver (49% Ag) Alloy & Flux',
        brazing_machine_model: 'Automated High-Frequency Induction Machine',
        brazing_technology: 'Automatic Induction Heating',
        heating_method: 'High-Frequency Induction',
        segment_type: 'Sandwich & Multilayer Diamond Segments',
        diamond_segment_compatibility: 'Granite & Sandstone Segments',
        supported_blade_materials: ['Hardened Steel Core', 'Carbon Steel 75Cr1'],
        quality_standards: 'ISO 9001:2015 & FEPA Safety Standards',

        // Step 3: Pricing & Terms
        service_price: 650,
        pricing_unit: 'Per Blade',
        turnaround_time: '24 Hours Dispatch',
        minimum_order_quantity: 5,
        bulk_order_pricing: '10% discount for orders above 25 blades',
        pickup_delivery_availability: true,
        service_warranty: '30-Day Segment Retention Guarantee',
        terms_and_conditions: 'Worn-out blades must be free of major structural cracks before re-tipping.',

        // Step 4: Review & Publish
        target_areas: [
          { state_name: 'Rajasthan', districts: ['Jaipur', 'Ajmer', 'Kishangarh', 'Rajsamand'] },
          { state_name: 'Gujarat', districts: ['Ahmedabad', 'Surat'] }
        ],
        target_categories: ['Manufacturer', 'Mining', 'Showroom'],
        status: 'active'
      };

      const res = await request(app)
        .post('/api/brazing/services')
        .set('Authorization', `Bearer ${brazingToken}`)
        .send(servicePayload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.service_name).toBe(servicePayload.service_name);
      expect(res.body.data.service_id).toMatch(/^BRZ-\d{4}-\d{4}$/);
      expect(res.body.data.service_price).toBe(650);
      expect(res.body.data.pricing_unit).toBe('Per Blade');
      expect(res.body.data.status).toBe('active');
    });

    it('should fail service creation when required fields are missing', async () => {
      const res = await request(app)
        .post('/api/brazing/services')
        .set('Authorization', `Bearer ${brazingToken}`)
        .send({
          service_name: 'Incomplete Service'
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBeDefined();
    });

    it('should get services list with status counts and search filter', async () => {
      // Create second service (draft)
      await BrazingService.create({
        providerId: brazingProfile._id,
        userId: brazingUser._id,
        service_id: 'BRZ-2026-9002',
        service_name: 'Diamond Core Drill Bit Re-tipping',
        brazing_service_type: 'Core Drill Bit Re-tipping',
        blade_size_supported: '50mm – 300mm Core Bits',
        daily_brazing_capacity: '120 Bits / Day',
        service_price: 350,
        pricing_unit: 'Per Job',
        status: 'draft'
      });

      // Get all services
      const resAll = await request(app)
        .get('/api/brazing/services?status=all')
        .set('Authorization', `Bearer ${brazingToken}`);

      expect(resAll.status).toBe(200);
      expect(resAll.body.success).toBe(true);
      expect(resAll.body.data.counts.all).toBeGreaterThanOrEqual(2);
      expect(resAll.body.data.counts.active).toBeGreaterThanOrEqual(1);
      expect(resAll.body.data.counts.draft).toBeGreaterThanOrEqual(1);

      // Search by keyword
      const resSearch = await request(app)
        .get('/api/brazing/services?search=Core Drill')
        .set('Authorization', `Bearer ${brazingToken}`);

      expect(resSearch.status).toBe(200);
      expect(resSearch.body.data.services.length).toBe(1);
      expect(resSearch.body.data.services[0].service_name).toContain('Core Drill');
    });

    it('should get service details by id', async () => {
      const res = await request(app)
        .get(`/api/brazing/services/${testService._id}`)
        .set('Authorization', `Bearer ${brazingToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id.toString()).toBe(testService._id.toString());
    });

    it('should update service details', async () => {
      const res = await request(app)
        .put(`/api/brazing/services/${testService._id}`)
        .set('Authorization', `Bearer ${brazingToken}`)
        .send({
          service_price: 700,
          turnaround_time: 'Same Day Dispatch'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.service_price).toBe(700);
      expect(res.body.data.turnaround_time).toBe('Same Day Dispatch');
    });

    it('should duplicate an existing service as draft with (Copy) suffix', async () => {
      const res = await request(app)
        .post(`/api/brazing/services/${testService._id}/duplicate`)
        .set('Authorization', `Bearer ${brazingToken}`);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.service_name).toContain('(Copy)');
      expect(res.body.data.status).toBe('draft');
      expect(res.body.data.service_id).toMatch(/^BRZ-\d{4}-\d{4}$/);
      expect(res.body.data._id.toString()).not.toBe(testService._id.toString());
    });

    it('should toggle service status between active and inactive', async () => {
      const resToggle = await request(app)
        .patch(`/api/brazing/services/${testService._id}/status`)
        .set('Authorization', `Bearer ${brazingToken}`);

      expect(resToggle.status).toBe(200);
      expect(resToggle.body.success).toBe(true);
      expect(resToggle.body.data.status).toBe('inactive');

      // Toggle back to active
      const resBack = await request(app)
        .patch(`/api/brazing/services/${testService._id}/status`)
        .set('Authorization', `Bearer ${brazingToken}`)
        .send({ status: 'active' });

      expect(resBack.status).toBe(200);
      expect(resBack.body.data.status).toBe('active');
    });

    it('should delete a service by id', async () => {
      const res = await request(app)
        .delete(`/api/brazing/services/${testService._id}`)
        .set('Authorization', `Bearer ${brazingToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const check = await BrazingService.findById(testService._id);
      expect(check).toBeNull();
    });
  });

  // ==========================================
  // 5. CONTACTS / KEY PERSONS
  // ==========================================
  describe('5. Contacts Management', () => {
    it('should add a new contact person', async () => {
      const res = await request(app)
        .post('/api/brazing/contacts')
        .set('Authorization', `Bearer ${brazingToken}`)
        .send({
          name: 'Sunil Verma',
          designation: 'Senior Induction Brazing Technician',
          phone: '+91 98290 88888',
          whatsapp: '+91 98290 88888',
          email: 'sunil@apexbrazing.com',
          is_primary: false
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Sunil Verma');
    });

    it('should get list of contacts', async () => {
      const res = await request(app)
        .get('/api/brazing/contacts')
        .set('Authorization', `Bearer ${brazingToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('should update a contact person', async () => {
      const primaryContact = brazingProfile.owners[0];
      const res = await request(app)
        .put(`/api/brazing/contacts/${primaryContact._id}`)
        .set('Authorization', `Bearer ${brazingToken}`)
        .send({
          designation: 'Head of Quality & Brazing Operations'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.designation).toBe('Head of Quality & Brazing Operations');
    });

    it('should delete a contact person', async () => {
      const primaryContact = brazingProfile.owners[0];
      const res = await request(app)
        .delete(`/api/brazing/contacts/${primaryContact._id}`)
        .set('Authorization', `Bearer ${brazingToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ==========================================
  // 6. GALLERY MANAGEMENT
  // ==========================================
  describe('6. Gallery Management', () => {
    it('should upload a gallery photo', async () => {
      const res = await request(app)
        .post('/api/brazing/gallery/photos')
        .set('Authorization', `Bearer ${brazingToken}`)
        .send({
          url: 'https://stonemarket.com/uploads/workshop-machine-1.jpg',
          title: 'High-Frequency Induction Brazing Unit',
          caption: 'High-precision automated temperature controller',
          category: 'machine',
          is_cover: true
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('High-Frequency Induction Brazing Unit');
    });

    it('should add a gallery video', async () => {
      const res = await request(app)
        .post('/api/brazing/gallery/videos')
        .set('Authorization', `Bearer ${brazingToken}`)
        .send({
          title: 'Gangsaw Blade Re-tipping Live Demo',
          video_url: 'https://stonemarket.com/videos/brazing-demo.mp4',
          youtube_url: 'https://youtube.com/watch?v=brazing123',
          source_type: 'youtube',
          category: 'brazing_demo',
          duration: '3:15'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Gangsaw Blade Re-tipping Live Demo');
    });

    it('should get gallery photos and videos', async () => {
      const res = await request(app)
        .get('/api/brazing/gallery')
        .set('Authorization', `Bearer ${brazingToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.photos.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data.videos.length).toBeGreaterThanOrEqual(1);
    });

    it('should delete gallery photo and video', async () => {
      const photoId = brazingProfile.gallery_photos[0]._id;
      const videoId = brazingProfile.gallery_videos[0]._id;

      const resPhoto = await request(app)
        .delete(`/api/brazing/gallery/photos/${photoId}`)
        .set('Authorization', `Bearer ${brazingToken}`);

      expect(resPhoto.status).toBe(200);

      const resVideo = await request(app)
        .delete(`/api/brazing/gallery/videos/${videoId}`)
        .set('Authorization', `Bearer ${brazingToken}`);

      expect(resVideo.status).toBe(200);
    });
  });

  // ==========================================
  // 7. VERIFICATION CENTER
  // ==========================================
  describe('7. Verification Center', () => {
    it('should retrieve verification status', async () => {
      const res = await request(app)
        .get('/api/brazing/verification')
        .set('Authorization', `Bearer ${brazingToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.overall_progress).toBe(100);
      expect(res.body.data.is_verified).toBe(true);
    });

    it('should send and verify phone OTP', async () => {
      const sendRes = await request(app)
        .post('/api/brazing/verification/phone/send-otp')
        .set('Authorization', `Bearer ${brazingToken}`);

      expect(sendRes.status).toBe(200);
      expect(sendRes.body.success).toBe(true);

      const verifyRes = await request(app)
        .post('/api/brazing/verification/phone/verify-otp')
        .set('Authorization', `Bearer ${brazingToken}`)
        .send({
          phone: '+91 98290 54321',
          otp: '123456'
        });

      expect(verifyRes.status).toBe(200);
      expect(verifyRes.body.success).toBe(true);
      expect(verifyRes.body.data.status).toBe('verified');
    });

    it('should submit GST verification', async () => {
      const res = await request(app)
        .post('/api/brazing/verification/gst')
        .set('Authorization', `Bearer ${brazingToken}`)
        .send({ gstin: '08AABCB1234F1Z9' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.gstin).toBe('08AABCB1234F1Z9');
    });

    it('should upload verification document', async () => {
      const res = await request(app)
        .post('/api/brazing/verification/documents')
        .set('Authorization', `Bearer ${brazingToken}`)
        .send({
          document_name: 'Factory Inspectorate Registration',
          document_type: 'Factory License',
          document_number: 'FAC-RJ-2022-881'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.document_name).toBe('Factory Inspectorate Registration');
    });
  });

  // ==========================================
  // 8. ANALYTICS ENGINE
  // ==========================================
  describe('8. Analytics Engine', () => {
    it('should load brazing analytics data', async () => {
      const res = await request(app)
        .get('/api/brazing/analytics')
        .set('Authorization', `Bearer ${brazingToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.metrics.total_profile_views).toBeDefined();
      expect(res.body.data.chart_data.timeline).toHaveLength(7);
    });

    it('should record an analytics event', async () => {
      const res = await request(app)
        .post('/api/brazing/analytics/event')
        .set('Authorization', `Bearer ${brazingToken}`)
        .send({
          event_type: 'contact_click',
          metadata: { source: 'dashboard_profile_card' }
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });

  // ==========================================
  // 9. INQUIRIES & LEAD MANAGEMENT
  // ==========================================
  describe('9. Inquiries & Lead Management', () => {
    beforeEach(async () => {
      await Inquiry.create({
        businessId: brazingProfile._id,
        senderId: customerUser._id,
        category: 'Brazing & Tooling Service',
        subject: 'Requirement for circular blade re-tipping (40 blades)',
        message: 'Looking for fast re-tipping service in Kishangarh area.',
        status: 'pending'
      });
    });

    it('should retrieve inquiries for brazing business', async () => {
      const res = await request(app)
        .get('/api/brazing/inquiries')
        .set('Authorization', `Bearer ${brazingToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('should retrieve matching leads for brazing business', async () => {
      const res = await request(app)
        .get('/api/brazing/leads')
        .set('Authorization', `Bearer ${brazingToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ==========================================
  // 10. SHARED MODULES & CMS ALIASES
  // ==========================================
  describe('10. Shared Modules & CMS Aliases', () => {
    it('should allow brazing business to access promotions (Ad Management)', async () => {
      const res = await request(app)
        .get('/api/brazing/promotions')
        .set('Authorization', `Bearer ${brazingToken}`);

      expect(res.status).toBe(200);
    });

    it('should allow brazing business to access account settings', async () => {
      const res = await request(app)
        .get('/api/brazing/settings')
        .set('Authorization', `Bearer ${brazingToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.business_profile_card).toBeDefined();
      expect(res.body.data.business_profile_card.company_name).toBe('Apex Diamond Brazing & Retipping Works');
    });

    it('should allow brazing business to access invoices', async () => {
      const res = await request(app)
        .get('/api/brazing/invoices')
        .set('Authorization', `Bearer ${brazingToken}`);

      expect(res.status).toBe(200);
    });

    it('should support /api/cms/brazing/dashboard alias', async () => {
      const res = await request(app)
        .get('/api/cms/brazing/dashboard')
        .set('Authorization', `Bearer ${brazingToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.business_profile_card.business_name).toBe('Apex Diamond Brazing & Retipping Works');
    });
  });
});
