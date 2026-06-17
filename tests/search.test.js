const request = require('supertest');
const app = require('../server');
const User = require('../src/models/User');
const Vendor = require('../src/models/Vendor');
const Product = require('../src/models/Product');

describe('Search API', () => {
  beforeEach(async () => {
    const user = await User.create({
      name: 'Test Vendor User',
      mobile: '1234567890',
      role: 'vendor',
      status: 'active'
    });
    
    const vendor = await Vendor.create({
      userId: user._id,
      businessName: 'Global Marble Export',
      category: 'Mining',
      status: 'active',
      address: { state: 'Rajasthan', city: 'Jaipur' },
      location: { type: 'Point', coordinates: [75.7873, 26.9124] } // Jaipur coords
    });

    await Product.create({
      vendorId: vendor._id,
      name: 'Premium White Marble',
      category: 'Marble',
      status: 'active'
    });
    
    await Vendor.createIndexes();
    await Product.createIndexes();
  });

  it('should find vendor via global search', async () => {
    const res = await request(app).get('/api/v1/search?q=Global');
    expect(res.statusCode).toEqual(200);
    expect(res.body.results.length).toBeGreaterThan(0);
    expect(res.body.results[0].type).toEqual('vendor');
  });

  it('should find product via global search', async () => {
    const res = await request(app).get('/api/v1/search?q=White&type=product');
    expect(res.statusCode).toEqual(200);
    expect(res.body.results.length).toBeGreaterThan(0);
    expect(res.body.results[0].type).toEqual('product');
  });

  it('should find vendor via nearby search', async () => {
    const res = await request(app).get('/api/v1/search/nearby?lat=26.9124&lng=75.7873&radius=5');
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].businessName).toEqual('Global Marble Export');
  });
});
