const request = require('supertest');
const app = require('../server');
const User = require('../src/models/User');
const Vendor = require('../src/models/Vendor');
const jwt = require('jsonwebtoken');

describe('Vendor API', () => {
  let token;
  let user;

  beforeEach(async () => {
    user = await User.create({
      name: 'Test Vendor User',
      mobile: '1234567890',
      role: 'vendor',
      status: 'active'
    });
    token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
  });

  it('should create a vendor profile', async () => {
    const res = await request(app)
      .post('/api/v1/vendors/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        businessName: 'Test Granite Co',
        category: 'Granite Manufacturer'
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.vendor).toHaveProperty('slug', 'test-granite-co');
    expect(res.body.vendor.category).toEqual('Granite Manufacturer');
  });

  it('should list active vendors', async () => {
    await Vendor.create({
      userId: user._id,
      businessName: 'Test Granite Co',
      category: 'Granite Manufacturer',
      status: 'active'
    });

    const res = await request(app).get('/api/v1/vendors');
    expect(res.statusCode).toEqual(200);
    expect(res.body.vendors.length).toBeGreaterThan(0);
  });
});
