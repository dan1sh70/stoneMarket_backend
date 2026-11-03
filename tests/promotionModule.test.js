const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const app = require('../server');
const User = require('../src/models/User');
const Product = require('../src/models/Product');
const BusinessProfile = require('../src/models/BusinessProfile');
const PromotionPackage = require('../src/models/PromotionPackage');
const PromotionCampaign = require('../src/models/PromotionCampaign');
const PromotionOrder = require('../src/models/PromotionOrder');
const Payment = require('../src/models/Payment');
const PromotionInvoice = require('../src/models/PromotionInvoice');
const PromotionAnalytics = require('../src/models/PromotionAnalytics');
const paymentService = require('../src/services/paymentService');

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

describe('Phase 2 — Ads & Promotion Management API Tests', () => {
  let adminUser, adminToken;
  let mfgUser, mfgToken, mfgProfile;
  let otherMfgUser, otherMfgToken, otherMfgProfile;
  let testProduct1, testProduct2;
  let feedPackage1, feedPackage2, listingPackage1, listingPackage2;

  beforeEach(async () => {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    // 1. Admin
    adminUser = await User.create({
      name: 'System Admin',
      mobile: '9111111101',
      email: 'admin@stonemarket.com',
      password: passwordHash,
      role: 'admin',
      status: 'active'
    });
    adminToken = jwt.sign({ id: adminUser._id, role: 'admin' }, JWT_SECRET, { expiresIn: '1d' });

    // 2. Manufacturer User 1
    mfgUser = await User.create({
      name: 'Suresh Sharma',
      mobile: '9111111104',
      email: 'suresh@mfggranite.com',
      password: passwordHash,
      role: 'manufacturer',
      status: 'active'
    });
    mfgToken = jwt.sign({ id: mfgUser._id, role: 'manufacturer' }, JWT_SECRET, { expiresIn: '1d' });

    mfgProfile = await BusinessProfile.create({
      userId: mfgUser._id,
      business_type: 'manufacturer',
      company_name: 'Royal Rajasthan Granite Processing',
      gst_number: '08AAACR1234F1Z9',
      address: {
        state: 'Rajasthan',
        district: 'Jalore',
        area: 'Phase 1 Industrial Area',
        full_address: 'Plot 42, Phase 1 Industrial Area, Jalore, Rajasthan 343001'
      },
      is_verified: true,
      status: 'active'
    });

    // 3. Other Manufacturer User (for isolation/ownership tests)
    otherMfgUser = await User.create({
      name: 'Rajesh Jain',
      mobile: '9111111105',
      email: 'rajesh@mfgmarble.com',
      password: passwordHash,
      role: 'manufacturer',
      status: 'active'
    });
    otherMfgToken = jwt.sign({ id: otherMfgUser._id, role: 'manufacturer' }, JWT_SECRET, { expiresIn: '1d' });

    otherMfgProfile = await BusinessProfile.create({
      userId: otherMfgUser._id,
      business_type: 'manufacturer',
      company_name: 'Kishangarh Marble Galleria',
      gst_number: '08AAACK5678F1Z2',
      address: {
        state: 'Rajasthan',
        district: 'Kishangarh',
        area: 'Silora Industrial Area'
      },
      is_verified: true,
      status: 'active'
    });

    // 4. Products for Mfg 1
    testProduct1 = await Product.create({
      vendorId: mfgProfile._id,
      businessProfileId: mfgProfile._id,
      name: 'Steel Grey Premium Granite Slab',
      category: 'Granite',
      material: 'Granite',
      description: 'Mirror polished 18mm export quality gangsaw slabs.',
      selling_price: 110,
      pricing_unit: 'Sq.Ft',
      publishing_status: 'published',
      status: 'active',
      images: ['https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80'],
      cover_image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80'
    });

    testProduct2 = await Product.create({
      vendorId: mfgProfile._id,
      businessProfileId: mfgProfile._id,
      name: 'Lakha Red Granite Slab',
      category: 'Granite',
      material: 'Granite',
      selling_price: 135,
      pricing_unit: 'Sq.Ft',
      publishing_status: 'published',
      status: 'active',
      images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80']
    });

    // 5. Packages
    feedPackage1 = await PromotionPackage.create({
      promotion_type: 'feed',
      package_name: 'Starter Feed Blast',
      price: 499,
      duration_days: 7,
      promotional_multiplier: '2.5x Inquiries',
      badge_label: 'Sponsored',
      theme_color: 'blue',
      benefits: ['Discovery feed placement', 'Direct inquiry button'],
      display_order: 1,
      status: 'active'
    });

    feedPackage2 = await PromotionPackage.create({
      promotion_type: 'feed',
      package_name: 'Growth Feed Blast',
      price: 999,
      duration_days: 15,
      promotional_multiplier: '5x Inquiries',
      badge_label: 'Sponsored',
      theme_color: 'blue',
      benefits: ['Home feed priority', 'WhatsApp and Call buttons'],
      display_order: 2,
      status: 'active'
    });

    listingPackage1 = await PromotionPackage.create({
      promotion_type: 'listing',
      package_name: 'Starter Top Rank',
      price: 499,
      duration_days: 7,
      promotional_multiplier: 'Guaranteed Top 5',
      badge_label: 'Featured Supplier',
      theme_color: 'orange',
      benefits: ['Top 5 directory rank', 'Featured Supplier badge'],
      display_order: 1,
      status: 'active'
    });

    listingPackage2 = await PromotionPackage.create({
      promotion_type: 'listing',
      package_name: 'Diamond Visibility',
      price: 999,
      duration_days: 15,
      promotional_multiplier: 'Guaranteed Top 3',
      badge_label: 'Featured Supplier',
      theme_color: 'orange',
      benefits: ['Top 3 directory rank', 'Direct Call/Inquiry priority'],
      display_order: 2,
      status: 'active'
    });
  });

  // ==========================================
  // 1. PROMOTION PACKAGES ENDPOINTS
  // ==========================================
  describe('1. Promotion Packages Endpoints', () => {
    it('should fetch all active promotion packages publicly', async () => {
      const res = await request(app).get('/api/promotion-packages');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.packages.length).toBe(4);
    });

    it('should filter promotion packages by type=feed', async () => {
      const res = await request(app).get('/api/promotion-packages?type=feed');
      expect(res.status).toBe(200);
      expect(res.body.data.packages.every(p => p.promotion_type === 'feed')).toBe(true);
      expect(res.body.data.packages.length).toBe(2);
    });

    it('should filter promotion packages by type=listing', async () => {
      const res = await request(app).get('/api/promotion-packages?type=listing');
      expect(res.status).toBe(200);
      expect(res.body.data.packages.every(p => p.promotion_type === 'listing')).toBe(true);
      expect(res.body.data.packages.length).toBe(2);
    });

    it('should fetch single package by ID', async () => {
      const res = await request(app).get(`/api/promotion-packages/${feedPackage1._id}`);
      expect(res.status).toBe(200);
      expect(res.body.data.package_name).toBe('Starter Feed Blast');
      expect(res.body.data.price).toBe(499);
    });
  });

  // ==========================================
  // 2. ELIGIBLE PRODUCTS
  // ==========================================
  describe('2. Eligible Products for Feed Promotion', () => {
    it('should return products belonging to authenticated manufacturer', async () => {
      const res = await request(app)
        .get('/api/manufacturer/promotions/eligible-products')
        .set('Authorization', `Bearer ${mfgToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.count).toBe(2);
      expect(res.body.data.products.some(p => p.name.includes('Steel Grey'))).toBe(true);
    });

    it('should require authentication to fetch eligible products', async () => {
      const res = await request(app).get('/api/manufacturer/promotions/eligible-products');
      expect(res.status).toBe(401);
    });
  });

  // ==========================================
  // 3. ORDER PREVIEWS & 18% GST CALCULATION
  // ==========================================
  describe('3. Order Previews & 18% GST Calculation', () => {
    it('should accurately calculate Feed Promotion order preview and 18% GST', async () => {
      const res = await request(app)
        .post('/api/manufacturer/promotions/feed/preview')
        .set('Authorization', `Bearer ${mfgToken}`)
        .send({
          package_id: feedPackage2._id.toString(), // Rs. 999
          product_id: testProduct1._id.toString(),
          targeting: { all_india: true }
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const { pricing } = res.body.data;
      expect(pricing.subtotal).toBe(999);
      expect(pricing.gst_amount).toBe(179.82); // 999 * 0.18
      expect(pricing.total_payable).toBe(1178.82); // 999 + 179.82
      expect(pricing.cgst_amount).toBe(89.91); // Intra-state Rajasthan
      expect(pricing.sgst_amount).toBe(89.91);
    });

    it('should accurately calculate Listing Promotion order preview and 18% GST', async () => {
      const res = await request(app)
        .post('/api/manufacturer/promotions/listing/preview')
        .set('Authorization', `Bearer ${mfgToken}`)
        .send({
          package_id: listingPackage1._id.toString(), // Rs. 499
          targeting: { all_india: true }
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const { pricing } = res.body.data;
      expect(pricing.subtotal).toBe(499);
      expect(pricing.gst_amount).toBe(89.82); // 499 * 0.18
      expect(pricing.total_payable).toBe(588.82); // 499 + 89.82
    });

    it('should fail feed preview when product_id is missing', async () => {
      const res = await request(app)
        .post('/api/manufacturer/promotions/feed/preview')
        .set('Authorization', `Bearer ${mfgToken}`)
        .send({
          package_id: feedPackage1._id.toString()
        });

      expect(res.status).toBe(400);
    });
  });

  // ==========================================
  // 4. CAMPAIGN CREATION & PAYMENT WORKFLOW
  // ==========================================
  describe('4. Campaign Creation & Payment Verification', () => {
    let feedOrderRes;

    it('should create pending Feed Promotion order with gateway order ID', async () => {
      const res = await request(app)
        .post('/api/manufacturer/promotions/feed/create')
        .set('Authorization', `Bearer ${mfgToken}`)
        .send({
          package_id: feedPackage2._id.toString(),
          product_id: testProduct1._id.toString(),
          campaign_name: 'Steel Grey Blast Campaign',
          targeting: {
            all_india: false,
            states: ['Rajasthan', 'Gujarat']
          }
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.order_number).toMatch(/^ORD-PRM-/);
      expect(res.body.data.gateway_order_id).toBeDefined();
      expect(res.body.data.amount).toBe(1178.82);

      feedOrderRes = res.body.data;

      // Campaign should be pending_payment before payment verification
      const campaign = await PromotionCampaign.findOne({ campaign_id: feedOrderRes.campaign_id });
      expect(campaign.campaign_status).toBe('pending_payment');
    });

    it('should reject payment verification with invalid signature', async () => {
      const createRes = await request(app)
        .post('/api/manufacturer/promotions/listing/create')
        .set('Authorization', `Bearer ${mfgToken}`)
        .send({
          package_id: listingPackage1._id.toString(),
          targeting: { all_india: true }
        });

      const orderData = createRes.body.data;

      const verifyRes = await request(app)
        .post('/api/payments/verify')
        .set('Authorization', `Bearer ${mfgToken}`)
        .send({
          order_id: orderData.order_number,
          gateway_order_id: orderData.gateway_order_id,
          gateway_payment_id: 'pay_invalid_123',
          gateway_signature: 'invalid_sha256_signature_string'
        });

      expect(verifyRes.status).toBe(400);
      expect(verifyRes.body.success).toBe(false);

      // Verify campaign status remained pending_payment
      const campaign = await PromotionCampaign.findOne({ campaign_id: orderData.campaign_id });
      expect(campaign.campaign_status).toBe('pending_payment');
    });

    it('should verify payment with valid cryptographic signature and activate Feed campaign', async () => {
      // 1. Create order
      const createRes = await request(app)
        .post('/api/manufacturer/promotions/feed/create')
        .set('Authorization', `Bearer ${mfgToken}`)
        .send({
          package_id: feedPackage2._id.toString(),
          product_id: testProduct1._id.toString(),
          campaign_name: 'Verified Active Feed Boost',
          targeting: { all_india: true }
        });

      const orderData = createRes.body.data;
      const paymentId = `pay_${Date.now()}_test`;
      const validSignature = paymentService.generateSignature({
        orderId: orderData.gateway_order_id,
        paymentId
      });

      // 2. Verify payment
      const verifyRes = await request(app)
        .post('/api/payments/verify')
        .set('Authorization', `Bearer ${mfgToken}`)
        .send({
          order_id: orderData.order_number,
          gateway_order_id: orderData.gateway_order_id,
          gateway_payment_id: paymentId,
          gateway_signature: validSignature
        });

      expect(verifyRes.status).toBe(200);
      expect(verifyRes.body.success).toBe(true);
      expect(verifyRes.body.data.campaign_status).toBe('active');
      expect(verifyRes.body.data.invoice_number).toMatch(/^INV-SMI-/);

      // 3. Ensure product received marketplace delivery boost
      const updatedProduct = await Product.findById(testProduct1._id);
      expect(updatedProduct.is_promoted).toBe(true);
      expect(updatedProduct.promotion_priority).toBeGreaterThanOrEqual(10);

      // 4. Ensure PromotionOrder is completed
      const order = await PromotionOrder.findOne({ order_number: orderData.order_number });
      expect(order.order_status).toBe('completed');

      // 5. Ensure immutable PromotionInvoice created with 18% GST breakdown
      const invoice = await PromotionInvoice.findOne({ invoice_number: verifyRes.body.data.invoice_number });
      expect(invoice).not.toBeNull();
      expect(invoice.taxable_amount).toBe(999);
      expect(invoice.total_amount).toBe(1178.82);
    });

    it('should be idempotent: verifying already completed order returns success without duplicates', async () => {
      const createRes = await request(app)
        .post('/api/manufacturer/promotions/listing/create')
        .set('Authorization', `Bearer ${mfgToken}`)
        .send({
          package_id: listingPackage2._id.toString(),
          targeting: { all_india: true }
        });

      const orderData = createRes.body.data;
      const paymentId = `pay_${Date.now()}_idempotent`;
      const validSignature = paymentService.generateSignature({
        orderId: orderData.gateway_order_id,
        paymentId
      });

      // First verification
      await request(app)
        .post('/api/payments/verify')
        .set('Authorization', `Bearer ${mfgToken}`)
        .send({
          order_id: orderData.order_number,
          gateway_order_id: orderData.gateway_order_id,
          gateway_payment_id: paymentId,
          gateway_signature: validSignature
        });

      // Second verification attempt
      const secondRes = await request(app)
        .post('/api/payments/verify')
        .set('Authorization', `Bearer ${mfgToken}`)
        .send({
          order_id: orderData.order_number,
          gateway_order_id: orderData.gateway_order_id,
          gateway_payment_id: paymentId,
          gateway_signature: validSignature
        });

      expect(secondRes.status).toBe(200);
      expect(secondRes.body.data.campaign_status).toBe('active');

      // Verify no duplicate payments or invoices
      const payments = await Payment.find({ gateway_order_id: orderData.gateway_order_id });
      expect(payments.length).toBe(1);
    });
  });

  // ==========================================
  // 5. CAMPAIGN LIFECYCLE MANAGEMENT
  // ==========================================
  describe('5. Campaign Lifecycle (Pause, Resume, End)', () => {
    let activeCampaign;

    beforeEach(async () => {
      activeCampaign = await PromotionCampaign.create({
        campaign_id: 'CMP-TEST-ACTIVE',
        manufacturer_id: mfgProfile._id,
        userId: mfgUser._id,
        product_id: testProduct1._id,
        package_id: feedPackage2._id,
        campaign_type: 'feed',
        campaign_name: 'Active Feed Lifecycle Test',
        campaign_status: 'active',
        duration_days: 15,
        start_date: new Date(),
        end_date: new Date(Date.now() + 15 * 86400000),
        subtotal: 999,
        gst_rate: 18,
        gst_amount: 179.82,
        total_amount: 1178.82,
        priority_score: 20
      });

      await Product.findByIdAndUpdate(testProduct1._id, {
        is_promoted: true,
        active_promotion_id: activeCampaign._id,
        promotion_priority: 20
      });
    });

    it('should pause an active campaign and disable product delivery flag', async () => {
      const res = await request(app)
        .post(`/api/manufacturer/promotions/${activeCampaign._id}/pause`)
        .set('Authorization', `Bearer ${mfgToken}`)
        .send({ reason: 'Inventory stock replenishment' });

      expect(res.status).toBe(200);
      expect(res.body.data.campaign_status).toBe('paused');

      const updatedProduct = await Product.findById(testProduct1._id);
      expect(updatedProduct.is_promoted).toBe(false);
    });

    it('should resume a paused campaign and re-enable product delivery flag', async () => {
      activeCampaign.campaign_status = 'paused';
      await activeCampaign.save();
      await Product.findByIdAndUpdate(testProduct1._id, { is_promoted: false });

      const res = await request(app)
        .post(`/api/manufacturer/promotions/${activeCampaign._id}/resume`)
        .set('Authorization', `Bearer ${mfgToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.campaign_status).toBe('active');

      const updatedProduct = await Product.findById(testProduct1._id);
      expect(updatedProduct.is_promoted).toBe(true);
    });

    it('should end a campaign upon confirmation and remove marketplace boost', async () => {
      const res = await request(app)
        .post(`/api/manufacturer/promotions/${activeCampaign._id}/end`)
        .set('Authorization', `Bearer ${mfgToken}`)
        .send({ reason: 'Early termination confirmed' });

      expect(res.status).toBe(200);
      expect(res.body.data.campaign_status).toBe('completed');

      const updatedProduct = await Product.findById(testProduct1._id);
      expect(updatedProduct.is_promoted).toBe(false);
    });

    it('should prevent other manufacturers from modifying the campaign', async () => {
      const res = await request(app)
        .post(`/api/manufacturer/promotions/${activeCampaign._id}/pause`)
        .set('Authorization', `Bearer ${otherMfgToken}`);

      expect(res.status).toBe(404);
    });
  });

  // ==========================================
  // 6. DASHBOARD & PERFORMANCE CHARTS
  // ==========================================
  describe('6. Ads Dashboard & Analytics Growth', () => {
    beforeEach(async () => {
      const campaign = await PromotionCampaign.create({
        campaign_id: 'CMP-DASH-TEST',
        manufacturer_id: mfgProfile._id,
        userId: mfgUser._id,
        package_id: feedPackage2._id,
        campaign_type: 'feed',
        campaign_name: 'Dashboard Analytics Campaign',
        campaign_status: 'active',
        duration_days: 15,
        start_date: new Date(),
        end_date: new Date(Date.now() + 15 * 86400000),
        subtotal: 999,
        gst_rate: 18,
        gst_amount: 179.82,
        total_amount: 1178.82,
        impressions_count: 1200,
        clicks_count: 85,
        inquiries_count: 12
      });

      // Add analytics events
      await PromotionAnalytics.insertMany([
        { campaign_id: campaign._id, event_type: 'impression', event_date: new Date() },
        { campaign_id: campaign._id, event_type: 'click', event_date: new Date() },
        { campaign_id: campaign._id, event_type: 'inquiry', event_date: new Date() }
      ]);
    });

    it('should load Ads Management Dashboard with promotion cards & KPIs', async () => {
      const res = await request(app)
        .get('/api/manufacturer/promotions/dashboard')
        .set('Authorization', `Bearer ${mfgToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.promotion_cards.length).toBe(2);
      expect(res.body.data.statistics.active_campaigns).toBeGreaterThanOrEqual(1);
      expect(res.body.data.statistics.total_impressions).toBeGreaterThanOrEqual(1200);
      expect(res.body.data.recent_campaigns.length).toBeGreaterThanOrEqual(1);
    });

    it('should return performance growth chart data over 30 days', async () => {
      const res = await request(app)
        .get('/api/manufacturer/promotions/performance?filter=30d')
        .set('Authorization', `Bearer ${mfgToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.chart_data.length).toBeGreaterThanOrEqual(7);
      expect(res.body.data.summary).toBeDefined();
    });

    it('should retrieve campaign details with ad preview and budget breakdown', async () => {
      const campaign = await PromotionCampaign.findOne({ manufacturer_id: mfgProfile._id });

      const res = await request(app)
        .get(`/api/manufacturer/promotions/${campaign._id}`)
        .set('Authorization', `Bearer ${mfgToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.header).toBeDefined();
      expect(res.body.data.performance_cards.length).toBe(4);
      expect(res.body.data.ad_preview).toBeDefined();
      expect(res.body.data.budget_and_cost).toBeDefined();
    });
  });

  // ==========================================
  // 7. MARKETPLACE AD DELIVERY INTEGRATION
  // ==========================================
  describe('7. Marketplace Ad Delivery Integration', () => {
    beforeEach(async () => {
      // Ensure product 1 has active promotion boost
      await Product.findByIdAndUpdate(testProduct1._id, {
        is_promoted: true,
        promotion_priority: 30
      });

      // Ensure mfgProfile has active directory listing boost
      await BusinessProfile.findByIdAndUpdate(mfgProfile._id, {
        is_promoted: true,
        promotion_priority: 30,
        promoted_badge: 'Featured Supplier'
      });
    });

    it('should deliver sponsored products at top of buyer discovery feed (/api/feed)', async () => {
      const res = await request(app).get('/api/feed');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const items = res.body.data.items;
      expect(items.length).toBeGreaterThan(0);

      // The promoted item must be at index 0 or have is_sponsored = true
      const sponsoredItem = items.find(i => i.is_sponsored === true);
      expect(sponsoredItem).toBeDefined();
      expect(sponsoredItem.sponsored_badge).toBe('Sponsored');
      expect(sponsoredItem.name).toBe(testProduct1.name);
    });

    it('should rank promoted manufacturers at top of directory listings (/api/manufacturers)', async () => {
      const res = await request(app).get('/api/manufacturers');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const items = res.body.data;
      expect(items.length).toBeGreaterThan(0);

      // Promoted business must have is_promoted = true and sponsored_badge
      const firstItem = items[0];
      expect(firstItem.is_promoted).toBe(true);
      expect(firstItem.sponsored_badge).toBe('Featured Supplier');
      expect(firstItem.company_name).toBe(mfgProfile.company_name);
    });
  });

  // ==========================================
  // 8. ANALYTICS EVENT LOGGING
  // ==========================================
  describe('8. Analytics Event Tracking', () => {
    it('should increment impression counter on active campaign', async () => {
      const campaign = await PromotionCampaign.create({
        campaign_id: 'CMP-EVT-01',
        manufacturer_id: mfgProfile._id,
        userId: mfgUser._id,
        package_id: feedPackage1._id,
        campaign_type: 'feed',
        campaign_name: 'Event Tracking Campaign',
        campaign_status: 'active',
        duration_days: 7,
        subtotal: 499,
        gst_rate: 18,
        gst_amount: 89.82,
        total_amount: 588.82,
        impressions_count: 10
      });

      const res = await request(app)
        .post(`/api/manufacturer/promotions/${campaign._id}/event`)
        .send({
          event_type: 'impression',
          source: 'buyer_feed'
        });

      expect(res.status).toBe(200);
      expect(res.body.data.recorded).toBe(true);

      const updated = await PromotionCampaign.findById(campaign._id);
      expect(updated.impressions_count).toBe(11);
    });
  });

  // ==========================================
  // 9. INVOICE GENERATION & PDF STREAM DOWNLOAD
  // ==========================================
  describe('9. Invoices & PDF Download Stream', () => {
    let invoice;

    beforeEach(async () => {
      invoice = await PromotionInvoice.create({
        invoice_number: 'INV-TEST-2026-999',
        invoice_date: new Date(),
        manufacturer_id: mfgProfile._id,
        userId: mfgUser._id,
        campaign_id: new mongoose.Types.ObjectId(),
        order_id: new mongoose.Types.ObjectId(),
        payment_id: new mongoose.Types.ObjectId(),
        seller_details: {
          company_name: 'Stone Market India Pvt. Ltd.',
          gstin: '08AAAAA0000A1Z5'
        },
        buyer_details: {
          company_name: mfgProfile.company_name,
          state: 'Rajasthan',
          gstin: mfgProfile.gst_number
        },
        promotion_type: 'feed',
        package_name: 'Growth Feed Blast',
        duration_days: 15,
        taxable_amount: 999,
        gst_rate: 18,
        cgst_amount: 89.91,
        sgst_amount: 89.91,
        gst_amount: 179.82,
        total_amount: 1178.82,
        payment_status: 'paid',
        transaction_reference: 'pay_test_pdf_123'
      });
    });

    it('should list manufacturer invoices', async () => {
      const res = await request(app)
        .get('/api/manufacturer/invoices')
        .set('Authorization', `Bearer ${mfgToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.invoices.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data.invoices[0].invoice_number).toBe('INV-TEST-2026-999');
    });

    it('should download immutable invoice as a valid PDF stream', async () => {
      const res = await request(app)
        .get(`/api/manufacturer/invoices/${invoice._id}/download`)
        .set('Authorization', `Bearer ${mfgToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toBe('application/pdf');
      expect(res.headers['content-disposition']).toContain('Invoice-INV-TEST-2026-999.pdf');
      expect(res.body.length).toBeGreaterThan(500); // Valid PDF binary bytes
    });
  });

  // ==========================================
  // 10. ADMIN PANEL PROMOTION CONTROLS
  // ==========================================
  describe('10. Admin Panel Promotion Management', () => {
    it('should allow admin to create, update, and manage packages', async () => {
      // 1. Create Package
      const createRes = await request(app)
        .post('/api/admin/promotions/packages')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          promotion_type: 'feed',
          package_name: 'Super Flash 3-Day Blast',
          price: 299,
          duration_days: 3,
          promotional_multiplier: '2x Inquiries',
          benefits: ['Flash discovery feed feature']
        });

      expect(createRes.status).toBe(201);
      const pkgId = createRes.body.data._id;

      // 2. Update Package Pricing
      const updateRes = await request(app)
        .put(`/api/admin/promotions/packages/${pkgId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ price: 349 });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.price).toBe(349);

      // 3. Deactivate Package
      const deleteRes = await request(app)
        .delete(`/api/admin/promotions/packages/${pkgId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.data.status).toBe('inactive');
    });

    it('should allow admin to view all campaigns and overall promotion statistics', async () => {
      const res = await request(app)
        .get('/api/admin/promotions/statistics')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.campaigns).toBeDefined();
      expect(res.body.data.orders).toBeDefined();
    });

    it('should block non-admins from admin promotion endpoints', async () => {
      const res = await request(app)
        .get('/api/admin/promotions/packages')
        .set('Authorization', `Bearer ${mfgToken}`);

      expect(res.status).toBe(403);
    });
  });
});
