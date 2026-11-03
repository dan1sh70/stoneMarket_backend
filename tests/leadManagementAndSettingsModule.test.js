const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const app = require('../server');
const User = require('../src/models/User');
const UserSession = require('../src/models/UserSession');
const BusinessProfile = require('../src/models/BusinessProfile');
const Inquiry = require('../src/models/Inquiry');
const InquiryQuotation = require('../src/models/InquiryQuotation');
const InquiryMessage = require('../src/models/InquiryMessage');
const Product = require('../src/models/Product');
const Lead = require('../src/models/Lead');
const LeadNote = require('../src/models/LeadNote');
const LeadActivityLog = require('../src/models/LeadActivityLog');
const NotificationPreference = require('../src/models/NotificationPreference');
const QuietHours = require('../src/models/QuietHours');
const UserPreferences = require('../src/models/UserPreferences');

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

describe('Phase 4 — Lead Management & Account Settings Module Tests', () => {
  let buyerUser, buyerToken;
  let mfg1User, mfg1Token, mfg1Profile;
  let mfg2User, mfg2Token, mfg2Profile;
  let sampleInquiry1, sampleInquiry2;
  let testLead1, testLead2, testLeadClosed;

  beforeEach(async () => {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    // 1. Buyer User
    buyerUser = await User.create({
      name: 'Vikram Rathore',
      mobile: '9876543210',
      email: 'vikram.rathore@example.com',
      password: passwordHash,
      role: 'buyer',
      status: 'active',
      verification_status: 'verified'
    });
    buyerToken = jwt.sign({ id: buyerUser._id, role: 'buyer' }, JWT_SECRET, { expiresIn: '1d' });

    // 2. Manufacturer 1 (RK Granite Industries)
    mfg1User = await User.create({
      name: 'Rajesh Kumar',
      mobile: '9876543211',
      email: 'info@rkgranite.com',
      password: passwordHash,
      role: 'manufacturer',
      status: 'active'
    });
    mfg1Token = jwt.sign({ id: mfg1User._id, role: 'manufacturer' }, JWT_SECRET, { expiresIn: '1d' });

    mfg1Profile = await BusinessProfile.create({
      userId: mfg1User._id,
      business_type: 'manufacturer',
      company_name: 'RK Granite Industries',
      established_year: 2015,
      monthly_capacity: 60000,
      capacity_unit: 'Sq.Ft',
      rating: 4.9,
      review_count: 32,
      status: 'active',
      email: 'info@rkgranite.com',
      phone: '+91 98765 43210',
      logo: 'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?auto=format&fit=crop&w=400&q=80'
    });

    // 3. Manufacturer 2 (Outsider / Rival Manufacturer)
    mfg2User = await User.create({
      name: 'Suresh Patel',
      mobile: '9876543212',
      email: 'suresh@rivalgranite.com',
      password: passwordHash,
      role: 'manufacturer',
      status: 'active'
    });
    mfg2Token = jwt.sign({ id: mfg2User._id, role: 'manufacturer' }, JWT_SECRET, { expiresIn: '1d' });

    mfg2Profile = await BusinessProfile.create({
      userId: mfg2User._id,
      business_type: 'manufacturer',
      company_name: 'Rival Marble & Granites',
      status: 'active'
    });

    // 4. Test Inquiries
    sampleInquiry1 = await Inquiry.create({
      senderId: buyerUser._id,
      businessId: mfg1Profile._id,
      assigned_manufacturers: [mfg1Profile._id],
      inquiry_number: 'INQ-4001',
      requirement_title: 'Black Galaxy Granite Gangsaw Slabs (20mm)',
      category: 'Granite & Marble Slabs',
      material: 'Black Galaxy Granite',
      quantity: 500,
      unit: 'Sq.ft',
      size: '10 × 6 ft',
      thickness: '20 mm',
      finish: 'Mirror Polished',
      grade: 'Premium Export Grade',
      requirements: 'Need super premium grade with dense gold specks and zero hairline cracks for a 5-star hotel lobby project.',
      contactInfo: {
        name: 'Vikram Rathore',
        company: 'Rathore Luxury Estates',
        mobile: '+91 98765 43210',
        email: 'vikram.rathore@example.com',
        city: 'Jaipur'
      },
      deliveryLocation: {
        city: 'Jaipur',
        state: 'Rajasthan',
        address: 'Civil Lines, Jaipur'
      },
      status: 'new',
      inquiry_status: 'new'
    });

    sampleInquiry2 = await Inquiry.create({
      senderId: buyerUser._id,
      businessId: mfg1Profile._id,
      assigned_manufacturers: [mfg1Profile._id],
      inquiry_number: 'INQ-4002',
      requirement_title: 'Steel Grey Granite Slabs (18mm)',
      category: 'Granite & Marble Slabs',
      material: 'Steel Grey Granite',
      quantity: 1200,
      unit: 'Sq.ft',
      size: '8 × 3 ft',
      thickness: '18 mm',
      finish: 'Leather Finish',
      grade: 'First Choice',
      requirements: 'Need uniform grey grain for commercial office flooring in Bangalore.',
      deliveryLocation: {
        city: 'Bengaluru',
        state: 'Karnataka'
      },
      status: 'new',
      inquiry_status: 'new'
    });

    // 5. Create Test Leads
    testLead1 = await Lead.create({
      lead_number: '#LD12345',
      inquiry_id: sampleInquiry1._id,
      buyer_id: buyerUser._id,
      manufacturer_id: mfg1Profile._id,
      lead_status: 'new',
      priority: 'high',
      urgency: 'within_15_days',
      usage_application: 'Flooring',
      budget_min: 250000,
      budget_max: 350000,
      currency: 'INR',
      budget_type: 'estimated',
      assigned_at: new Date(Date.now() - 120000), // 2 mins ago
      share_token: 'share_token_test_12345'
    });

    testLead2 = await Lead.create({
      lead_number: '#LD12346',
      inquiry_id: sampleInquiry2._id,
      buyer_id: buyerUser._id,
      manufacturer_id: mfg1Profile._id,
      lead_status: 'in_discussion',
      priority: 'urgent',
      urgency: 'immediate',
      usage_application: 'Commercial Flooring',
      budget_min: 500000,
      budget_max: 750000,
      currency: 'INR',
      budget_type: 'estimated',
      assigned_at: new Date(Date.now() - 3600000),
      share_token: 'share_token_test_12346'
    });

    testLeadClosed = await Lead.create({
      lead_number: '#LD12347',
      inquiry_id: sampleInquiry2._id,
      buyer_id: buyerUser._id,
      manufacturer_id: mfg1Profile._id,
      lead_status: 'closed',
      priority: 'normal',
      urgency: 'flexible',
      closure_reason: 'Buyer purchased locally',
      closed_at: new Date(),
      share_token: 'share_token_test_12347'
    });
  });

  // =========================================================================
  // MODULE A: LEAD MANAGEMENT TESTS
  // =========================================================================
  describe('Module A: Lead Management — Received Inquiries & Listing', () => {
    it('1. should retrieve received inquiries list with header, counts, chips, and formatted lead cards', async () => {
      const res = await request(app)
        .get('/api/manufacturer/leads')
        .set('Authorization', `Bearer ${mfg1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.screen.title).toBe('Received Inquiries');
      expect(res.body.data.screen.subtitle).toBe('Incoming requirement leads from buyers.');

      // Check Filter Chips & Counts
      expect(res.body.data.counts).toHaveProperty('all');
      expect(res.body.data.counts).toHaveProperty('new');
      expect(res.body.data.counts).toHaveProperty('in_discussion');
      expect(res.body.data.counts).toHaveProperty('closed');
      expect(Array.isArray(res.body.data.filter_chips)).toBe(true);

      // Check Lead Cards
      const leads = res.body.data.leads;
      expect(leads.length).toBeGreaterThanOrEqual(3);

      const card = leads.find(l => l.lead_number === '#LD12345');
      expect(card).toBeDefined();
      expect(card.buyer.name).toBe('Vikram Rathore');
      expect(card.buyer.company_name).toBe('Rathore Luxury Estates');
      expect(card.requirement.product_name).toContain('Black Galaxy Granite');
      expect(card.requirement.quantity_display).toBe('500 Sq.ft');
      expect(card.requirement.dimensions).toBe('10 × 6 ft');
      expect(card.requirement.thickness).toBe('20 mm');
      expect(card.requirement.finish).toBe('Mirror Polished');
      expect(card.requirement.estimated_budget).toContain('2.5');
      expect(card.requirement.delivery_location).toBe('Jaipur');
      expect(card.actions.view_details).toBe(true);
      expect(card.actions.send_quote).toBe(true);
      expect(card.actions.call_buyer).toBe(true);
    });

    it('2. should filter leads by status chips (all, new, in_discussion, closed)', async () => {
      const resNew = await request(app)
        .get('/api/manufacturer/leads?status=new')
        .set('Authorization', `Bearer ${mfg1Token}`);
      expect(resNew.status).toBe(200);
      expect(resNew.body.data.leads.every(l => l.lead_status === 'new')).toBe(true);

      const resInDisc = await request(app)
        .get('/api/manufacturer/leads?status=in_discussion')
        .set('Authorization', `Bearer ${mfg1Token}`);
      expect(resInDisc.status).toBe(200);
      expect(resInDisc.body.data.leads.every(l => l.lead_status === 'in_discussion')).toBe(true);

      const resClosed = await request(app)
        .get('/api/manufacturer/leads?status=closed')
        .set('Authorization', `Bearer ${mfg1Token}`);
      expect(resClosed.status).toBe(200);
      expect(resClosed.body.data.leads.every(l => l.lead_status === 'closed')).toBe(true);
    });

    it('3. should support search by stone name, buyer name, city, and lead ID', async () => {
      // Search by material name
      const resMaterial = await request(app)
        .get('/api/manufacturer/leads?search=Black Galaxy')
        .set('Authorization', `Bearer ${mfg1Token}`);
      expect(resMaterial.status).toBe(200);
      expect(resMaterial.body.data.leads.length).toBe(1);
      expect(resMaterial.body.data.leads[0].lead_number).toBe('#LD12345');

      // Search by City
      const resCity = await request(app)
        .get('/api/manufacturer/leads/search?q=Bengaluru')
        .set('Authorization', `Bearer ${mfg1Token}`);
      expect(resCity.status).toBe(200);
      expect(resCity.body.data.leads.length).toBeGreaterThanOrEqual(1);

      // Search by Lead ID
      const resId = await request(app)
        .get('/api/manufacturer/leads?search=LD12345')
        .set('Authorization', `Bearer ${mfg1Token}`);
      expect(resId.status).toBe(200);
      expect(resId.body.data.leads[0].lead_number).toBe('#LD12345');
    });

    it('4. should retrieve lead statistics and conversion KPI metrics', async () => {
      const res = await request(app)
        .get('/api/manufacturer/leads/statistics')
        .set('Authorization', `Bearer ${mfg1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('total_leads');
      expect(res.body.data).toHaveProperty('new_leads');
      expect(res.body.data).toHaveProperty('in_discussion_leads');
      expect(res.body.data).toHaveProperty('conversion_rate_percentage');
      expect(res.body.data).toHaveProperty('avg_response_time');
    });
  });

  describe('Module A: Lead Details Screen, Tabs, & Actions', () => {
    it('5. should retrieve complete Lead Details with summary card, tabs, requirements, 4-stage timeline, and bottom actions', async () => {
      const res = await request(app)
        .get(`/api/manufacturer/leads/${testLead1._id}`)
        .set('Authorization', `Bearer ${mfg1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const data = res.body.data;
      // Header & Summary Card
      expect(data.header.title).toBe('Lead Details');
      expect(data.header.lead_id).toBe('#LD12345');
      expect(data.header.overflow_actions.length).toBe(4);
      expect(data.summary_card.buyer_name).toBe('Vikram Rathore');

      // Tabs: Overview, Messages, Quotes, Notes, History
      const tabKeys = data.tabs.map(t => t.key);
      expect(tabKeys).toEqual(expect.arrayContaining(['overview', 'messages', 'quotes', 'notes', 'history']));

      // Structured Requirements Card
      const reqCard = data.overview.requirements_card;
      expect(reqCard.product_required).toContain('Black Galaxy Granite');
      expect(reqCard.quantity).toBe('500 Sq.ft');
      expect(reqCard.usage_application).toBe('Flooring');
      expect(reqCard.delivery_location).toBe('Jaipur');

      // Vertical 4-Stage Lead Timeline Tracker
      const timeline = data.overview.lead_timeline;
      expect(timeline.stages.length).toBe(4);
      expect(timeline.stages[0].stage_key).toBe('lead_received');
      expect(timeline.stages[0].status).toBe('completed');
      expect(timeline.stages[1].stage_key).toBe('in_discussion');
      expect(timeline.stages[2].stage_key).toBe('quote_sent');
      expect(timeline.stages[3].stage_key).toBe('converted');

      // Buyer Contact Card
      expect(data.overview.buyer_contact_card.contact_person).toBe('Vikram Rathore');
      expect(data.overview.buyer_contact_card.company_name).toBe('Rathore Luxury Estates');
      expect(data.overview.buyer_contact_card.authorized_phone_number).toBe('+91 98765 43210');

      // Budget Information Card
      expect(data.overview.budget_card.is_disclosed).toBe(true);
      expect(data.overview.budget_card.estimated_budget_range).toContain('2.5');

      // Product Details Card
      expect(data.overview.product_details_card.product_name).toContain('Black Galaxy Granite');

      // Additional Notes Card
      expect(data.overview.additional_notes_card.buyer_requirement_notes).toContain('hotel lobby project');

      // Fixed Bottom Action Bar: Mark As, Share Lead, Reply Now
      expect(data.bottom_action_bar).toHaveProperty('mark_as');
      expect(data.bottom_action_bar).toHaveProperty('share_lead');
      expect(data.bottom_action_bar).toHaveProperty('reply_now');
      expect(data.bottom_action_bar.mark_as.allowed_transitions).toContain('in_discussion');
    });

    it('6. should validate IDOR security: rival manufacturer cannot access another manufacturer lead', async () => {
      const res = await request(app)
        .get(`/api/manufacturer/leads/${testLead1._id}`)
        .set('Authorization', `Bearer ${mfg2Token}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('7. should perform state machine status transition (new -> in_discussion -> closed)', async () => {
      // 1. Move to in_discussion
      const resDiscussion = await request(app)
        .post(`/api/manufacturer/leads/${testLead1._id}/status`)
        .set('Authorization', `Bearer ${mfg1Token}`)
        .send({ lead_status: 'in_discussion' });

      expect(resDiscussion.status).toBe(200);
      expect(resDiscussion.body.data.lead_status).toBe('in_discussion');

      // 2. Closing requires closure_reason
      const resFailClose = await request(app)
        .post(`/api/manufacturer/leads/${testLead1._id}/status`)
        .set('Authorization', `Bearer ${mfg1Token}`)
        .send({ lead_status: 'closed' });
      expect(resFailClose.status).toBe(422);

      // 3. Close with valid closure_reason
      const resSuccessClose = await request(app)
        .post(`/api/manufacturer/leads/${testLead1._id}/status`)
        .set('Authorization', `Bearer ${mfg1Token}`)
        .send({
          lead_status: 'closed',
          closure_reason: 'Project specifications changed',
          closure_comments: 'Buyer delayed execution by 6 months'
        });

      expect(resSuccessClose.status).toBe(200);
      expect(resSuccessClose.body.data.lead_status).toBe('closed');
      expect(resSuccessClose.body.data.closed_at).toBeDefined();
    });

    it('8. should manage private internal notes (CRUD) without exposing them to buyers', async () => {
      // Add Note
      const resAdd = await request(app)
        .post(`/api/manufacturer/leads/${testLead1._id}/notes`)
        .set('Authorization', `Bearer ${mfg1Token}`)
        .send({ note: 'Buyer requested premium material samples before finalizing gangsaw slabs.' });

      expect(resAdd.status).toBe(201);
      expect(resAdd.body.success).toBe(true);
      const noteId = resAdd.body.data._id;

      // Get Notes
      const resGet = await request(app)
        .get(`/api/manufacturer/leads/${testLead1._id}/notes`)
        .set('Authorization', `Bearer ${mfg1Token}`);

      expect(resGet.status).toBe(200);
      expect(resGet.body.data.notes.length).toBe(1);
      expect(resGet.body.data.notes[0].note).toContain('premium material samples');

      // Update Note
      const resUpdate = await request(app)
        .put(`/api/manufacturer/leads/${testLead1._id}/notes/${noteId}`)
        .set('Authorization', `Bearer ${mfg1Token}`)
        .send({ note: 'Samples dispatched via courier. Tracking shared with buyer.' });

      expect(resUpdate.status).toBe(200);
      expect(resUpdate.body.data.note).toContain('Samples dispatched');

      // Delete Note
      const resDelete = await request(app)
        .delete(`/api/manufacturer/leads/${testLead1._id}/notes/${noteId}`)
        .set('Authorization', `Bearer ${mfg1Token}`);

      expect(resDelete.status).toBe(200);
      expect(resDelete.body.success).toBe(true);
    });

    it('9. should handle Send Quote integration: calculate financials and update lead to quote_sent', async () => {
      const quotePayload = {
        quoted_quantity: 500,
        quantity_unit: 'Sq.ft',
        unit_price: 650,
        tax_rate: 18,
        shipping_charges: 12000,
        discount: 5000,
        material: 'Black Galaxy Granite Gangsaw Slabs (20mm)',
        size: '10 × 6 ft',
        thickness: '20 mm',
        finish: 'Mirror Polished',
        delivery_timeline: '7-10 Business Days',
        payment_terms: '50% Advance, 50% on Delivery'
      };

      const resQuote = await request(app)
        .post(`/api/manufacturer/leads/${testLead1._id}/quotes`)
        .set('Authorization', `Bearer ${mfg1Token}`)
        .send(quotePayload);

      expect(resQuote.status).toBe(201);
      expect(resQuote.body.success).toBe(true);
      expect(resQuote.body.data.quote_number).toMatch(/^QT-/);
      expect(resQuote.body.data.lead_status).toBe('quote_sent');

      const quotation = resQuote.body.data.quotation;
      expect(quotation.subtotal).toBe(500 * 650); // 325,000
      expect(quotation.tax_amount).toBe((325000 * 18) / 100); // 58,500
      expect(quotation.total_amount).toBe(325000 + 58500 + 12000 - 5000); // 390,500

      // Verify Lead status updated in DB
      const updatedLead = await Lead.findById(testLead1._id);
      expect(updatedLead.lead_status).toBe('quote_sent');
    });

    it('10. should send and retrieve messages linked to lead', async () => {
      const resSend = await request(app)
        .post(`/api/manufacturer/leads/${testLead1._id}/messages`)
        .set('Authorization', `Bearer ${mfg1Token}`)
        .send({ message: 'Hello Vikram, we have 2000 sq.ft ready stock of premium Black Galaxy in Jaipur.' });

      expect(resSend.status).toBe(201);
      expect(resSend.body.success).toBe(true);

      const resGet = await request(app)
        .get(`/api/manufacturer/leads/${testLead1._id}/messages`)
        .set('Authorization', `Bearer ${mfg1Token}`);

      expect(resGet.status).toBe(200);
      expect(resGet.body.data.messages.length).toBeGreaterThanOrEqual(1);
      expect(resGet.body.data.messages[0].message).toContain('ready stock');
    });

    it('11. should log buyer contact action (call/message)', async () => {
      const resLog = await request(app)
        .post(`/api/manufacturer/leads/${testLead1._id}/contact-log`)
        .set('Authorization', `Bearer ${mfg1Token}`)
        .send({ action_type: 'call', notes: 'Spoke with Vikram regarding slab thickness requirements.' });

      expect(resLog.status).toBe(200);
      expect(resLog.body.success).toBe(true);

      const resHist = await request(app)
        .get(`/api/manufacturer/leads/${testLead1._id}/history`)
        .set('Authorization', `Bearer ${mfg1Token}`);

      expect(resHist.status).toBe(200);
      expect(resHist.body.data.history.some(h => h.event_type === 'buyer_contacted')).toBe(true);
    });

    it('12. should generate share link and provide sanitized public preview without buyer phone/email', async () => {
      const resShare = await request(app)
        .post(`/api/manufacturer/leads/${testLead1._id}/share`)
        .set('Authorization', `Bearer ${mfg1Token}`)
        .send({ channel: 'copy_link' });

      expect(resShare.status).toBe(200);
      expect(resShare.body.data.share_token).toBeDefined();
      expect(resShare.body.data.share_url).toContain('/leads/share/');

      // Public view via token
      const token = resShare.body.data.share_token;
      const resPublic = await request(app)
        .get(`/api/public/leads/shared/${token}`);

      expect(resPublic.status).toBe(200);
      expect(resPublic.body.data.product).toBeDefined();
      expect(resPublic.body.data.quantity).toBe('500 Sq.ft');
      // Must NOT contain private buyer phone or email
      expect(resPublic.body.data).not.toHaveProperty('phone');
      expect(resPublic.body.data).not.toHaveProperty('mobile');
      expect(resPublic.body.data).not.toHaveProperty('email');
    });

    it('13. should download lead requirement PDF document stream', async () => {
      const resPdf = await request(app)
        .get(`/api/manufacturer/leads/${testLead1._id}/download`)
        .set('Authorization', `Bearer ${mfg1Token}`);

      expect(resPdf.status).toBe(200);
      expect(resPdf.header['content-type']).toBe('application/pdf');
      expect(resPdf.header['content-disposition']).toContain('attachment');
      expect(resPdf.body.length).toBeGreaterThan(100);
    });
  });

  // =========================================================================
  // MODULE B: ACCOUNT SETTINGS TESTS
  // =========================================================================
  describe('Module B: Account Settings — Profiles, Security, Notifications & More', () => {
    it('14. should retrieve main Settings Screen overview with Business Profile Card', async () => {
      const res = await request(app)
        .get('/api/manufacturer/settings')
        .set('Authorization', `Bearer ${mfg1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const data = res.body.data;
      expect(data.screen_title).toBe('Settings');
      expect(data.business_profile_card.company_name).toBe('RK Granite Industries');
      expect(data.business_profile_card.verification_status).toBe('Verified Supplier');
      expect(data.business_profile_card.business_email).toBe('info@rkgranite.com');
      expect(data.business_profile_card.authorized_phone_number).toBe('+91 98765 43210');
      expect(data.business_profile_card.view_profile_action.endpoint).toBe('/api/manufacturer/profile');

      expect(data.account_and_security).toHaveProperty('profile_information');
      expect(data.account_and_security).toHaveProperty('change_password');
      expect(data.account_and_security).toHaveProperty('security');

      expect(data.notification_preferences).toHaveProperty('new_inquiry');
      expect(data.quiet_hours).toHaveProperty('schedule');
      expect(data.more_settings).toHaveProperty('language');
      expect(data.more_settings).toHaveProperty('appearance');
      expect(data.more_settings).toHaveProperty('about');
      expect(data.logout_card.label).toBe('Logout');
    });

    it('15. should retrieve and update independent Notification Preferences toggles', async () => {
      // Get Preferences
      const resGet = await request(app)
        .get('/api/manufacturer/settings/notifications')
        .set('Authorization', `Bearer ${mfg1Token}`);

      expect(resGet.status).toBe(200);
      expect(resGet.body.data.preferences.length).toBe(6);
      expect(resGet.body.data.preferences.some(p => p.key === 'new_inquiry')).toBe(true);

      // Update toggles
      const resUpdate = await request(app)
        .put('/api/manufacturer/settings/notifications')
        .set('Authorization', `Bearer ${mfg1Token}`)
        .send({
          new_inquiry: true,
          lead_messages: true,
          quote_requests: false,
          ad_performance: true,
          subscription_billing: true,
          marketing_emails: false,
          channels: {
            push: true,
            email: false
          }
        });

      expect(resUpdate.status).toBe(200);
      expect(resUpdate.body.data.quote_requests).toBe(false);
      expect(resUpdate.body.data.channels.email).toBe(false);

      // Verify persistence in DB
      const savedPref = await NotificationPreference.findOne({ user_id: mfg1User._id });
      expect(savedPref.quote_requests).toBe(false);
    });

    it('16. should retrieve and update Quiet Hours schedule supporting overnight range', async () => {
      const resUpdate = await request(app)
        .put('/api/manufacturer/settings/quiet-hours')
        .set('Authorization', `Bearer ${mfg1Token}`)
        .send({
          enabled: true,
          start_time: '22:00', // 10:00 PM
          end_time: '08:00',   // 08:00 AM
          timezone: 'Asia/Kolkata'
        });

      expect(resUpdate.status).toBe(200);
      expect(resUpdate.body.data.enabled).toBe(true);
      expect(resUpdate.body.data.start_time).toBe('22:00');
      expect(resUpdate.body.data.end_time).toBe('08:00');
      expect(resUpdate.body.data.display_schedule).toBe('10:00 PM – 8:00 AM');

      // Get Quiet Hours
      const resGet = await request(app)
        .get('/api/manufacturer/settings/quiet-hours')
        .set('Authorization', `Bearer ${mfg1Token}`);

      expect(resGet.status).toBe(200);
      expect(resGet.body.data.enabled).toBe(true);
      expect(resGet.body.data.display_schedule).toBe('10:00 PM – 8:00 AM');
    });

    it('17. should retrieve and update user preferences for Language and Appearance', async () => {
      // Get preferences
      const resGet = await request(app)
        .get('/api/manufacturer/settings/preferences')
        .set('Authorization', `Bearer ${mfg1Token}`);

      expect(resGet.status).toBe(200);
      expect(resGet.body.data.available_languages.length).toBe(3);
      expect(resGet.body.data.available_themes.length).toBe(3);

      // Update to Hindi and Dark Mode
      const resUpdate = await request(app)
        .put('/api/manufacturer/settings/preferences')
        .set('Authorization', `Bearer ${mfg1Token}`)
        .send({
          language: 'hi',
          appearance: 'dark'
        });

      expect(resUpdate.status).toBe(200);
      expect(resUpdate.body.data.language).toBe('hi');
      expect(resUpdate.body.data.appearance).toBe('dark');

      const savedPref = await UserPreferences.findOne({ user_id: mfg1User._id });
      expect(savedPref.language).toBe('hi');
      expect(savedPref.appearance).toBe('dark');
    });

    it('18. should change password securely and invalidate other active sessions', async () => {
      // Seed an extra active session
      await UserSession.create({
        userId: mfg1User._id,
        session_id: 'active_session_abc123',
        device_name: 'Chrome on Mac',
        is_active: true
      });

      // Wrong current password fails
      const resWrong = await request(app)
        .post('/api/manufacturer/settings/change-password')
        .set('Authorization', `Bearer ${mfg1Token}`)
        .send({
          current_password: 'wrongpassword',
          new_password: 'newSecretPassword123',
          confirm_password: 'newSecretPassword123'
        });
      expect(resWrong.status).toBe(400);

      // Password mismatch fails
      const resMismatch = await request(app)
        .post('/api/manufacturer/settings/change-password')
        .set('Authorization', `Bearer ${mfg1Token}`)
        .send({
          current_password: 'password123',
          new_password: 'newSecretPassword123',
          confirm_password: 'differentPassword123'
        });
      expect(resMismatch.status).toBe(422);

      // Valid password change succeeds
      const resSuccess = await request(app)
        .post('/api/manufacturer/settings/change-password')
        .set('Authorization', `Bearer ${mfg1Token}`)
        .send({
          current_password: 'password123',
          new_password: 'newSecretPassword123',
          confirm_password: 'newSecretPassword123'
        });

      expect(resSuccess.status).toBe(200);
      expect(resSuccess.body.success).toBe(true);

      // Verify bcrypt hash works for login
      const updatedUser = await User.findById(mfg1User._id);
      const isNewValid = await bcrypt.compare('newSecretPassword123', updatedUser.password);
      expect(isNewValid).toBe(true);

      // Other sessions should be invalidated
      const otherSessions = await UserSession.find({ userId: mfg1User._id, is_active: true });
      expect(otherSessions.length).toBe(0);
    });

    it('19. should manage active user sessions and support single session termination and logout-all', async () => {
      // Create test sessions
      const s1 = await UserSession.create({
        userId: mfg1User._id,
        session_id: 'session_phone_1',
        device_name: 'Samsung Galaxy S24',
        device_type: 'mobile',
        is_active: true
      });

      const s2 = await UserSession.create({
        userId: mfg1User._id,
        session_id: 'session_pc_2',
        device_name: 'Dell XPS 15',
        device_type: 'desktop',
        is_active: true
      });

      // Get Active Sessions
      const resList = await request(app)
        .get('/api/manufacturer/settings/sessions')
        .set('Authorization', `Bearer ${mfg1Token}`);

      expect(resList.status).toBe(200);
      expect(resList.body.data.total_active_sessions).toBeGreaterThanOrEqual(2);

      // Revoke single session
      const resRevoke = await request(app)
        .delete(`/api/manufacturer/settings/sessions/${s1.session_id}`)
        .set('Authorization', `Bearer ${mfg1Token}`);

      expect(resRevoke.status).toBe(200);
      const checkS1 = await UserSession.findOne({ session_id: s1.session_id });
      expect(checkS1.is_active).toBe(false);

      // Logout All Devices
      const resLogoutAll = await request(app)
        .post('/api/manufacturer/settings/logout-all')
        .set('Authorization', `Bearer ${mfg1Token}`);

      expect(resLogoutAll.status).toBe(200);
      const activeCount = await UserSession.countDocuments({ userId: mfg1User._id, is_active: true });
      expect(activeCount).toBe(0);
    });

    it('20. should retrieve About Stone Market configuration and Help & Support data', async () => {
      // About endpoint
      const resAbout = await request(app)
        .get('/api/manufacturer/settings/about')
        .set('Authorization', `Bearer ${mfg1Token}`);

      expect(resAbout.status).toBe(200);
      expect(resAbout.body.data.app_name).toBe('Stone Market India');
      expect(resAbout.body.data.app_version).toBe('1.4.0');
      expect(resAbout.body.data.build_number).toBe('2026.11.03');

      // Help & Support endpoint
      const resHelp = await request(app)
        .get('/api/manufacturer/settings/help-support')
        .set('Authorization', `Bearer ${mfg1Token}`);

      expect(resHelp.status).toBe(200);
      expect(resHelp.body.data.support_contact.email).toBe('support@stonemarketindia.com');
      expect(Array.isArray(resHelp.body.data.faqs)).toBe(true);
    });

    it('21. should handle user session logout', async () => {
      await UserSession.create({
        userId: mfg1User._id,
        session_id: 'session_logout_test',
        device_name: 'OnePlus 12',
        is_active: true
      });

      const resLogout = await request(app)
        .post('/api/manufacturer/settings/logout')
        .set('Authorization', `Bearer ${mfg1Token}`);

      expect(resLogout.status).toBe(200);
      expect(resLogout.body.success).toBe(true);
      expect(resLogout.body.message).toContain('Logged out successfully');
    });
  });
});
