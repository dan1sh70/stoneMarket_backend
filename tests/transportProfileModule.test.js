const request = require('supertest');
const app = require('../server');
const User = require('../src/models/User');
const BusinessProfile = require('../src/models/BusinessProfile');
const TransportVehicle = require('../src/models/TransportVehicle');
const Inquiry = require('../src/models/Inquiry');
const jwt = require('jsonwebtoken');

describe('Stone Transport Module (National & Local Transport) - Comprehensive Suite', () => {
  let nationalUser, localUser, buyerUser;
  let nationalToken, localToken, buyerToken;
  let nationalProfile, localProfile;

  beforeEach(async () => {
    // 1. National Transport User & Profile
    nationalUser = await User.create({
      name: 'Sohan Lal Choudhary',
      mobile: '9829011111',
      email: 'sohan.national@expresslogistics.com',
      password: 'password123',
      role: 'transport_national',
      status: 'active'
    });

    nationalToken = jwt.sign(
      { id: nationalUser._id, role: nationalUser.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1h' }
    );

    nationalProfile = await BusinessProfile.create({
      userId: nationalUser._id,
      business_type: 'transport_national',
      transport_category: 'national',
      company_name: 'Rajasthan Gujarat Express Logistics',
      business_category: 'National Transport',
      business_subcategory: 'Inter-State Multi-Axle Fleet Carrier',
      short_description: 'Pan-India logistics with heavy trailer fleet for raw blocks and gangsaw slabs.',
      dispatch_timings: '24x7 Dispatch Available',
      has_all_india_permit: true,
      has_national_coverage: true,
      fleet_categories: [
        { category_name: 'Heavy Trailer', vehicle_type: 'Heavy Trailer', max_payload_ton: 40, quantity: 8 },
        { category_name: 'Multi-Axle Truck', vehicle_type: 'Multi-Axle Truck', max_payload_ton: 25, quantity: 14 },
        { category_name: 'Hydraulic Dumper', vehicle_type: 'Hydraulic Dumper', max_payload_ton: 30, quantity: 4 }
      ],
      operational_coverage_states: [
        { state_name: 'Rajasthan', cities: ['Ajmer (Kishangarh)', 'Jaipur', 'Jalore', 'Rajsamand', 'Udaipur'] },
        { state_name: 'Gujarat', cities: ['Ahmedabad', 'Surat', 'Morbi'] },
        { state_name: 'Maharashtra', cities: ['Mumbai', 'Pune', 'Nagpur'] }
      ],
      address: {
        state: 'Rajasthan',
        district: 'Jaipur',
        full_address: 'Plot 45, VKI Area, Jaipur, Rajasthan 302013'
      },
      owners: [
        {
          name: 'Sohan Lal Choudhary',
          designation: 'Managing Director',
          phone: '+91 98290 11111',
          email: 'sohan@expresslogistics.com',
          is_primary: true
        }
      ],
      rating: 4.9,
      review_count: 32,
      is_verified: true,
      status: 'active'
    });

    // 2. Local Transport User & Profile
    localUser = await User.create({
      name: 'Mukesh Gurjar',
      mobile: '9829022222',
      email: 'mukesh.local@carrier.com',
      password: 'password123',
      role: 'transport_local',
      status: 'active'
    });

    localToken = jwt.sign(
      { id: localUser._id, role: localUser.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1h' }
    );

    localProfile = await BusinessProfile.create({
      userId: localUser._id,
      business_type: 'transport_local',
      transport_category: 'local',
      company_name: 'Balaji Local Stone Carrier',
      business_category: 'Local Transport',
      business_subcategory: 'City & District Stone Logistics',
      dispatch_timings: '6:00 AM – 9:00 PM (All Days)',
      vehicle_name: 'Tata 407 Mini Truck',
      vehicle_number: 'RJ14 EA 1234',
      vehicle_type: 'Mini Truck',
      weight_capacity_ton: 10,
      driving_experience_years: 8,
      driving_license_number: 'RJ14 20150012345',
      address: {
        state: 'Rajasthan',
        district: 'Jaipur',
        full_address: 'Shop 4, Transport Nagar, Jaipur, Rajasthan 302003'
      },
      owners: [
        {
          name: 'Mukesh Gurjar',
          designation: 'Owner & Driver',
          phone: '+91 98290 22222',
          email: 'mukesh@carrier.com',
          is_primary: true
        }
      ],
      rating: 4.7,
      review_count: 18,
      is_verified: true,
      status: 'active'
    });

    // 3. Buyer User for inquiries/leads
    buyerUser = await User.create({
      name: 'Rajesh V. Patel',
      mobile: '9876511223',
      email: 'buyer.procure@apexinfra.com',
      role: 'buyer'
    });
    buyerToken = jwt.sign({ id: buyerUser._id, role: 'buyer' }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
  });

  // ==========================================
  // 1. DASHBOARD & BUSINESS TYPE SWITCHER
  // ==========================================
  describe('1. Dashboard & Subtype Switching', () => {
    it('GET /api/transport/dashboard?subtype=national - loads National Transport dashboard with 4 operational cards', async () => {
      const res = await request(app)
        .get('/api/transport/dashboard?subtype=national')
        .set('Authorization', `Bearer ${nationalToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.transport_subtype).toBe('national');
      expect(res.body.data.business_profile_card.business_name).toBe('Rajasthan Gujarat Express Logistics');
      expect(res.body.data.business_profile_card.transport_category_badge).toBe('National Transport');
      
      // National 4 operational summary cards
      expect(res.body.data.operational_summary.card_1.label).toBe('Fleet Specification');
      expect(res.body.data.operational_summary.card_2.label).toBe('Operational Coverage');
      expect(res.body.data.operational_summary.card_3.label).toBe('Maximum Payload');
      expect(res.body.data.operational_summary.card_4.label).toBe('Dispatch Timings');

      expect(res.body.data.capabilities.has_fleet_categories).toBe(true);
      expect(res.body.data.capabilities.vehicle_limit).toBeNull();
    });

    it('GET /api/transport/dashboard?subtype=local - loads Local Transport dashboard with vehicle-specific cards', async () => {
      const res = await request(app)
        .get('/api/transport/dashboard?subtype=local')
        .set('Authorization', `Bearer ${localToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.transport_subtype).toBe('local');
      expect(res.body.data.business_profile_card.business_name).toBe('Balaji Local Stone Carrier');
      expect(res.body.data.business_profile_card.transport_category_badge).toBe('Local Transport');

      // Local 4 operational summary cards
      expect(res.body.data.operational_summary.card_1.label).toBe('Vehicle Type');
      expect(res.body.data.operational_summary.card_1.value).toBe('Tata 407 Mini Truck');
      expect(res.body.data.operational_summary.card_2.label).toBe('Registration Number');
      expect(res.body.data.operational_summary.card_2.value).toBe('RJ14 EA 1234');
      expect(res.body.data.operational_summary.card_3.label).toBe('Weight Capacity');
      expect(res.body.data.operational_summary.card_4.label).toBe('Driving Experience');

      expect(res.body.data.capabilities.is_local).toBe(true);
      expect(res.body.data.capabilities.vehicle_limit).toBe(1);
    });

    it('GET /api/transport/business-types - lists transport business type with national & local subtypes', async () => {
      const res = await request(app)
        .get('/api/transport/business-types')
        .set('Authorization', `Bearer ${nationalToken}`);

      expect(res.status).toBe(200);
      const transportItem = res.body.data.types.find(t => t.id === 'transport');
      expect(transportItem).toBeDefined();
      expect(transportItem.subtypes.length).toBe(2);
    });

    it('POST /api/transport/switch-subtype - safely switches between national and local transport', async () => {
      const res = await request(app)
        .post('/api/transport/switch-subtype')
        .set('Authorization', `Bearer ${nationalToken}`)
        .send({ subtype: 'local' });

      expect(res.status).toBe(200);
      expect(res.body.data.subtype).toBe('local');
      expect(res.body.data.target_business_type).toBe('transport_local');
    });
  });

  // ==========================================
  // 2. FLEET CATEGORIES & OPERATIONAL COVERAGE
  // ==========================================
  describe('2. National Fleet Categories & Operational Coverage', () => {
    it('GET, POST, PUT, DELETE /api/transport/fleet-categories', async () => {
      // 1. GET
      const getRes = await request(app)
        .get('/api/transport/fleet-categories')
        .set('Authorization', `Bearer ${nationalToken}`);
      expect(getRes.status).toBe(200);
      expect(getRes.body.data.fleet_categories.length).toBe(3);

      // 2. POST
      const postRes = await request(app)
        .post('/api/transport/fleet-categories')
        .set('Authorization', `Bearer ${nationalToken}`)
        .send({
          category_name: 'Flatbed Trailer',
          vehicle_type: 'Flatbed Trailer',
          max_payload_ton: 35,
          quantity: 6
        });
      expect(postRes.status).toBe(201);
      const added = postRes.body.data.fleet_categories.find(c => c.category_name === 'Flatbed Trailer');
      expect(added).toBeDefined();

      // 3. PUT
      const putRes = await request(app)
        .put(`/api/transport/fleet-categories/${added._id}`)
        .set('Authorization', `Bearer ${nationalToken}`)
        .send({ quantity: 10 });
      expect(putRes.status).toBe(200);
      expect(putRes.body.data.fleet_category.quantity).toBe(10);

      // 4. DELETE
      const delRes = await request(app)
        .delete(`/api/transport/fleet-categories/${added._id}`)
        .set('Authorization', `Bearer ${nationalToken}`);
      expect(delRes.status).toBe(200);
    });

    it('GET & PUT /api/transport/operational-coverage - manages states and districts coverage', async () => {
      const putRes = await request(app)
        .put('/api/transport/operational-coverage')
        .set('Authorization', `Bearer ${nationalToken}`)
        .send({
          coverage_states: [
            { state_name: 'Rajasthan', cities: ['Jaipur', 'Kishangarh', 'Makrana'] },
            { state_name: 'Gujarat', cities: ['Ahmedabad', 'Surat'] },
            { state_name: 'Karnataka', cities: ['Bangalore', 'Ilkal'] }
          ]
        });

      expect(putRes.status).toBe(200);
      expect(putRes.body.data.coverage_states.length).toBe(3);
    });
  });

  // ==========================================
  // 3. VEHICLE MANAGEMENT ENGINE & 1-VEHICLE LIMIT
  // ==========================================
  describe('3. Vehicle Management & Local 1-Vehicle Enforcement', () => {
    let nationalVehicleId;

    it('National Transport - should allow registering multiple vehicles', async () => {
      // Vehicle 1
      const v1Res = await request(app)
        .post('/api/transport/vehicles?subtype=national')
        .set('Authorization', `Bearer ${nationalToken}`)
        .send({
          vehicle_name: 'Ashok Leyland 40-Ton Trailer',
          registration_number: 'RJ14 GA 5566',
          vehicle_category: 'Heavy Trailer',
          payload_capacity: 40,
          driving_experience_years: 12,
          driving_license_number: 'RJ14 20120098765',
          driver_name: 'Ramesh Singh',
          driver_phone: '+91 98290 33445',
          has_gps_tracking: true
        });

      expect(v1Res.status).toBe(201);
      nationalVehicleId = v1Res.body.data.vehicle._id;

      // Vehicle 2
      const v2Res = await request(app)
        .post('/api/transport/vehicles?subtype=national')
        .set('Authorization', `Bearer ${nationalToken}`)
        .send({
          vehicle_name: 'Tata Signa 28-Ton Multi-Axle',
          registration_number: 'RJ14 GB 7788',
          vehicle_category: 'Multi-Axle Truck',
          payload_capacity: 28,
          driving_experience_years: 7,
          driving_license_number: 'RJ14 20170044556'
        });

      expect(v2Res.status).toBe(201);

      // GET vehicles list
      const listRes = await request(app)
        .get('/api/transport/vehicles?subtype=national')
        .set('Authorization', `Bearer ${nationalToken}`);

      expect(listRes.status).toBe(200);
      expect(listRes.body.data.vehicles.length).toBe(2);
    });

    it('Local Transport - strictly enforces 1 registered vehicle limit (400 on second)', async () => {
      // Vehicle 1 - success
      const v1Res = await request(app)
        .post('/api/transport/vehicles?subtype=local')
        .set('Authorization', `Bearer ${localToken}`)
        .send({
          vehicle_name: 'Tata 407 Mini Truck',
          registration_number: 'RJ14 EA 1234',
          payload_capacity: 10,
          weight_capacity_ton: 10,
          driving_experience_years: 8,
          driving_license_number: 'RJ14 20150012345',
          driver_name: 'Mukesh Gurjar'
        });

      expect(v1Res.status).toBe(201);

      // Vehicle 2 - must fail with limit notice
      const v2Res = await request(app)
        .post('/api/transport/vehicles?subtype=local')
        .set('Authorization', `Bearer ${localToken}`)
        .send({
          vehicle_name: 'Mahindra Bolero Maxi Truck',
          registration_number: 'RJ14 EB 9900',
          payload_capacity: 3.5,
          driving_experience_years: 4,
          driving_license_number: 'RJ14 20190011223'
        });

      expect(v2Res.status).toBe(400);
      expect(v2Res.body.message).toContain('Local Transport limit: 1 registered vehicle');

      // Delete existing vehicle to allow another
      await request(app)
        .delete(`/api/transport/vehicles/${v1Res.body.data.vehicle._id}`)
        .set('Authorization', `Bearer ${localToken}`);

      // Now adding another should succeed
      const v3Res = await request(app)
        .post('/api/transport/vehicles?subtype=local')
        .set('Authorization', `Bearer ${localToken}`)
        .send({
          vehicle_name: 'Mahindra Bolero Maxi Truck',
          registration_number: 'RJ14 EB 9900',
          payload_capacity: 3.5,
          driving_experience_years: 4,
          driving_license_number: 'RJ14 20190011223'
        });

      expect(v3Res.status).toBe(201);
    });

    it('Vehicle Availability Status toggle', async () => {
      const v = await TransportVehicle.create({
        providerId: nationalProfile._id,
        vehicle_name: 'Trailer 1',
        registration_number: 'RJ14 GC 1122',
        payload_capacity: 30,
        availability_status: 'available_now'
      });

      const patchRes = await request(app)
        .patch(`/api/transport/vehicles/${v._id}/availability`)
        .set('Authorization', `Bearer ${nationalToken}`)
        .send({
          availability_status: 'unavailable',
          is_active: false
        });

      expect(patchRes.status).toBe(200);
      expect(patchRes.body.data.availability_status).toBe('unavailable');
    });
  });

  // ==========================================
  // 4. CONTACTS, GALLERY & VERIFICATION
  // ==========================================
  describe('4. Contacts, Gallery & Verification Center', () => {
    it('Contacts CRUD', async () => {
      const addRes = await request(app)
        .post('/api/transport/contacts')
        .set('Authorization', `Bearer ${nationalToken}`)
        .send({
          name: 'Kailash Choudhary',
          designation: 'Operations Manager',
          phone: '+91 98290 88776',
          email: 'operations@expresslogistics.com'
        });

      expect(addRes.status).toBe(201);

      const getRes = await request(app)
        .get('/api/transport/contacts')
        .set('Authorization', `Bearer ${nationalToken}`);

      expect(getRes.status).toBe(200);
      expect(getRes.body.data.contacts.length).toBeGreaterThanOrEqual(2);
    });

    it('Gallery photo and video management', async () => {
      const photoRes = await request(app)
        .post('/api/transport/gallery/photos')
        .set('Authorization', `Bearer ${nationalToken}`)
        .send({
          url: 'https://images.sample.com/fleet1.jpg',
          title: 'Heavy Trailer Fleet at Jaipur Yard',
          category: 'fleet'
        });
      expect(photoRes.status).toBe(201);

      const galleryRes = await request(app)
        .get('/api/transport/gallery')
        .set('Authorization', `Bearer ${nationalToken}`);
      expect(galleryRes.status).toBe(200);
      expect(galleryRes.body.data.photos.length).toBeGreaterThanOrEqual(1);
    });

    it('Verification Center - status, OTP and GST submission', async () => {
      const verRes = await request(app)
        .get('/api/transport/verification?subtype=local')
        .set('Authorization', `Bearer ${localToken}`);

      expect(verRes.status).toBe(200);
      expect(verRes.body.data.is_local).toBe(true);
      expect(verRes.body.data.required_documents).toContain('Driving License');

      const otpRes = await request(app)
        .post('/api/transport/verification/phone/send-otp')
        .set('Authorization', `Bearer ${localToken}`)
        .send({ phone: '+91 98290 22222' });
      expect(otpRes.status).toBe(200);

      const verifyOtpRes = await request(app)
        .post('/api/transport/verification/phone/verify-otp')
        .set('Authorization', `Bearer ${localToken}`)
        .send({ phone: '+91 98290 22222', otp: '123456' });
      expect(verifyOtpRes.status).toBe(200);
      expect(verifyOtpRes.body.data.status).toBe('verified');
    });
  });

  // ==========================================
  // 5. ANALYTICS, LEADS & INQUIRIES
  // ==========================================
  describe('5. Analytics, Inquiries & Lead Management', () => {
    it('GET /api/transport/analytics - returns real metrics for national and local transport', async () => {
      const natAnalyticsRes = await request(app)
        .get('/api/transport/analytics?subtype=national')
        .set('Authorization', `Bearer ${nationalToken}`);

      expect(natAnalyticsRes.status).toBe(200);
      expect(natAnalyticsRes.body.data.subtype).toBe('national');
      expect(natAnalyticsRes.body.data.fleet_category_breakdown).toBeDefined();

      const localAnalyticsRes = await request(app)
        .get('/api/transport/analytics?subtype=local')
        .set('Authorization', `Bearer ${localToken}`);

      expect(localAnalyticsRes.status).toBe(200);
      expect(localAnalyticsRes.body.data.subtype).toBe('local');
    });

    it('Inquiries & Leads submodules', async () => {
      // Create transport requirement lead
      await Inquiry.create({
        senderId: buyerUser._id,
        businessId: nationalProfile._id,
        category: 'Transport Logistics',
        transport_type: 'national',
        subject: 'Requirement for 40-Ton Trailer from Kishangarh to Ahmedabad',
        quantity: 40,
        unit: 'tons',
        pickupLocation: { city: 'Kishangarh', state: 'Rajasthan' },
        deliveryLocation: { city: 'Ahmedabad', state: 'Gujarat' },
        status: 'pending'
      });

      // GET inquiries
      const inqRes = await request(app)
        .get('/api/transport/inquiries')
        .set('Authorization', `Bearer ${nationalToken}`);
      expect(inqRes.status).toBe(200);

      // GET leads
      const leadsRes = await request(app)
        .get('/api/transport/leads?subtype=national')
        .set('Authorization', `Bearer ${nationalToken}`);
      expect(leadsRes.status).toBe(200);
      expect(leadsRes.body.data.leads.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ==========================================
  // 6. SHARED SETTINGS & PROMOTIONS INTEGRATION
  // ==========================================
  describe('6. Shared Settings & Promotions Engine Integration', () => {
    it('GET /api/transport/settings - accesses shared account settings for transport', async () => {
      const res = await request(app)
        .get('/api/transport/settings')
        .set('Authorization', `Bearer ${nationalToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('GET /api/transport/promotions - accesses ad promotions for transport', async () => {
      const res = await request(app)
        .get('/api/transport/promotions')
        .set('Authorization', `Bearer ${nationalToken}`);

      expect(res.status).toBe(200);
    });
  });
});
