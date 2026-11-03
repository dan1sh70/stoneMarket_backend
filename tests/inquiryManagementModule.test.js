const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const app = require('../server');
const User = require('../src/models/User');
const Product = require('../src/models/Product');
const BusinessProfile = require('../src/models/BusinessProfile');
const Inquiry = require('../src/models/Inquiry');
const InquiryQuotation = require('../src/models/InquiryQuotation');
const InquiryActivityLog = require('../src/models/InquiryActivityLog');
const InquiryMessage = require('../src/models/InquiryMessage');

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

describe('Phase 3 — My Inquiries & Lead Management API Tests', () => {
  let buyerUser, buyerToken;
  let mfg1User, mfg1Token, mfg1Profile;
  let mfg2User, mfg2Token, mfg2Profile;
  let outsiderUser, outsiderToken, outsiderProfile;
  let testProduct;
  let sampleInquiry1, sampleInquiry2, closedInquiry;
  let sampleQuote1, sampleQuote2;
  let sampleMessage;

  beforeEach(async () => {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    // 1. Buyer User
    buyerUser = await User.create({
      name: 'Ramesh Patel',
      mobile: '9876543210',
      email: 'ramesh.buyer@example.com',
      password: passwordHash,
      role: 'buyer',
      status: 'active'
    });
    buyerToken = jwt.sign({ id: buyerUser._id, role: 'buyer' }, JWT_SECRET, { expiresIn: '1d' });

    // 2. Manufacturer 1 (Royal Granite)
    mfg1User = await User.create({
      name: 'Vikram Singh',
      mobile: '9876543211',
      email: 'vikram.mfg@example.com',
      password: passwordHash,
      role: 'manufacturer',
      status: 'active'
    });
    mfg1Token = jwt.sign({ id: mfg1User._id, role: 'manufacturer' }, JWT_SECRET, { expiresIn: '1d' });

    mfg1Profile = await BusinessProfile.create({
      userId: mfg1User._id,
      business_type: 'manufacturer',
      company_name: 'Royal Rajasthan Granite Slabs',
      established_year: 2012,
      monthly_capacity: 80000,
      capacity_unit: 'Sq.Ft',
      rating: 4.8,
      review_count: 24,
      status: 'active',
      gst_number: '08AAACR1234F1Z9',
      address: {
        state: 'Rajasthan',
        district: 'Jaipur',
        area: 'Sitapura Industrial Area',
        pincode: '302022'
      }
    });

    // 3. Manufacturer 2 (Marble Exports India)
    mfg2User = await User.create({
      name: 'Sunil Sharma',
      mobile: '9876543212',
      email: 'sunil.marble@example.com',
      password: passwordHash,
      role: 'manufacturer',
      status: 'active'
    });
    mfg2Token = jwt.sign({ id: mfg2User._id, role: 'manufacturer' }, JWT_SECRET, { expiresIn: '1d' });

    mfg2Profile = await BusinessProfile.create({
      userId: mfg2User._id,
      business_type: 'manufacturer',
      company_name: 'Marble Exports India',
      established_year: 2015,
      monthly_capacity: 65000,
      capacity_unit: 'Sq.Ft',
      rating: 4.5,
      review_count: 18,
      status: 'active',
      gst_number: '08BBBBR5678F2Z1',
      address: {
        state: 'Rajasthan',
        district: 'Kishangarh',
        area: 'Marble City Zone',
        pincode: '305801'
      }
    });

    // 4. Outsider / Unassigned Trader
    outsiderUser = await User.create({
      name: 'Unrelated Trader',
      mobile: '9876543219',
      email: 'outsider@example.com',
      password: passwordHash,
      role: 'trader',
      status: 'active'
    });
    outsiderToken = jwt.sign({ id: outsiderUser._id, role: 'trader' }, JWT_SECRET, { expiresIn: '1d' });

    outsiderProfile = await BusinessProfile.create({
      userId: outsiderUser._id,
      business_type: 'trader',
      company_name: 'Delhi Ceramic Depot',
      status: 'active'
    });

    // 5. Sample Product
    testProduct = await Product.create({
      vendorId: mfg1Profile._id,
      businessId: mfg1Profile._id,
      businessProfileId: mfg1Profile._id,
      title: 'Black Galaxy Granite Gangsaw Slabs',
      name: 'Black Galaxy Granite Gangsaw Slabs',
      category: 'Granite & Marble Slabs',
      price: 180,
      min_order_quantity: 200,
      unit: 'Sq.Ft',
      status: 'active'
    });

    // 6. Sample Inquiries
    sampleInquiry1 = await Inquiry.create({
      inquiry_number: 'INQ-2026-9041',
      buyer_id: buyerUser._id,
      senderId: buyerUser._id,
      productId: testProduct._id,
      requirement_title: 'Black Galaxy Granite Gangsaw Slabs',
      subject: 'Black Galaxy Granite Gangsaw Slabs',
      category: 'Granite & Marble Slabs',
      description: 'Require export quality Black Galaxy granite slabs for luxury villa flooring project in Jaipur.',
      requirements: 'Polished finish, consistent golden speckles, zero hairline cracks.',
      required_quantity: 500,
      quantity: 500,
      quantity_unit: 'Sq.Ft',
      unit: 'Sq.Ft',
      required_size: '10 x 6 ft',
      size: '10 x 6 ft',
      thickness: '18 mm',
      finish: 'Mirror Polished',
      quality: 'Premium Grade A',
      grade: 'Grade A',
      edge_profile: 'Straight Cut',
      material: 'Granite',
      color: 'Black Galaxy',
      delivery_location: 'Jaipur, Rajasthan',
      deliveryLocation: {
        address: 'Plot 45, Tonk Road',
        city: 'Jaipur',
        state: 'Rajasthan',
        pincode: '302015'
      },
      supplierType: 'manufacturer',
      assigned_manufacturers: [mfg1Profile._id, mfg2Profile._id],
      recipients: [
        { manufacturer_id: mfg1Profile._id, delivery_status: 'delivered' },
        { manufacturer_id: mfg2Profile._id, delivery_status: 'delivered' }
      ],
      inquiry_status: 'pending',
      status: 'pending',
      quotations_count: 0,
      attachments: [
        {
          file_name: 'floor_plan_villa.pdf',
          file_path: '/uploads/inquiries/floor_plan_villa.pdf',
          file_type: 'application/pdf',
          file_size: 1048576
        }
      ]
    });

    sampleInquiry2 = await Inquiry.create({
      inquiry_number: 'INQ-2026-9042',
      buyer_id: buyerUser._id,
      senderId: buyerUser._id,
      requirement_title: 'Steel Grey Granite Cut-to-Size',
      subject: 'Steel Grey Granite Cut-to-Size',
      category: 'Granite & Marble Slabs',
      description: 'Need Steel Grey granite cut to size for commercial office staircase.',
      required_quantity: 1200,
      quantity: 1200,
      quantity_unit: 'Sq.Ft',
      unit: 'Sq.Ft',
      required_size: '4 x 1 ft',
      size: '4 x 1 ft',
      thickness: '20 mm',
      finish: 'Flamed / Lapato',
      quality: 'Standard Commercial',
      material: 'Granite',
      color: 'Steel Grey',
      delivery_location: 'Udaipur, Rajasthan',
      deliveryLocation: {
        city: 'Udaipur',
        state: 'Rajasthan'
      },
      supplierType: 'manufacturer',
      assigned_manufacturers: [mfg1Profile._id, mfg2Profile._id],
      recipients: [
        { manufacturer_id: mfg1Profile._id, delivery_status: 'delivered' },
        { manufacturer_id: mfg2Profile._id, delivery_status: 'delivered' }
      ],
      inquiry_status: 'quotes_received',
      status: 'quotes_received',
      quotations_count: 2
    });

    closedInquiry = await Inquiry.create({
      inquiry_number: 'INQ-2026-8800',
      buyer_id: buyerUser._id,
      senderId: buyerUser._id,
      requirement_title: 'Makrana White Marble Blocks',
      category: 'Granite & Marble Slabs',
      required_quantity: 80,
      quantity: 80,
      quantity_unit: 'Tons',
      delivery_location: 'Makrana, Rajasthan',
      supplierType: 'manufacturer',
      assigned_manufacturers: [mfg1Profile._id],
      inquiry_status: 'closed',
      status: 'closed',
      closed_at: new Date(),
      closure_reason: 'Project requirement completed via alternate source',
      closure_comments: 'Found suitable block stock locally.'
    });

    // 7. Seed sample quotations on sampleInquiry2
    sampleQuote1 = await InquiryQuotation.create({
      quote_number: 'QTE-2026-90001',
      inquiry_id: sampleInquiry2._id,
      manufacturer_id: mfg1Profile._id,
      manufacturer_user_id: mfg1User._id,
      buyer_id: buyerUser._id,
      quoted_quantity: 1200,
      quantity_unit: 'Sq.Ft',
      unit_price: 165,
      subtotal: 198000,
      tax_rate: 18,
      tax_amount: 35640,
      shipping_charges: 6000,
      discount: 0,
      total_amount: 239640,
      delivery_timeline: '7-10 Business Days',
      payment_terms: '50% Advance, 50% on Dispatch',
      advance_payment: 50,
      balance_payment: 50,
      validity_date: new Date(Date.now() + 15 * 86400000),
      warranty: '1 Year Warranty',
      quote_status: 'submitted'
    });

    sampleQuote2 = await InquiryQuotation.create({
      quote_number: 'QTE-2026-90002',
      inquiry_id: sampleInquiry2._id,
      manufacturer_id: mfg2Profile._id,
      manufacturer_user_id: mfg2User._id,
      buyer_id: buyerUser._id,
      quoted_quantity: 1200,
      quantity_unit: 'Sq.Ft',
      unit_price: 170,
      subtotal: 204000,
      tax_rate: 18,
      tax_amount: 36720,
      shipping_charges: 5000,
      discount: 2000,
      total_amount: 243720,
      delivery_timeline: '5-7 Days',
      payment_terms: '100% on Dispatch',
      validity_date: new Date(Date.now() + 20 * 86400000),
      warranty: 'Standard Guarantee',
      quote_status: 'submitted'
    });

    // 8. Seed sample message on sampleInquiry1
    sampleMessage = await InquiryMessage.create({
      inquiry_id: sampleInquiry1._id,
      sender_id: mfg1User._id,
      sender_type: 'manufacturer',
      receiver_id: buyerUser._id,
      message: 'Hello Ramesh, we have ready stock of 10x6 ft Black Galaxy gangsaw slabs at our Jaipur factory.',
      is_read: false
    });

    // 9. Create Initial Activity Log for sampleInquiry1
    await InquiryActivityLog.create({
      inquiry_id: sampleInquiry1._id,
      performed_by: buyerUser._id,
      actor_type: 'buyer',
      activity_type: 'inquiry_created',
      stage: 1,
      title: 'Inquiry Requested',
      description: 'Buyer submitted new requirement inquiry INQ-2026-9041'
    });
  });

  describe('1. Main Inquiry Screen Listing & Filters', () => {
    it('should list all inquiries visible to the manufacturer with pagination and cards', async () => {
      const res = await request(app)
        .get('/api/manufacturer/inquiries')
        .set('Authorization', `Bearer ${mfg1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.inquiries).toBeInstanceOf(Array);
      expect(res.body.data.inquiries.length).toBeGreaterThanOrEqual(3);

      const firstCard = res.body.data.inquiries[0];
      expect(firstCard.id).toBeDefined();
      expect(firstCard.inquiry_number).toBeDefined();
      expect(firstCard.requirement_title).toBeDefined();
      expect(firstCard.status).toBeDefined();
      expect(firstCard.ui_badge).toBeDefined();
      expect(firstCard.required_quantity).toBeDefined();
    });

    it('should filter inquiries by status=pending', async () => {
      const res = await request(app)
        .get('/api/manufacturer/inquiries?status=pending')
        .set('Authorization', `Bearer ${mfg1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const items = res.body.data.inquiries;
      expect(items.length).toBeGreaterThanOrEqual(1);
      items.forEach(item => {
        expect(['pending', 'in_review', 'new']).toContain(item.status);
      });
    });

    it('should filter inquiries by status=quotes_received', async () => {
      const res = await request(app)
        .get('/api/manufacturer/inquiries?status=quotes_received')
        .set('Authorization', `Bearer ${mfg1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const items = res.body.data.inquiries;
      expect(items.length).toBeGreaterThanOrEqual(1);
      expect(items.some(i => i.inquiry_number === 'INQ-2026-9042')).toBe(true);
    });

    it('should filter inquiries by status=closed', async () => {
      const res = await request(app)
        .get('/api/manufacturer/inquiries?status=closed')
        .set('Authorization', `Bearer ${mfg1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const items = res.body.data.inquiries;
      expect(items.length).toBeGreaterThanOrEqual(1);
      expect(items.some(i => i.inquiry_number === 'INQ-2026-8800')).toBe(true);
    });

    it('should search inquiries by keyword, city, or inquiry ID', async () => {
      const res = await request(app)
        .get('/api/manufacturer/inquiries?search=Jaipur')
        .set('Authorization', `Bearer ${mfg1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.inquiries.some(i => i.inquiry_number === 'INQ-2026-9041')).toBe(true);
    });

    it('should support dedicated search endpoint GET /search?q=Galaxy', async () => {
      const res = await request(app)
        .get('/api/manufacturer/inquiries/search?q=Galaxy')
        .set('Authorization', `Bearer ${mfg1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.inquiries.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data.inquiries[0].requirement_title).toContain('Galaxy');
    });

    it('should fetch dynamic counts via GET /statistics', async () => {
      const res = await request(app)
        .get('/api/manufacturer/inquiries/statistics')
        .set('Authorization', `Bearer ${mfg1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.tab_counts).toBeDefined();
      expect(res.body.data.tab_counts.all).toBeGreaterThanOrEqual(3);
      expect(res.body.data.tab_counts.pending).toBeGreaterThanOrEqual(1);
      expect(res.body.data.tab_counts.quotes_received).toBeGreaterThanOrEqual(1);
      expect(res.body.data.tab_counts.closed).toBeGreaterThanOrEqual(1);
      expect(res.body.data.conversion_rate).toBeDefined();
    });
  });

  describe('2. Inquiry Details Screen & Sub-Resources', () => {
    it('should fetch complete inquiry details with 4-stage progress tracker', async () => {
      const res = await request(app)
        .get(`/api/manufacturer/inquiries/${sampleInquiry1._id}`)
        .set('Authorization', `Bearer ${mfg1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const d = res.body.data;
      expect(d.inquiry_id).toBe(sampleInquiry1._id.toString());
      expect(d.inquiry_number).toBe('INQ-2026-9041');

      // Product Summary Card
      expect(d.summary_card).toBeDefined();
      expect(d.summary_card.requirement_title).toBe('Black Galaxy Granite Gangsaw Slabs');
      expect(d.summary_card.category).toBe('Granite & Marble Slabs');

      // 4-Stage Progress Tracker
      expect(d.progress_tracker).toBeDefined();
      expect(d.progress_tracker.stages).toBeInstanceOf(Array);
      expect(d.progress_tracker.stages.length).toBe(4);
      expect(d.progress_tracker.stages[0].name).toBe('Inquiry Requested');
      expect(d.progress_tracker.stages[0].is_completed).toBe(true);
      expect(d.progress_tracker.stages[1].name).toBe('In Review');
      expect(d.progress_tracker.stages[2].name).toBe('Quotes Received');
      expect(d.progress_tracker.stages[3].name).toBe('Completed');

      // Structured Product Requirements
      expect(d.requirements.product_specifications).toBeDefined();
      expect(d.requirements.product_specifications.required_quantity).toBe('500 Sq.Ft');
      expect(d.requirements.product_specifications.thickness).toBe('18 mm');
      expect(d.requirements.product_specifications.finish).toBe('Mirror Polished');

      // Delivery & Attachments
      expect(d.requirements.delivery_information.city).toBe('Jaipur');
      expect(d.attachments.total_files).toBe(1);

      // Bottom Actions Bar
      expect(d.bottom_actions.can_download).toBe(true);
      expect(d.bottom_actions.can_close).toBe(true);
    });

    it('should fetch isolated requirements via GET /:id/requirements', async () => {
      const res = await request(app)
        .get(`/api/manufacturer/inquiries/${sampleInquiry1._id}/requirements`)
        .set('Authorization', `Bearer ${mfg1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.specifications).toBeDefined();
      expect(res.body.data.delivery).toBeDefined();
    });

    it('should fetch attachments via GET /:id/attachments', async () => {
      const res = await request(app)
        .get(`/api/manufacturer/inquiries/${sampleInquiry1._id}/attachments`)
        .set('Authorization', `Bearer ${mfg1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.attachments).toBeInstanceOf(Array);
      expect(res.body.data.attachments.length).toBe(1);
      expect(res.body.data.attachments[0].file_name).toBe('floor_plan_villa.pdf');
    });

    it('should fetch activity history via GET /:id/activity', async () => {
      const res = await request(app)
        .get(`/api/manufacturer/inquiries/${sampleInquiry1._id}/activity`)
        .set('Authorization', `Bearer ${mfg1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.activities).toBeInstanceOf(Array);
      expect(res.body.data.activities.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('3. Quotation Management, Comparison & Lifecycle', () => {
    it('should allow manufacturer to submit quotation with auto calculations', async () => {
      const quotePayload = {
        quoted_quantity: 500,
        quantity_unit: 'Sq.Ft',
        unit_price: 175,
        tax_rate: 18,
        shipping_charges: 4500,
        discount: 1000,
        delivery_timeline: '7-10 Business Days',
        payment_terms: '50% Advance, 50% on Dispatch',
        advance_payment: 50,
        balance_payment: 50,
        validity_days: 15,
        warranty: '1 Year Crack & Polish Warranty',
        notes: 'Premium export quality Gangsaw cut Black Galaxy slabs.'
      };

      const res = await request(app)
        .post(`/api/manufacturer/inquiries/${sampleInquiry1._id}/quotes`)
        .set('Authorization', `Bearer ${mfg1Token}`)
        .send(quotePayload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      const q = res.body.data;
      expect(q.quote_number).toMatch(/^QTE-/);
      expect(q.quoted_quantity).toBe(500);
      expect(q.unit_price).toBe(175);
      expect(q.subtotal).toBe(500 * 175); // 87500
      expect(q.tax_amount).toBe((87500 - 1000) * 0.18); // 15570
      expect(q.shipping_charges).toBe(4500);
      expect(q.discount).toBe(1000);
      expect(q.total_amount).toBe(87500 - 1000 + 15570 + 4500); // 106570
      expect(q.quote_status).toBe('submitted');

      // Verify inquiry status transitioned to quotes_received
      const updatedInq = await Inquiry.findById(sampleInquiry1._id);
      expect(updatedInq.inquiry_status).toBe('quotes_received');
      expect(updatedInq.quotations_count).toBe(1);

      // Verify activity log added Stage 3
      const logs = await InquiryActivityLog.find({ inquiry_id: sampleInquiry1._id, stage: 3 });
      expect(logs.length).toBeGreaterThanOrEqual(1);
    });

    it('should reject duplicate quote from same manufacturer for the same inquiry', async () => {
      // sampleQuote1 already exists on sampleInquiry2 from mfg1
      const res = await request(app)
        .post(`/api/manufacturer/inquiries/${sampleInquiry2._id}/quotes`)
        .set('Authorization', `Bearer ${mfg1Token}`)
        .send({
          quoted_quantity: 500,
          unit_price: 180
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/already submitted an active quotation/i);
    });

    it('should isolate competitor pricing when manufacturer views quotes list', async () => {
      const res = await request(app)
        .get(`/api/manufacturer/inquiries/${sampleInquiry2._id}/quotes`)
        .set('Authorization', `Bearer ${mfg1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const quotes = res.body.data.quotes;
      expect(quotes.length).toBe(2);

      // Mfg1's own quote should be visible in detail
      const ownQuote = quotes.find(q => q.is_own_quote === true);
      expect(ownQuote).toBeDefined();
      expect(ownQuote.unit_price).toBe(165);

      // Competitor quote should have sensitive details masked
      const compQuote = quotes.find(q => q.is_own_quote === false);
      expect(compQuote).toBeDefined();
      expect(compQuote.unit_price).toBe('Protected');
      expect(compQuote.can_view_full).toBe(false);
    });

    it('should display complete comparison matrix when buyer views compare quotes', async () => {
      const res = await request(app)
        .get(`/api/manufacturer/inquiries/${sampleInquiry2._id}/quotes/compare`)
        .set('Authorization', `Bearer ${buyerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.comparison_matrix).toBeDefined();
      expect(res.body.data.comparison_matrix.quotes.length).toBe(2);
      expect(res.body.data.comparison_matrix.comparison_rows).toBeInstanceOf(Array);
    });

    it('should get detailed view of single quote via GET /api/manufacturer/quotes/:id', async () => {
      const res = await request(app)
        .get(`/api/manufacturer/quotes/${sampleQuote1._id}`)
        .set('Authorization', `Bearer ${mfg1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.quotation_details).toBeDefined();
      expect(res.body.data.commercial_terms).toBeDefined();
      expect(res.body.data.actions.can_edit).toBe(true);
      expect(res.body.data.actions.can_withdraw).toBe(true);
    });

    it('should update quote via PUT /api/manufacturer/quotes/:id', async () => {
      const res = await request(app)
        .put(`/api/manufacturer/quotes/${sampleQuote1._id}`)
        .set('Authorization', `Bearer ${mfg1Token}`)
        .send({
          unit_price: 160,
          discount: 1500,
          notes: 'Special festival revised pricing offer.'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.unit_price).toBe(160);
      expect(res.body.data.discount).toBe(1500);
    });

    it('should withdraw quote via POST /api/manufacturer/quotes/:id/withdraw', async () => {
      const res = await request(app)
        .post(`/api/manufacturer/quotes/${sampleQuote1._id}/withdraw`)
        .set('Authorization', `Bearer ${mfg1Token}`)
        .send({ reason: 'Raw material stock allocated elsewhere' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.quote_status).toBe('withdrawn');
    });
  });

  describe('4. Inquiry Review & Closure Lifecycle', () => {
    it('should mark inquiry in review via POST /:id/review', async () => {
      const res = await request(app)
        .post(`/api/manufacturer/inquiries/${sampleInquiry1._id}/review`)
        .set('Authorization', `Bearer ${mfg1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.stage).toBe(2);

      // Verify recipient viewed_at updated
      const inq = await Inquiry.findById(sampleInquiry1._id);
      const recipient = inq.recipients.find(r => r.manufacturer_id.toString() === mfg1Profile._id.toString());
      expect(recipient.viewed_at).toBeDefined();
    });

    it('should close inquiry with reason via POST /:id/close', async () => {
      const res = await request(app)
        .post(`/api/manufacturer/inquiries/${sampleInquiry1._id}/close`)
        .set('Authorization', `Bearer ${mfg1Token}`)
        .send({
          closure_reason: 'Order finalized with offline buyer',
          comments: 'Material dispatched from factory.'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('closed');
      expect(res.body.data.closure_reason).toBe('Order finalized with offline buyer');

      const updated = await Inquiry.findById(sampleInquiry1._id);
      expect(updated.inquiry_status).toBe('closed');
      expect(updated.closed_at).toBeDefined();
    });

    it('should reopen inquiry via POST /:id/reopen', async () => {
      const res = await request(app)
        .post(`/api/manufacturer/inquiries/${closedInquiry._id}/reopen`)
        .set('Authorization', `Bearer ${mfg1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('pending');

      const updated = await Inquiry.findById(closedInquiry._id);
      expect(updated.inquiry_status).toBe('pending');
    });
  });

  describe('5. Inquiry-Linked Messaging Thread', () => {
    it('should fetch messaging conversation thread via GET /:id/messages', async () => {
      const res = await request(app)
        .get(`/api/manufacturer/inquiries/${sampleInquiry1._id}/messages`)
        .set('Authorization', `Bearer ${buyerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.messages).toBeInstanceOf(Array);
      expect(res.body.data.messages.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data.unread_count).toBeGreaterThanOrEqual(1);
    });

    it('should send a message linked to the inquiry via POST /:id/messages', async () => {
      const res = await request(app)
        .post(`/api/manufacturer/inquiries/${sampleInquiry1._id}/messages`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          message: 'Can you please confirm slab packing for export transportation?'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.message).toContain('export transportation');
      expect(res.body.data.sender_type).toBe('buyer');
    });

    it('should mark unread messages as read via POST /:id/messages/read', async () => {
      const res = await request(app)
        .post(`/api/manufacturer/inquiries/${sampleInquiry1._id}/messages/read`)
        .set('Authorization', `Bearer ${buyerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.read).toBe(true);
    });
  });

  describe('6. Download Inquiry PDF Document', () => {
    it('should stream branded PDF document via GET /:id/download', async () => {
      const res = await request(app)
        .get(`/api/manufacturer/inquiries/${sampleInquiry1._id}/download`)
        .set('Authorization', `Bearer ${mfg1Token}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/application\/pdf/);
      expect(res.headers['content-disposition']).toContain('.pdf');
      expect(res.body).toBeDefined();
    });
  });

  describe('7. Security, Authorization & Input Validation', () => {
    it('should require authentication for inquiry routes', async () => {
      const res = await request(app).get('/api/manufacturer/inquiries');
      expect(res.status).toBe(401);
    });

    it('should return 400 when submitting quote with missing required fields', async () => {
      const res = await request(app)
        .post(`/api/manufacturer/inquiries/${sampleInquiry1._id}/quotes`)
        .set('Authorization', `Bearer ${mfg1Token}`)
        .send({
          // missing quoted_quantity and unit_price
          payment_terms: '100% advance'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 when closing inquiry without closure reason', async () => {
      const res = await request(app)
        .post(`/api/manufacturer/inquiries/${sampleInquiry1._id}/close`)
        .set('Authorization', `Bearer ${mfg1Token}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 404 for non-existent inquiry', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/manufacturer/inquiries/${fakeId}`)
        .set('Authorization', `Bearer ${mfg1Token}`);

      expect(res.status).toBe(404);
    });
  });
});
