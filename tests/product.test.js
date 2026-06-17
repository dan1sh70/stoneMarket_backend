const request = require('supertest');
const app = require('../server');
const User = require('../src/models/User');
const Vendor = require('../src/models/Vendor');
const Product = require('../src/models/Product');
const jwt = require('jsonwebtoken');

describe('Product API', () => {
  let token;
  let user;
  let vendor;

  beforeEach(async () => {
    user = await User.create({
      name: 'Test Vendor User',
      mobile: '1234567890',
      role: 'vendor',
      status: 'active'
    });
    
    vendor = await Vendor.create({
      userId: user._id,
      businessName: 'Test Granite Co',
      category: 'Granite Manufacturer',
      status: 'active'
    });

    token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
  });

  it('should add a new product', async () => {
    const res = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Black Galaxy Granite',
        category: 'Granite'
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('name', 'Black Galaxy Granite');
    expect(res.body.vendorId.toString()).toEqual(vendor._id.toString());
  });

  it('should list products', async () => {
    await Product.create({
      vendorId: vendor._id,
      name: 'Black Galaxy Granite',
      category: 'Granite',
      status: 'active'
    });

    const res = await request(app).get('/api/v1/products');
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBeGreaterThan(0);
  });
});
