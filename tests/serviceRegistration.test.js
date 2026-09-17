const request = require('supertest');
const app = require('../server');
const User = require('../src/models/User');
const ServiceCategory = require('../src/models/ServiceCategory');
const RegistrationDraft = require('../src/models/RegistrationDraft');
const BusinessProfile = require('../src/models/BusinessProfile');
const jwt = require('jsonwebtoken');

describe('Service Provider Registration API', () => {
  let adminToken;
  let userToken;
  let user;
  let categoryId;

  beforeEach(async () => {
    // Create Admin
    const admin = await User.create({
      name: 'Admin User',
      mobile: '9999999999',
      role: 'admin',
      status: 'active'
    });
    adminToken = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });

    // Create standard user
    user = await User.create({
      name: 'Service Provider User',
      mobile: '1234567890',
      role: 'customer',
      status: 'active'
    });
    userToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });

    // Seed one category manually for test
    const category = await ServiceCategory.create({
      name: 'Machine Manufacturer',
      slug: 'machine-manufacturer',
      status: 'active'
    });
    categoryId = category._id.toString();
  });

  describe('Service Categories', () => {
    it('should seed categories as admin', async () => {
      const res = await request(app)
        .post('/api/service-categories/seed')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toMatch(/Seeded/);
      
      // Should now have 17 categories (since we manually created 1, 16 new ones)
      const count = await ServiceCategory.countDocuments();
      expect(count).toBeGreaterThan(1);
    });

    it('should list active categories for public', async () => {
      const res = await request(app).get('/api/service-categories');
      expect(res.statusCode).toEqual(200);
      expect(res.body.data.items.length).toEqual(1);
      expect(res.body.data.items[0].name).toEqual('Machine Manufacturer');
    });
  });

  describe('Registration Flow', () => {
    it('should fail step 1 with invalid category', async () => {
      const res = await request(app)
        .post('/api/registration/service_provider/step-1')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          service_category_id: '507f1f77bcf86cd799439011', // Fake ID
          company_name: 'Test Services',
          established_year: 2020,
          company_details: 'Details'
        });
      
      expect(res.statusCode).toEqual(422);
      expect(res.body.errors).toHaveProperty('service_category_id');
    });

    it('should complete full registration flow', async () => {
      // Step 1
      const step1Res = await request(app)
        .post('/api/registration/service_provider/step-1')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          service_category_id: categoryId,
          company_name: 'Valid Services Co',
          gst_number: '22AAAAA0000A1Z5',
          established_year: 2015,
          company_details: 'Providing the best machine repairing.'
        });
      
      expect(step1Res.statusCode).toEqual(200);
      const registration_id = step1Res.body.data.registration_id;

      // Step 2
      const step2Res = await request(app)
        .post('/api/registration/service_provider/step-2')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          owner_1: {
            name: 'John Doe',
            phone: '9876543210',
            whatsapp: '9876543210', // Required for service provider owner 1
            birth_date: '1980-01-01',
            anniversary_date: '2005-05-20'
          }
        });
      expect(step2Res.statusCode).toEqual(200);

      // Step 3
      const step3Res = await request(app)
        .post('/api/registration/service_provider/step-3')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          state: 'Rajasthan',
          district: 'Jaipur',
          area: 'Sitapura',
          address: 'Plot 42, Industrial Area',
          terms_accepted: true,
          privacy_policy_accepted: true
        });
      expect(step3Res.statusCode).toEqual(200);

      // Submit
      const submitRes = await request(app)
        .post(`/api/registration/${registration_id}/submit`)
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(submitRes.statusCode).toEqual(200);
      expect(submitRes.body.data.status).toEqual('submitted');

      // Verify BusinessProfile was created correctly
      const profile = await BusinessProfile.findOne({ userId: user._id });
      expect(profile).toBeDefined();
      expect(profile.business_type).toEqual('service_provider');
      expect(profile.service_categories).toContainEqual(expect.anything()); // Should have category ID
      expect(profile.service_categories[0].toString()).toEqual(categoryId);
      expect(profile.owners[0].name).toEqual('John Doe');
      
      // User role should be updated
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.role).toEqual('service_provider');
    });
  });
});
