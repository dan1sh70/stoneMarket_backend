const request = require('supertest');
const app = require('../server');
const User = require('../src/models/User');
const BusinessProfile = require('../src/models/BusinessProfile');
const Inquiry = require('../src/models/Inquiry');
const Lead = require('../src/models/Lead');
const AnalyticsEvent = require('../src/models/AnalyticsEvent');
const jwt = require('jsonwebtoken');

describe('Stone Trader Profile & Business Module (Phase 1)', () => {
  let traderUser;
  let traderToken;
  let traderProfile;

  beforeEach(async () => {
    // 1. Create Trader User & Token
    traderUser = await User.create({
      name: 'Rameshwar Lal Sharma',
      mobile: '9829054321',
      email: 'rameshwar.trader@mockstonemarket.com',
      password: 'password123',
      role: 'trader',
      status: 'active'
    });

    traderToken = jwt.sign(
      { id: traderUser._id, role: traderUser.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1h' }
    );

    // 2. Create Business Profile for Trader
    traderProfile = await BusinessProfile.create({
      userId: traderUser._id,
      business_type: 'trader',
      company_name: 'Shree Shyam Marble & Granite Traders',
      business_category: 'Stone Trader',
      business_subcategory: 'Wholesale & B2B Stone Sourcing Intermediary',
      short_description: 'Premier stone trading company sourcing premium granite, marble, and sandstone across India and export markets.',
      about_business: 'Leading commercial intermediary connecting manufacturers, quarry owners, showrooms, and project contractors for quality stone procurement.',
      established_year: 2012,
      trading_business_types: [
        'Wholesale Stone Trader',
        'Importer & Exporter',
        'Stone Distributor',
        'Stockist',
        'Bulk Material Supplier'
      ],
      trading_specializations: [
        'Granite',
        'Marble',
        'Sandstone',
        'Limestone',
        'Quartzite',
        'Tiles',
        'Other Natural Stones'
      ],
      trading_capabilities: [
        'Domestic Trading',
        'International Trading',
        'Wholesale Supply',
        'Bulk Orders',
        'Custom Orders'
      ],
      monthly_trading_volume: 3500,
      trading_volume_unit: 'Tons',
      min_order_quantity: 25,
      max_order_capacity: 10000,
      preferred_order_type: 'Wholesale & Bulk Orders',
      supply_network_coverage: 'Pan India & Export to UAE, USA, Europe',
      operating_markets: ['Domestic', 'International'],
      gst_number: '08AAAFS1234F1Z8',
      iec_number: 'IECRJ987654321',
      business_registration_number: 'REG-TRADER-RJ-2012-9901',
      trade_license_number: 'TL-KSH-2012-4412',
      rating: 4.9,
      review_count: 24,
      status: 'active',
      is_mock: false,
      address: {
        full_address: 'Marble Mandi Road, Madanganj, Kishangarh, Ajmer District, Rajasthan',
        office_address: 'Marble Mandi Road, Madanganj, Kishangarh, Ajmer District, Rajasthan',
        commercial_area: 'Kishangarh Marble Market Mandi',
        district: 'Ajmer',
        state: 'Rajasthan',
        country: 'India',
        postal_code: '305801',
        google_map_location: 'https://maps.google.com/?q=26.5794,74.8687',
        latitude: 26.5794,
        longitude: 74.8687
      },
      owners: [
        {
          name: 'Rameshwar Lal Sharma',
          designation: 'Managing Partner & Founder',
          phone: '9829054321',
          email: 'rameshwar.trader@mockstonemarket.com',
          is_primary: true
        }
      ]
    });
  });

  // ==========================================
  // 1. BUSINESS TYPE SWITCHING
  // ==========================================
  describe('Business Type Switching', () => {
    it('GET /api/trader/business-types - lists business types with current selection', async () => {
      const res = await request(app)
        .get('/api/trader/business-types')
        .set('Authorization', `Bearer ${traderToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.current_type).toBe('trader');
      expect(res.body.data.types).toBeInstanceOf(Array);

      const traderType = res.body.data.types.find(t => t.id === 'trader');
      expect(traderType).toBeDefined();
      expect(traderType.is_current).toBe(true);
      expect(traderType.has_products).toBe(false);
    });

    it('POST /api/trader/switch-business-type - successfully switches business type', async () => {
      const res = await request(app)
        .post('/api/trader/switch-business-type')
        .set('Authorization', `Bearer ${traderToken}`)
        .send({ target_business_type: 'showroom' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.target_business_type).toBe('showroom');
      expect(res.body.data.dashboard_url).toBe('/api/showroom/dashboard');
    });

    it('POST /api/trader/switch-business-type - rejects invalid business type', async () => {
      const res = await request(app)
        .post('/api/trader/switch-business-type')
        .set('Authorization', `Bearer ${traderToken}`)
        .send({ target_business_type: 'invalid_type' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // ==========================================
  // 2. TRADER DASHBOARD (NO PRODUCT MANAGEMENT)
  // ==========================================
  describe('Trader Dashboard', () => {
    it('GET /api/trader/dashboard - loads complete trader dashboard with 0 product references', async () => {
      const res = await request(app)
        .get('/api/trader/dashboard')
        .set('Authorization', `Bearer ${traderToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      const { business_profile, quick_stats, menus, bottom_navigation } = res.body.data;

      // Business Profile Card verification
      expect(business_profile.business_name).toBe('Shree Shyam Marble & Granite Traders');
      expect(business_profile.business_category).toBe('Stone Trader');
      expect(business_profile.location).toContain('Rajasthan');
      expect(business_profile.rating).toBe(4.9);
      expect(business_profile.review_count).toBe(24);

      // Quick Stats verification - Traders have inquiries, leads, quote requests, views, network suppliers
      expect(quick_stats).toHaveProperty('inquiries');
      expect(quick_stats).toHaveProperty('leads');
      expect(quick_stats).toHaveProperty('quote_requests');
      expect(quick_stats).toHaveProperty('profile_views');
      expect(quick_stats).not.toHaveProperty('total_products');
      expect(quick_stats).not.toHaveProperty('stock_value');

      // Menu structure verification - Must NOT contain Product Management
      const myBusinessMenu = menus.my_business;
      expect(myBusinessMenu).toBeInstanceOf(Array);
      expect(myBusinessMenu.length).toBe(5); // Profile, Gallery, Verification, Analytics, Ad Management
      const productItem = myBusinessMenu.find(item =>
        item.title.toLowerCase().includes('product') || item.route.includes('products')
      );
      expect(productItem).toBeUndefined();

      // Ensure expected items exist
      const itemTitles = myBusinessMenu.map(m => m.title);
      expect(itemTitles).toContain('Business Profile');
      expect(itemTitles).toContain('Gallery');
      expect(itemTitles).toContain('Verification Center');
      expect(itemTitles).toContain('Analytics');
      expect(itemTitles).toContain('Ad Management');

      // Bottom Navigation verification
      expect(bottom_navigation).toHaveLength(5);
    });
  });

  // ==========================================
  // 3. PRODUCT MANAGEMENT DISABLED ENFORCEMENT
  // ==========================================
  describe('Product Management Disabled Enforcement', () => {
    it('GET /api/trader/products - returns 403 Forbidden with descriptive message', async () => {
      const res = await request(app)
        .get('/api/trader/products')
        .set('Authorization', `Bearer ${traderToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Product Management is not available for Trader');
    });

    it('POST /api/trader/products - returns 403 Forbidden', async () => {
      const res = await request(app)
        .post('/api/trader/products')
        .set('Authorization', `Bearer ${traderToken}`)
        .send({ product_name: 'Black Galaxy Granite' });

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Product Management is not available for Trader');
    });

    it('GET /api/trader/inventory/overview - returns 403 Forbidden', async () => {
      const res = await request(app)
        .get('/api/trader/inventory/overview')
        .set('Authorization', `Bearer ${traderToken}`);

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Product Management is not available for Trader');
    });
  });

  // ==========================================
  // 4. TRADER BUSINESS PROFILE & TRADING CAPABILITIES
  // ==========================================
  describe('Trader Profile & Capabilities', () => {
    it('GET /api/trader/profile - retrieves full trader business profile', async () => {
      const res = await request(app)
        .get('/api/trader/profile')
        .set('Authorization', `Bearer ${traderToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.company_name).toBe('Shree Shyam Marble & Granite Traders');
      expect(res.body.data.business_category).toBe('Stone Trader');
      expect(res.body.data.trading_business_types).toContain('Wholesale Stone Trader');
      expect(res.body.data.trading_specializations).toContain('Granite');
      expect(res.body.data.trading_capabilities).toContain('Domestic Trading');
      expect(res.body.data.business_capacity.monthly_trading_volume).toBe(3500);
      expect(res.body.data.business_capacity.trading_volume_unit).toBe('Tons');
      expect(res.body.data.enterprise_tax.iec_number).toBe('IECRJ987654321');
    });

    it('PUT /api/trader/profile - updates basic information and location', async () => {
      const updateData = {
        company_name: 'Shree Shyam Global Stone Traders',
        short_description: 'Updated leading stone trading house in Rajasthan.',
        established_year: 2010,
        address: {
          office_address: 'Marble Market Sector 4, Kishangarh, Rajasthan',
          commercial_area: 'Marble City Kishangarh',
          district: 'Ajmer',
          state: 'Rajasthan',
          postal_code: '305802'
        }
      };

      const res = await request(app)
        .put('/api/trader/profile')
        .set('Authorization', `Bearer ${traderToken}`)
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.company_name).toBe('Shree Shyam Global Stone Traders');
      expect(res.body.data.short_description).toBe('Updated leading stone trading house in Rajasthan.');
      expect(res.body.data.address.district).toBe('Ajmer');
    });

    it('PUT /api/trader/trading-capabilities - updates trading types, specializations, and capacity', async () => {
      const capData = {
        trading_business_types: ['Wholesale Stone Trader', 'Exporter', 'Bulk Material Supplier'],
        trading_specializations: ['Granite', 'Marble', 'Sandstone', 'Travertine', 'Onyx'],
        trading_capabilities: ['Domestic Trading', 'International Trading', 'Exporting', 'Bulk Orders'],
        monthly_trading_volume: 5000,
        trading_volume_unit: 'Metric Tons',
        min_order_quantity: 50,
        max_order_capacity: 15000,
        preferred_order_type: 'Bulk Export & Container Shipments',
        supply_network_coverage: 'Middle East, Europe, North America, Southeast Asia',
        operating_markets: ['International']
      };

      const res = await request(app)
        .put('/api/trader/trading-capabilities')
        .set('Authorization', `Bearer ${traderToken}`)
        .send(capData);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.trading_business_types).toContain('Exporter');
      expect(res.body.data.trading_specializations).toContain('Travertine');
      expect(res.body.data.trading_capabilities).toContain('Exporting');
      expect(res.body.data.business_capacity.monthly_trading_volume).toBe(5000);
      expect(res.body.data.business_capacity.trading_volume_unit).toBe('Metric Tons');
    });
  });

  // ==========================================
  // 5. CONTACTS & KEY PERSONS MANAGEMENT
  // ==========================================
  describe('Contacts & Key Persons Management', () => {
    let createdContactId;

    it('POST /api/trader/contacts - adds new partner / director contact', async () => {
      const newContact = {
        name: 'Vikas Sharma',
        designation: 'Commercial Trading Partner',
        phone: '9829099887',
        email: 'vikas@shreeshyamtraders.com',
        birthday: '1985-07-15',
        anniversary: '2012-11-20'
      };

      const res = await request(app)
        .post('/api/trader/contacts')
        .set('Authorization', `Bearer ${traderToken}`)
        .send(newContact);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Vikas Sharma');
      expect(res.body.data.designation).toBe('Commercial Trading Partner');
      createdContactId = res.body.data._id;
    });

    it('GET /api/trader/contacts - lists all contacts with actions', async () => {
      const res = await request(app)
        .get('/api/trader/contacts')
        .set('Authorization', `Bearer ${traderToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('PUT /api/trader/contacts/:contactId - updates existing contact', async () => {
      const res = await request(app)
        .put(`/api/trader/contacts/${traderProfile.owners[0]._id}`)
        .set('Authorization', `Bearer ${traderToken}`)
        .send({
          name: 'Rameshwar Lal Sharma (Senior Partner)',
          designation: 'Senior Managing Director'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Rameshwar Lal Sharma (Senior Partner)');
    });

    it('DELETE /api/trader/contacts/:contactId - removes contact', async () => {
      // Add a dummy contact to delete
      const addRes = await request(app)
        .post('/api/trader/contacts')
        .set('Authorization', `Bearer ${traderToken}`)
        .send({
          name: 'Temporary Contact',
          designation: 'Staff',
          phone: '9829000000'
        });

      const contactId = addRes.body.data._id;

      const deleteRes = await request(app)
        .delete(`/api/trader/contacts/${contactId}`)
        .set('Authorization', `Bearer ${traderToken}`);

      expect(deleteRes.statusCode).toBe(200);
      expect(deleteRes.body.success).toBe(true);
    });
  });

  // ==========================================
  // 6. GALLERY MANAGEMENT
  // ==========================================
  describe('Gallery Management', () => {
    let photoId;
    let videoId;

    it('POST /api/trader/gallery/photos - uploads categorized photo', async () => {
      const res = await request(app)
        .post('/api/trader/gallery/photos')
        .set('Authorization', `Bearer ${traderToken}`)
        .send({
          category: 'warehouse',
          title: 'Kishangarh Central Godown',
          caption: 'Massive stocking yard of pre-inspected granite slabs'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.category).toBe('warehouse');
      expect(res.body.data.title).toBe('Kishangarh Central Godown');
      photoId = res.body.data._id;
    });

    it('POST /api/trader/gallery/videos - adds categorized video link', async () => {
      const res = await request(app)
        .post('/api/trader/gallery/videos')
        .set('Authorization', `Bearer ${traderToken}`)
        .send({
          category: 'walkthrough',
          title: 'Warehouse & Inspection Walkthrough',
          video_url: 'https://youtube.com/watch?v=sample123',
          duration: '3:45'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.category).toBe('walkthrough');
      videoId = res.body.data._id;
    });

    it('GET /api/trader/gallery - lists categorized photos and videos', async () => {
      const res = await request(app)
        .get('/api/trader/gallery')
        .set('Authorization', `Bearer ${traderToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.photos).toBeInstanceOf(Array);
      expect(res.body.data.videos).toBeInstanceOf(Array);
      expect(res.body.data.photo_categories).toContain('warehouse');
      expect(res.body.data.video_categories).toContain('walkthrough');
    });

    it('DELETE /api/trader/gallery/photos/:photoId - deletes a photo', async () => {
      const addRes = await request(app)
        .post('/api/trader/gallery/photos')
        .set('Authorization', `Bearer ${traderToken}`)
        .send({
          category: 'warehouse',
          title: 'Photo to delete',
          url: 'https://images.unsplash.com/photo-to-delete.jpg'
        });

      const targetId = addRes.body.data._id;
      const res = await request(app)
        .delete(`/api/trader/gallery/photos/${targetId}`)
        .set('Authorization', `Bearer ${traderToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('DELETE /api/trader/gallery/videos/:videoId - deletes a video', async () => {
      const addRes = await request(app)
        .post('/api/trader/gallery/videos')
        .set('Authorization', `Bearer ${traderToken}`)
        .send({
          category: 'walkthrough',
          title: 'Video to delete',
          video_url: 'https://youtube.com/watch?v=sample-del',
          duration: '1:30'
        });

      const targetId = addRes.body.data._id;
      const res = await request(app)
        .delete(`/api/trader/gallery/videos/${targetId}`)
        .set('Authorization', `Bearer ${traderToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('GET /api/trader/gallery/owners - returns owner profiles for gallery display', async () => {
      const res = await request(app)
        .get('/api/trader/gallery/owners')
        .set('Authorization', `Bearer ${traderToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeInstanceOf(Array);
    });
  });

  // ==========================================
  // 7. VERIFICATION CENTER
  // ==========================================
  describe('Verification Center', () => {
    it('GET /api/trader/verification - gets verification status and documents', async () => {
      const res = await request(app)
        .get('/api/trader/verification')
        .set('Authorization', `Bearer ${traderToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('sections');
      expect(res.body.data.sections).toHaveProperty('phone');
      expect(res.body.data.sections).toHaveProperty('email');
      expect(res.body.data.sections).toHaveProperty('business');
      expect(res.body.data.sections).toHaveProperty('gst');
      expect(res.body.data.sections).toHaveProperty('bank');
    });

    it('POST /api/trader/verification/phone/send-otp and verify', async () => {
      const sendRes = await request(app)
        .post('/api/trader/verification/phone/send-otp')
        .set('Authorization', `Bearer ${traderToken}`)
        .send({ phone: '9829054321' });

      expect(sendRes.statusCode).toBe(200);

      const verifyRes = await request(app)
        .post('/api/trader/verification/phone/verify-otp')
        .set('Authorization', `Bearer ${traderToken}`)
        .send({ phone: '9829054321', otp: '123456' });

      expect(verifyRes.statusCode).toBe(200);
      expect(verifyRes.body.success).toBe(true);
    });

    it('POST /api/trader/verification/gst - submits GST certificate', async () => {
      const res = await request(app)
        .post('/api/trader/verification/gst')
        .set('Authorization', `Bearer ${traderToken}`)
        .send({
          gst_number: '08AAAFS1234F1Z8',
          legal_business_name: 'Shree Shyam Marble & Granite Traders'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('POST /api/trader/verification/business - submits business registration', async () => {
      const res = await request(app)
        .post('/api/trader/verification/business')
        .set('Authorization', `Bearer ${traderToken}`)
        .send({
          registration_type: 'Partnership Firm',
          registration_number: 'REG-TRADER-RJ-2012-9901'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('POST /api/trader/verification/bank - submits bank details', async () => {
      const res = await request(app)
        .post('/api/trader/verification/bank')
        .set('Authorization', `Bearer ${traderToken}`)
        .send({
          account_holder_name: 'Shree Shyam Marble & Granite Traders',
          account_number: '98765432109876',
          ifsc_code: 'SBIN0001234',
          bank_name: 'State Bank of India',
          branch_name: 'Madanganj Kishangarh'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('POST /api/trader/verification/documents - uploads trader specific documents', async () => {
      const res = await request(app)
        .post('/api/trader/verification/documents')
        .set('Authorization', `Bearer ${traderToken}`)
        .send({
          document_type: 'iec_certificate',
          document_name: 'Import Export Code (IEC) Certificate',
          document_number: 'IECRJ987654321'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });

  // ==========================================
  // 8. TRADER ANALYTICS ENGINE
  // ==========================================
  describe('Trader Analytics Engine', () => {
    beforeEach(async () => {
      // Seed some mock analytics events
      await AnalyticsEvent.create([
        {
          businessId: traderProfile._id,
          eventType: 'profile_view',
          location: {
            city: 'Jaipur',
            state: 'Rajasthan',
            country: 'India'
          },
          visitorId: 'visitor-001'
        },
        {
          businessId: traderProfile._id,
          eventType: 'contact_click',
          location: {
            city: 'Ahmedabad',
            state: 'Gujarat',
            country: 'India'
          },
          visitorId: 'visitor-002'
        }
      ]);
    });

    it('GET /api/trader/analytics/overview - retrieves aggregate business overview', async () => {
      const res = await request(app)
        .get('/api/trader/analytics/overview?period=30days')
        .set('Authorization', `Bearer ${traderToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.overview).toHaveProperty('total_profile_views');
      expect(res.body.data.overview).toHaveProperty('total_inquiries');
      expect(res.body.data.overview).toHaveProperty('total_leads');
      expect(res.body.data.overview).toHaveProperty('contact_clicks');
    });

    it('GET /api/trader/analytics/inquiries - retrieves inquiry metrics by material and location', async () => {
      const res = await request(app)
        .get('/api/trader/analytics/inquiries?period=30days')
        .set('Authorization', `Bearer ${traderToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('inquiries_by_material');
      expect(res.body.data).toHaveProperty('inquiries_by_location');
    });

    it('GET /api/trader/analytics/leads - retrieves lead conversion metrics', async () => {
      const res = await request(app)
        .get('/api/trader/analytics/leads?period=30days')
        .set('Authorization', `Bearer ${traderToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('lead_funnel');
      expect(res.body.data).toHaveProperty('conversion_rate');
    });

    it('GET /api/trader/analytics/audience - retrieves visitor locations and growth', async () => {
      const res = await request(app)
        .get('/api/trader/analytics/audience?period=30days')
        .set('Authorization', `Bearer ${traderToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('visitor_locations');
    });

    it('POST /api/trader/analytics/event - records profile view or contact click event', async () => {
      const res = await request(app)
        .post('/api/trader/analytics/event')
        .set('Authorization', `Bearer ${traderToken}`)
        .send({
          event_type: 'business_save',
          city: 'Mumbai',
          state: 'Maharashtra'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });

  // ==========================================
  // 9. INQUIRIES & LEADS SUBMODULES
  // ==========================================
  describe('Inquiries & Leads Submodules', () => {
    it('GET /api/trader/inquiries - retrieves trader inquiries list', async () => {
      const res = await request(app)
        .get('/api/trader/inquiries')
        .set('Authorization', `Bearer ${traderToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.inquiries).toBeInstanceOf(Array);
    });

    it('GET /api/trader/leads - retrieves trader incoming leads list', async () => {
      const res = await request(app)
        .get('/api/trader/leads')
        .set('Authorization', `Bearer ${traderToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.leads).toBeInstanceOf(Array);
    });
  });

  // ==========================================
  // 10. SHARED SUBMODULES MOUNTED UNDER /api/trader
  // ==========================================
  describe('Shared Submodules Integration', () => {
    it('GET /api/trader/promotions/dashboard - retrieves promotions dashboard for trader', async () => {
      const res = await request(app)
        .get('/api/trader/promotions/dashboard')
        .set('Authorization', `Bearer ${traderToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('GET /api/trader/invoices - retrieves promotion invoices for trader', async () => {
      const res = await request(app)
        .get('/api/trader/invoices')
        .set('Authorization', `Bearer ${traderToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.invoices).toBeInstanceOf(Array);
    });

    it('GET /api/trader/settings - retrieves account settings for trader', async () => {
      const res = await request(app)
        .get('/api/trader/settings')
        .set('Authorization', `Bearer ${traderToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
