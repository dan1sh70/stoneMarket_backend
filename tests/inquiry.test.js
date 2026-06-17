const request = require('supertest');
const app = require('../server');
const User = require('../src/models/User');
const Vendor = require('../src/models/Vendor');
const jwt = require('jsonwebtoken');

describe('Inquiry API', () => {
  let buyerToken;
  let buyer;
  let vendorUser;
  let vendor;

  beforeEach(async () => {
    buyer = await User.create({
      name: 'Test Buyer',
      mobile: '1111111111',
      role: 'buyer',
      status: 'active'
    });
    buyerToken = jwt.sign({ id: buyer._id, role: buyer.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });

    vendorUser = await User.create({
      name: 'Test Vendor User',
      mobile: '2222222222',
      role: 'vendor',
      status: 'active'
    });
    vendor = await Vendor.create({
      userId: vendorUser._id,
      businessName: 'Test Mining Co',
      category: 'Mining',
      status: 'active'
    });
  });

  it('should submit an inquiry successfully when category matches', async () => {
    const res = await request(app)
      .post('/api/v1/inquiries')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        vendorId: vendor._id.toString(),
        category: 'Mining',
        subject: 'Need marble',
        message: 'Quote please'
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('message', 'Inquiry submitted successfully');
  });

  it('should reject inquiry when category mismatches', async () => {
    const res = await request(app)
      .post('/api/v1/inquiries')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        vendorId: vendor._id.toString(),
        category: 'Granite Manufacturer', // mismatch
        subject: 'Need marble',
        message: 'Quote please'
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toMatch(/Inquiry routing failed/);
  });
});
