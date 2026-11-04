const request = require('supertest');
const app = require('../server');
const User = require('../src/models/User');
const BusinessProfile = require('../src/models/BusinessProfile');
const BuyerRequirement = require('../src/models/BuyerRequirement');
const PurchaseOrder = require('../src/models/PurchaseOrder');
const Inquiry = require('../src/models/Inquiry');
const InquiryQuotation = require('../src/models/InquiryQuotation');
const jwt = require('jsonwebtoken');

describe('Stone Buyer Module (Phase 1) - Comprehensive Test Suite', () => {
  let buyerUser;
  let supplierUser;
  let buyerToken;
  let supplierToken;
  let buyerProfile;
  let supplierProfile;

  let createdRequirementId;
  let sampleInquiry;
  let sampleQuote;
  let createdOrderId;

  beforeEach(async () => {
    // 1. Create Buyer User & Token
    buyerUser = await User.create({
      name: 'Rajesh V. Patel',
      mobile: '9876511223',
      email: 'buyer.test@apexinfra.com',
      password: 'password123',
      role: 'buyer',
      status: 'active'
    });

    buyerToken = jwt.sign(
      { id: buyerUser._id, role: buyerUser.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1h' }
    );

    // 2. Create Buyer Profile
    buyerProfile = await BusinessProfile.create({
      userId: buyerUser._id,
      business_type: 'buyer',
      company_name: 'Apex Infra Buildcon Stone Sourcing',
      business_category: 'Stone Buyer',
      business_subcategory: 'Infrastructure & Commercial Procurement',
      short_description: 'Premier infrastructure and commercial stone procurement organization sourcing high-grade marble, granite, and natural stones across India.',
      about_business: 'Leading stone buyer executing nationwide infrastructure, institutional, and commercial real estate stone procurement with stringent quality standards.',
      established_year: 2017,
      company_type: 'Private Limited',
      buyer_business_types: [
        'Infrastructure Company',
        'Commercial Developer',
        'Contractor'
      ],
      purchasing_specializations: [
        'Granite Slabs',
        'Marble Blocks',
        'Paving Stones',
        'Cut-to-Size Tiles'
      ],
      ongoing_projects_count: 8,
      annual_purchasing_volume: 250000,
      purchasing_volume_unit: 'Sq.ft',
      procurement_capacity: '25,000+ Sq.ft / Month',
      sourcing_scope: 'Domestic',
      procurement_regions: ['Gujarat', 'Rajasthan', 'Maharashtra', 'Karnataka'],
      address: {
        state: 'Gujarat',
        district: 'Ahmedabad',
        area: 'SG Highway',
        commercial_area: 'Infra Towers',
        full_address: 'Level 6, Infra Towers, SG Highway, Ahmedabad, Gujarat 380054',
        postal_code: '380054',
        country: 'India',
        google_map_location: 'https://maps.google.com/?q=23.0225,72.5714',
        latitude: 23.0225,
        longitude: 72.5714
      },
      owners: [
        {
          name: 'Rajesh V. Patel',
          designation: 'Head of Procurement',
          phone: '+91 98765 11223',
          email: 'procurement@apexinfra.com',
          whatsapp: '+91 98765 11223',
          is_primary: true
        }
      ],
      verification_steps: {
        phone: { phone: '+91 98765 11223', status: 'verified', verified_at: new Date() },
        email: { email: 'procurement@apexinfra.com', status: 'verified', verified_at: new Date() },
        business: { registration_type: 'CIN', registration_number: 'U45201GJ2017PTC098765', status: 'verified' },
        gst: { gstin: '24AAACA5678B1Z2', status: 'verified' },
        bank: { status: 'verified', bank_name: 'HDFC Bank', account_holder_name: 'Apex Infra Buildcon Pvt Ltd' }
      },
      is_verified: true,
      verification_status: 'approved',
      gst_number: '24AAACA5678B1Z2',
      business_registration_number: 'CIN-U45201GJ2017PTC098765',
      rating: 4.9,
      review_count: 19,
      status: 'active',
      is_mock: false
    });

    // 3. Create Supplier User & Token & Profile
    supplierUser = await User.create({
      name: 'Vikramaditya Stone Works',
      mobile: '9876543210',
      email: 'vikram.supplier@granite.com',
      password: 'password123',
      role: 'manufacturer',
      status: 'active'
    });

    supplierToken = jwt.sign(
      { id: supplierUser._id, role: supplierUser.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1h' }
    );

    supplierProfile = await BusinessProfile.create({
      userId: supplierUser._id,
      business_type: 'manufacturer',
      company_name: 'Vikramaditya Granites Pvt Ltd',
      rating: 4.8,
      review_count: 22,
      is_verified: true,
      address: { city: 'Kishangarh', district: 'Ajmer', state: 'Rajasthan' }
    });
  });

  // 1. Dashboard & Business Switcher
  describe('1. Buyer Dashboard & Business Switcher', () => {
    it('GET /api/buyer/dashboard - should load stone buyer dashboard with profile summary and correct category', async () => {
      const res = await request(app)
        .get('/api/buyer/dashboard')
        .set('Authorization', `Bearer ${buyerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.business_profile_card.business_category).toBe('Stone Buyer');
      expect(res.body.data.business_profile_card.business_name).toContain('Stone Sourcing');
      expect(res.body.data.capabilities.has_product_management).toBe(false);
      expect(res.body.data.capabilities.has_sourcing_requirements).toBe(true);

      // Verify My Business items count (6 items)
      expect(res.body.data.my_business.length).toBe(6);
      expect(res.body.data.my_business.map(m => m.id)).toEqual(
        expect.arrayContaining(['profile', 'gallery', 'requirements', 'verification', 'analytics', 'promotions'])
      );

      // Verify Business Activity items (2 items)
      expect(res.body.data.business_activity.map(m => m.id)).toEqual(['inquiries', 'orders']);
    });

    it('GET /api/buyer/business-types - should list buyer business type as current', async () => {
      const res = await request(app)
        .get('/api/buyer/business-types')
        .set('Authorization', `Bearer ${buyerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.current_type).toBe('buyer');
      expect(res.body.data.types.length).toBeGreaterThanOrEqual(7);
    });

    it('POST /api/buyer/switch-business-type - should switch business context safely', async () => {
      const res = await request(app)
        .post('/api/buyer/switch-business-type')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ target_business_type: 'trader' });

      expect(res.status).toBe(200);
      expect(res.body.data.switched_to).toBe('trader');
    });
  });

  // 2. Strict Product Management Disabled Enforcement
  describe('2. Product Management Disabled Enforcement (403 Forbidden)', () => {
    it('GET /api/buyer/products - should strictly return 403 Forbidden', async () => {
      const res = await request(app)
        .get('/api/buyer/products')
        .set('Authorization', `Bearer ${buyerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Product Management is disabled for Stone Buyers');
    });

    it('POST /api/buyer/products - should strictly return 403 Forbidden', async () => {
      const res = await request(app)
        .post('/api/buyer/products')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ name: 'Marble Slab' });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/buyer/inventory - should strictly return 403 Forbidden', async () => {
      const res = await request(app)
        .get('/api/buyer/inventory')
        .set('Authorization', `Bearer ${buyerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  // 3. Buyer Profile & Project Information
  describe('3. Buyer Profile & Project Information', () => {
    it('GET /api/buyer/profile - should retrieve profile', async () => {
      const res = await request(app)
        .get('/api/buyer/profile')
        .set('Authorization', `Bearer ${buyerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.profile.business_type).toBe('buyer');
    });

    it('PUT /api/buyer/profile - should update buyer basic profile information', async () => {
      const res = await request(app)
        .put('/api/buyer/profile')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          company_name: 'Apex Infra Buildcon Stone Sourcing',
          company_type: 'Private Limited',
          gst_number: '24AAACA5678B1Z2',
          established_year: 2017,
          about_business: 'Nationwide institutional stone procurement partner.',
          buyer_business_types: ['Infrastructure Company', 'Real Estate Developer', 'Contractor'],
          purchasing_specializations: ['Granite Slabs', 'Marble Blocks', 'Paving Stones']
        });

      expect(res.status).toBe(200);
      expect(res.body.data.profile.company_name).toBe('Apex Infra Buildcon Stone Sourcing');
      expect(res.body.data.profile.buyer_business_types).toContain('Infrastructure Company');
    });

    it('PUT /api/buyer/project-info - should update procurement capacity and ongoing project counts', async () => {
      const res = await request(app)
        .put('/api/buyer/project-info')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          ongoing_projects_count: 12,
          annual_purchasing_volume: 350000,
          purchasing_volume_unit: 'Sq.ft',
          procurement_capacity: '30,000+ Sq.ft / Month',
          sourcing_scope: 'Domestic',
          procurement_regions: ['Gujarat', 'Rajasthan', 'Karnataka']
        });

      expect(res.status).toBe(200);
      expect(res.body.data.project_info.ongoing_projects_count).toBe(12);
      expect(res.body.data.project_info.annual_purchasing_volume).toBe(350000);
    });
  });

  // 4. Contacts / Key Persons Management
  describe('4. Contacts & Key Persons Management', () => {
    it('POST /api/buyer/contacts - should add a new procurement contact', async () => {
      const res = await request(app)
        .post('/api/buyer/contacts')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          name: 'Suresh Trivedi',
          designation: 'Senior Purchase Officer',
          phone: '+91 98250 99881',
          email: 'suresh@apexinfra.com',
          is_primary: false
        });

      expect(res.status).toBe(201);
      const added = res.body.data.contacts.find(c => c.name === 'Suresh Trivedi');
      expect(added).toBeDefined();
    });

    it('GET /api/buyer/contacts - should return all contacts', async () => {
      const res = await request(app)
        .get('/api/buyer/contacts')
        .set('Authorization', `Bearer ${buyerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.contacts.length).toBeGreaterThanOrEqual(1);
    });

    it('PUT /api/buyer/contacts/:contactId and DELETE - should update and remove contact', async () => {
      const contact = buyerProfile.owners[0];
      const updateRes = await request(app)
        .put(`/api/buyer/contacts/${contact._id}`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ designation: 'VP Procurement & Supply Chain' });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.contact.designation).toBe('VP Procurement & Supply Chain');

      const delRes = await request(app)
        .delete(`/api/buyer/contacts/${contact._id}`)
        .set('Authorization', `Bearer ${buyerToken}`);

      expect(delRes.status).toBe(200);
    });
  });

  // 5. Gallery Management
  describe('5. Buyer Gallery Management', () => {
    it('POST /api/buyer/gallery/photos - should add a project photo', async () => {
      const res = await request(app)
        .post('/api/buyer/gallery/photos')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          url: 'https://images.stone-market.in/projects/sample-site1.jpg',
          title: 'Ahmedabad IT Park Cladding',
          caption: 'Completed exterior granite facade',
          category: 'completed_project'
        });

      expect(res.status).toBe(201);
      expect(res.body.data.photo.title).toBe('Ahmedabad IT Park Cladding');
    });

    it('GET /api/buyer/gallery - should list photos and videos', async () => {
      const res = await request(app)
        .get('/api/buyer/gallery')
        .set('Authorization', `Bearer ${buyerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.photos).toBeDefined();
    });

    it('POST /api/buyer/gallery/videos - should add a video walkthrough', async () => {
      const res = await request(app)
        .post('/api/buyer/gallery/videos')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          title: 'Site Progress Drone Video',
          youtube_url: 'https://youtube.com/watch?v=sample123',
          source_type: 'youtube',
          category: 'project_site'
        });

      expect(res.status).toBe(201);
      expect(res.body.data.video.title).toBe('Site Progress Drone Video');
    });
  });

  // 6. Sourcing Requirements Engine
  describe('6. Sourcing Requirements Engine', () => {
    it('POST /api/buyer/requirements - should create and publish a complete sourcing requirement', async () => {
      const res = await request(app)
        .post('/api/buyer/requirements')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          title: 'High-Grade Black Galaxy Granite for Airport Terminal',
          project_name: 'Ahmedabad International Airport Terminal 3',
          project_type: 'Infrastructure',
          material_category: 'Granite',
          material_name: 'Black Galaxy Granite',
          description: 'High traffic flooring tiles with golden flecks, calibrated and mirror polished.',
          application_usage: ['Flooring', 'Wall Cladding'],
          color: 'Black with Gold Flecks',
          finish: 'Polished',
          quality: 'First Choice / Export Quality',
          size: '600x600 mm',
          thickness: '20 mm',
          edge_profile: 'Straight / Beveled',
          preferred_origin: 'Andhra Pradesh',
          quantity: 45000,
          quantity_unit: 'sqft',
          budget_min: 180,
          budget_max: 230,
          budget_type: 'Rate per Sq.ft',
          target_price: 200,
          delivery_address: 'Site Terminal 3, Sardar Vallabhbhai Patel Airport, Ahmedabad',
          procurement_timeline: '15 - 30 Days',
          delivery_type: 'FOR Project Site',
          special_requirements: {
            inspection_required: true,
            inspection_details: 'Third party lab density and water absorption testing required',
            packaging_type: 'Wooden Crates',
            transportation_required: true
          },
          supplier_targeting: {
            all_india: true,
            target_categories: ['Manufacturer', 'Mining', 'Trader'],
            verified_suppliers_only: true
          },
          status: 'open'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.requirement_id).toMatch(/^REQ-2026-\d{4}$/);
      expect(res.body.data.status).toBe('open');
      expect(res.body.data._id).toBeDefined();
      createdRequirementId = res.body.data.requirement_id;
    });

    it('GET /api/buyer/requirements - should list sourcing requirements', async () => {
      const req = await BuyerRequirement.create({
        buyerId: buyerProfile._id,
        userId: buyerUser._id,
        requirement_id: 'REQ-2026-8888',
        title: 'Makrana Marble Slabs for Heritage Hotel',
        quantity: 15000,
        status: 'open'
      });

      const res = await request(app)
        .get('/api/buyer/requirements')
        .set('Authorization', `Bearer ${buyerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('GET, PUT, DUPLICATE, CLOSE /api/buyer/requirements/:id', async () => {
      const req = await BuyerRequirement.create({
        buyerId: buyerProfile._id,
        userId: buyerUser._id,
        requirement_id: 'REQ-2026-9999',
        title: 'Teakwood Sandstone Pavers',
        quantity: 8000,
        status: 'open'
      });

      // GET
      const getRes = await request(app)
        .get(`/api/buyer/requirements/${req.requirement_id}`)
        .set('Authorization', `Bearer ${buyerToken}`);
      expect(getRes.status).toBe(200);

      // PUT
      const putRes = await request(app)
        .put(`/api/buyer/requirements/${req.requirement_id}`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ target_price: 150 });
      expect(putRes.status).toBe(200);
      expect(putRes.body.data.requirement.target_price).toBe(150);

      // DUPLICATE
      const dupRes = await request(app)
        .post(`/api/buyer/requirements/${req.requirement_id}/duplicate`)
        .set('Authorization', `Bearer ${buyerToken}`);
      expect(dupRes.status).toBe(201);
      expect(dupRes.body.data.requirement.status).toBe('draft');

      // CLOSE
      const closeRes = await request(app)
        .put(`/api/buyer/requirements/${req.requirement_id}/close`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ closing_reason: 'Procurement quota fulfilled' });
      expect(closeRes.status).toBe(200);
      expect(closeRes.body.data.requirement.status).toBe('closed');
    });
  });

  // 7. My Purchase Inquiries & Quote Comparison
  describe('7. My Purchase Inquiries & Quote Comparison', () => {
    it('Workflow: Inquiries, Quotation comparison, and Order creation', async () => {
      // Create a second supplier to avoid unique compound index (inquiry_id, manufacturer_id)
      const supplierUser2 = await User.create({
        name: 'Makrana Heritage Stones',
        mobile: '9829099887',
        email: 'makrana@supplier.com',
        role: 'manufacturer'
      });
      const supplierProfile2 = await BusinessProfile.create({
        userId: supplierUser2._id,
        business_type: 'manufacturer',
        company_name: 'Makrana Marble Crafts Pvt Ltd',
        rating: 4.9,
        is_verified: true,
        address: { city: 'Makrana', state: 'Rajasthan' }
      });

      const inq = await Inquiry.create({
        senderId: buyerUser._id,
        buyerId: buyerProfile._id,
        businessId: supplierProfile._id,
        category: 'Granite',
        subject: 'Inquiry for Black Galaxy Tiles',
        message: 'Looking for 10,000 sqft 600x600 tiles',
        quantity: 10000,
        unit: 'sqft'
      });

      const q1 = await InquiryQuotation.create({
        quote_number: 'QT-2026-9001',
        inquiry_id: inq._id,
        manufacturer_id: supplierProfile._id,
        manufacturer_user_id: supplierUser._id,
        buyer_id: buyerUser._id,
        quoted_quantity: 10000,
        unit_price: 195,
        subtotal: 1950000,
        tax_amount: 351000,
        shipping_charges: 45000,
        total_amount: 2346000,
        delivery_timeline: '7 Days',
        payment_terms: '40% Advance, 60% upon delivery'
      });

      const q2 = await InquiryQuotation.create({
        quote_number: 'QT-2026-9002',
        inquiry_id: inq._id,
        manufacturer_id: supplierProfile2._id,
        manufacturer_user_id: supplierUser2._id,
        buyer_id: buyerUser._id,
        quoted_quantity: 10000,
        unit_price: 210,
        subtotal: 2100000,
        tax_amount: 378000,
        shipping_charges: 30000,
        total_amount: 2508000,
        delivery_timeline: '12 Days',
        payment_terms: '50% Advance, 50% upon delivery'
      });

      // GET /api/buyer/inquiries
      const inqListRes = await request(app)
        .get('/api/buyer/inquiries')
        .set('Authorization', `Bearer ${buyerToken}`);
      expect(inqListRes.status).toBe(200);
      expect(inqListRes.body.data.inquiries.length).toBeGreaterThanOrEqual(1);

      // GET /api/buyer/inquiries/:id
      const inqDetailRes = await request(app)
        .get(`/api/buyer/inquiries/${inq._id}`)
        .set('Authorization', `Bearer ${buyerToken}`);
      expect(inqDetailRes.status).toBe(200);
      expect(inqDetailRes.body.data.quotes.length).toBe(2);

      // POST /api/buyer/quotes/compare
      const compareRes = await request(app)
        .post('/api/buyer/quotes/compare')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ quote_ids: [q1._id, q2._id] });
      expect(compareRes.status).toBe(200);
      expect(compareRes.body.data.suppliers.length).toBe(2);

      // POST /api/buyer/quotes/:quote_id/accept
      const acceptRes = await request(app)
        .post(`/api/buyer/quotes/${q1._id}/accept`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          delivery_address: {
            site_name: 'Terminal 3 Site',
            full_address: 'Ahmedabad International Airport Site Office',
            city: 'Ahmedabad',
            state: 'Gujarat',
            pincode: '380022',
            contact_person: 'Rajesh V. Patel',
            contact_phone: '+91 98765 11223'
          },
          buyer_notes: 'Urgent delivery required.'
        });

      expect(acceptRes.status).toBe(201);
      expect(acceptRes.body.data.purchase_order.order_id).toMatch(/^PO-2026-\d{5}$/);
      expect(acceptRes.body.data.purchase_order.order_status).toBe('confirmed');
    });
  });

  // 8. Order History & Order Details
  describe('8. Order History Engine', () => {
    it('Workflow: View orders, order details, and confirm delivery', async () => {
      const order = await PurchaseOrder.create({
        order_id: 'PO-2026-77777',
        buyer_id: buyerProfile._id,
        buyer_user_id: buyerUser._id,
        supplier_id: supplierProfile._id,
        supplier_name: supplierProfile.company_name,
        items: [
          {
            material_name: 'Black Galaxy Granite',
            quantity: 5000,
            quantity_unit: 'Sq.ft',
            unit_price: 200,
            total_amount: 1000000
          }
        ],
        pricing: {
          subtotal: 1000000,
          total_amount: 1180000
        },
        delivery_address: {
          full_address: 'Level 6, Infra Towers, Ahmedabad'
        },
        order_status: 'dispatched'
      });

      // GET /api/buyer/orders
      const ordersRes = await request(app)
        .get('/api/buyer/orders')
        .set('Authorization', `Bearer ${buyerToken}`);
      expect(ordersRes.status).toBe(200);
      expect(ordersRes.body.data.orders.length).toBeGreaterThanOrEqual(1);

      // GET /api/buyer/orders/:id
      const detailRes = await request(app)
        .get(`/api/buyer/orders/${order.order_id}`)
        .set('Authorization', `Bearer ${buyerToken}`);
      expect(detailRes.status).toBe(200);
      expect(detailRes.body.data.order.order_id).toBe(order.order_id);

      // PUT /api/buyer/orders/:id/confirm-delivery
      const confirmRes = await request(app)
        .put(`/api/buyer/orders/${order.order_id}/confirm-delivery`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          rating: 5,
          review: 'Excellent material received in good condition.'
        });
      expect(confirmRes.status).toBe(200);
      expect(confirmRes.body.data.order.order_status).toBe('completed');
    });
  });

  // 9. Verification Center
  describe('9. Verification Center', () => {
    it('GET /api/buyer/verification - should get verification status', async () => {
      const res = await request(app)
        .get('/api/buyer/verification')
        .set('Authorization', `Bearer ${buyerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.steps).toBeDefined();
    });

    it('OTP & GST verification endpoints', async () => {
      const sendRes = await request(app)
        .post('/api/buyer/verification/phone/send-otp')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ phone: '+91 98765 11223' });
      expect(sendRes.status).toBe(200);

      const verifyRes = await request(app)
        .post('/api/buyer/verification/phone/verify-otp')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ phone: '+91 98765 11223', otp: '123456' });
      expect(verifyRes.status).toBe(200);

      const gstRes = await request(app)
        .post('/api/buyer/verification/gst')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ gstin: '24AAACA5678B1Z2' });
      expect(gstRes.status).toBe(200);
    });
  });

  // 10. Buyer Analytics Engine
  describe('10. Buyer Analytics Engine', () => {
    it('GET overview, sourcing, procurement analytics and POST event', async () => {
      const overviewRes = await request(app)
        .get('/api/buyer/analytics/overview')
        .set('Authorization', `Bearer ${buyerToken}`);
      expect(overviewRes.status).toBe(200);

      const sourcingRes = await request(app)
        .get('/api/buyer/analytics/sourcing')
        .set('Authorization', `Bearer ${buyerToken}`);
      expect(sourcingRes.status).toBe(200);

      const procRes = await request(app)
        .get('/api/buyer/analytics/procurement')
        .set('Authorization', `Bearer ${buyerToken}`);
      expect(procRes.status).toBe(200);

      const eventRes = await request(app)
        .post('/api/buyer/analytics/event')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          event_type: 'requirement_published',
          metadata: { project: 'Airport Terminal 3' }
        });
      expect(eventRes.status).toBe(201);
    });
  });

  // 11. Shared Account Settings & Ad Management for Buyer
  describe('11. Shared Account Settings & Ad Management for Buyer', () => {
    it('GET /api/buyer/settings - should retrieve settings overview via shared settings endpoint', async () => {
      const res = await request(app)
        .get('/api/buyer/settings')
        .set('Authorization', `Bearer ${buyerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('GET /api/buyer/promotions - should list promotions dashboard/campaigns for buyer', async () => {
      const res = await request(app)
        .get('/api/buyer/promotions')
        .set('Authorization', `Bearer ${buyerToken}`);

      expect(res.status).toBe(200);
    });
  });
});
