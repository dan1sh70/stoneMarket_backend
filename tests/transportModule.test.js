const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../server');

const User = require('../src/models/User');
const BusinessProfile = require('../src/models/BusinessProfile');
const Location = require('../src/models/Location');
const VehicleType = require('../src/models/VehicleType');
const TransportVehicle = require('../src/models/TransportVehicle');
const TransportRoute = require('../src/models/TransportRoute');
const FreightRate = require('../src/models/FreightRate');
const Inquiry = require('../src/models/Inquiry');
const QuoteRequest = require('../src/models/QuoteRequest');
const QuoteResponse = require('../src/models/QuoteResponse');
const BusinessFavorite = require('../src/models/BusinessFavorite');

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

const generateToken = (user) => {
  return jwt.sign({ id: user._id.toString(), role: user.role }, JWT_SECRET, { expiresIn: '1d' });
};

describe('Transport Module Backend Integration Tests', () => {
  let adminUser, adminToken;
  let nationalProviderUser, nationalProviderToken;
  let localProviderUser, localProviderToken;
  let buyerUser, buyerToken;
  let competitorProviderUser, competitorToken;

  let nationalProviderProfile, localProviderProfile, competitorProfile;
  let stateRaj, stateDelhi, stateGuj;
  let cityJaipur, cityKishangarh, cityDelhi, cityAhmedabad;
  let vt10Wheeler, vt12Wheeler, vtFlatbed;
  let nationalRoute1, nationalRoute2;

  beforeEach(async () => {
    // Clean collections
    await User.deleteMany({});
    await BusinessProfile.deleteMany({});
    await Location.deleteMany({});
    await VehicleType.deleteMany({});
    await TransportVehicle.deleteMany({});
    await TransportRoute.deleteMany({});
    await FreightRate.deleteMany({});
    await Inquiry.deleteMany({});
    await QuoteRequest.deleteMany({});
    await QuoteResponse.deleteMany({});
    await BusinessFavorite.deleteMany({});

    // 1. Create Users
    adminUser = await User.create({
      name: 'Admin User',
      mobile: '9800000001',
      email: 'admin@stonemarket.com',
      role: 'admin',
      status: 'active'
    });
    adminToken = generateToken(adminUser);

    nationalProviderUser = await User.create({
      name: 'National Logistics Director',
      mobile: '9800000002',
      email: 'national@logistics.com',
      role: 'transport_national',
      status: 'active'
    });
    nationalProviderToken = generateToken(nationalProviderUser);

    localProviderUser = await User.create({
      name: 'Local Vehicle Owner',
      mobile: '9800000003',
      email: 'local@trucking.com',
      role: 'transport_local',
      status: 'active'
    });
    localProviderToken = generateToken(localProviderUser);

    buyerUser = await User.create({
      name: 'Stone Buyer',
      mobile: '9800000004',
      email: 'buyer@builders.com',
      role: 'buyer',
      status: 'active'
    });
    buyerToken = generateToken(buyerUser);

    competitorProviderUser = await User.create({
      name: 'Competitor Transporter',
      mobile: '9800000005',
      email: 'competitor@transport.com',
      role: 'transport_national',
      status: 'active'
    });
    competitorToken = generateToken(competitorProviderUser);

    // 2. Create Locations
    stateRaj = await Location.create({
      name: 'Rajasthan',
      districts: [
        { name: 'Jaipur', areas: [{ name: 'Mansarovar', pincode: '302020' }, { name: 'Sitapura', pincode: '302022' }] },
        { name: 'Kishangarh', areas: [{ name: 'Madanganj', pincode: '305801' }] }
      ]
    });
    cityJaipur = stateRaj.districts[0];
    cityKishangarh = stateRaj.districts[1];

    stateDelhi = await Location.create({
      name: 'Delhi',
      districts: [
        { name: 'Central Delhi', areas: [{ name: 'Connaught Place', pincode: '110001' }] }
      ]
    });
    cityDelhi = stateDelhi.districts[0];

    stateGuj = await Location.create({
      name: 'Gujarat',
      districts: [
        { name: 'Ahmedabad', areas: [{ name: 'SG Highway', pincode: '380054' }] }
      ]
    });
    cityAhmedabad = stateGuj.districts[0];

    // 3. Create Vehicle Types
    vt10Wheeler = await VehicleType.create({
      name: '10-Wheeler Truck',
      slug: '10-wheeler-truck',
      configuration: '10 Wheeler',
      default_payload_capacity: 21,
      is_active: true
    });

    vt12Wheeler = await VehicleType.create({
      name: '12-Wheeler Truck',
      slug: '12-wheeler-truck',
      configuration: '12 Wheeler',
      default_payload_capacity: 25,
      is_active: true
    });

    vtFlatbed = await VehicleType.create({
      name: 'Flatbed Multi-axle Trailer',
      slug: 'flatbed-trailer',
      configuration: 'Multi-axle Trailer',
      default_payload_capacity: 40,
      is_active: true
    });

    // 4. Create Business Profiles
    nationalProviderProfile = await BusinessProfile.create({
      userId: nationalProviderUser._id,
      business_type: 'transport_national',
      transport_category: 'national',
      company_name: 'Apex Bharat Heavy Logistics',
      company_details: 'Specialized heavy granite slab & block transportation across India.',
      fleet_summary: 'Fleet of 35+ 10-wheeler and 12-wheeler multi-axle trailers',
      has_all_india_permit: true,
      has_national_coverage: true,
      address: {
        state: 'Rajasthan',
        district: 'Jaipur',
        area: 'Sitapura',
        full_address: 'Plot 45, Transport Nagar, Sitapura, Jaipur, Rajasthan',
        latitude: 26.9124,
        longitude: 75.7873
      },
      owners: [{
        name: 'Rajesh Sharma',
        designation: 'Managing Director',
        phone: '9829011111',
        whatsapp: '9829011111',
        is_primary: true
      }],
      gst_number: '08AAACA1234A1Z5',
      is_verified: true,
      verification_status: 'approved',
      status: 'active',
      rating: 4.8,
      review_count: 32
    });

    localProviderProfile = await BusinessProfile.create({
      userId: localProviderUser._id,
      business_type: 'transport_local',
      transport_category: 'local',
      company_name: 'Jaipur City Stone Express',
      company_details: 'Intra-city marble and granite tile transport.',
      fleet_summary: '10-wheeler and tempo transport for local stone markets',
      has_all_india_permit: false,
      has_national_coverage: false,
      address: {
        state: 'Rajasthan',
        district: 'Jaipur',
        area: 'Mansarovar',
        full_address: 'Shop 12, Stone Mandi, Mansarovar, Jaipur',
        latitude: 26.8500, // ~8 km from 26.9124
        longitude: 75.7600
      },
      owners: [{
        name: 'Manoj Kumar',
        designation: 'Owner & Operator',
        phone: '9829022222',
        whatsapp: '9829022222',
        is_primary: true
      }],
      gst_number: '08AAACM9876M1Z1',
      is_verified: true,
      verification_status: 'approved',
      status: 'active',
      rating: 4.6,
      review_count: 15
    });

    competitorProfile = await BusinessProfile.create({
      userId: competitorProviderUser._id,
      business_type: 'transport_national',
      transport_category: 'national',
      company_name: 'FastTrack Cargo Movers',
      company_details: 'Container freight logistics',
      address: {
        state: 'Delhi',
        district: 'Central Delhi',
        area: 'Connaught Place',
        full_address: 'Connaught Place, Delhi'
      },
      is_verified: false,
      verification_status: 'pending',
      status: 'active'
    });

    // 5. Create Vehicles
    await TransportVehicle.create({
      providerId: nationalProviderProfile._id,
      vehicleTypeId: vt10Wheeler._id,
      driver_name: 'Harish Singh',
      driver_phone: '9829033333',
      registration_number: 'RJ14GB1001',
      payload_capacity: 21,
      capacity_unit: 'tons',
      permit_type: 'all_india',
      availability_status: 'available_now',
      service_type: 'national',
      city_name: 'Jaipur',
      state_name: 'Rajasthan',
      location: { type: 'Point', coordinates: [75.7873, 26.9124] },
      is_active: true
    });

    await TransportVehicle.create({
      providerId: localProviderProfile._id,
      vehicleTypeId: vt10Wheeler._id,
      driver_name: 'Suresh Gurjar',
      driver_phone: '9829044444',
      registration_number: 'RJ14GB2002',
      payload_capacity: 15,
      capacity_unit: 'tons',
      permit_type: 'local_only',
      availability_status: 'available_now',
      service_type: 'local',
      city_name: 'Jaipur',
      state_name: 'Rajasthan',
      location: { type: 'Point', coordinates: [75.7600, 26.8500] },
      is_active: true
    });

    // 6. Create Routes
    nationalRoute1 = await TransportRoute.create({
      providerId: nationalProviderProfile._id,
      origin_city_id: cityJaipur._id,
      origin_city_name: 'Jaipur',
      origin_state_name: 'Rajasthan',
      destination_city_id: cityDelhi._id,
      destination_city_name: 'Central Delhi',
      destination_state_name: 'Delhi',
      route_type: 'direct_only',
      directionality: 'bidirectional',
      direct_route_only: true,
      estimated_transit_days: 1,
      default_freight_rate: 1100,
      rate_unit: 'INR per ton',
      is_active: true
    });

    nationalRoute2 = await TransportRoute.create({
      providerId: nationalProviderProfile._id,
      origin_city_id: cityJaipur._id,
      origin_city_name: 'Jaipur',
      origin_state_name: 'Rajasthan',
      destination_city_id: cityAhmedabad._id,
      destination_city_name: 'Ahmedabad',
      destination_state_name: 'Gujarat',
      route_type: 'regular',
      directionality: 'one_way',
      direct_route_only: false,
      estimated_transit_days: 2,
      default_freight_rate: 1450,
      rate_unit: 'INR per ton',
      is_active: true
    });

    // 7. Create Freight Rate
    await FreightRate.create({
      providerId: nationalProviderProfile._id,
      vehicleTypeId: vt10Wheeler._id,
      routeId: nationalRoute1._id,
      origin_city_name: 'Jaipur',
      destination_city_name: 'Central Delhi',
      pricing_model: 'per_ton',
      amount: 1100,
      currency: 'INR',
      unit: 'INR per ton',
      status: 'active'
    });
  });

  // ==========================================
  // TEST SUITE 1: NATIONAL TRANSPORT DISCOVERY
  // ==========================================
  describe('1. National Transport Discovery', () => {
    it('GET /api/v1/transports/national returns verified national transporters', async () => {
      const res = await request(app).get('/api/v1/transports/national?verified=true');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);

      const first = res.body.data[0];
      expect(first.company_name).toBe('Apex Bharat Heavy Logistics');
      expect(first.is_verified).toBe(true);
      expect(first.contact_actions.phone).toBe('9829011111');
      expect(first.contact_actions.whatsapp_url).toContain('https://wa.me/919829011111');
    });

    it('GET /api/v1/transports/national filters by keyword search', async () => {
      const res = await request(app).get('/api/v1/transports/national?search=Apex');
      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].company_name).toContain('Apex');
    });

    it('GET /api/v1/transports/national filters by all_india permit type', async () => {
      const res = await request(app).get('/api/v1/transports/national?permit_type=all_india');
      expect(res.statusCode).toBe(200);
      expect(res.body.data.every(p => p.has_all_india_permit === true)).toBe(true);
    });
  });

  // ==========================================
  // TEST SUITE 2: AREA WISE & DESTINATIONS
  // ==========================================
  describe('2. Area Wise & Destination Discovery Flow', () => {
    it('GET /api/v1/locations/states?transport_type=national returns states with provider counts', async () => {
      const res = await request(app).get('/api/v1/locations/states?transport_type=national');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      const rajState = res.body.data.find(s => s.name === 'Rajasthan');
      expect(rajState).toBeDefined();
      expect(rajState.provider_count).toBeGreaterThanOrEqual(1);
    });

    it('GET /api/v1/locations/cities?state_id=...&transport_type=national returns cities', async () => {
      const res = await request(app).get(`/api/v1/locations/cities?state_id=${stateRaj._id}&transport_type=national`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      const jaipurCity = res.body.data.find(c => c.name === 'Jaipur');
      expect(jaipurCity).toBeDefined();
    });

    it('GET /api/v1/transports/national/destinations returns reachable destinations from origin', async () => {
      const res = await request(app).get(`/api/v1/transports/national/destinations?origin_city_id=${cityJaipur._id}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(2); // Delhi and Ahmedabad
      const destNames = res.body.data.map(d => d.city_name);
      expect(destNames).toContain('Central Delhi');
      expect(destNames).toContain('Ahmedabad');
    });

    it('GET /api/v1/transports/national/routes respects route directionality', async () => {
      // Jaipur -> Ahmedabad (one_way) should return route
      const forwardRes = await request(app).get(`/api/v1/transports/national/routes?origin_city_id=${cityJaipur._id}&destination_city_id=${cityAhmedabad._id}`);
      expect(forwardRes.statusCode).toBe(200);
      expect(forwardRes.body.data.length).toBe(1);

      // Reverse direction: Ahmedabad -> Jaipur should NOT return the one_way route
      const reverseRes = await request(app).get(`/api/v1/transports/national/routes?origin_city_id=${cityAhmedabad._id}&destination_city_id=${cityJaipur._id}`);
      expect(reverseRes.statusCode).toBe(200);
      expect(reverseRes.body.data.length).toBe(0);
    });

    it('GET /api/v1/transports/national/routes/:id returns route details', async () => {
      const res = await request(app).get(`/api/v1/transports/national/routes/${nationalRoute1._id}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data.freight_rate).toBe(1100);
      expect(res.body.data.direct_route_only).toBe(true);
    });
  });

  // ==========================================
  // TEST SUITE 3: LOCAL TRANSPORT NEARBY
  // ==========================================
  describe('3. Local Transport Discovery', () => {
    it('GET /api/v1/transports/local/nearby finds vehicles within radius and calculates distance', async () => {
      // Searching near Jaipur center: 26.9124, 75.7873 with 15 km radius
      const res = await request(app).get('/api/v1/transports/local/nearby?latitude=26.9124&longitude=75.7873&radius_km=15');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);

      const vehicle = res.body.data[0];
      expect(vehicle.driver_name).toBe('Suresh Gurjar');
      expect(vehicle.distance_km).toBeDefined();
      expect(vehicle.distance_km).toBeLessThanOrEqual(15);
      // Privacy check: registration number masked
      expect(vehicle.registration_number_masked).toContain('****');
    });

    it('GET /api/v1/transports/local/nearby excludes vehicles beyond radius', async () => {
      // Searching with very small radius 1 km from 26.9124, 75.7873 (local vehicle is ~8 km away)
      const res = await request(app).get('/api/v1/transports/local/nearby?latitude=26.9124&longitude=75.7873&radius_km=1');
      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBe(0);
    });

    it('GET /api/v1/transports/local/vehicles/:id returns vehicle details', async () => {
      const localVehicle = await TransportVehicle.findOne({ service_type: 'local' });
      const res = await request(app).get(`/api/v1/transports/local/vehicles/${localVehicle._id}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data.driver_name).toBe('Suresh Gurjar');
    });
  });

  // ==========================================
  // TEST SUITE 4: PROVIDER PROFILE & RATES
  // ==========================================
  describe('4. Transport Provider Profile', () => {
    it('GET /api/v1/transport-providers/:id returns structured profile and masks private GSTIN for public', async () => {
      const res = await request(app).get(`/api/v1/transport-providers/${nationalProviderProfile._id}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data.company.name).toBe('Apex Bharat Heavy Logistics');
      expect(res.body.data.contacts.length).toBe(1);
      expect(res.body.data.fleet.length).toBe(1);
      expect(res.body.data.freight_rates.length).toBe(1);

      // Masked GSTIN for public
      expect(res.body.data.business_details.gstin).toContain('XXXX');
    });

    it('GET /api/v1/transport-providers/:id exposes unmasked GSTIN when requested by owner', async () => {
      const res = await request(app)
        .get(`/api/v1/transport-providers/${nationalProviderProfile._id}`)
        .set('Authorization', `Bearer ${nationalProviderToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data.business_details.gstin).toBe('08AAACA1234A1Z5');
    });

    it('GET /api/v1/transport-providers/:id/freight-rates returns active freight table', async () => {
      const res = await request(app).get(`/api/v1/transport-providers/${nationalProviderProfile._id}/freight-rates`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].amount).toBe(1100);
      expect(res.body.data[0].unit).toBe('INR per ton');
    });
  });

  // ==========================================
  // TEST SUITE 5: INQUIRIES WORKFLOW
  // ==========================================
  describe('5. Transport Inquiries Workflow', () => {
    it('POST /api/v1/transport-inquiries submits inquiry and generates unique reference number', async () => {
      const res = await request(app)
        .post('/api/v1/transport-inquiries')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          provider_id: nationalProviderProfile._id,
          full_name: 'Ramesh Patel',
          phone: '9829055555',
          email: 'ramesh@buildcon.com',
          city: 'Jaipur',
          origin_location: 'Jaipur Quarry Hub',
          destination_location: 'Delhi NCR Site',
          transport_type: 'national',
          vehicle_type: '10-Wheeler Truck',
          vehicle_quantity: 2,
          cargo_type: 'Granite Gangsaw Slabs',
          cargo_weight: 42,
          quantity_unit: 'tons',
          additional_notes: 'Urgent transit required with safety lashing'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.reference_number).toContain('TR-INQ-');
      expect(res.body.data.status).toBe('submitted');
    });

    it('GET /api/v1/transport-inquiries lists buyer inquiries', async () => {
      // Create sample inquiry
      await request(app)
        .post('/api/v1/transport-inquiries')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          provider_id: nationalProviderProfile._id,
          full_name: 'Buyer Ramesh',
          phone: '9829055555',
          origin_location: 'Jaipur',
          destination_location: 'Delhi'
        });

      const res = await request(app)
        .get('/api/v1/transport-inquiries')
        .set('Authorization', `Bearer ${buyerToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ==========================================
  // TEST SUITE 6: QUOTATIONS & CONFIDENTIALITY
  // ==========================================
  describe('6. Transport Quotation Workflow & Confidentiality', () => {
    let quoteRequestId;

    it('POST /api/v1/transport-quote-requests creates single or multi-provider quote request', async () => {
      const res = await request(app)
        .post('/api/v1/transport-quote-requests')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          provider_ids: [nationalProviderProfile._id, competitorProfile._id],
          pickup_location: 'Jaipur Mandi',
          destination_location: 'Delhi Metro Depot',
          cargo_type: 'Sandstone Blocks',
          cargo_weight: 80,
          quantity_unit: 'tons',
          required_vehicle_type: '12-Wheeler Truck',
          vehicle_quantity: 3,
          budget: 90000,
          additional_notes: 'Loading crane available at origin'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.dispatched_count).toBe(2);
      expect(res.body.data.quotes.length).toBe(2);
      quoteRequestId = res.body.data.quotes[0]._id;
    });

    it('POST /api/v1/transport-quote-requests/:id/quotes allows assigned provider to respond', async () => {
      // 1. Create quote request
      const createRes = await request(app)
        .post('/api/v1/transport-quote-requests')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          provider_id: nationalProviderProfile._id,
          pickup_location: 'Jaipur',
          destination_location: 'Delhi',
          cargo_weight: 25
        });
      const qId = createRes.body.data.id;

      // 2. National provider submits quotation
      const quoteRes = await request(app)
        .post(`/api/v1/transport-quote-requests/${qId}/quotes`)
        .set('Authorization', `Bearer ${nationalProviderToken}`)
        .send({
          amount: 1050,
          pricing_unit: 'INR per ton',
          offered_capacity: 25,
          vehicle_type: '12-Wheeler Truck',
          estimated_total: 26250,
          pickup_estimate: new Date(),
          terms: '50% advance, balance against unloading'
        });

      expect(quoteRes.statusCode).toBe(201);
      expect(quoteRes.body.data.offered_price).toBe(1050);

      // 3. Confidentiality Isolation: Competitor should NOT see National Provider's quote
      const competitorViewRes = await request(app)
        .get(`/api/v1/transport-quote-requests/${qId}/quotes`)
        .set('Authorization', `Bearer ${competitorToken}`);

      expect(competitorViewRes.statusCode).toBe(200);
      expect(competitorViewRes.body.data.length).toBe(0); // Competitor sees empty array

      // 4. Buyer sees the quotation
      const buyerViewRes = await request(app)
        .get(`/api/v1/transport-quote-requests/${qId}/quotes`)
        .set('Authorization', `Bearer ${buyerToken}`);

      expect(buyerViewRes.statusCode).toBe(200);
      expect(buyerViewRes.body.data.length).toBe(1);
      expect(buyerViewRes.body.data[0].offered_price).toBe(1050);

      // 5. Buyer accepts the quotation
      const quoteResponseId = buyerViewRes.body.data[0]._id;
      const acceptRes = await request(app)
        .post(`/api/v1/transport-quotes/${quoteResponseId}/accept`)
        .set('Authorization', `Bearer ${buyerToken}`);

      expect(acceptRes.statusCode).toBe(200);
      expect(acceptRes.body.data.status).toBe('accepted');
    });
  });

  // ==========================================
  // TEST SUITE 7: FAVORITES
  // ==========================================
  describe('7. Favorites / Saved Transporters', () => {
    it('POST /api/v1/favorites/transports/:id saves and DELETE removes favorite', async () => {
      // 1. Add favorite
      const addRes = await request(app)
        .post(`/api/v1/favorites/transports/${nationalProviderProfile._id}`)
        .set('Authorization', `Bearer ${buyerToken}`);
      expect(addRes.statusCode).toBe(201);

      // 2. Get favorites
      const getRes = await request(app)
        .get('/api/v1/favorites/transports')
        .set('Authorization', `Bearer ${buyerToken}`);
      expect(getRes.statusCode).toBe(200);
      expect(getRes.body.data.length).toBe(1);
      expect(getRes.body.data[0].provider.name).toBe('Apex Bharat Heavy Logistics');

      // 3. Remove favorite
      const deleteRes = await request(app)
        .delete(`/api/v1/favorites/transports/${nationalProviderProfile._id}`)
        .set('Authorization', `Bearer ${buyerToken}`);
      expect(deleteRes.statusCode).toBe(200);
    });
  });

  // ==========================================
  // TEST SUITE 8: PROVIDER DASHBOARD CRUD
  // ==========================================
  describe('8. Provider Dashboard CRUD APIs', () => {
    it('Provider can add vehicle to fleet and toggle availability', async () => {
      // Add vehicle
      const addRes = await request(app)
        .post('/api/v1/provider/transport/vehicles')
        .set('Authorization', `Bearer ${nationalProviderToken}`)
        .send({
          vehicleTypeId: vt12Wheeler._id,
          driver_name: 'Dinesh Kumar',
          driver_phone: '9829066666',
          registration_number: 'RJ14GC3003',
          payload_capacity: 28,
          capacity_unit: 'tons',
          permit_type: 'all_india'
        });

      expect(addRes.statusCode).toBe(201);
      const vehicleId = addRes.body.data._id;

      // Update availability status
      const patchRes = await request(app)
        .patch(`/api/v1/provider/transport/vehicles/${vehicleId}/availability`)
        .set('Authorization', `Bearer ${nationalProviderToken}`)
        .send({
          availability_status: 'available_soon',
          expected_available_time: 'Available in 45 mins'
        });

      expect(patchRes.statusCode).toBe(200);
      expect(patchRes.body.data.availability_status).toBe('available_soon');
      expect(patchRes.body.data.expected_available_time).toBe('Available in 45 mins');
    });

    it('Provider can add new transport route and manage freight rate', async () => {
      // Add route
      const routeRes = await request(app)
        .post('/api/v1/provider/transport/routes')
        .set('Authorization', `Bearer ${nationalProviderToken}`)
        .send({
          origin_city_id: cityJaipur._id,
          origin_city_name: 'Jaipur',
          origin_state_name: 'Rajasthan',
          destination_city_id: cityDelhi._id,
          destination_city_name: 'Central Delhi',
          destination_state_name: 'Delhi',
          default_freight_rate: 1150
        });

      expect(routeRes.statusCode).toBe(201);
      const routeId = routeRes.body.data._id;

      // Add freight rate
      const rateRes = await request(app)
        .post('/api/v1/provider/freight-rates')
        .set('Authorization', `Bearer ${nationalProviderToken}`)
        .send({
          routeId,
          amount: 1150,
          pricing_model: 'per_ton',
          unit: 'INR per ton'
        });

      expect(rateRes.statusCode).toBe(201);
      expect(rateRes.body.data.amount).toBe(1150);
    });
  });

  // ==========================================
  // TEST SUITE 9: ADMIN MANAGEMENT & ANALYTICS
  // ==========================================
  describe('9. Admin Management, Verification & Analytics', () => {
    it('Admin can approve or reject provider verification and view analytics', async () => {
      // Verify provider
      const verifyRes = await request(app)
        .patch(`/api/v1/admin/transport/providers/${competitorProfile._id}/verification`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'approved' });

      expect(verifyRes.statusCode).toBe(200);
      expect(verifyRes.body.data.is_verified).toBe(true);
      expect(verifyRes.body.data.verification_status).toBe('approved');

      // Analytics
      const analyticsRes = await request(app)
        .get('/api/v1/admin/transport/analytics')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(analyticsRes.statusCode).toBe(200);
      expect(analyticsRes.body.data.total_providers).toBeGreaterThanOrEqual(2);
      expect(analyticsRes.body.data.verified_providers).toBeGreaterThanOrEqual(2);
    });

    it('Admin can create new vehicle type configuration', async () => {
      const createRes = await request(app)
        .post('/api/v1/admin/transport/vehicle-types')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Heavy Duty 18-Wheeler Trailer',
          configuration: '18 Wheeler',
          default_payload_capacity: 45
        });

      expect(createRes.statusCode).toBe(201);
      expect(createRes.body.data.slug).toBe('heavy-duty-18-wheeler-trailer');
    });
  });
});
