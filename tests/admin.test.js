const request = require('supertest');
const app = require('../server');
const User = require('../src/models/User');
const Vendor = require('../src/models/Vendor');
const jwt = require('jsonwebtoken');

describe('Admin API', () => {
  let adminToken;
  let vendorUser;
  let vendor;

  beforeEach(async () => {
    const admin = await User.create({
      name: 'Super Admin',
      mobile: '9999999999',
      role: 'admin',
      status: 'active'
    });
    adminToken = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });

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
      status: 'pending'
    });
  });

  it('should allow admin to verify a vendor', async () => {
    const res = await request(app)
      .put(`/api/v1/admin/vendors/${vendor._id}/verify`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        action: 'approve'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.badges.verified).toBeDefined();
  });

  it('should fetch analytics stats', async () => {
    const res = await request(app)
      .get('/api/v1/admin/analytics')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('userCount');
    expect(res.body).toHaveProperty('vendorCount');
  });
});
