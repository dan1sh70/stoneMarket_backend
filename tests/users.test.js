const request = require('supertest');
const app = require('../server');
const User = require('../src/models/User');
const Vendor = require('../src/models/Vendor');
const jwt = require('jsonwebtoken');

describe('Users API (Favorites)', () => {
  let token;
  let user;
  let vendorUser;
  let vendor;

  beforeEach(async () => {
    user = await User.create({
      name: 'Test Buyer User',
      mobile: '1111111111',
      role: 'buyer',
      status: 'active'
    });
    token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });

    vendorUser = await User.create({
      name: 'Test Vendor User',
      mobile: '2222222222',
      role: 'vendor',
      status: 'active'
    });

    vendor = await Vendor.create({
      userId: vendorUser._id,
      businessName: 'Unique Granite Co',
      slug: 'unique-granite-co',
      category: 'Granite Manufacturer',
      status: 'active'
    });
  });

  it('should save a vendor to favorites', async () => {
    const res = await request(app)
      .post(`/api/v1/vendors/${vendor._id}/save`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toEqual('Vendor saved to favorites');

    const updatedUser = await User.findById(user._id);
    expect(updatedUser.savedBusinesses.includes(vendor._id)).toBe(true);
  });

  it('should retrieve populated favorites list', async () => {
    user.savedBusinesses.push(vendor._id);
    await user.save();

    const res = await request(app)
      .get('/api/v1/users/favorites')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toEqual(1);
    expect(res.body[0]).toHaveProperty('businessName', 'Unique Granite Co');
    expect(res.body[0]).toHaveProperty('slug', 'unique-granite-co');
  });

  it('should remove a vendor from favorites', async () => {
    user.savedBusinesses.push(vendor._id);
    await user.save();

    const res = await request(app)
      .delete(`/api/v1/vendors/${vendor._id}/save`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toEqual('Vendor removed from favorites');

    const updatedUser = await User.findById(user._id);
    expect(updatedUser.savedBusinesses.includes(vendor._id)).toBe(false);
  });
});
