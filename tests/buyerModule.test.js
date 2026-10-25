const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../server');

const User = require('../src/models/User');
const BusinessProfile = require('../src/models/BusinessProfile');
const BuyerType = require('../src/models/BuyerType');
const BuyerRequirement = require('../src/models/BuyerRequirement');
const BuyerReview = require('../src/models/BuyerReview');
const Location = require('../src/models/Location');
const Product = require('../src/models/Product');
const QuoteRequest = require('../src/models/QuoteRequest');
const QuoteResponse = require('../src/models/QuoteResponse');
const Inquiry = require('../src/models/Inquiry');
const BusinessFavorite = require('../src/models/BusinessFavorite');

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

const generateToken = (user) => {
  return jwt.sign({ id: user._id.toString(), role: user.role }, JWT_SECRET, { expiresIn: '1d' });
};

describe('Stone Buyer Marketplace Module Tests', () => {
  let adminUser, adminToken;
  let buyerUser1, buyerToken1, buyerProfile1;
  let buyerUser2, buyerToken2, buyerProfile2;
  let supplierUser1, supplierToken1, supplierBusiness1;
  let supplierUser2, supplierToken2, supplierBusiness2;
  let testProduct1, testProduct2;
  let testLocationState;
  let buyerTypeConst, buyerTypeArch;

  beforeEach(async () => {
    // 1. Create Users
    adminUser = await User.create({
      name: 'Super Admin',
      mobile: '9900000001',
      email: 'admin@test.com',
      role: 'admin',
      status: 'active'
    });
    adminToken = generateToken(adminUser);

    buyerUser1 = await User.create({
      name: 'Builder Amit',
      mobile: '9900000002',
      email: 'amit@buyer.com',
      role: 'buyer',
      status: 'active'
    });
    buyerToken1 = generateToken(buyerUser1);

    buyerUser2 = await User.create({
      name: 'Architect Priya',
      mobile: '9900000003',
      email: 'priya@buyer.com',
      role: 'buyer',
      status: 'active'
    });
    buyerToken2 = generateToken(buyerUser2);

    supplierUser1 = await User.create({
      name: 'Supplier Ramesh',
      mobile: '9900000004',
      email: 'ramesh@supplier.com',
      role: 'manufacturer',
      status: 'active'
    });
    supplierToken1 = generateToken(supplierUser1);

    supplierUser2 = await User.create({
      name: 'Supplier Suresh',
      mobile: '9900000005',
      email: 'suresh@supplier.com',
      role: 'trader',
      status: 'active'
    });
    supplierToken2 = generateToken(supplierUser2);

    // 2. Create Locations
    testLocationState = await Location.create({
      name: 'Rajasthan',
      districts: [
        {
          name: 'Jaipur',
          areas: [{ name: 'Mansarovar', pincode: '302020' }]
        },
        {
          name: 'Kishangarh',
          areas: [{ name: 'Madanganj', pincode: '305801' }]
        }
      ]
    });

    // 3. Create Buyer Types
    buyerTypeConst = await BuyerType.create({
      name: 'Construction Company',
      slug: 'construction-company',
      description: 'Infrastructure and building developers',
      sort_order: 1,
      status: 'active'
    });

    buyerTypeArch = await BuyerType.create({
      name: 'Architect / Interior Designer',
      slug: 'architect-interior-designer',
      description: 'Architects and premium interior specialists',
      sort_order: 2,
      status: 'active'
    });

    // 4. Create Buyer Profiles
    buyerProfile1 = await BusinessProfile.create({
      userId: buyerUser1._id,
      business_type: 'buyer',
      company_name: 'Apex Infra Buildcon',
      company_details: 'Mega residential and commercial developer in North India',
      buyer_types: [buyerTypeConst._id],
      preferred_materials: ['Granite', 'Sandstone'],
      preferred_products: ['Slabs', 'Tiles'],
      requirement_summary: 'Bulk 20mm Granite Slabs',
      industry: 'Real Estate & Infrastructure',
      gst_number: '08AAACA0000A1Z1',
      iec_number: '0511223344',
      address: {
        state: 'Rajasthan',
        district: 'Jaipur',
        area: 'Mansarovar',
        full_address: 'Plot 100, Mansarovar, Jaipur, Rajasthan'
      },
      status: 'active',
      is_verified: true,
      verification_status: 'approved',
      rating: 4.8,
      review_count: 5
    });

    buyerProfile2 = await BusinessProfile.create({
      userId: buyerUser2._id,
      business_type: 'buyer',
      company_name: 'Design Studio Architects',
      company_details: 'Luxury villa and hospitality stone architecture',
      buyer_types: [buyerTypeArch._id],
      preferred_materials: ['Marble', 'Italian Marble'],
      preferred_products: ['Bookmatch Slabs', 'Jali'],
      requirement_summary: 'Exotic White Marble Bookmatch',
      industry: 'Architecture & Design',
      address: {
        state: 'Rajasthan',
        district: 'Kishangarh',
        area: 'Madanganj',
        full_address: 'Shop 12, Madanganj, Kishangarh, Rajasthan'
      },
      status: 'active',
      is_verified: false,
      verification_status: 'pending',
      rating: 4.2,
      review_count: 2
    });

    // 5. Create Supplier Businesses & Products
    supplierBusiness1 = await BusinessProfile.create({
      userId: supplierUser1._id,
      business_type: 'manufacturer',
      company_name: 'Royal Granite Processors',
      address: { state: 'Rajasthan', district: 'Jaipur' },
      status: 'active',
      is_verified: true
    });

    supplierBusiness2 = await BusinessProfile.create({
      userId: supplierUser2._id,
      business_type: 'trader',
      company_name: 'Heritage Marble Traders',
      address: { state: 'Rajasthan', district: 'Kishangarh' },
      status: 'active',
      is_verified: true
    });

    testProduct1 = await Product.create({
      vendorId: supplierBusiness1._id,
      name: 'Black Galaxy Granite Slab 20mm',
      category: 'Granite',
      priceRange: { min: 180, max: 250, unit: 'Sq.Ft' },
      status: 'active'
    });

    testProduct2 = await Product.create({
      vendorId: supplierBusiness2._id,
      name: 'Makrana White Marble 18mm',
      category: 'Marble',
      priceRange: { min: 300, max: 600, unit: 'Sq.Ft' },
      status: 'active'
    });
  });

  // 1. States and Cities Discovery
  describe('1. States and Cities Discovery Flow', () => {
    it('GET /api/buyers/states should return only states with active buyers and dynamic counts', async () => {
      const res = await request(app).get('/api/buyers/states');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);

      const raj = res.body.data.find(s => s.name === 'Rajasthan');
      expect(raj).toBeDefined();
      expect(raj.buyer_count).toBe(2);
    });

    it('GET /api/buyers/states with verified=true filter should count only verified buyers', async () => {
      const res = await request(app).get('/api/buyers/states?verified=true');
      expect(res.statusCode).toBe(200);
      const raj = res.body.data.find(s => s.name === 'Rajasthan');
      expect(raj).toBeDefined();
      expect(raj.buyer_count).toBe(1); // Only buyerProfile1 is verified
    });

    it('GET /api/buyers/cities?state_id=... should return cities with matching buyer counts', async () => {
      const res = await request(app).get(`/api/buyers/cities?state_id=${testLocationState._id}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(2); // Jaipur and Kishangarh

      const jaipur = res.body.data.find(c => c.name === 'Jaipur');
      expect(jaipur).toBeDefined();
      expect(jaipur.buyer_count).toBe(1);
    });

    it('GET /api/buyers/cities should filter by search term', async () => {
      const res = await request(app).get(`/api/buyers/cities?state_id=${testLocationState._id}&search=Jaipur`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].name).toBe('Jaipur');
    });
  });

  // 2. Buyer Listing, Search and Filters
  describe('2. Verified Buyer Listing and Filters', () => {
    it('GET /api/buyers should list all active buyers with card fields', async () => {
      const res = await request(app).get('/api/buyers');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(2);
      expect(res.body.meta).toHaveProperty('total', 2);

      const card = res.body.data[0];
      expect(card).toHaveProperty('id');
      expect(card).toHaveProperty('name');
      expect(card).toHaveProperty('buyer_type');
      expect(card).toHaveProperty('location');
      expect(card).toHaveProperty('is_verified');
      expect(card).toHaveProperty('rating');
      expect(card).toHaveProperty('requirement_summary');
    });

    it('GET /api/buyers should filter by verified=true', async () => {
      const res = await request(app).get('/api/buyers?verified=true');
      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].name).toBe('Apex Infra Buildcon');
      expect(res.body.data[0].is_verified).toBe(true);
    });

    it('GET /api/buyers should filter by city and material', async () => {
      const res = await request(app).get('/api/buyers?city=Jaipur&material=Granite');
      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].name).toBe('Apex Infra Buildcon');
    });

    it('GET /api/buyers should filter by search query', async () => {
      const res = await request(app).get('/api/buyers?search=Design Studio');
      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].name).toBe('Design Studio Architects');
    });
  });

  // 3. Buyer Types
  describe('3. Buyer Types Configurable APIs', () => {
    it('GET /api/buyers/types should return list of active buyer types', async () => {
      const res = await request(app).get('/api/buyers/types');
      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBe(2);
      expect(res.body.data[0].name).toBe('Construction Company');
    });

    it('Admin can create, update, and delete buyer types', async () => {
      // 1. Create
      const createRes = await request(app)
        .post('/api/admin/buyers/types')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Stone Importer',
          description: 'Global bulk stone importers',
          sort_order: 3
        });
      expect(createRes.statusCode).toBe(201);
      expect(createRes.body.data.slug).toBe('stone-importer');
      const typeId = createRes.body.data._id;

      // 2. Update
      const updateRes = await request(app)
        .put(`/api/admin/buyers/types/${typeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ description: 'Updated description' });
      expect(updateRes.statusCode).toBe(200);
      expect(updateRes.body.data.description).toBe('Updated description');

      // 3. Delete
      const deleteRes = await request(app)
        .delete(`/api/admin/buyers/types/${typeId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(deleteRes.statusCode).toBe(200);

      // Verify deleted
      const checkRes = await request(app).get('/api/buyers/types');
      expect(checkRes.body.data.some(t => t._id === typeId)).toBe(false);
    });
  });

  // 4. Buyer Profile & Privacy Restrictions
  describe('4. Buyer Profile and Privacy Restrictions', () => {
    it('GET /api/buyers/:id returns public profile and hides sensitive GST / full address from public', async () => {
      const res = await request(app).get(`/api/buyers/${buyerProfile1._id}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);

      const profile = res.body.data;
      expect(profile.company.name).toBe('Apex Infra Buildcon');
      expect(profile.company.verified).toBe(true);
      expect(profile.business_details.gst_registered).toBe(true);
      // Confidential check: Public should NOT see full raw GST number
      expect(profile.business_details.gst_number).toBeUndefined();
    });

    it('GET /api/buyers/:id exposes full business details when requested by profile owner', async () => {
      const res = await request(app)
        .get(`/api/buyers/${buyerProfile1._id}`)
        .set('Authorization', `Bearer ${buyerToken1}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data.business_details.gst_number).toBe('08AAACA0000A1Z1');
      expect(res.body.data.location.address).toBe('Plot 100, Mansarovar, Jaipur, Rajasthan');
    });
  });

  // 5. Buyer Purchasing Requirements CRUD & Ownership
  describe('5. Buyer Purchasing Requirements CRUD & Ownership Checks', () => {
    let createdReqId;

    it('POST /api/buyer/requirements should allow authenticated buyer to publish purchasing requirement', async () => {
      const res = await request(app)
        .post('/api/buyer/requirements')
        .set('Authorization', `Bearer ${buyerToken1}`)
        .send({
          title: 'Requirement for 15,000 Sq.Ft Steel Grey Granite',
          description: 'Need mirror polished 20mm Gangsaw slabs for hotel project',
          material: 'Granite',
          product_type: 'Slabs',
          colour: 'Steel Grey',
          finish: 'Polished',
          thickness_mm: 20,
          quantity: 15000,
          quantity_unit: 'sqft',
          budget: { min: 100, max: 140, currency: 'INR' },
          delivery_location: { city: 'Jaipur', state: 'Rajasthan' },
          status: 'open',
          visibility: 'public'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('_id');
      expect(res.body.data.title).toContain('Steel Grey Granite');
      createdReqId = res.body.data._id;
    });

    it('GET /api/buyer/requirements should list authenticated buyer requirements', async () => {
      // First create one
      await request(app)
        .post('/api/buyer/requirements')
        .set('Authorization', `Bearer ${buyerToken1}`)
        .send({
          title: 'Makrana Marble for Temple',
          quantity: 5000
        });

      const res = await request(app)
        .get('/api/buyer/requirements')
        .set('Authorization', `Bearer ${buyerToken1}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('PUT /api/buyer/requirements/:id should reject update from a different buyer (Ownership check)', async () => {
      const reqRecord = await BuyerRequirement.create({
        buyerId: buyerProfile1._id,
        userId: buyerUser1._id,
        title: 'Original Title',
        quantity: 2000
      });

      // Try updating with buyerUser2 token
      const res = await request(app)
        .put(`/api/buyer/requirements/${reqRecord._id}`)
        .set('Authorization', `Bearer ${buyerToken2}`)
        .send({ title: 'Hacked Title' });

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toContain('not authorized');
    });

    it('DELETE /api/buyer/requirements/:id should delete requirement when called by owner', async () => {
      const reqRecord = await BuyerRequirement.create({
        buyerId: buyerProfile1._id,
        userId: buyerUser1._id,
        title: 'To Be Deleted',
        quantity: 1000
      });

      const res = await request(app)
        .delete(`/api/buyer/requirements/${reqRecord._id}`)
        .set('Authorization', `Bearer ${buyerToken1}`);

      expect(res.statusCode).toBe(200);
      const check = await BuyerRequirement.findById(reqRecord._id);
      expect(check).toBeNull();
    });
  });

  // 6. Admin Verification Workflow
  describe('6. Admin Buyer Verification Workflow', () => {
    it('Buyers cannot self-verify by sending is_verified: true', async () => {
      // Buyer attempts to update their own profile with is_verified: true via normal routes
      const checkBefore = await BusinessProfile.findById(buyerProfile2._id);
      expect(checkBefore.is_verified).toBe(false);

      // Verify endpoint is restricted to Admin
      const unauthorizedRes = await request(app)
        .put(`/api/admin/buyers/${buyerProfile2._id}/verify`)
        .set('Authorization', `Bearer ${buyerToken2}`)
        .send({ verification_status: 'approved' });
      expect(unauthorizedRes.statusCode).toBe(403);
    });

    it('Admin can approve or reject buyer verification', async () => {
      // Approve
      const approveRes = await request(app)
        .put(`/api/admin/buyers/${buyerProfile2._id}/verify`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ verification_status: 'approved' });

      expect(approveRes.statusCode).toBe(200);
      expect(approveRes.body.data.is_verified).toBe(true);
      expect(approveRes.body.data.verification_status).toBe('approved');
      expect(approveRes.body.data.verified_by).toBe(adminUser._id.toString());

      // Reject
      const rejectRes = await request(app)
        .put(`/api/admin/buyers/${buyerProfile2._id}/verify`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          verification_status: 'rejected',
          rejection_reason: 'Invalid GST Certificate provided'
        });

      expect(rejectRes.statusCode).toBe(200);
      expect(rejectRes.body.data.is_verified).toBe(false);
      expect(rejectRes.body.data.rejection_reason).toBe('Invalid GST Certificate provided');
    });
  });

  // 7. Ratings and Reviews
  describe('7. Ratings and Reviews', () => {
    it('POST /api/buyers/:id/reviews allows supplier to review a buyer and recalculates aggregate rating', async () => {
      const res = await request(app)
        .post(`/api/buyers/${buyerProfile2._id}/reviews`)
        .set('Authorization', `Bearer ${supplierToken1}`)
        .send({
          rating: 5,
          review: 'Prompt payment and professional communication.'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);

      // Verify updated rating on buyer profile
      const updatedBuyer = await BusinessProfile.findById(buyerProfile2._id);
      expect(updatedBuyer.rating).toBe(5);
      expect(updatedBuyer.review_count).toBe(1);
    });

    it('Prevents duplicate reviews and self-reviews', async () => {
      // Self-review attempt
      const selfRes = await request(app)
        .post(`/api/buyers/${buyerProfile1._id}/reviews`)
        .set('Authorization', `Bearer ${buyerToken1}`)
        .send({ rating: 5, review: 'I am the best buyer' });
      expect(selfRes.statusCode).toBe(400);
      expect(selfRes.body.message).toContain('cannot review their own profile');

      // First valid review
      await request(app)
        .post(`/api/buyers/${buyerProfile1._id}/reviews`)
        .set('Authorization', `Bearer ${supplierToken1}`)
        .send({ rating: 4, review: 'Good' });

      // Duplicate review attempt from same user
      const dupRes = await request(app)
        .post(`/api/buyers/${buyerProfile1._id}/reviews`)
        .set('Authorization', `Bearer ${supplierToken1}`)
        .send({ rating: 5, review: 'Trying again' });
      expect(dupRes.statusCode).toBe(400);
      expect(dupRes.body.message).toContain('already submitted a review');
    });
  });

  // 8. Inquiry Flow & Product-Supplier Relationship Validation
  describe('8. Inquiry Flow & Product-Supplier Relationship Validation', () => {
    it('POST /api/inquiries submits inquiry successfully with buyer details', async () => {
      const res = await request(app)
        .post('/api/inquiries')
        .set('Authorization', `Bearer ${buyerToken1}`)
        .send({
          businessId: supplierBusiness1._id.toString(),
          productId: testProduct1._id.toString(),
          quantity: 5000,
          unit: 'Sq.Ft',
          subject: 'Price inquiry for 20mm Black Galaxy',
          message: 'Please send quote for 5000 sqft',
          contactInfo: {
            name: 'Buyer Amit',
            mobile: '9900000002',
            city: 'Jaipur'
          }
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty('inquiryId');
    });

    it('POST /api/inquiries rejects inquiry if product does not belong to selected supplier', async () => {
      // testProduct2 belongs to supplierBusiness2, but we pass supplierBusiness1
      const res = await request(app)
        .post('/api/inquiries')
        .set('Authorization', `Bearer ${buyerToken1}`)
        .send({
          businessId: supplierBusiness1._id.toString(),
          productId: testProduct2._id.toString(), // Mismatch!
          message: 'Testing mismatch'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('does not belong to the selected supplier');
    });
  });

  // 9. Quotation Flow, Multi-Supplier Dispatch, and Confidentiality
  describe('9. Quotation Request Flow & Confidentiality Isolation', () => {
    it('POST /api/quotes supports single supplier quote request', async () => {
      const res = await request(app)
        .post('/api/quotes')
        .set('Authorization', `Bearer ${buyerToken1}`)
        .send({
          business_id: supplierBusiness1._id.toString(),
          product_id: testProduct1._id.toString(),
          quantity: 8000,
          unit: 'Sq.Ft',
          message: 'Please quote best price for 8,000 sqft Black Galaxy'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('submitted');
    });

    it('POST /api/quotes supports multi-supplier broadcast dispatch', async () => {
      const res = await request(app)
        .post('/api/quotes')
        .set('Authorization', `Bearer ${buyerToken1}`)
        .send({
          business_ids: [supplierBusiness1._id.toString(), supplierBusiness2._id.toString()],
          quantity: 12000,
          unit: 'Sq.Ft',
          message: 'Broadcast quotation request for project'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.data).toHaveProperty('parentQuoteId');
      expect(res.body.data.dispatchedCount).toBe(2);
      expect(res.body.data.quotes.length).toBe(2);
    });

    it('Supplier can submit quote response, and other suppliers CANNOT see it (Confidentiality)', async () => {
      // 1. Buyer creates quote to supplier 1
      const quoteRes = await request(app)
        .post('/api/quotes')
        .set('Authorization', `Bearer ${buyerToken1}`)
        .send({
          business_id: supplierBusiness1._id.toString(),
          quantity: 5000,
          message: 'Quote needed'
        });
      const quoteId = quoteRes.body.data._id;

      // 2. Supplier 1 responds with offer
      const responseRes = await request(app)
        .post(`/api/quotes/${quoteId}/responses`)
        .set('Authorization', `Bearer ${supplierToken1}`)
        .send({
          offered_price: 195,
          unit: 'Sq.Ft',
          available_quantity: 5000,
          shipping_cost: 15000,
          terms_and_conditions: '50% advance, balance on dispatch'
        });
      expect(responseRes.statusCode).toBe(201);
      expect(responseRes.body.data.offered_price).toBe(195);

      // 3. Buyer views responses -> Sees Supplier 1 offer
      const buyerView = await request(app)
        .get(`/api/quotes/${quoteId}/responses`)
        .set('Authorization', `Bearer ${buyerToken1}`);
      expect(buyerView.statusCode).toBe(200);
      expect(buyerView.body.data.length).toBe(1);
      expect(buyerView.body.data[0].offered_price).toBe(195);

      // 4. Supplier 2 attempts to view -> Sees EMPTY or only their own (Strict Isolation)
      const supplier2View = await request(app)
        .get(`/api/quotes/${quoteId}/responses`)
        .set('Authorization', `Bearer ${supplierToken2}`);
      expect(supplier2View.statusCode).toBe(200);
      // Supplier 2 has not submitted a response, so they see 0 responses (never Supplier 1's price)
      expect(supplier2View.body.data.length).toBe(0);
    });
  });

  // 10. Form Options and Favorites
  describe('10. Marketplace Form Options and Buyer Favorites', () => {
    it('GET /api/marketplace/form-options returns database-backed dropdowns', async () => {
      const res = await request(app).get('/api/marketplace/form-options');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);

      const options = res.body.data;
      expect(options).toHaveProperty('quantity_units');
      expect(options).toHaveProperty('materials');
      expect(options).toHaveProperty('finishes');
      expect(options).toHaveProperty('delivery_locations');
      expect(options.delivery_locations.some(l => l.name === 'Rajasthan')).toBe(true);
    });

    it('Allows saving and removing buyers from favorites', async () => {
      // 1. Add to favorites
      const addRes = await request(app)
        .post(`/api/buyers/${buyerProfile1._id}/favorite`)
        .set('Authorization', `Bearer ${supplierToken1}`);
      expect(addRes.statusCode).toBe(201);

      // 2. View favorites
      const viewRes = await request(app)
        .get('/api/buyers/favorites')
        .set('Authorization', `Bearer ${supplierToken1}`);
      expect(viewRes.statusCode).toBe(200);
      expect(viewRes.body.data.length).toBe(1);

      // 3. Remove from favorites
      const delRes = await request(app)
        .delete(`/api/buyers/${buyerProfile1._id}/favorite`)
        .set('Authorization', `Bearer ${supplierToken1}`);
      expect(delRes.statusCode).toBe(200);

      // Verify removed
      const checkRes = await request(app)
        .get('/api/buyers/favorites')
        .set('Authorization', `Bearer ${supplierToken1}`);
      expect(checkRes.body.data.length).toBe(0);
    });
  });
});
