const request = require('supertest');
const app = require('../server');
const User = require('../src/models/User');
const Advertisement = require('../src/models/Advertisement');
const jwt = require('jsonwebtoken');

describe('Advertisement API', () => {
  let adminToken;
  let adId;

  beforeEach(async () => {
    const admin = await User.create({
      name: 'Super Admin',
      mobile: '9999999999',
      role: 'admin',
      status: 'active'
    });
    adminToken = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });

    const ad = await Advertisement.create({
      title: 'Summer Sale',
      adType: 'home_banner',
      targetAudience: 'all',
      imageUrl: 'http://example.com/ad.jpg',
      linkUrl: 'http://example.com',
      startDate: new Date(Date.now() - 86400000), // Yesterday
      endDate: new Date(Date.now() + 86400000), // Tomorrow
      status: 'active'
    });
    adId = ad._id;
  });

  it('should fetch active advertisements for public', async () => {
    const res = await request(app).get('/api/v1/ads');

    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].title).toEqual('Summer Sale');
  });

  it('should record an impression', async () => {
    const res = await request(app).post(`/api/v1/ads/${adId}/impression`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toEqual('Impression recorded');
  });
});
