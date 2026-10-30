const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const app = require('../server');
const User = require('../src/models/User');
const Product = require('../src/models/Product');
const Vendor = require('../src/models/Vendor');
const BusinessProfile = require('../src/models/BusinessProfile');
const Inquiry = require('../src/models/Inquiry');
const QuoteRequest = require('../src/models/QuoteRequest');
const QuoteResponse = require('../src/models/QuoteResponse');
const Estimate = require('../src/models/Estimate');
const CustomerAddress = require('../src/models/CustomerAddress');
const CustomerFavorite = require('../src/models/CustomerFavorite');
const CustomerNotification = require('../src/models/CustomerNotification');
const UserSession = require('../src/models/UserSession');
const SupportTicket = require('../src/models/SupportTicket');
const SupportFaq = require('../src/models/SupportFaq');
const AppConfig = require('../src/models/AppConfig');

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

describe('Customer Profile & Account Management API Tests', () => {
  let customerUser1;
  let customerToken1;
  let customerUser2;
  let customerToken2;
  let supplierUser;
  let supplierProfile;
  let testVendor;
  let testProduct;

  beforeEach(async () => {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    // Customer 1
    customerUser1 = await User.create({
      name: 'Rahul Sharma',
      mobile: '9876543211',
      email: 'rahul.customer@test.com',
      password: passwordHash,
      role: 'customer',
      city: 'Jaipur',
      state: 'Rajasthan',
      whatsapp_number: '9876543211',
      date_of_birth: new Date('1992-08-20'),
      verification_status: 'verified',
      rating: 4.9,
      review_count: 8,
      status: 'active'
    });
    customerToken1 = jwt.sign({ id: customerUser1._id, role: customerUser1.role }, JWT_SECRET, { expiresIn: '1d' });

    // Customer 2 (for IDOR and isolation checks)
    customerUser2 = await User.create({
      name: 'Amit Patel',
      mobile: '9876543212',
      email: 'amit.customer@test.com',
      password: passwordHash,
      role: 'customer',
      city: 'Ahmedabad',
      state: 'Gujarat',
      whatsapp_number: '9876543212',
      status: 'active'
    });
    customerToken2 = jwt.sign({ id: customerUser2._id, role: customerUser2.role }, JWT_SECRET, { expiresIn: '1d' });

    // Supplier
    supplierUser = await User.create({
      name: 'Rajesh Agarwal',
      mobile: '9876543213',
      email: 'rajesh.supplier@test.com',
      password: passwordHash,
      role: 'manufacturer',
      status: 'active'
    });

    supplierProfile = await BusinessProfile.create({
      userId: supplierUser._id,
      company_name: 'Royal Rajasthan Marble & Granite',
      business_type: 'manufacturer',
      gst_number: '08AAAAA0000A1Z5',
      rating: 4.8,
      review_count: 14,
      is_verified: true,
      address: {
        district: 'Kishangarh',
        state: 'Rajasthan',
        full_address: 'Marble Mandi, Kishangarh'
      }
    });

    testVendor = await Vendor.create({
      userId: supplierUser._id,
      businessName: 'Royal Rajasthan Marble & Granite',
      category: 'Granite Manufacturer',
      slug: `royal-rajasthan-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      status: 'active'
    });

    testProduct = await Product.create({
      vendorId: testVendor._id,
      name: 'Imperial Black Granite',
      category: 'Granite',
      description: 'Premium dark granite with fine crystalline structure',
      priceRange: { min: 140, max: 220, unit: 'Sq.Ft', visible: true },
      images: ['https://example.com/granite1.jpg'],
      specifications: [
        { key: 'Material', value: 'Granite' },
        { key: 'Thickness', value: '18mm' }
      ],
      stock_status: 'in_stock'
    });
  });

  // ==========================================
  // 1. CUSTOMER PROFILE & DASHBOARD
  // ==========================================
  describe('1. Customer Profile & Dashboard', () => {
    it('GET /api/customer/profile should retrieve authenticated customer profile', async () => {
      const res = await request(app)
        .get('/api/customer/profile')
        .set('Authorization', `Bearer ${customerToken1}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.customer_id).toBe(customerUser1._id.toString());
      expect(res.body.data.full_name).toBe('Rahul Sharma');
      expect(res.body.data.registered_mobile).toBe('9876543211');
      expect(res.body.data.account_verification_status).toBe('verified');
      expect(res.body.data.customer_rating).toBe(4.9);
      expect(res.body.data.profile_picture).toBeTruthy();
    });

    it('PUT /api/customer/profile should update editable customer profile information', async () => {
      const res = await request(app)
        .put('/api/customer/profile')
        .set('Authorization', `Bearer ${customerToken1}`)
        .send({
          full_name: 'Rahul R. Sharma',
          whatsapp_number: '9876549999',
          city: 'Udaipur',
          state: 'Rajasthan',
          bio: 'Architectural Stone Consultant'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.full_name).toBe('Rahul R. Sharma');
      expect(res.body.data.whatsapp_number).toBe('9876549999');
      expect(res.body.data.city).toBe('Udaipur');
    });

    it('POST /api/customer/profile/photo and DELETE should manage profile avatar', async () => {
      // Update photo URL
      const postRes = await request(app)
        .post('/api/customer/profile/photo')
        .set('Authorization', `Bearer ${customerToken1}`)
        .send({ photo_url: 'https://example.com/my-photo.jpg' });

      expect(postRes.status).toBe(200);
      expect(postRes.body.data.profile_picture).toBe('https://example.com/my-photo.jpg');

      // Remove photo
      const delRes = await request(app)
        .delete('/api/customer/profile/photo')
        .set('Authorization', `Bearer ${customerToken1}`);

      expect(delRes.status).toBe(200);
      expect(delRes.body.data.profile_picture).toContain('ui-avatars.com');
    });

    it('GET /api/customer/dashboard should calculate aggregated statistics from real database records', async () => {
      // Create sample inquiries
      await Inquiry.create({
        senderId: customerUser1._id,
        category: 'Granite',
        subject: 'Black Granite',
        quantity: 500,
        status: 'pending'
      });
      await Inquiry.create({
        senderId: customerUser1._id,
        category: 'Marble',
        subject: 'White Marble',
        quantity: 1200,
        status: 'quotes_received'
      });

      // Create favorite
      await CustomerFavorite.create({
        userId: customerUser1._id,
        productId: testProduct._id
      });

      // Create notification
      await CustomerNotification.create({
        userId: customerUser1._id,
        title: 'Quote Received',
        description: 'New quote available',
        category: 'Quote Requests',
        is_read: false
      });

      const res = await request(app)
        .get('/api/customer/dashboard')
        .set('Authorization', `Bearer ${customerToken1}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.stats.total_inquiries).toBe(2);
      expect(res.body.data.stats.pending_inquiries).toBe(1);
      expect(res.body.data.stats.inquiries_with_quotations).toBe(1);
      expect(res.body.data.stats.saved_stones_count).toBe(1);
      expect(res.body.data.stats.unread_notifications).toBe(1);
      expect(res.body.data.recent_inquiries.length).toBe(2);
    });
  });

  // ==========================================
  // 2. PERSONAL DETAILS MANAGEMENT
  // ==========================================
  describe('2. Personal Details Management & Mobile Verification', () => {
    it('GET /api/customer/personal-details should return personal fields', async () => {
      const res = await request(app)
        .get('/api/customer/personal-details')
        .set('Authorization', `Bearer ${customerToken1}`);

      expect(res.status).toBe(200);
      expect(res.body.data.full_name).toBe('Rahul Sharma');
      expect(res.body.data.mobile_phone).toBe('9876543211');
      expect(res.body.data.whatsapp_number).toBe('9876543211');
    });

    it('PUT /api/customer/personal-details should update personal details without altering verification status', async () => {
      const res = await request(app)
        .put('/api/customer/personal-details')
        .set('Authorization', `Bearer ${customerToken1}`)
        .send({
          full_name: 'Rahul S. Sharma',
          whatsapp_number: '9876547777',
          account_verification_status: 'unverified' // Should be ignored/protected
        });

      expect(res.status).toBe(200);
      expect(res.body.data.full_name).toBe('Rahul S. Sharma');
      expect(res.body.data.whatsapp_number).toBe('9876547777');
      expect(res.body.data.account_verification_status).toBe('verified'); // Still verified!
    });

    it('POST /api/customer/personal-details/verify-mobile and /verify-otp should change mobile upon valid OTP', async () => {
      // 1. Request OTP to new mobile
      const reqRes = await request(app)
        .post('/api/customer/personal-details/verify-mobile')
        .set('Authorization', `Bearer ${customerToken1}`)
        .send({ new_mobile: '9876549999' });

      expect(reqRes.status).toBe(200);
      expect(reqRes.body.success).toBe(true);

      // 2. Verify with standard demo/mock OTP
      const verifyRes = await request(app)
        .post('/api/customer/personal-details/verify-otp')
        .set('Authorization', `Bearer ${customerToken1}`)
        .send({ code: '123456' });

      expect(verifyRes.status).toBe(200);
      expect(verifyRes.body.data.mobile_phone).toBe('9876549999');

      // Verify DB updated
      const updatedUser = await User.findById(customerUser1._id);
      expect(updatedUser.mobile).toBe('9876549999');
    });
  });

  // ==========================================
  // 3. MY INQUIRIES MODULE
  // ==========================================
  describe('3. My Inquiries Module', () => {
    let testInquiry;

    beforeEach(async () => {
      testInquiry = await Inquiry.create({
        senderId: customerUser1._id,
        productId: testProduct._id,
        category: 'Granite',
        subject: 'Imperial Black Granite inquiry',
        requirements: 'Edge beveling and flamed surface required',
        quantity: 1500,
        unit: 'Sq.Ft',
        size: '10x6 ft slabs',
        thickness: '20mm',
        finish: 'Flamed',
        edge_profile: 'Bevel Edge',
        deliveryLocation: { city: 'Jaipur', state: 'Rajasthan', address: 'B-14 Subhash Marg' },
        reference_number: 'INQ-20261030-TEST1',
        delivery_timeline: 'Within 15 Days',
        status: 'pending',
        status_history: [
          {
            previous_status: 'none',
            new_status: 'pending',
            updated_by: customerUser1._id,
            remarks: 'Submitted by customer',
            timestamp: new Date()
          }
        ]
      });
    });

    it('GET /api/customer/inquiries should retrieve paginated inquiries and support filters', async () => {
      const res = await request(app)
        .get('/api/customer/inquiries?search=Imperial')
        .set('Authorization', `Bearer ${customerToken1}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].product_name).toBe('Imperial Black Granite');
      expect(res.body.data[0].required_quantity).toBe(1500);
    });

    it('GET /api/customer/inquiries/:inquiry_id/details should return complete details', async () => {
      const res = await request(app)
        .get(`/api/customer/inquiries/${testInquiry._id}/details`)
        .set('Authorization', `Bearer ${customerToken1}`);

      expect(res.status).toBe(200);
      expect(res.body.data.requirements.edge_profile).toBe('Bevel Edge');
      expect(res.body.data.requirements.finish_grade).toBe('Flamed');
    });

    it('GET /api/customer/inquiries/:inquiry_id/tracking should return workflow steps', async () => {
      const res = await request(app)
        .get(`/api/customer/inquiries/${testInquiry._id}/tracking`)
        .set('Authorization', `Bearer ${customerToken1}`);

      expect(res.status).toBe(200);
      expect(res.body.data.tracking_steps.length).toBe(5);
      expect(res.body.data.tracking_steps[0].status_key).toBe('pending');
      expect(res.body.data.tracking_steps[0].is_completed).toBe(true);
    });

    it('GET /api/customer/inquiries/:inquiry_id/download should stream inquiry PDF', async () => {
      const res = await request(app)
        .get(`/api/customer/inquiries/${testInquiry._id}/download`)
        .set('Authorization', `Bearer ${customerToken1}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toBe('application/pdf');
      expect(res.body).toBeInstanceOf(Buffer);
    });

    it('POST /api/customer/inquiries/:inquiry_id/close should allow customer to close inquiry', async () => {
      const res = await request(app)
        .post(`/api/customer/inquiries/${testInquiry._id}/close`)
        .set('Authorization', `Bearer ${customerToken1}`)
        .send({ remarks: 'Requirement fulfilled locally' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('closed');

      const checkInq = await Inquiry.findById(testInquiry._id);
      expect(checkInq.status).toBe('closed');
      expect(checkInq.closed_reason).toBe('Requirement fulfilled locally');
    });

    it('Should reject unauthorized customer from viewing another customer inquiry (IDOR 403)', async () => {
      const res = await request(app)
        .get(`/api/customer/inquiries/${testInquiry._id}`)
        .set('Authorization', `Bearer ${customerToken2}`); // Customer 2 tries to access Customer 1 inquiry

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  // ==========================================
  // 4. GET QUOTES MODULE
  // ==========================================
  describe('4. Get Quotes Module', () => {
    it('GET /api/customer/quotes/request-options should return dropdown options', async () => {
      const res = await request(app)
        .get('/api/customer/quotes/request-options')
        .set('Authorization', `Bearer ${customerToken1}`);

      expect(res.status).toBe(200);
      expect(res.body.data.categories).toContain('Granite');
      expect(res.body.data.finishes).toContain('Polished');
      expect(res.body.data.thicknesses).toContain('18mm');
      expect(res.body.data.edge_profiles).toContain('Full Bullnose');
    });

    it('POST /api/customer/quotes/request should submit request and create database records', async () => {
      const payload = {
        product_id: testProduct._id.toString(),
        supplier_id: supplierProfile._id.toString(),
        category: 'Granite',
        quantity: 2000,
        unit: 'Sq.Ft',
        size: '10x5 ft',
        thickness: '20mm',
        finish: 'Leather',
        edge_profile: 'Straight Edge',
        delivery_location: {
          city: 'Jaipur',
          state: 'Rajasthan',
          address: 'Sitapura Industrial Area',
          pin_code: '302022'
        },
        message: 'Need 2000 sqft premium leather finish black granite',
        budget_range: 'Rs. 150-180/sqft',
        delivery_timeline: 'Within 7 Days'
      };

      const res = await request(app)
        .post('/api/customer/quotes/request')
        .set('Authorization', `Bearer ${customerToken1}`)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.reference_number).toContain('RFQ-');

      // Verify QuoteRequest created
      const quoteReq = await QuoteRequest.findById(res.body.data.quote_request_id);
      expect(quoteReq).toBeTruthy();
      expect(quoteReq.quantity).toBe(2000);

      // Verify Inquiry created
      const inq = await Inquiry.findById(res.body.data.inquiry_id);
      expect(inq).toBeTruthy();
      expect(inq.edge_profile).toBe('Straight Edge');
    });
  });

  // ==========================================
  // 5. CUSTOMER QUOTATIONS & COMPARISON
  // ==========================================
  describe('5. Customer Quotations & Comparison', () => {
    let quoteReq;
    let quoteRes1;
    let quoteRes2;
    let supplierProfile2;

    beforeEach(async () => {
      quoteReq = await QuoteRequest.create({
        userId: customerUser1._id,
        productId: testProduct._id,
        quantity: 1000,
        unit: 'Sq.Ft',
        reference_number: 'RFQ-TEST-2026',
        status: 'submitted'
      });

      const supplierUser2 = await User.create({
        name: 'Sunil Jain',
        mobile: '9876543214',
        email: 'sunil.supplier@test.com',
        role: 'manufacturer'
      });

      supplierProfile2 = await BusinessProfile.create({
        userId: supplierUser2._id,
        company_name: 'Apex Marble & Granite Hub',
        business_type: 'manufacturer',
        rating: 4.6,
        review_count: 9,
        is_verified: true,
        address: { district: 'Jalore', state: 'Rajasthan' }
      });

      quoteRes1 = await QuoteResponse.create({
        quoteRequestId: quoteReq._id,
        supplierId: supplierProfile._id,
        supplierUserId: supplierUser._id,
        offered_price: 160,
        unit: 'Sq.Ft',
        taxes: 8000,
        shipping_cost: 6000,
        estimated_total: 174000,
        estimated_delivery_time: '7 business days',
        offer_validity: new Date('2026-12-31'),
        reference_number: 'QTE-ROYAL-001',
        status: 'submitted'
      });

      quoteRes2 = await QuoteResponse.create({
        quoteRequestId: quoteReq._id,
        supplierId: supplierProfile2._id,
        supplierUserId: supplierUser2._id,
        offered_price: 150,
        unit: 'Sq.Ft',
        taxes: 7500,
        shipping_cost: 8000,
        estimated_total: 165500,
        estimated_delivery_time: '10 business days',
        offer_validity: new Date('2026-12-31'),
        reference_number: 'QTE-APEX-002',
        status: 'submitted'
      });
    });

    it('GET /api/customer/quotations should list all quotations received for customer', async () => {
      const res = await request(app)
        .get('/api/customer/quotations')
        .set('Authorization', `Bearer ${customerToken1}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
      expect(res.body.data[0].quoted_price).toBeTruthy();
    });

    it('GET /api/customer/quotations/:quote_id should return quote details', async () => {
      const res = await request(app)
        .get(`/api/customer/quotations/${quoteRes1._id}`)
        .set('Authorization', `Bearer ${customerToken1}`);

      expect(res.status).toBe(200);
      expect(res.body.data.pricing.unit_price).toBe(160);
      expect(res.body.data.supplier.name).toBe('Royal Rajasthan Marble & Granite');
    });

    it('GET /api/customer/quotations/:quote_id/download should download quotation PDF', async () => {
      const res = await request(app)
        .get(`/api/customer/quotations/${quoteRes1._id}/download`)
        .set('Authorization', `Bearer ${customerToken1}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toBe('application/pdf');
      expect(res.body).toBeInstanceOf(Buffer);
    });

    it('POST /api/customer/quotations/compare should perform side-by-side comparison', async () => {
      const res = await request(app)
        .post('/api/customer/quotations/compare')
        .set('Authorization', `Bearer ${customerToken1}`)
        .send({ quote_ids: [quoteRes1._id.toString(), quoteRes2._id.toString()] });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.compared_quotes_count).toBe(2);
      expect(res.body.data.comparisons[0].financials.unit_price).toBe(160);
      expect(res.body.data.comparisons[1].financials.unit_price).toBe(150);
    });

    it('Should reject cross-inquiry quote comparison', async () => {
      // Create another quote request and quote
      const otherReq = await QuoteRequest.create({
        userId: customerUser1._id,
        productId: testProduct._id,
        quantity: 500,
        reference_number: 'RFQ-OTHER'
      });
      const otherQuote = await QuoteResponse.create({
        quoteRequestId: otherReq._id,
        supplierId: supplierProfile._id,
        supplierUserId: supplierUser._id,
        offered_price: 200,
        estimated_total: 100000
      });

      const res = await request(app)
        .post('/api/customer/quotations/compare')
        .set('Authorization', `Bearer ${customerToken1}`)
        .send({ quote_ids: [quoteRes1._id.toString(), otherQuote._id.toString()] });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Cross-inquiry');
    });
  });

  // ==========================================
  // 6. QUOTES & ESTIMATES HISTORY
  // ==========================================
  describe('6. Quotes & Estimates History', () => {
    it('POST /api/customer/estimates should create slab estimate with calculations', async () => {
      const payload = {
        estimate_type: 'slab',
        party_name: 'Sharma Villa Construction',
        party_address: 'Civil Lines, Jaipur',
        party_contact: '9876543210',
        slab_details: {
          colour_quality: 'Imperial Black Granite First Choice',
          measurement_unit: 'inch',
          area_unit: 'sqft',
          unit_price: 150,
          measurement_rows: [
            { length: 120, width: 60 },
            { length: 100, width: 50 }
          ]
        }
      };

      const res = await request(app)
        .post('/api/customer/estimates')
        .set('Authorization', `Bearer ${customerToken1}`)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.data.slab_details.total_area).toBeGreaterThan(0);
      expect(res.body.data.total_amount).toBeGreaterThan(0);
      expect(res.body.data.reference_number).toContain('SLB-');
    });

    it('POST /api/customer/estimates should create particular estimate with ledger', async () => {
      const payload = {
        estimate_type: 'particular',
        party_name: 'Jaipur Boutique Hotel',
        particular_details: {
          items: [
            { particular_name: 'Granite Countertop', quantity: 200, unit: 'sqft', unit_price: 180 },
            { particular_name: 'Baluster Railing', quantity: 10, unit: 'pieces', unit_price: 1200 }
          ],
          payments: [
            { amount: 20000, payment_method: 'upi', notes: 'Advance token' }
          ]
        }
      };

      const res = await request(app)
        .post('/api/customer/estimates')
        .set('Authorization', `Bearer ${customerToken1}`)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.data.total_amount).toBe(48000); // 36000 + 12000
      expect(res.body.data.particular_details.total_paid).toBe(20000);
      expect(res.body.data.particular_details.remaining_balance).toBe(28000);
      expect(res.body.data.particular_details.payment_status).toBe('partially_paid');
    });

    it('GET /api/customer/estimates/:estimate_id/download should stream estimate PDF', async () => {
      const estimate = await Estimate.create({
        reference_number: 'SLB-TEST-PDF',
        owner_user_id: customerUser1._id,
        estimate_type: 'slab',
        party_name: 'Test Customer Party',
        total_amount: 50000,
        slab_details: {
          measurement_unit: 'inch',
          area_unit: 'sqft',
          unit_price: 100,
          total_area: 500,
          measurement_rows: [{ serial_number: 1, length: 120, width: 60, calculated_area: 50 }]
        }
      });

      const res = await request(app)
        .get(`/api/customer/estimates/${estimate._id}/download`)
        .set('Authorization', `Bearer ${customerToken1}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toBe('application/pdf');
    });
  });

  // ==========================================
  // 7. SAVED STONES & FAVORITES
  // ==========================================
  describe('7. Saved Stones & Favorites', () => {
    it('POST /api/customer/favorites should save product and prevent duplicate saving', async () => {
      // 1. Add favorite
      const addRes = await request(app)
        .post('/api/customer/favorites')
        .set('Authorization', `Bearer ${customerToken1}`)
        .send({ product_id: testProduct._id.toString() });

      expect(addRes.status).toBe(201);
      expect(addRes.body.data.is_favorite).toBe(true);

      // 2. Duplicate add should succeed gracefully without creating second record
      const dupRes = await request(app)
        .post('/api/customer/favorites')
        .set('Authorization', `Bearer ${customerToken1}`)
        .send({ product_id: testProduct._id.toString() });

      expect(dupRes.status).toBe(200);
      const count = await CustomerFavorite.countDocuments({ userId: customerUser1._id });
      expect(count).toBe(1);
    });

    it('GET /api/customer/favorites should list populated favorite products', async () => {
      await CustomerFavorite.create({ userId: customerUser1._id, productId: testProduct._id });

      const res = await request(app)
        .get('/api/customer/favorites')
        .set('Authorization', `Bearer ${customerToken1}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].product_name).toBe('Imperial Black Granite');
      expect(res.body.data[0].supplier_information.name).toBeTruthy();
    });

    it('DELETE /api/customer/favorites/:product_id should remove favorite without deleting product', async () => {
      await CustomerFavorite.create({ userId: customerUser1._id, productId: testProduct._id });

      const delRes = await request(app)
        .delete(`/api/customer/favorites/${testProduct._id}`)
        .set('Authorization', `Bearer ${customerToken1}`);

      expect(delRes.status).toBe(200);
      expect(delRes.body.data.is_favorite).toBe(false);

      // Product still exists in DB
      const prodCheck = await Product.findById(testProduct._id);
      expect(prodCheck).toBeTruthy();
    });
  });

  // ==========================================
  // 8. DELIVERY & PROJECT ADDRESSES
  // ==========================================
  describe('8. Delivery & Project Addresses', () => {
    it('POST and GET /api/customer/addresses should manage addresses and set first address as default', async () => {
      const res = await request(app)
        .post('/api/customer/addresses')
        .set('Authorization', `Bearer ${customerToken1}`)
        .send({
          state: 'Rajasthan',
          district: 'Jaipur',
          area: 'C-Scheme',
          full_address: 'B-14 Subhash Marg',
          pin_code: '302001',
          address_label: 'Home'
        });

      expect(res.status).toBe(201);
      expect(res.body.data.default_address).toBe(true); // First address is auto-default
    });

    it('PATCH /api/customer/addresses/:address_id/default should toggle default address and unset previous', async () => {
      const addr1 = await CustomerAddress.create({
        userId: customerUser1._id,
        state: 'Rajasthan',
        district: 'Jaipur',
        full_address: 'Address 1',
        pin_code: '302001',
        is_default: true
      });
      const addr2 = await CustomerAddress.create({
        userId: customerUser1._id,
        state: 'Rajasthan',
        district: 'Udaipur',
        full_address: 'Address 2',
        pin_code: '313001',
        is_default: false
      });

      const res = await request(app)
        .patch(`/api/customer/addresses/${addr2._id}/default`)
        .set('Authorization', `Bearer ${customerToken1}`);

      expect(res.status).toBe(200);

      const check1 = await CustomerAddress.findById(addr1._id);
      const check2 = await CustomerAddress.findById(addr2._id);
      expect(check1.is_default).toBe(false);
      expect(check2.is_default).toBe(true);
    });

    it('DELETE /api/customer/addresses/:address_id should reassign default if default was deleted', async () => {
      const addr1 = await CustomerAddress.create({
        userId: customerUser1._id,
        state: 'Rajasthan',
        district: 'Jaipur',
        full_address: 'Address 1',
        pin_code: '302001',
        is_default: true
      });
      const addr2 = await CustomerAddress.create({
        userId: customerUser1._id,
        state: 'Rajasthan',
        district: 'Udaipur',
        full_address: 'Address 2',
        pin_code: '313001',
        is_default: false
      });

      await request(app)
        .delete(`/api/customer/addresses/${addr1._id}`)
        .set('Authorization', `Bearer ${customerToken1}`);

      const remaining = await CustomerAddress.findById(addr2._id);
      expect(remaining.is_default).toBe(true); // Reassigned!
    });
  });

  // ==========================================
  // 9. NOTIFICATIONS & PREFERENCES
  // ==========================================
  describe('9. Notifications & Notification Preferences', () => {
    it('GET /api/customer/notifications and /unread-count should track unread items', async () => {
      await CustomerNotification.create({
        userId: customerUser1._id,
        title: 'New Quote',
        description: 'Supplier quoted',
        category: 'Quote Requests',
        is_read: false
      });

      const countRes = await request(app)
        .get('/api/customer/notifications/unread-count')
        .set('Authorization', `Bearer ${customerToken1}`);

      expect(countRes.status).toBe(200);
      expect(countRes.body.data.unread_count).toBe(1);

      const markRes = await request(app)
        .patch('/api/customer/notifications/read-all')
        .set('Authorization', `Bearer ${customerToken1}`);

      expect(markRes.status).toBe(200);

      const countRes2 = await request(app)
        .get('/api/customer/notifications/unread-count')
        .set('Authorization', `Bearer ${customerToken1}`);

      expect(countRes2.body.data.unread_count).toBe(0);
    });

    it('PUT and PATCH /api/customer/settings/notifications should update individual preferences', async () => {
      const res = await request(app)
        .put('/api/customer/settings/notifications')
        .set('Authorization', `Bearer ${customerToken1}`)
        .send({
          new_inquiry: true,
          marketing_emails: false
        });

      expect(res.status).toBe(200);
      expect(res.body.data.marketing_emails).toBe(false);

      // Toggle category
      const patchRes = await request(app)
        .patch('/api/customer/settings/notifications/lead_messages')
        .set('Authorization', `Bearer ${customerToken1}`)
        .send({ enabled: false });

      expect(patchRes.status).toBe(200);
      expect(patchRes.body.data.enabled).toBe(false);
    });

    it('PUT and GET /api/customer/settings/quiet-hours should manage quiet hours configuration', async () => {
      const res = await request(app)
        .put('/api/customer/settings/quiet-hours')
        .set('Authorization', `Bearer ${customerToken1}`)
        .send({
          enabled: true,
          start_time: '23:00',
          end_time: '07:00',
          timezone: 'Asia/Kolkata'
        });

      expect(res.status).toBe(200);
      expect(res.body.data.enabled).toBe(true);
      expect(res.body.data.start_time).toBe('23:00');
    });
  });

  // ==========================================
  // 10. ACCOUNT SECURITY & SESSIONS
  // ==========================================
  describe('10. Account Security, Sessions & Settings', () => {
    it('PUT /api/customer/security/change-password should change password upon valid verification', async () => {
      const res = await request(app)
        .put('/api/customer/security/change-password')
        .set('Authorization', `Bearer ${customerToken1}`)
        .send({
          current_password: 'password123',
          new_password: 'NewStrongPassword123',
          confirm_new_password: 'NewStrongPassword123'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify new password works
      const user = await User.findById(customerUser1._id);
      const isMatch = await bcrypt.compare('NewStrongPassword123', user.password);
      expect(isMatch).toBe(true);
    });

    it('GET and DELETE /api/customer/security/sessions should manage active sessions', async () => {
      const sess = await UserSession.create({
        userId: customerUser1._id,
        session_id: 'test_session_123',
        device_name: 'iPhone 15 Pro',
        is_active: true
      });

      const getRes = await request(app)
        .get('/api/customer/security/sessions')
        .set('Authorization', `Bearer ${customerToken1}`);

      expect(getRes.status).toBe(200);
      expect(getRes.body.data.length).toBeGreaterThan(0);

      const delRes = await request(app)
        .delete(`/api/customer/security/sessions/${sess.session_id}`)
        .set('Authorization', `Bearer ${customerToken1}`);

      expect(delRes.status).toBe(200);
      const checkSess = await UserSession.findById(sess._id);
      expect(checkSess.is_active).toBe(false);
    });

    it('PUT and GET /api/customer/settings/preferences should update language and appearance', async () => {
      const res = await request(app)
        .put('/api/customer/settings/preferences')
        .set('Authorization', `Bearer ${customerToken1}`)
        .send({ language: 'hi', appearance: 'dark' });

      expect(res.status).toBe(200);
      expect(res.body.data.language).toBe('hi');
      expect(res.body.data.appearance).toBe('dark');
    });

    it('POST /api/customer/logout should logout customer and revoke sessions', async () => {
      const res = await request(app)
        .post('/api/customer/logout')
        .set('Authorization', `Bearer ${customerToken1}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ==========================================
  // 11. HELP & SUPPORT
  // ==========================================
  describe('11. Help & Support', () => {
    it('GET /api/customer/support/faqs should return categorized FAQs', async () => {
      const res = await request(app)
        .get('/api/customer/support/faqs')
        .set('Authorization', `Bearer ${customerToken1}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].question).toBeTruthy();
    });

    it('POST and GET /api/customer/support/tickets should create and thread messages', async () => {
      // 1. Create ticket
      const createRes = await request(app)
        .post('/api/customer/support/tickets')
        .set('Authorization', `Bearer ${customerToken1}`)
        .send({
          subject: 'Issue with marble slab delivery',
          category: 'Orders & Delivery',
          description: 'Slab delivered with chipped edge on corner',
          priority: 'high'
        });

      expect(createRes.status).toBe(201);
      const ticketId = createRes.body.data.id;
      expect(createRes.body.data.ticket_id).toContain('TKT-');

      // 2. Add message to thread
      const msgRes = await request(app)
        .post(`/api/customer/support/tickets/${ticketId}/messages`)
        .set('Authorization', `Bearer ${customerToken1}`)
        .send({ message: 'Attached the photo of damaged edge' });

      expect(msgRes.status).toBe(201);

      // 3. Get messages
      const getRes = await request(app)
        .get(`/api/customer/support/tickets/${ticketId}/messages`)
        .set('Authorization', `Bearer ${customerToken1}`);

      expect(getRes.status).toBe(200);
      expect(getRes.body.data.length).toBe(2); // initial description + follow-up message
    });
  });

  // ==========================================
  // 12. ABOUT STONE MARKET & APP METADATA
  // ==========================================
  describe('12. About Stone Market & Policies', () => {
    it('GET /api/app/about should return platform information', async () => {
      const res = await request(app).get('/api/app/about');
      expect(res.status).toBe(200);
      expect(res.body.data.app_name).toBe('Stone Market India');
      expect(res.body.data.supported_categories).toContain('Granite');
    });

    it('GET /api/app/version should return app version requirements', async () => {
      const res = await request(app).get('/api/app/version');
      expect(res.status).toBe(200);
      expect(res.body.data.current_version).toBeTruthy();
    });

    it('GET /api/app/policies should return privacy policy and terms URLs', async () => {
      const res = await request(app).get('/api/app/policies');
      expect(res.status).toBe(200);
      expect(res.body.data.privacy_policy_url).toBeTruthy();
      expect(res.body.data.terms_and_conditions_url).toBeTruthy();
    });
  });

  // ==========================================
  // 13. SECURITY & AUTHORIZATION ENFORCEMENT
  // ==========================================
  describe('13. Security & Authorization Enforcement', () => {
    it('Should reject unauthenticated requests with 401', async () => {
      const res = await request(app).get('/api/customer/profile');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('Should reject invalid JWT tokens with 401', async () => {
      const res = await request(app)
        .get('/api/customer/profile')
        .set('Authorization', 'Bearer invalid_random_token_123');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
